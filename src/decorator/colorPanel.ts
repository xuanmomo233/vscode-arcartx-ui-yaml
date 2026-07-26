import * as vscode from 'vscode';
import { controls } from '../completion/structure/rule/control';
import { control_effects } from '../completion/structure/rule/controlEffect';
import * as root from '../completion/structure/rule/root';

/**
 * 侧边栏面板 — 颜色选择器 + 颜色展示 + 控件模板 + Effect 模板 + UI 模板
 */
export class ColorPanelProvider implements vscode.WebviewViewProvider {
    public static readonly viewType = 'arcartxUiYaml.colorPanel';

    private view?: vscode.WebviewView;
    private decorator: { enabled: boolean; setEnabled: (e: boolean) => void } | undefined;

    constructor(private readonly context: vscode.ExtensionContext) {}

    public setDecorator(decorator: { enabled: boolean; setEnabled: (e: boolean) => void }) {
        this.decorator = decorator;
    }

    public resolveWebviewView(
        webviewView: vscode.WebviewView,
        _context: vscode.WebviewViewResolveContext,
        _token: vscode.CancellationToken,
    ) {
        this.view = webviewView;
        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [],
        };

        webviewView.webview.html = this.getHtml(webviewView.webview);

        webviewView.webview.onDidReceiveMessage(message => this.handleMessage(message));
    }

    private handleMessage(message: any) {
        if (!message.command) return;

        switch (message.command) {
            case 'insertText': {
                const editor = vscode.window.activeTextEditor;
                if (editor) {
                    const text = message.text as string;
                    const lines = text.split('\n');
                    editor.edit(editBuilder => {
                        if (lines.length <= 1) {
                            editBuilder.insert(editor.selection.active, text);
                        } else {
                            const pos = editor.selection.active;
                            const indent = ' '.repeat(pos.character);
                            const multiLine = lines.map((line, i) =>
                                i === 0 ? line : indent + line
                            ).join('\n');
                            editBuilder.insert(pos, multiLine);
                        }
                    });
                } else {
                    vscode.window.showWarningMessage('请先打开一个 .arx 文件');
                }
                break;
            }
            case 'copyToClipboard': {
                vscode.env.clipboard.writeText(message.text);
                vscode.window.showInformationMessage(`已复制到剪贴板`);
                break;
            }
            case 'toggleDecorator': {
                if (this.decorator) {
                    this.decorator.setEnabled(message.enabled);
                }
                break;
            }
            case 'getDecoratorState': {
                this.view?.webview.postMessage({
                    command: 'decoratorState',
                    enabled: this.decorator?.enabled ?? true,
                });
                break;
            }
            case 'getCustomTemplates': {
                const templates = this.context.globalState.get<{ label: string; detail: string; insertText: string }[]>('customTemplates', []);
                this.view?.webview.postMessage({ command: 'customTemplates', templates });
                break;
            }
            case 'addCustomTemplate': {
                const templates = this.context.globalState.get<{ label: string; detail: string; insertText: string }[]>('customTemplates', []);
                templates.push({ label: message.label, detail: message.detail, insertText: message.insertText });
                this.context.globalState.update('customTemplates', templates);
                this.view?.webview.postMessage({ command: 'customTemplates', templates });
                vscode.window.showInformationMessage(`模板 "${message.label}" 已添加`);
                break;
            }
            case 'deleteCustomTemplate': {
                const templates = this.context.globalState.get<{ label: string; detail: string; insertText: string }[]>('customTemplates', []);
                const filtered = templates.filter(t => t.label !== message.label);
                this.context.globalState.update('customTemplates', filtered);
                this.view?.webview.postMessage({ command: 'customTemplates', templates: filtered });
                vscode.window.showInformationMessage(`模板 "${message.label}" 已删除`);
                break;
            }
            case 'setTitle': {
                if (this.view) {
                    this.view.title = message.title;
                }
                break;
            }
        }
    }

    private getHtml(webview: vscode.Webview): string {
        const controlTemplates = controls.map(c => ({ label: c.label, detail: c.detail, insertText: c.insertText }));
        const effectTemplates = control_effects.map(e => ({ label: e.label, detail: e.detail, insertText: e.insertText }));
        const uiTemplates = [
            { label: 'ui-full', detail: '完整UI配置模板(含所有配置项)', insertText: root.ui_full.insertText },
            { label: 'ui-base', detail: 'UI基础设定', insertText: root.ui_base.insertText },
            { label: 'controls-empty', detail: '空控件列表', insertText: root.controls_empty.insertText },
            { label: 'controls-with-adaptive', detail: '自适应布局控件结构', insertText: root.controls_with_adaptive.insertText },
            { label: 'tip-base', detail: '基础Tip配置模板', insertText: root.tips_base.insertText },
            { label: 'tip-adaptive', detail: '自适应Tip配置模板', insertText: root.tips_adaptive.insertText },
            { label: 'entity-model', detail: '实体模型渲染配置', insertText: root.entity_model_base.insertText },
        ];
        const presetColors = [
            { name: '白色', rgba: '255,255,255,255', hex: '#FFFFFF' },
            { name: '黑色', rgba: '0,0,0,255', hex: '#000000' },
            { name: '红色', rgba: '255,0,0,255', hex: '#FF0000' },
            { name: '绿色', rgba: '0,255,0,255', hex: '#00FF00' },
            { name: '蓝色', rgba: '0,0,255,255', hex: '#0000FF' },
            { name: '黄色', rgba: '255,255,0,255', hex: '#FFFF00' },
            { name: '青色', rgba: '0,255,255,255', hex: '#00FFFF' },
            { name: '紫色', rgba: '255,0,255,255', hex: '#FF00FF' },
            { name: '橙色', rgba: '255,165,0,255', hex: '#FFA500' },
            { name: '浅灰', rgba: '192,192,192,255', hex: '#C0C0C0' },
            { name: '灰色', rgba: '128,128,128,255', hex: '#808080' },
            { name: '深灰', rgba: '64,64,64,255', hex: '#404040' },
            { name: '半透明黑', rgba: '0,0,0,120', hex: '#00000078' },
            { name: '半透明白', rgba: '255,255,255,120', hex: '#FFFFFF78' },
            { name: '半透明黑80', rgba: '0,0,0,80', hex: '#00000050' },
            { name: '浅蓝绿', rgba: '110,230,80,255', hex: '#6EE650' },
        ];
        return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body {
    background: var(--vscode-editor-background);
    color: var(--vscode-editor-foreground);
    font-family: var(--vscode-editor-font-family);
    font-size: 13px;
    padding: 8px;
}
.section { margin-bottom: 12px; }
.section-title {
    font-weight: bold;
    font-size: 12px;
    text-transform: uppercase;
    color: var(--vscode-settings-textInputForeground);
    margin-bottom: 6px;
    border-bottom: 1px solid var(--vscode-editorWidget-border);
    padding-bottom: 3px;
}
label { display: block; margin-bottom: 3px; font-size: 12px; }
input[type="range"] { width: 100%; height: 20px; cursor: pointer; }
input[type="text"], input[type="number"] {
    background: var(--vscode-input-background);
    color: var(--vscode-input-foreground);
    border: 1px solid var(--vscode-input-border);
    padding: 3px 6px;
    border-radius: 2px;
    font-size: 12px;
    width: 100%;
}
.row { display: flex; gap: 6px; align-items: center; margin-bottom: 4px; }
.row label { min-width: 16px; text-align: center; font-weight: bold; }
.row .val { min-width: 36px; text-align: right; font-size: 11px; }

.color-picker-wrap {
    position: relative;
    margin-bottom: 8px;
}
#colorPicker {
    width: 100%;
    height: 160px;
    border: 1px solid var(--vscode-editorWidget-border);
    border-radius: 4px;
    cursor: crosshair;
}
#hueBar {
    width: 100%;
    height: 16px;
    margin-top: 4px;
    border: 1px solid var(--vscode-editorWidget-border);
    border-radius: 2px;
    cursor: pointer;
    background: linear-gradient(to right, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000);
}

