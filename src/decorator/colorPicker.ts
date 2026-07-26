import * as vscode from 'vscode';

/**
 * 颜色选择器 — 通过 QuickPick + InputBox 让用户选择颜色，插入 ~R,G,B,A 格式
 */
export class ColorPickerCommand {
    public static readonly commandId = 'arcartxUiYaml.pickColor';

    public static register(context: vscode.ExtensionContext): vscode.Disposable {
        return vscode.commands.registerCommand(ColorPickerCommand.commandId, async () => {
            await ColorPickerCommand.pickColor();
        });
    }

    private static async pickColor() {
        const editor = vscode.window.activeTextEditor;
        if (!editor) return;

        // 检测当前光标位置是否已有颜色值
        const position = editor.selection.active;
        const lineText = editor.document.lineAt(position.line).text;
        const existingColor = ColorPickerCommand.findColorAtPosition(lineText, position.character);

        let currentR = 255, currentG = 255, currentB = 255, currentA = 255;
        if (existingColor) {
            currentR = existingColor.r;
            currentG = existingColor.g;
            currentB = existingColor.b;
            currentA = existingColor.a;
        }

        // 第一步：选择预设颜色或自定义
        const presetItems: (vscode.QuickPickItem & { color?: [number, number, number, number] })[] = [
            { label: '自定义 RGBA', description: '手动输入 R,G,B,A 值', color: undefined },
            { label: '$(paintcan) 红色', description: '~255,0,0,255', color: [255, 0, 0, 255] },
            { label: '$(paintcan) 绿色', description: '~0,255,0,255', color: [0, 255, 0, 255] },
            { label: '$(paintcan) 蓝色', description: '~0,0,255,255', color: [0, 0, 255, 255] },
            { label: '$(paintcan) 白色', description: '~255,255,255,255', color: [255, 255, 255, 255] },
            { label: '$(paintcan) 黑色', description: '~0,0,0,255', color: [0, 0, 0, 255] },
            { label: '$(paintcan) 黄色', description: '~255,255,0,255', color: [255, 255, 0, 255] },
            { label: '$(paintcan) 青色', description: '~0,255,255,255', color: [0, 255, 255, 255] },
            { label: '$(paintcan) 紫色', description: '~255,0,255,255', color: [255, 0, 255, 255] },
            { label: '$(paintcan) 橙色', description: '~255,165,0,255', color: [255, 165, 0, 255] },
            { label: '$(paintcan) 灰色', description: '~128,128,128,255', color: [128, 128, 128, 255] },
            { label: '$(paintcan) 深灰', description: '~64,64,64,255', color: [64, 64, 64, 255] },
            { label: '$(paintcan) 半透明黑', description: '~0,0,0,120', color: [0, 0, 0, 120] },
            { label: '$(paintcan) 半透明白', description: '~255,255,255,120', color: [255, 255, 255, 120] },
            { label: '$(paintcan) 浅蓝', description: '~110,230,80,255', color: [110, 230, 80, 255] },
        ];

        const selected = await vscode.window.showQuickPick(presetItems, {
            placeHolder: `当前颜色: ~${currentR},${currentG},${currentB},${currentA} — 选择预设颜色或自定义`,
            title: 'ArcartX 颜色选择器',
        });

        if (!selected) return;

        let r: number, g: number, b: number, a: number;

        if (selected.color) {
            [r, g, b, a] = selected.color;
        } else {
            // 自定义输入
            const rgbInput = await vscode.window.showInputBox({
                prompt: '输入 RGB 值 (0-255,0-255,0-255)',
                value: `${currentR},${currentG},${currentB}`,
                validateInput: (input) => {
                    const parts = input.split(',').map(s => s.trim());
                    if (parts.length !== 3) return '请输入 3 个值，用逗号分隔';
                    for (const p of parts) {
                        const n = Number(p);
                        if (isNaN(n) || n < 0 || n > 255) return '每个值必须在 0-255 之间';
                    }
                    return null;
                },
            });

            if (!rgbInput) return;

            const rgbParts = rgbInput.split(',').map(s => parseInt(s.trim()));
            r = rgbParts[0];
            g = rgbParts[1];
            b = rgbParts[2];

            const alphaInput = await vscode.window.showInputBox({
                prompt: '输入 Alpha 透明度 (0-255，255=完全不透明)',
                value: `${currentA}`,
                validateInput: (input) => {
                    const n = Number(input);
                    if (isNaN(n) || n < 0 || n > 255) return 'Alpha 必须在 0-255 之间';
                    return null;
                },
            });

            if (!alphaInput) return;
            a = parseInt(alphaInput);
        }

        const colorString = `~${r},${g},${b},${a}`;

        // 第二步：预览确认
        const previewHex = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}${a.toString(16).padStart(2, '0')}`;
        const confirm = await vscode.window.showQuickPick([
            { label: '$(check) 插入', description: `插入 ${colorString}` },
            { label: '$(close) 取消' },
        ], {
            placeHolder: `颜色: ${colorString} (${previewHex})`,
            title: '确认颜色',
        });

        if (!confirm || confirm.label.startsWith('$(close)')) return;

        // 插入或替换
        if (existingColor) {
            // 替换已有颜色值
            const startPos = new vscode.Position(position.line, existingColor.startCol);
            const endPos = new vscode.Position(position.line, existingColor.endCol);
            editor.edit(editBuilder => {
                editBuilder.replace(new vscode.Range(startPos, endPos), colorString);
            });
        } else {
            // 在光标处插入
            editor.edit(editBuilder => {
                editBuilder.insert(position, colorString);
            });
        }
    }

    /**
     * 查找行中指定位置附近的颜色值
     */
    private static findColorAtPosition(lineText: string, charPos: number): { r: number; g: number; b: number; a: number; startCol: number; endCol: number } | null {
        const colorRegex = /~(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})(?:\s*,\s*(\d{1,3}))?/g;
        let match: RegExpExecArray | null;

        while ((match = colorRegex.exec(lineText)) !== null) {
            const startCol = match.index;
            const endCol = match.index + match[0].length;
            if (charPos >= startCol && charPos <= endCol) {
                return {
                    r: parseInt(match[1]),
                    g: parseInt(match[2]),
                    b: parseInt(match[3]),
                    a: match[4] !== undefined ? parseInt(match[4]) : 255,
                    startCol,
                    endCol,
                };
            }
        }
        return null;
    }
}
