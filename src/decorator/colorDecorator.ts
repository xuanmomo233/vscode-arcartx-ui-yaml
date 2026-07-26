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

        const swatchDecorations: vscode.DecorationOptions[] = [];

        // 1. 匹配 ~R,G,B 或 ~R,G,B,A（允许空格）— 显示色块
        const colorRegex = /~(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})(?:\s*,\s*(\d{1,3}))?/g;
        let match: RegExpExecArray | null;

        while ((match = colorRegex.exec(text)) !== null) {
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

        // 2. 匹配 §#RRGGBB — 只着色后续文字，不着色颜色码本身
        // 按颜色批量分组，同一颜色的所有 range 共享一个 decorationType
        const textColorMap = new Map<string, vscode.Range[]>();
        const textColorRegex = /§#([0-9A-Fa-f]{6})/g;
        while ((match = textColorRegex.exec(text)) !== null) {
            const hex = match[1].toUpperCase();
            const codeStart = match.index;
            const codeEnd = match.index + match[0].length;
            // 查找后续文字结束位置
            const afterCode = text.substring(codeEnd);
            const stopPatterns = ['§r', '§#', '§~', '\n'];
            let endRel = afterCode.length;
            for (const p of stopPatterns) {
                const idx = afterCode.indexOf(p);
                if (idx >= 0 && idx < endRel) endRel = idx;
            }
            const textStart = codeEnd;
            const textEnd = codeEnd + endRel;

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

            // 文字部分：按颜色批量分组着色（同一颜色的所有 range 共享一个 decorationType）
            if (textEnd > textStart) {
                if (!textColorMap.has(hex)) {
                    textColorMap.set(hex, []);
                }
                textColorMap.get(hex)!.push(new vscode.Range(editor.document.positionAt(textStart), editor.document.positionAt(textEnd)));
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
        // 优化：按颜色批量分组，相同颜色的字符共享一个 decorationType
        const gradientColorMap = new Map<string, vscode.Range[]>();
        const gradientRegex = /§~([0-9A-Fa-f]{6})-([0-9A-Fa-f]{6})/g;
        while ((match = gradientRegex.exec(text)) !== null) {
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
            // 查找后续文字结束位置
            const afterCode = text.substring(codeEnd);
            const stopPatterns = ['§r', '§#', '§~', '\n'];
            let endRel = afterCode.length;
            for (const p of stopPatterns) {
                const idx = afterCode.indexOf(p);
                if (idx >= 0 && idx < endRel) endRel = idx;
            }
            const textContent = afterCode.substring(0, endRel);
            const textStart = codeEnd;

            // 颜色码部分：显示双色块
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

            // 逐字插值着色 — 按颜色分组批量装饰
            const chars = [...textContent];
            const charCount = chars.length;
            let charOffset = 0;
            for (let i = 0; i < charCount; i++) {
                const t = charCount > 1 ? i / (charCount - 1) : 0;
                const r = Math.round(r1 + (r2 - r1) * t);
                const g = Math.round(g1 + (g2 - g1) * t);
                const b = Math.round(b1 + (b2 - b1) * t);
                const charHex = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;

                const charStart = textStart + charOffset;
                const charEnd = textStart + charOffset + chars[i].length;
                charOffset += chars[i].length;

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
