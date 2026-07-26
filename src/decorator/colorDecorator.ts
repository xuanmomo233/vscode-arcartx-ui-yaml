import * as vscode from 'vscode';

/**
 * 颜色装饰器 — 在 ~R,G,B,A 值旁显示色块，§#RRGGBB 文字着色，§~RRGGBB-RRGGBB 渐变色块
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

        // 销毁上一轮的动态装饰类型
        this.dynamicTypes.forEach(t => t.dispose());
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

        // 2. 匹配 §#RRGGBB — 文字本身直接着色渲染
        // 按颜色分组，每种颜色创建一个动态 decorationType（color 属性）
        const textColorMap = new Map<string, vscode.Range[]>();
        const textColorRegex = /§#([0-9A-Fa-f]{6})/g;
        while ((match = textColorRegex.exec(text)) !== null) {
            const hex = match[1].toUpperCase();
            const startPos = editor.document.positionAt(match.index);
            const endPos = editor.document.positionAt(match.index + match[0].length);
            const range = new vscode.Range(startPos, endPos);
            if (!textColorMap.has(hex)) {
                textColorMap.set(hex, []);
            }
            textColorMap.get(hex)!.push(range);
        }
        for (const [hex, ranges] of textColorMap) {
            const type = vscode.window.createTextEditorDecorationType({
                color: `#${hex}`,
                before: {
                    backgroundColor: `#${hex}`,
                    contentText: ' ',
                    border: '1px solid #555',
                    width: '10px',
                    height: '10px',
                    margin: '0 4px 0 0',
                },
            });
            this.dynamicTypes.push(type);
            editor.setDecorations(type, ranges);
        }

        // 3. 匹配 §~RRGGBB-RRGGBB — 渐变色文字直接着色 + 双色块
        // 按颜色对分组，每对创建一个动态 decorationType
        const gradientMap = new Map<string, { ranges: vscode.Range[], hex1: string, hex2: string }>();
        const gradientRegex = /§~([0-9A-Fa-f]{6})-([0-9A-Fa-f]{6})/g;
        while ((match = gradientRegex.exec(text)) !== null) {
            const hex1 = match[1].toUpperCase();
            const hex2 = match[2].toUpperCase();
            const key = `${hex1}-${hex2}`;
            const startPos = editor.document.positionAt(match.index);
            const endPos = editor.document.positionAt(match.index + match[0].length);
            const range = new vscode.Range(startPos, endPos);
            if (!gradientMap.has(key)) {
                gradientMap.set(key, { ranges: [], hex1, hex2 });
            }
            gradientMap.get(key)!.ranges.push(range);
        }
        for (const [, { ranges, hex1, hex2 }] of gradientMap) {
            const type = vscode.window.createTextEditorDecorationType({
                color: `#${hex1}`,
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
            });
            this.dynamicTypes.push(type);
            editor.setDecorations(type, ranges);
        }

        editor.setDecorations(this.swatchType, swatchDecorations);
    }
}
