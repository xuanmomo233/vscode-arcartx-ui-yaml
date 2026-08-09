import * as vscode from 'vscode';

/**
 * 颜色装饰器 — ~R,G,B,A 色块 / §#RRGGBB 文字着色 / §~RRGGBB-RRGGBB 渐变逐字插值着色
 */
export class ColorDecorator {
    private swatchType: vscode.TextEditorDecorationType;
    private activeEditor: vscode.TextEditor | undefined;
    private updateTimeout: NodeJS.Timeout | undefined;
    private _enabled: boolean = true;
    private dynamicTypes: vscode.TextEditorDecorationType[] = [];

    constructor(context: vscode.ExtensionContext) {
        this.swatchType = vscode.window.createTextEditorDecorationType({
            before: {
                contentText: ' ',
                border: '1px solid #888',
                width: '12px',
                height: '12px',
                margin: '0 4px 0 0',
            },
        });

        context.subscriptions.push(this.swatchType);

        // 监听编辑器切换
        vscode.window.onDidChangeActiveTextEditor(editor => {
            this.activeEditor = editor;
            if (editor && editor.document.languageId === 'arcartx-ui-yaml') {
                this.updateDecorations();
            }
        }, null, context.subscriptions);

        // 监听文档变化
        vscode.workspace.onDidChangeTextDocument(e => {
            if (this.activeEditor && e.document === this.activeEditor.document &&
                e.document.languageId === 'arcartx-ui-yaml') {
                if (this.updateTimeout) clearTimeout(this.updateTimeout);
                this.updateTimeout = setTimeout(() => this.updateDecorations(), 100);
            }
        }, null, context.subscriptions);

        // 监听滚动 / 可视区域变化 — 只为渐变逐字装饰触发重渲染
        vscode.window.onDidChangeTextEditorVisibleRanges(e => {
            if (this.activeEditor && e.textEditor === this.activeEditor &&
                this.activeEditor.document.languageId === 'arcartx-ui-yaml') {
                if (this.updateTimeout) clearTimeout(this.updateTimeout);
                this.updateTimeout = setTimeout(() => this.updateDecorations(), 80);
            }
        }, null, context.subscriptions);

        // 初始化当前编辑器
        this.activeEditor = vscode.window.activeTextEditor;
        if (this.activeEditor && this.activeEditor.document.languageId === 'arcartx-ui-yaml') {
            this.updateDecorations();
        }
    }

    get enabled(): boolean { return this._enabled; }

    setEnabled(enabled: boolean) {
        this._enabled = enabled;
        if (!enabled) {
            this.clearDecorations();
        } else {
            this.updateDecorations();
        }
    }

    toggle(): boolean {
        this.setEnabled(!this._enabled);
        return this._enabled;
    }

    private clearDecorations() {
        if (this.activeEditor) {
            this.activeEditor.setDecorations(this.swatchType, []);
            this.dynamicTypes.forEach(t => {
                this.activeEditor!.setDecorations(t, []);
                t.dispose();
            });
            this.dynamicTypes = [];
        }
    }

    private updateDecorations() {
        if (!this.activeEditor || !this._enabled) return;
        const editor = this.activeEditor;
        const text = editor.document.getText();

        // 清空上一轮的动态装饰（先 setDecorations([]) 再 dispose，避免残留）
        this.dynamicTypes.forEach(t => {
            editor.setDecorations(t, []);
            t.dispose();
        });
        this.dynamicTypes = [];

        // 预计算每行的注释起始偏移量（YAML # 注释 + Aria // 注释）
        const commentStarts: number[] = [];
        const lines = text.split('\n');
        let lineOffset = 0;
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            let commentStart = -1;
            // 查找 YAML # 注释（行首或空格后的 #）
            for (let j = 0; j < line.length; j++) {
                if (line[j] === '#' && (j === 0 || line[j - 1] === ' ' || line[j - 1] === '\t')) {
                    commentStart = j;
                    break;
                }
            }
            // 查找 Aria // 注释（如果比 # 更靠前）
            for (let j = 0; j < line.length - 1; j++) {
                if (line[j] === '/' && line[j + 1] === '/') {
                    if (commentStart === -1 || j < commentStart) {
                        commentStart = j;
                        break;
                    }
                }
            }
            commentStarts.push(commentStart >= 0 ? lineOffset + commentStart : -1);
            lineOffset += line.length + 1;
        }