.preview-box {
    width: 100%;
    height: 40px;
    border: 1px solid var(--vscode-editorWidget-border);
    border-radius: 4px;
    margin-top: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    font-weight: bold;
    position: relative;
    overflow: hidden;
}
.preview-text {
    position: relative;
    z-index: 1;
    text-shadow: 0 0 2px rgba(0,0,0,0.5);
}

.output-group { margin-bottom: 6px; }
.output-label {
    font-size: 11px;
    color: var(--vscode-descriptionForeground);
    margin-bottom: 2px;
}
.output-row {
    display: flex;
    gap: 4px;
    align-items: center;
}
.output-row input[type="text"] {
    flex: 1;
    font-family: var(--vscode-editor-font-family);
    font-size: 12px;
}
.btn {
    background: var(--vscode-button-background);
    color: var(--vscode-button-foreground);
    border: none;
    padding: 4px 10px;
    border-radius: 2px;
    cursor: pointer;
    font-size: 12px;
    white-space: nowrap;
}
.btn:hover { background: var(--vscode-button-hoverBackground); }
.btn-sm { padding: 3px 6px; font-size: 11px; }

.gradient-section { margin-top: 8px; }
.gradient-preview {
    width: 100%;
    height: 36px;
    border: 1px solid var(--vscode-editorWidget-border);
    border-radius: 4px;
    margin-top: 4px;
}
.gradient-controls {
    display: flex;
    gap: 8px;
    margin-bottom: 4px;
}
.gradient-controls > div { flex: 1; }
select {
    background: var(--vscode-input-background);
    color: var(--vscode-input-foreground);
    border: 1px solid var(--vscode-input-border);
    padding: 3px;
    border-radius: 2px;
    font-size: 12px;
    width: 100%;
}
.tabs {
    display: flex;
    gap: 2px;
    margin-bottom: 8px;
}
.tab {
    flex: 1;
    padding: 4px 8px;
    text-align: center;
    cursor: pointer;
    border: 1px solid var(--vscode-editorWidget-border);
    border-radius: 2px 2px 0 0;
    font-size: 12px;
}
.tab.active {
    background: var(--vscode-button-background);
    color: var(--vscode-button-foreground);
    border-color: var(--vscode-button-background);
}
.tab-content { display: none; }
.tab-content.active { display: block; }
.color-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 4px; }
.color-card {
    border: 1px solid var(--vscode-editorWidget-border); border-radius: 3px;
    padding: 5px; cursor: pointer; display: flex; align-items: center; gap: 5px;
    transition: border-color 0.15s;
}
.color-card:hover { border-color: var(--vscode-button-background); }
.color-swatch { width: 22px; height: 22px; border-radius: 3px; border: 1px solid rgba(128,128,128,0.3); flex-shrink: 0; }
.color-card-info { flex: 1; min-width: 0; }
.color-card-name { font-size: 11px; font-weight: bold; }
.color-card-value { font-size: 10px; color: var(--vscode-descriptionForeground); }
.template-list { display: flex; flex-direction: column; gap: 4px; }
.template-item {
    border: 1px solid var(--vscode-editorWidget-border); border-radius: 3px;
    padding: 6px; cursor: default; transition: border-color 0.15s;
}
.template-item:hover { border-color: var(--vscode-button-background); }
.template-item-label { font-size: 12px; font-weight: bold; }
.template-item-detail { font-size: 10px; color: var(--vscode-descriptionForeground); margin-top: 2px; }
.template-item-actions { display: flex; gap: 4px; margin-top: 4px; }
.template-item-preview {
    font-size: 10px; font-family: var(--vscode-editor-font-family);
    background: var(--vscode-textCodeBlock-background);
    border: 1px solid var(--vscode-editorWidget-border);
    border-radius: 2px; padding: 5px; margin-top: 4px;
    max-height: 100px; overflow: auto; white-space: pre-wrap;
    word-break: break-all; color: var(--vscode-editor-foreground);
}
.search-box { margin-bottom: 6px; }
.decorator-toggle {
    display: flex; align-items: center; justify-content: space-between;
    padding: 6px 8px; margin-bottom: 8px;
    border: 1px solid var(--vscode-editorWidget-border); border-radius: 3px;
    background: var(--vscode-editor-inactiveSelectionBackground);
}
.decorator-toggle-label { font-size: 12px; font-weight: bold; }
.switch { position: relative; width: 32px; height: 18px; cursor: pointer; }
.switch input { opacity: 0; width: 0; height: 0; }
.switch .slider {
    position: absolute; top: 0; left: 0; right: 0; bottom: 0;
    background: var(--vscode-input-background); border: 1px solid var(--vscode-input-border);
    border-radius: 9px; transition: 0.2s;
}
.switch .slider:before {
    content: ''; position: absolute; width: 12px; height: 12px;
    left: 2px; top: 2px; background: var(--vscode-editor-foreground);
    border-radius: 50%; transition: 0.2s;
}
.switch input:checked + .slider { background: var(--vscode-button-background); border-color: var(--vscode-button-background); }
.switch input:checked + .slider:before { transform: translateX(14px); background: var(--vscode-button-foreground); }
</style>
</head>
<body>

