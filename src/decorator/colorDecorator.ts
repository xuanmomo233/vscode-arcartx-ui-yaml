import * as vscode from 'vscode';

/**
 * 颜色装饰器 — 在 ~R,G,B 或 ~R,G,B,A 值旁显示颜色色块
 */
export class ColorDecorator {
    private decorationType: vscode.TextEditorDecorationType;
    private activeEditor: vscode.TextEditor | undefined;
    private updateTimeout: NodeJS.Timeout | undefined;
    private _enabled: boolean = true;

    constructor(context: vscode.ExtensionContext) {
        this.decorationType = vscode.window.createTextEditorDecorationType({
            before: {
                contentText: ' ',
                border: '1px solid #888',
                width: '12px',
                height: '12px',
                margin: '0 4px 0 0',
            },
        });

        context.subscriptions.push(this.decorationType);

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
            this.activeEditor.setDecorations(this.decorationType, []);
        }
    }

    private updateDecorations() {
        if (!this.activeEditor || !this._enabled) return;
        const editor = this.activeEditor;
        const text = editor.document.getText();
        const decorations: vscode.DecorationOptions[] = [];

        // 匹配 ~R,G,B 或 ~R,G,B,A（允许空格）
        const colorRegex = /~(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})(?:\s*,\s*(\d{1,3}))?/g;
        let match: RegExpExecArray | null;

        while ((match = colorRegex.exec(text)) !== null) {
            const r = parseInt(match[1]);
            const g = parseInt(match[2]);
            const b = parseInt(match[3]);
            const a = match[4] !== undefined ? parseInt(match[4]) : 255;

            // 验证范围
            if (r > 255 || g > 255 || b > 255 || a > 255) continue;

            const startPos = editor.document.positionAt(match.index);
            const endPos = editor.document.positionAt(match.index + match[0].length);
            const range = new vscode.Range(startPos, endPos);

            // 棋盘格背景色（用于透明度可视化）
            const alphaHex = Math.round(a / 255 * 255).toString(16).padStart(2, '0');
            const colorHex = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}${alphaHex}`;

            decorations.push({
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

        editor.setDecorations(this.decorationType, decorations);
    }
}