        // 辅助函数：判断偏移量是否在注释中
        const isInComment = (offset: number): boolean => {
            const pos = editor.document.positionAt(offset);
            const lineNum = pos.line;
            if (lineNum >= commentStarts.length) return false;
            return commentStarts[lineNum] >= 0 && offset >= commentStarts[lineNum];
        };

        // 计算可视区域的字符偏移范围（用于渐变逐字装饰的视口裁剪）
        const visibleRanges = editor.visibleRanges;
        let visibleStartOffset = 0;
        let visibleEndOffset = text.length;
        if (visibleRanges.length > 0) {
            visibleStartOffset = editor.document.offsetAt(visibleRanges[0].start);
            visibleEndOffset = editor.document.offsetAt(visibleRanges[visibleRanges.length - 1].end);
        }

        const swatchDecorations: vscode.DecorationOptions[] = [];

        // 1. 匹配 ~R,G,B 或 ~R,G,B,A（允许空格）— 显示色块（全文档，量小）
        const colorRegex = /~(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})(?:\s*,\s*(\d{1,3}))?/g;
        let match: RegExpExecArray | null;

        while ((match = colorRegex.exec(text)) !== null) {
            if (isInComment(match.index)) continue;
            const r = parseInt(match[1]);
            const g = parseInt(match[2]);
            const b = parseInt(match[3]);
            const a = match[4] !== undefined ? parseInt(match[4]) : 255;
            if (r > 255 || g > 255 || b > 255 || a > 255) continue;

            const startPos = editor.document.positionAt(match.index);
            const endPos = editor.document.positionAt(match.index + match[0].length);
            const range = new vscode.Range(startPos, endPos);
            const alphaHex = Math.round(a / 255 * 255).toString(16).padStart(2, '0');
            const colorHex = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}${alphaHex}`;

            swatchDecorations.push({
                range,
                renderOptions: {
                    before: {
                        backgroundColor: colorHex,
                        contentText: ' ',
                        border: '1px solid #555',
                        width: '14px',
                        height: '14px',
                        margin: '0 6px 0 0',
                    },
                },
            });
        }

        // 1b. 匹配 Frosted:blur;R,G,B,A — 显示色块
        const frostedRegex = /~?Frosted:(\d+)\s*;\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})(?:\s*,\s*(\d{1,3}))?/g;
        while ((match = frostedRegex.exec(text)) !== null) {
            if (isInComment(match.index)) continue;
            const r = parseInt(match[2]);
            const g = parseInt(match[3]);
            const b = parseInt(match[4]);
            const a = match[5] !== undefined ? parseInt(match[5]) : 255;
            if (r > 255 || g > 255 || b > 255 || a > 255) continue;

            const startPos = editor.document.positionAt(match.index);
            const endPos = editor.document.positionAt(match.index + match[0].length);
            const alphaHex = Math.round(a / 255 * 255).toString(16).padStart(2, '0');
            const colorHex = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}${alphaHex}`;

            swatchDecorations.push({
                range: new vscode.Range(startPos, endPos),
                renderOptions: {
                    before: {
                        backgroundColor: colorHex,
                        contentText: ' ',
                        border: '1px solid #555',
                        width: '14px',
                        height: '14px',
                        margin: '0 6px 0 0',
                    },
                },
            });
        }

        // textColorMap 供 §a/&b 和 §# 共用
        const textColorMap = new Map<string, vscode.Range[]>();

        // 颜色码截断模式（遇到下一个颜色码 / 重置码 / 换行时停止染色）
        const colorStopPatterns = ['§r', '§#', '§~', '§0', '§1', '§2', '§3', '§4', '§5', '§6', '§7', '§8', '§9', '§a', '§b', '§c', '§d', '§e', '§f', '&r', '&0', '&1', '&2', '&3', '&4', '&5', '&6', '&7', '&8', '&9', '&a', '&b', '&c', '&d', '&e', '&f', '\n'];

        // 辅助函数：从颜色码结束位置查找染色范围
        // 1. 从行首用栈匹配引号，找到颜色码所在字符串的最外层未闭合引号
        // 2. 染色到同类型闭合引号停止（同时考虑其他颜色码截断）
        // 3. 染色范围内的 " 和 ' 字符本身不染色
        // 4. 颜色码在 {...} 外时，染色范围内的 {...} 表达式整体不染色（已有 Aria 语法高亮）
        // 返回 { textEnd, skipOffsets } — skipOffsets 为需要跳过染色的字符偏移集合
        const findColorExtent = (codeEnd: number): { textEnd: number; skipOffsets: Set<number> } => {
            const lineStart = text.lastIndexOf('\n', codeEnd - 1) + 1;

            // 引号栈：查找颜色码所在字符串的最外层未闭合引号
            const quoteStack: string[] = [];
            for (let i = lineStart; i < codeEnd; i++) {
                const ch = text[i];
                if (ch === '"' || ch === "'") {
                    if (quoteStack.length > 0 && quoteStack[quoteStack.length - 1] === ch) {
                        quoteStack.pop();
                    } else {
                        quoteStack.push(ch);
                    }
                }
            }
            const quoteChar = quoteStack.length > 0 ? quoteStack[0] : undefined;

            // 花括号深度：判断颜色码是否在 {...} 表达式内部
            let braceDepth = 0;
            for (let i = lineStart; i < codeEnd; i++) {
                const ch = text[i];
                if (ch === '{') braceDepth++;
                else if (ch === '}') braceDepth--;
            }
            const insideBrace = braceDepth > 0;

            // 查找染色结束位置（取颜色码截断、闭合引号的最早位置）
            const afterCode = text.substring(codeEnd);
            let endRel = afterCode.length;
            for (const p of colorStopPatterns) {
                const idx = afterCode.indexOf(p);
                if (idx >= 0 && idx < endRel) endRel = idx;
            }
            if (quoteChar) {
                const closeIdx = afterCode.indexOf(quoteChar);
                if (closeIdx >= 0 && closeIdx < endRel) endRel = closeIdx;
            }

            const skipOffsets = new Set<number>();

            // 跳过引号字符本身
            for (let i = 0; i < endRel; i++) {
                const ch = afterCode[i];
                if (ch === '"' || ch === "'") {
                    skipOffsets.add(codeEnd + i);
                }
            }

            // 颜色码在 {...} 外时，跳过后续 {...} 表达式整体（含花括号）
            if (!insideBrace) {
                let relPos = 0;
                while (relPos < endRel) {
                    if (afterCode[relPos] === '{') {
                        let depth = 1;
                        let j = relPos + 1;
                        while (j < endRel && depth > 0) {
                            if (afterCode[j] === '{') depth++;
                            else if (afterCode[j] === '}') depth--;
                            if (depth > 0) j++;
                        }
                        // j 指向匹配的 }（若 depth===0），或未闭合时指向 endRel
                        const segEnd = depth === 0 ? j + 1 : endRel;
                        for (let k = relPos; k < segEnd; k++) {
                            skipOffsets.add(codeEnd + k);
                        }
                        relPos = segEnd;
                    } else {
                        relPos++;
                    }
                }
            }

            return { textEnd: codeEnd + endRel, skipOffsets };
        };

        // 辅助函数：将染色范围按跳过的字符偏移集合拆分成多个子 Range
        const splitRangeSkipping = (textStart: number, textEnd: number, skipOffsets: Set<number>): vscode.Range[] => {
            const ranges: vscode.Range[] = [];
            let curStart = textStart;
            for (let i = textStart; i < textEnd; i++) {
                if (skipOffsets.has(i)) {
                    if (i > curStart) {
                        ranges.push(new vscode.Range(editor.document.positionAt(curStart), editor.document.positionAt(i)));
                    }
                    curStart = i + 1;
                }
            }
            if (curStart < textEnd) {
                ranges.push(new vscode.Range(editor.document.positionAt(curStart), editor.document.positionAt(textEnd)));
            }
            return ranges;
        };

        // 1c. 匹配 §a / &b 等 Minecraft 颜色码 — 显示色块 + 着色后续文字
        const mcColorMap: Record<string, string> = {
            '0': '#000000', '1': '#0000AA', '2': '#00AA00', '3': '#00AAAA',
            '4': '#AA0000', '5': '#AA00AA', '6': '#FFAA00', '7': '#AAAAAA',
            '8': '#555555', '9': '#5555FF', 'a': '#55FF55', 'b': '#55FFFF',
            'c': '#FF5555', 'd': '#FF55FF', 'e': '#FFFF55', 'f': '#FFFFFF',
        };
        const mcCodeRegex = /[§&]([0-9a-f])/g;
        while ((match = mcCodeRegex.exec(text)) !== null) {
            if (isInComment(match.index)) continue;
            const code = match[1];
            const colorHex = mcColorMap[code];
            if (!colorHex) continue;

            const codeStart = match.index;
            const codeEnd = match.index + match[0].length;
            const { textEnd, skipOffsets } = findColorExtent(codeEnd);
            const textStart = codeEnd;

            swatchDecorations.push({
                range: new vscode.Range(editor.document.positionAt(codeStart), editor.document.positionAt(codeEnd)),
                renderOptions: {
                    before: {
                        backgroundColor: colorHex,
                        contentText: ' ',
                        border: '1px solid #555',
                        width: '10px',
                        height: '10px',
                        margin: '0 4px 0 0',
                    },
                },
            });

            if (textEnd > textStart) {
                if (!textColorMap.has(colorHex.substring(1).toUpperCase())) {
                    textColorMap.set(colorHex.substring(1).toUpperCase(), []);
                }
                const subRanges = splitRangeSkipping(textStart, textEnd, skipOffsets);
                textColorMap.get(colorHex.substring(1).toUpperCase())!.push(...subRanges);
            }
        }

        // 2. 匹配 §#RRGGBB — 只着色后续文字，不着色颜色码本身（全文档，按颜色分组）
        const textColorRegex = /§#([0-9A-Fa-f]{6})/g;
        while ((match = textColorRegex.exec(text)) !== null) {
            if (isInComment(match.index)) continue;
            const hex = match[1].toUpperCase();
            const codeStart = match.index;
            const codeEnd = match.index + match[0].length;
            const { textEnd, skipOffsets } = findColorExtent(codeEnd);
            const textStart = codeEnd;

            // 颜色码部分：显示色块，不着色文字
            swatchDecorations.push({
                range: new vscode.Range(editor.document.positionAt(codeStart), editor.document.positionAt(codeEnd)),
                renderOptions: {
                    before: {
                        backgroundColor: `#${hex}`,
                        contentText: ' ',
                        border: '1px solid #555',
                        width: '10px',
                        height: '10px',
                        margin: '0 4px 0 0',
                    },
                },
            });

            // 文字部分：按颜色批量分组着色（跳过引号字符和 {...} 表达式）
            if (textEnd > textStart) {
                if (!textColorMap.has(hex)) {
                    textColorMap.set(hex, []);
                }
                const subRanges = splitRangeSkipping(textStart, textEnd, skipOffsets);
                textColorMap.get(hex)!.push(...subRanges);
            }
        }
        for (const [hex, ranges] of textColorMap) {
            const type = vscode.window.createTextEditorDecorationType({
                color: `#${hex}`,
            });
            this.dynamicTypes.push(type);
            editor.setDecorations(type, ranges);
        }

        // 3. 匹配 §~RRGGBB-RRGGBB — 逐字线性插值着色
        // 性能优化：只渲染可视区域内的字符，滚动时动态更新
        const gradientColorMap = new Map<string, vscode.Range[]>();
        const gradientRegex = /§~([0-9A-Fa-f]{6})-([0-9A-Fa-f]{6})/g;
        while ((match = gradientRegex.exec(text)) !== null) {
            if (isInComment(match.index)) continue;
            const hex1 = match[1].toUpperCase();
            const hex2 = match[2].toUpperCase();
            const r1 = parseInt(hex1.substring(0, 2), 16);
            const g1 = parseInt(hex1.substring(2, 4), 16);
            const b1 = parseInt(hex1.substring(4, 6), 16);
            const r2 = parseInt(hex2.substring(0, 2), 16);
            const g2 = parseInt(hex2.substring(2, 4), 16);
            const b2 = parseInt(hex2.substring(4, 6), 16);
            const codeStart = match.index;
            const codeEnd = match.index + match[0].length;
            const { textEnd, skipOffsets } = findColorExtent(codeEnd);
            const textStart = codeEnd;
            const textContent = text.substring(textStart, textEnd);

            // 颜色码部分：显示双色块（始终渲染，量小）
            swatchDecorations.push({
                range: new vscode.Range(editor.document.positionAt(codeStart), editor.document.positionAt(codeEnd)),
                renderOptions: {
                    before: {
                        backgroundColor: `#${hex1}`,
                        contentText: ' ',
                        border: '1px solid #555',
                        width: '10px',
                        height: '10px',
                        margin: '0 4px 0 0',
                    },
                    after: {
                        backgroundColor: `#${hex2}`,
                        contentText: ' ',
                        border: '1px solid #555',
                        width: '10px',
                        height: '10px',
                        margin: '0 0 0 4px',
                    },
                },
            });

            // 视口裁剪：跳过完全在可视区域外的渐变文本
            if (textEnd < visibleStartOffset || textStart > visibleEndOffset) {
                continue;
            }

            // 逐字插值着色 — 只渲染可视区域内的字符，跳过引号字符和 {...} 表达式
            const chars = [...textContent];
            const charCount = chars.length;
            let charOffset = 0;
            for (let i = 0; i < charCount; i++) {
                const charStart = textStart + charOffset;
                const charEnd = textStart + charOffset + chars[i].length;
                charOffset += chars[i].length;

                // 跳过可视区域外的字符
                if (charEnd < visibleStartOffset || charStart > visibleEndOffset) {
                    continue;
                }

                // 跳过引号字符和 {...} 表达式字符（不染色，但仍参与插值位置计算）
                if (skipOffsets.has(charStart)) {
                    continue;
                }

                const t = charCount > 1 ? i / (charCount - 1) : 0;
                const r = Math.round(r1 + (r2 - r1) * t);
                const g = Math.round(g1 + (g2 - g1) * t);
                const b = Math.round(b1 + (b2 - b1) * t);
                const charHex = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;

                if (!gradientColorMap.has(charHex)) {
                    gradientColorMap.set(charHex, []);
                }
                gradientColorMap.get(charHex)!.push(new vscode.Range(editor.document.positionAt(charStart), editor.document.positionAt(charEnd)));
            }
        }
        for (const [charHex, ranges] of gradientColorMap) {
            const type = vscode.window.createTextEditorDecorationType({
                color: charHex,
            });
            this.dynamicTypes.push(type);
            editor.setDecorations(type, ranges);
        }

        editor.setDecorations(this.swatchType, swatchDecorations);
    }
}