<div class="decorator-toggle">
    <span class="decorator-toggle-label">颜色色块装饰器</span>
    <label class="switch"><input type="checkbox" id="decoratorSwitch" checked><span class="slider"></span></label>
</div>

<div class="tabs">
    <div class="tab active" data-tab="rgba">RGBA</div>
    <div class="tab" data-tab="text">文字色</div>
    <div class="tab" data-tab="gradient">渐变</div>
    <div class="tab" data-tab="colors">色板</div>
    <div class="tab" data-tab="controls">控件</div>
    <div class="tab" data-tab="effects">特效</div>
    <div class="tab" data-tab="ui">UI模板</div>
    <div class="tab" data-tab="custom">自定义</div>
</div>

<!-- Tab 1: RGBA 色块 -->
<div id="tab-rgba" class="tab-content active">
    <div class="section">
        <div class="section-title">色谱选择</div>
        <div class="color-picker-wrap">
            <canvas id="colorPicker" width="240" height="160"></canvas>
            <canvas id="hueBar" width="240" height="16"></canvas>
        </div>
    </div>

    <div class="section">
        <div class="section-title">RGBA 值</div>
        <div class="row">
            <label style="color:#e74c3c">R</label>
            <input type="range" id="rSlider" min="0" max="255" value="255">
            <span class="val" id="rVal">255</span>
        </div>
        <div class="row">
            <label style="color:#2ecc71">G</label>
            <input type="range" id="gSlider" min="0" max="255" value="255">
            <span class="val" id="gVal">255</span>
        </div>
        <div class="row">
            <label style="color:#3498db">B</label>
            <input type="range" id="bSlider" min="0" max="255" value="255">
            <span class="val" id="bVal">255</span>
        </div>
        <div class="row">
            <label>A</label>
            <input type="range" id="aSlider" min="0" max="255" value="255">
            <span class="val" id="aVal">255</span>
        </div>
    </div>

    <div class="section">
        <div class="section-title">预览</div>
        <div class="preview-box" id="rgbaPreview">
            <span class="preview-text" id="rgbaPreviewText">~255,255,255,255</span>
        </div>
    </div>

    <div class="section">
        <div class="section-title">输出格式</div>
        <div class="output-group">
            <div class="output-label">控件属性值 (~R,G,B,A)</div>
            <div class="output-row">
                <input type="text" id="rgbaOutput" readonly value="~255,255,255,255">
                <button class="btn btn-sm" onclick="copyText('rgbaOutput')">复制</button>
                <button class="btn btn-sm" onclick="insertText('rgbaOutput')">插入</button>
            </div>
        </div>
        <div class="output-group">
            <div class="output-label">不带 Alpha (~R,G,B)</div>
            <div class="output-row">
                <input type="text" id="rgbOutput" readonly value="~255,255,255">
                <button class="btn btn-sm" onclick="copyText('rgbOutput')">复制</button>
                <button class="btn btn-sm" onclick="insertText('rgbOutput')">插入</button>
            </div>
        </div>
        <div class="output-group">
            <div class="output-label">HEX (#RRGGBBAA)</div>
            <div class="output-row">
                <input type="text" id="hexOutput" readonly value="#FFFFFFFF">
                <button class="btn btn-sm" onclick="copyText('hexOutput')">复制</button>
            </div>
        </div>
    </div>
</div>

<!-- Tab 2: 文字颜色 -->
<div id="tab-text" class="tab-content">
    <div class="section">
        <div class="section-title">色谱选择</div>
        <div class="color-picker-wrap">
            <canvas id="colorPicker2" width="240" height="160"></canvas>
            <canvas id="hueBar2" width="240" height="16"></canvas>
        </div>
    </div>

    <div class="section">
        <div class="section-title">RGB 值</div>
        <div class="row">
            <label style="color:#e74c3c">R</label>
            <input type="range" id="rSlider2" min="0" max="255" value="255">
            <span class="val" id="rVal2">255</span>
        </div>
        <div class="row">
            <label style="color:#2ecc71">G</label>
            <input type="range" id="gSlider2" min="0" max="255" value="85">
            <span class="val" id="gVal2">85</span>
        </div>
        <div class="row">
            <label style="color:#3498db">B</label>
            <input type="range" id="bSlider2" min="0" max="255" value="0">
            <span class="val" id="bVal2">0</span>
        </div>
    </div>

    <div class="section">
        <div class="section-title">预览</div>
        <div class="preview-box" id="textPreview" style="background:#1e1e1e">
            <span class="preview-text" id="textPreviewContent" style="font-size:18px;">§#FF5500 示例文字</span>
        </div>
    </div>

    <div class="section">
        <div class="section-title">输出格式</div>
        <div class="output-group">
            <div class="output-label">自定义颜色 (§#RRGGBB)</div>
            <div class="output-row">
                <input type="text" id="hexColorOutput" readonly value="§#FF5500">
                <button class="btn btn-sm" onclick="copyText('hexColorOutput')">复制</button>
                <button class="btn btn-sm" onclick="insertText('hexColorOutput')">插入</button>
            </div>
        </div>
        <div class="output-group">
            <div class="output-label">描边颜色 (§s§#RRGGBB)</div>
            <div class="output-row">
                <input type="text" id="strokeOutput" readonly value="§s§#FF5500">
                <button class="btn btn-sm" onclick="copyText('strokeOutput')">复制</button>
                <button class="btn btn-sm" onclick="insertText('strokeOutput')">插入</button>
            </div>
        </div>
        <div class="output-group">
            <div class="output-label">流光 (§^RRGGBB)</div>
            <div class="output-row">
                <input type="text" id="flowOutput" readonly value="§^FF5500">
                <button class="btn btn-sm" onclick="copyText('flowOutput')">复制</button>
                <button class="btn btn-sm" onclick="insertText('flowOutput')">插入</button>
            </div>
        </div>
        <div class="output-group">
            <div class="output-label">荧光笔背景 (§*RRGGBB)</div>
            <div class="output-row">
                <input type="text" id="highlightOutput" readonly value="§*FF5500">
                <button class="btn btn-sm" onclick="copyText('highlightOutput')">复制</button>
                <button class="btn btn-sm" onclick="insertText('highlightOutput')">插入</button>
            </div>
        </div>
    </div>
</div>

<!-- Tab 3: 渐变色 -->
<div id="tab-gradient" class="tab-content">
    <div class="section">
        <div class="section-title">起始色 (color1)</div>
        <div class="color-picker-wrap">
            <canvas id="colorPicker3a" width="240" height="120"></canvas>
            <canvas id="hueBar3a" width="240" height="16"></canvas>
        </div>
        <div class="row">
            <label style="color:#e74c3c">R</label>
            <input type="range" id="rSlider3a" min="0" max="255" value="255">
            <span class="val" id="rVal3a">255</span>
        </div>
        <div class="row">
            <label style="color:#2ecc71">G</label>
            <input type="range" id="gSlider3a" min="0" max="255" value="0">
            <span class="val" id="gVal3a">0</span>
        </div>
        <div class="row">
            <label style="color:#3498db">B</label>
            <input type="range" id="bSlider3a" min="0" max="255" value="0">
            <span class="val" id="bVal3a">0</span>
        </div>
        <div class="row">
            <label>A</label>
            <input type="range" id="aSlider3a" min="0" max="255" value="100">
            <span class="val" id="aVal3a">100</span>
        </div>
    </div>

    <div class="section">
        <div class="section-title">结束色 (color2)</div>
        <div class="color-picker-wrap">
            <canvas id="colorPicker3b" width="240" height="120"></canvas>
            <canvas id="hueBar3b" width="240" height="16"></canvas>
        </div>
        <div class="row">
            <label style="color:#e74c3c">R</label>
            <input type="range" id="rSlider3b" min="0" max="255" value="0">
            <span class="val" id="rVal3b">0</span>
        </div>
        <div class="row">
            <label style="color:#2ecc71">G</label>
            <input type="range" id="gSlider3b" min="0" max="255" value="0">
            <span class="val" id="gVal3b">0</span>
        </div>
        <div class="row">
            <label style="color:#3498db">B</label>
            <input type="range" id="bSlider3b" min="0" max="255" value="255">
            <span class="val" id="bVal3b">255</span>
        </div>
        <div class="row">
            <label>A</label>
            <input type="range" id="aSlider3b" min="0" max="255" value="50">
            <span class="val" id="aVal3b">50</span>
        </div>
    </div>

    <div class="section">
        <div class="section-title">渐变参数</div>
        <div class="row">
            <label>类型</label>
            <select id="gradType">
                <option value="0">0 - 线性</option>
                <option value="1" selected>1 - 径向</option>
                <option value="2">2 - 角度</option>
                <option value="3">3 - 菱形</option>
            </select>
        </div>
        <div class="row">
            <label>角度</label>
            <input type="number" id="gradAngle" value="90" min="0" max="360" style="width:60px">
            <span class="val">度</span>
        </div>
    </div>

    <div class="section">
        <div class="section-title">预览</div>
        <div class="gradient-preview" id="gradPreview"></div>
    </div>

    <div class="section">
        <div class="section-title">输出格式</div>
        <div class="output-group">
            <div class="output-label">effect 渐变块 (YAML)</div>
            <div class="output-row">
                <textarea id="gradEffectOutput" readonly rows="5" style="width:100%;background:var(--vscode-input-background);color:var(--vscode-input-foreground);border:1px solid var(--vscode-input-border);padding:4px;border-radius:3px;font-family:var(--vscode-editor-font-family);font-size:11px;resize:vertical"></textarea>
            </div>
            <div class="output-row">
                <button class="btn btn-sm" onclick="copyText('gradEffectOutput')">复制</button>
                <button class="btn btn-sm" onclick="insertText('gradEffectOutput')">插入</button>
            </div>
        </div>
        <div class="output-group">
            <div class="output-label">文字渐变 (§~RRGGBB-RRGGBB)</div>
            <div class="output-row">
                <input type="text" id="gradTextOutput" readonly>
                <button class="btn btn-sm" onclick="copyText('gradTextOutput')">复制</button>
                <button class="btn btn-sm" onclick="insertText('gradTextOutput')">插入</button>
            </div>
        </div>
        <div class="output-group">
            <div class="output-label">文字渐变预览</div>
            <input type="text" id="gradTextInput" placeholder="输入要预览的文字..." value="渐变文字示例" style="width:100%;margin-bottom:4px;background:var(--vscode-input-background);color:var(--vscode-input-foreground);border:1px solid var(--vscode-input-border);padding:4px;border-radius:3px;">
            <div class="preview-box" id="gradTextPreview" style="background:#1e1e1e">
                <span class="preview-text" id="gradTextPreviewContent" style="font-size:18px;">渐变文字示例</span>
            </div>
            <div class="output-row" style="margin-top:4px;">
                <button class="btn btn-sm" id="gradTextInsertBtn">插入带格式文字</button>
                <button class="btn btn-sm" id="gradTextCopyBtn">复制带格式文字</button>
            </div>
        </div>
    </div>
</div>

<!-- Tab 4: 色板 -->
<div id="tab-colors" class="tab-content">
    <div class="section">
        <div class="section-title">预设颜色</div>
        <div class="color-grid" id="colorGrid"></div>
    </div>
</div>

<!-- Tab 5: 控件模板 -->
<div id="tab-controls" class="tab-content">
    <div class="search-box"><input type="text" id="controlSearch" placeholder="搜索控件..."></div>
    <div class="template-list" id="controlList"></div>
</div>

<!-- Tab 6: 特效模板 -->
<div id="tab-effects" class="tab-content">
    <div class="template-list" id="effectList"></div>
</div>

<!-- Tab 7: UI 模板 -->
<div id="tab-ui" class="tab-content">
    <div class="template-list" id="uiList"></div>
</div>

<!-- Tab 8: 自定义模板 -->
<div id="tab-custom" class="tab-content">
    <div class="section">
        <div class="section-title">添加模板</div>
        <input type="text" id="customLabel" placeholder="模板名称" style="width:100%;margin-bottom:4px;background:var(--vscode-input-background);color:var(--vscode-input-foreground);border:1px solid var(--vscode-input-border);padding:4px;border-radius:3px;">
        <input type="text" id="customDetail" placeholder="描述（可选）" style="width:100%;margin-bottom:4px;background:var(--vscode-input-background);color:var(--vscode-input-foreground);border:1px solid var(--vscode-input-border);padding:4px;border-radius:3px;">
        <textarea id="customContent" placeholder="模板内容（多行 YAML）..." rows="6" style="width:100%;margin-bottom:4px;background:var(--vscode-input-background);color:var(--vscode-input-foreground);border:1px solid var(--vscode-input-border);padding:4px;border-radius:3px;font-family:var(--vscode-editor-font-family);font-size:11px;resize:vertical;"></textarea>
        <button class="btn btn-sm" id="addCustomBtn" style="width:100%;">添加模板</button>
    </div>
    <div class="section">
        <div class="section-title">已保存的模板</div>
        <div class="template-list" id="customList"></div>
    </div>
</div>

<script>
const vscode = acquireVsCodeApi();

// ===== 装饰器开关 =====
const decoratorSwitch = document.getElementById('decoratorSwitch');
decoratorSwitch.addEventListener('change', () => {
    vscode.postMessage({ command: 'toggleDecorator', enabled: decoratorSwitch.checked });
});
// 接收扩展返回的装饰器状态
window.addEventListener('message', (e) => {
    const msg = e.data;
    if (msg.command === 'decoratorState') {
        decoratorSwitch.checked = msg.enabled;
    }
});
// 初始化时请求当前状态
vscode.postMessage({ command: 'getDecoratorState' });

// ===== 通用工具 =====
function hsvToRgb(h, s, v) {
    s = s / 100; v = v / 100;
    const c = v * s;
    const x = c * (1 - Math.abs((h / 60) % 2 - 1));
    const m = v - c;
    let r, g, b;
    if (h < 60) { r=c; g=x; b=0; }
    else if (h < 120) { r=x; g=c; b=0; }
    else if (h < 180) { r=0; g=c; b=x; }
    else if (h < 240) { r=0; g=x; b=c; }
    else if (h < 300) { r=x; g=0; b=c; }
    else { r=c; g=0; b=x; }
    return [Math.round((r+m)*255), Math.round((g+m)*255), Math.round((b+m)*255)];
}

function rgbToHex(r, g, b) {
    return [r, g, b].map(v => v.toString(16).padStart(2, '0').toUpperCase()).join('');
}

function rgbToHexA(r, g, b, a) {
    return '#' + rgbToHex(r, g, b) + a.toString(16).padStart(2, '0').toUpperCase();
}

// ===== 色谱画布初始化 =====
function initColorPicker(canvasId, hueCanvasId, onPick) {
    const canvas = document.getElementById(canvasId);
    const ctx = canvas.getContext('2d');
    const hueCanvas = document.getElementById(hueCanvasId);
    const hueCtx = hueCanvas.getContext('2d');
    let currentHue = 0;

    function drawColorArea(hue) {
        const w = canvas.width, h = canvas.height;
        // 白到色
        const grad1 = ctx.createLinearGradient(0, 0, w, 0);
        grad1.addColorStop(0, '#ffffff');
        const [r,g,b] = hsvToRgb(hue, 100, 100);
        grad1.addColorStop(1, \`rgb(\${r},\${g},\${b})\`);
        ctx.fillStyle = grad1;
        ctx.fillRect(0, 0, w, h);
        // 透明到黑
        const grad2 = ctx.createLinearGradient(0, 0, 0, h);
        grad2.addColorStop(0, 'rgba(0,0,0,0)');
        grad2.addColorStop(1, 'rgba(0,0,0,1)');
        ctx.fillStyle = grad2;
        ctx.fillRect(0, 0, w, h);
    }

    function drawHueBar() {
        const w = hueCanvas.width, h = hueCanvas.height;
        const grad = hueCtx.createLinearGradient(0, 0, w, 0);
        grad.addColorStop(0, '#ff0000');
        grad.addColorStop(1/6, '#ffff00');
        grad.addColorStop(2/6, '#00ff00');
        grad.addColorStop(3/6, '#00ffff');
        grad.addColorStop(4/6, '#0000ff');
        grad.addColorStop(5/6, '#ff00ff');
        grad.addColorStop(1, '#ff0000');
        hueCtx.fillStyle = grad;
        hueCtx.fillRect(0, 0, w, h);
    }

    drawColorArea(0);
    drawHueBar();

    canvas.addEventListener('mousedown', (e) => {
        const rect = canvas.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;
        const s = x * 100;
        const v = (1 - y) * 100;
        const [r, g, b] = hsvToRgb(currentHue, s, v);
        onPick(r, g, b);
    });

    hueCanvas.addEventListener('mousedown', (e) => {
        const rect = hueCanvas.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        currentHue = x * 360;
        drawColorArea(currentHue);
    });
}

// ===== Tab 切换 =====
const tabTitles = {
    'rgba': 'RGBA 色块',
    'text': '文字颜色',
    'gradient': '渐变色',
    'colors': '色板',
    'controls': '控件模板',
    'effects': '特效模板',
    'ui': 'UI 模板',
    'custom': '自定义模板',
};
document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        tab.classList.add('active');
        document.getElementById('tab-' + tab.dataset.tab).classList.add('active');
        vscode.postMessage({ command: 'setTitle', title: tabTitles[tab.dataset.tab] || '工具箱' });
    });
});
// 初始化标题
vscode.postMessage({ command: 'setTitle', title: tabTitles['rgba'] });

// ===== Tab 1: RGBA =====
function updateRgba() {
    const r = +document.getElementById('rSlider').value;
    const g = +document.getElementById('gSlider').value;
    const b = +document.getElementById('bSlider').value;
    const a = +document.getElementById('aSlider').value;
    document.getElementById('rVal').textContent = r;
    document.getElementById('gVal').textContent = g;
    document.getElementById('bVal').textContent = b;
    document.getElementById('aVal').textContent = a;
    const hex = rgbToHexA(r, g, b, a);
    const rgbaStr = \`~\${r},\${g},\${b},\${a}\`;
    const rgbStr = \`~\${r},\${g},\${b}\`;
    document.getElementById('rgbaPreview').style.background = hex;
    document.getElementById('rgbaPreviewText').textContent = rgbaStr;
    document.getElementById('rgbaPreviewText').style.color = (r+g+b) > 382 ? '#000' : '#fff';
    document.getElementById('rgbaOutput').value = rgbaStr;
    document.getElementById('rgbOutput').value = rgbStr;
    document.getElementById('hexOutput').value = hex.toUpperCase();
}

['rSlider', 'gSlider', 'bSlider', 'aSlider'].forEach(id => {
    document.getElementById(id).addEventListener('input', updateRgba);
});

initColorPicker('colorPicker', 'hueBar', (r, g, b) => {
    document.getElementById('rSlider').value = r;
    document.getElementById('gSlider').value = g;
    document.getElementById('bSlider').value = b;
    updateRgba();
});

// ===== Tab 2: 文字颜色 =====
function updateTextColor() {
    const r = +document.getElementById('rSlider2').value;
    const g = +document.getElementById('gSlider2').value;
    const b = +document.getElementById('bSlider2').value;
    document.getElementById('rVal2').textContent = r;
    document.getElementById('gVal2').textContent = g;
    document.getElementById('bVal2').textContent = b;
    const hex = rgbToHex(r, g, b);
    const colorCode = '§#' + hex;
    document.getElementById('textPreviewContent').textContent = colorCode + ' 示例文字§r';
    document.getElementById('textPreviewContent').style.color = '#' + hex;
    document.getElementById('hexColorOutput').value = colorCode;
    document.getElementById('strokeOutput').value = '§s§#' + hex;
    document.getElementById('flowOutput').value = '§^' + hex;
    document.getElementById('highlightOutput').value = '§*' + hex;
}

['rSlider2', 'gSlider2', 'bSlider2'].forEach(id => {
    document.getElementById(id).addEventListener('input', updateTextColor);
});

initColorPicker('colorPicker2', 'hueBar2', (r, g, b) => {
    document.getElementById('rSlider2').value = r;
    document.getElementById('gSlider2').value = g;
    document.getElementById('bSlider2').value = b;
    updateTextColor();
});

// ===== Tab 3: 渐变色 =====
function updateGradient() {
    const r1 = +document.getElementById('rSlider3a').value;
    const g1 = +document.getElementById('gSlider3a').value;
    const b1 = +document.getElementById('bSlider3a').value;
    const a1 = +document.getElementById('aSlider3a').value;
    const r2 = +document.getElementById('rSlider3b').value;
    const g2 = +document.getElementById('gSlider3b').value;
    const b2 = +document.getElementById('bSlider3b').value;
    const a2 = +document.getElementById('aSlider3b').value;
    const type = document.getElementById('gradType').value;
    const angle = document.getElementById('gradAngle').value || 90;

    document.getElementById('rVal3a').textContent = r1;
    document.getElementById('gVal3a').textContent = g1;
    document.getElementById('bVal3a').textContent = b1;
    document.getElementById('aVal3a').textContent = a1;
    document.getElementById('rVal3b').textContent = r2;
    document.getElementById('gVal3b').textContent = g2;
    document.getElementById('bVal3b').textContent = b2;
    document.getElementById('aVal3b').textContent = a2;

    const hex1 = rgbToHexA(r1, g1, b1, a1);
    const hex2 = rgbToHexA(r2, g2, b2, a2);

    // 渐变预览
    const preview = document.getElementById('gradPreview');
    if (type === '0') {
        preview.style.background = \`linear-gradient(\${angle}deg, \${hex1}, \${hex2})\`;
    } else if (type === '1') {
        preview.style.background = \`radial-gradient(circle, \${hex1}, \${hex2})\`;
    } else if (type === '2') {
        preview.style.background = \`conic-gradient(from \${angle}deg, \${hex1}, \${hex2}, \${hex1})\`;
    } else {
        preview.style.background = \`linear-gradient(\${angle}deg, \${hex1}, \${hex2}, \${hex1})\`;
    }

    // effect 渐变 YAML
    const effectStr = \`gradient:\\n  color1: ~\${r1},\${g1},\${b1},\${a1}\\n  color2: ~\${r2},\${g2},\${b2},\${a2}\\n  type: \${type}\\n  angleDeg: \${angle}\`;
    document.getElementById('gradEffectOutput').value = effectStr;

    // 文字渐变
    const hex1NoA = rgbToHex(r1, g1, b1);
    const hex2NoA = rgbToHex(r2, g2, b2);
    const textGrad = '§~' + hex1NoA + '-' + hex2NoA;
    document.getElementById('gradTextOutput').value = textGrad;
    updateGradTextPreview();
}

function updateGradTextPreview() {
    const textGrad = document.getElementById('gradTextOutput').value;
    const inputText = document.getElementById('gradTextInput').value || '渐变文字示例';
    const previewEl = document.getElementById('gradTextPreviewContent');
    previewEl.textContent = inputText;
    const m = textGrad.match(/§~([0-9A-Fa-f]{6})-([0-9A-Fa-f]{6})/);
    if (m) {
        previewEl.style.background = 'linear-gradient(90deg, #' + m[1] + ', #' + m[2] + ')';
        previewEl.style.webkitBackgroundClip = 'text';
        previewEl.style.backgroundClip = 'text';
        previewEl.style.webkitTextFillColor = 'transparent';
        previewEl.style.color = 'transparent';
    }
}

document.getElementById('gradTextInput').addEventListener('input', updateGradTextPreview);
document.getElementById('gradTextInsertBtn').addEventListener('click', () => {
    const textGrad = document.getElementById('gradTextOutput').value;
    const inputText = document.getElementById('gradTextInput').value || '';
    vscode.postMessage({ command: 'insertText', text: textGrad + inputText + '§r' });
});
document.getElementById('gradTextCopyBtn').addEventListener('click', () => {
    const textGrad = document.getElementById('gradTextOutput').value;
    const inputText = document.getElementById('gradTextInput').value || '';
    vscode.postMessage({ command: 'copyToClipboard', text: textGrad + inputText + '§r' });
});

['rSlider3a', 'gSlider3a', 'bSlider3a', 'aSlider3a',
 'rSlider3b', 'gSlider3b', 'bSlider3b', 'aSlider3b',
 'gradType', 'gradAngle'].forEach(id => {
    const el = document.getElementById(id);
    el.addEventListener('input', updateGradient);
    el.addEventListener('change', updateGradient);
});

initColorPicker('colorPicker3a', 'hueBar3a', (r, g, b) => {
    document.getElementById('rSlider3a').value = r;
    document.getElementById('gSlider3a').value = g;
    document.getElementById('bSlider3a').value = b;
    updateGradient();
});

initColorPicker('colorPicker3b', 'hueBar3b', (r, g, b) => {
    document.getElementById('rSlider3b').value = r;
    document.getElementById('gSlider3b').value = g;
    document.getElementById('bSlider3b').value = b;
    updateGradient();
});

// ===== 通信函数 =====
function insertText(inputId) {
    const val = document.getElementById(inputId).value;
    vscode.postMessage({ command: 'insertText', text: val });
}

function copyText(inputId) {
    const val = document.getElementById(inputId).value;
    vscode.postMessage({ command: 'copyToClipboard', text: val });
}

function insertRaw(text) { vscode.postMessage({ command: 'insertText', text }); }
function copyRaw(text) { vscode.postMessage({ command: 'copyToClipboard', text }); }

function stripSnippetSyntax(text) {
    return text
        .replace(/\\$\{(\\d+):([^}]*)\}/g, '$2')
        .replace(/\\$\{(\\d+)\|([^|}]*)\|[^}]*\}/g, '$2')
        .replace(/\\$\{(\\d+)\}/g, '')
        .replace(/\\$\\d+/g, '');
}

function makeTemplateItem(t) {
    const item = document.createElement('div');
    item.className = 'template-item';
    item.innerHTML = '<div class="template-item-label">' + t.label + '</div>' +
        '<div class="template-item-detail">' + t.detail + '</div>' +
        '<div class="template-item-actions">' +
        '<button class="btn btn-sm">复制</button>' +
        '<button class="btn btn-sm">插入</button>' +
        '<button class="btn btn-sm">预览</button></div>' +
        '<div class="template-item-preview" style="display:none"></div>';
    const btns = item.querySelectorAll('button');
    btns[0].addEventListener('click', () => copyRaw(stripSnippetSyntax(t.insertText)));
    btns[1].addEventListener('click', () => insertRaw(stripSnippetSyntax(t.insertText)));
    btns[2].addEventListener('click', () => {
        const pre = item.querySelector('.template-item-preview');
        if (pre.style.display === 'none') { pre.textContent = stripSnippetSyntax(t.insertText); pre.style.display = 'block'; btns[2].textContent = '隐藏'; }
        else { pre.style.display = 'none'; btns[2].textContent = '预览'; }
    });
    return item;
}

// ===== Tab 4: 色板 =====
const presetColors = ${JSON.stringify(presetColors)};
const colorGrid = document.getElementById('colorGrid');
presetColors.forEach(c => {
    const card = document.createElement('div');
    card.className = 'color-card';
    card.innerHTML = '<div class="color-swatch" style="background:' + c.hex + '"></div>' +
        '<div class="color-card-info"><div class="color-card-name">' + c.name + '</div>' +
        '<div class="color-card-value">~' + c.rgba + '</div></div>';
    card.addEventListener('click', () => {
        const parts = c.rgba.split(',');
        document.getElementById('rSlider').value = parts[0];
        document.getElementById('gSlider').value = parts[1];
        document.getElementById('bSlider').value = parts[2];
        document.getElementById('aSlider').value = parts[3];
        updateRgba();
        document.querySelector('[data-tab="rgba"]').click();
    });
    colorGrid.appendChild(card);
});

// ===== Tab 5: 控件模板 =====
const controlTemplates = ${JSON.stringify(controlTemplates)};
function renderControls(filter) {
    const list = document.getElementById('controlList');
    list.innerHTML = '';
    controlTemplates.filter(t => !filter || t.label.toLowerCase().includes(filter.toLowerCase()) || t.detail.includes(filter))
        .forEach(t => list.appendChild(makeTemplateItem(t)));
}
renderControls('');
document.getElementById('controlSearch').addEventListener('input', (e) => renderControls(e.target.value));

// ===== Tab 6: 特效模板 =====
const effectTemplates = ${JSON.stringify(effectTemplates)};
const effectList = document.getElementById('effectList');
effectTemplates.forEach(t => effectList.appendChild(makeTemplateItem(t)));

// ===== Tab 7: UI 模板 =====
const uiTemplates = ${JSON.stringify(uiTemplates)};
const uiList = document.getElementById('uiList');
uiTemplates.forEach(t => uiList.appendChild(makeTemplateItem(t)));

// ===== Tab 8: 自定义模板 =====
function makeCustomTemplateItem(t) {
    const item = document.createElement('div');
    item.className = 'template-item';
    item.innerHTML = '<div class="template-item-label">' + t.label + '</div>' +
        '<div class="template-item-detail">' + (t.detail || '') + '</div>' +
        '<div class="template-item-actions">' +
        '<button class="btn btn-sm">复制</button>' +
        '<button class="btn btn-sm">插入</button>' +
        '<button class="btn btn-sm">预览</button>' +
        '<button class="btn btn-sm" style="color:var(--vscode-errorForeground)">删除</button></div>' +
        '<div class="template-item-preview" style="display:none"></div>';
    const btns = item.querySelectorAll('button');
    btns[0].addEventListener('click', () => copyRaw(t.insertText));
    btns[1].addEventListener('click', () => insertRaw(t.insertText));
    btns[2].addEventListener('click', () => {
        const pre = item.querySelector('.template-item-preview');
        if (pre.style.display === 'none') { pre.textContent = t.insertText; pre.style.display = 'block'; btns[2].textContent = '隐藏'; }
        else { pre.style.display = 'none'; btns[2].textContent = '预览'; }
    });
    btns[3].addEventListener('click', () => {
        vscode.postMessage({ command: 'deleteCustomTemplate', label: t.label });
    });
    return item;
}

function renderCustomTemplates(templates) {
    const list = document.getElementById('customList');
    list.innerHTML = '';
    if (templates.length === 0) {
        list.innerHTML = '<div style="color:var(--vscode-descriptionForeground);font-size:11px;padding:8px;">暂无自定义模板</div>';
        return;
    }
    templates.forEach(t => list.appendChild(makeCustomTemplateItem(t)));
}

// 监听扩展返回的自定义模板数据
window.addEventListener('message', (e) => {
    const msg = e.data;
    if (msg.command === 'customTemplates') {
        renderCustomTemplates(msg.templates);
    }
});

// 添加模板按钮
document.getElementById('addCustomBtn').addEventListener('click', () => {
    const label = document.getElementById('customLabel').value.trim();
    const detail = document.getElementById('customDetail').value.trim();
    const content = document.getElementById('customContent').value;
    if (!label) { alert('请输入模板名称'); return; }
    if (!content) { alert('请输入模板内容'); return; }
    vscode.postMessage({ command: 'addCustomTemplate', label, detail, insertText: content });
    document.getElementById('customLabel').value = '';
    document.getElementById('customDetail').value = '';
    document.getElementById('customContent').value = '';
});

// 请求已保存的自定义模板
vscode.postMessage({ command: 'getCustomTemplates' });

// 初始化
updateRgba();
updateTextColor();
updateGradient();
</script>
</body>
</html>`;
    }
}
