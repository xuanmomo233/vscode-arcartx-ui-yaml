import * as vscode from 'vscode';
import { type_values } from '../completion/structure/rule/controlAttributeValue';

const VALID_CONTROL_TYPES = new Set(type_values.map(v => v.label.toLowerCase()));

// 需要 ~ 前缀的属性（值是纯文本/颜色/路径/枚举，不是脚本表达式）
const TILDE_REQUIRED_ATTRS = new Set([
    'normal', 'hover', 'point', 'slotType', 'shape', 'emptyText',
    'passwordChar', 'background', 'cursorColor', 'textColor', 'uneditableTextColor',
    'hoverTextColor', 'tickColor', 'directionColor', 'filter', 'exclude',
    'tip', 'font', 'model', 'animation', 'node', 'showType', 'alignment',
    'cooldown', 'textures', 'itemEffect', 'overwriteText',
]);

// 颜色值模式：数字,数字,数字 或 数字,数字,数字,数字
const COLOR_PATTERN = /^\d+,\s*\d+(,\s*\d+(,\s*\d+)?)?/;

// 路径值模式：包含 / 和文件扩展名
const PATH_PATTERN = /\.\w+$/;

// 锚点值模式：top_left, middle_center 等
const ANCHOR_VALUES = new Set([
    'top_left', 'top_center', 'top_right',
    'middle_left', 'middle_center', 'middle_right',
    'bottom_left', 'bottom_center', 'bottom_right',
    'horizontal_stretch_top', 'horizontal_stretch_middle', 'horizontal_stretch_bottom',
    'vertical_stretch_left', 'vertical_stretch_center', 'vertical_stretch_right',
    'stretch_all',
]);

// slotType 枚举值
const SLOT_TYPE_VALUES = new Set(['Backpack', 'Container', 'Extra', 'Icon', 'Hover']);

// shape 枚举值
const SHAPE_VALUES = new Set(['rect', 'round_rect', 'circle']);

export class DiagnosticProvider {
    private diagnosticCollection: vscode.DiagnosticCollection;

    constructor(context: vscode.ExtensionContext) {
        this.diagnosticCollection = vscode.languages.createDiagnosticCollection('arcartx-ui-yaml');

        context.subscriptions.push(this.diagnosticCollection);

        vscode.workspace.onDidChangeTextDocument(e => {
            if (e.document.languageId === 'arcartx-ui-yaml') {
                this.updateDiagnostics(e.document);
            }
        }, null, context.subscriptions);

        vscode.workspace.onDidOpenTextDocument(doc => {
            if (doc.languageId === 'arcartx-ui-yaml') {
                this.updateDiagnostics(doc);
            }
        }, null, context.subscriptions);

        for (const doc of vscode.workspace.textDocuments) {
            if (doc.languageId === 'arcartx-ui-yaml') {
                this.updateDiagnostics(doc);
            }
        }
    }

    private updateDiagnostics(document: vscode.TextDocument) {
        const diagnostics: vscode.Diagnostic[] = [];
        const text = document.getText();
        const lines = text.split('\n');

        let inAriaBlock = false;
        let ariaBlockIndent = 0;
        let ariaBlockStartLine = -1;
        let braceDepth = 0;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const trimmed = line.trim();

            if (trimmed === '' || trimmed.startsWith('#') || trimmed.startsWith('//')) continue;

            const indent = this.getIndent(line);

            // 混合缩进检测
            if (line.includes('\t') && line.includes(' ') && !line.trim().startsWith('#')) {
                const leadingWhitespace = line.match(/^\s*/)?.[0] || '';
                if (leadingWhitespace.includes('\t') && leadingWhitespace.includes(' ')) {
                    diagnostics.push(new vscode.Diagnostic(
                        new vscode.Range(i, 0, i, leadingWhitespace.length),
                        '混合使用 Tab 和空格缩进，建议统一使用空格',
                        vscode.DiagnosticSeverity.Warning
                    ));
                }
            }

            // Aria 脚本块检测
            if (trimmed.match(/^\w+:\s*\|?-?$/)) {
                if (trimmed.endsWith('|-') || trimmed.endsWith('|')) {
                    inAriaBlock = true;
                    ariaBlockIndent = indent;
                    ariaBlockStartLine = i;
                    braceDepth = 0;
                }
                continue;
            }

            if (inAriaBlock) {
                if (indent > ariaBlockIndent || trimmed === '') {
                    const openBraces = (trimmed.match(/{/g) || []).length;
                    const closeBraces = (trimmed.match(/}/g) || []).length;
                    braceDepth += openBraces - closeBraces;

                    // range() 浮点数陷阱检测
                    this.checkRangeFloatTrap(trimmed, line, i, diagnostics);
                    continue;
                } else {
                    if (braceDepth > 0) {
                        diagnostics.push(new vscode.Diagnostic(
                            new vscode.Range(ariaBlockStartLine, 0, i, 0),
                            `Aria 代码块中花括号未闭合（缺少 ${braceDepth} 个 '}'）`,
                            vscode.DiagnosticSeverity.Error
                        ));
                    }
                    inAriaBlock = false;
                }
            }

            const yamlKeyMatch = trimmed.match(/^(\w+):\s*(.*)$/);
            if (yamlKeyMatch) {
                const key = yamlKeyMatch[1];
                const value = yamlKeyMatch[2];

                // 控件类型检测
                if (key === 'type' && value && !value.startsWith('${') && isNaN(Number(value.trim().replace(/['"]/g, '')))) {
                    const typeValue = value.trim().replace(/['"]/g, '');
                    if (!VALID_CONTROL_TYPES.has(typeValue.toLowerCase()) && typeValue !== '') {
                        diagnostics.push(new vscode.Diagnostic(
                            new vscode.Range(i, line.indexOf(value), i, line.indexOf(value) + value.length),
                            `无效的控件类型: "${typeValue}"`,
                            vscode.DiagnosticSeverity.Warning
                        ));
                    }
                }

                // ~ 前缀缺失检测（仅在非脚本块内、attribute 块下的属性值）
                if (!inAriaBlock && value && TILDE_REQUIRED_ATTRS.has(key)) {
                    this.checkTildePrefix(key, value, line, i, diagnostics);
                }

                // 缩进检测
                if (indent > 0 && indent % 2 !== 0) {
                    diagnostics.push(new vscode.Diagnostic(
                        new vscode.Range(i, 0, i, indent),
                        `缩进为 ${indent} 个空格，建议使用 2 的倍数`,
                        vscode.DiagnosticSeverity.Information
                    ));
                }
            }
        }

        if (inAriaBlock && braceDepth > 0) {
            diagnostics.push(new vscode.Diagnostic(
                new vscode.Range(ariaBlockStartLine, 0, lines.length - 1, 0),
                `Aria 代码块中花括号未闭合（缺少 ${braceDepth} 个 '}'）`,
                vscode.DiagnosticSeverity.Error
            ));
        }

        this.diagnosticCollection.set(document.uri, diagnostics);
    }

    /**
     * 检测 ~ 前缀缺失
     * 颜色值（r,g,b 或 r,g,b,a）、路径值（xxx.png）、锚点枚举、slotType 枚举、shape 枚举
     * 这些值如果不加 ~ 前缀，会被当作脚本表达式编译，导致报错或值为空
     */
    private checkTildePrefix(key: string, value: string, line: string, lineNum: number, diagnostics: vscode.Diagnostic[]) {
        const cleanValue = value.trim().replace(/^['"]|['"]$/g, '');

        // 已经有 ~ 前缀，OK
        if (cleanValue.startsWith('~')) return;

        // 值为空或占位符
        if (cleanValue === '' || cleanValue.startsWith('${')) return;

        // 值是纯数字或布尔值，不需要 ~
        if (/^-?\d+\.?\d*$/.test(cleanValue) || cleanValue === 'true' || cleanValue === 'false') return;

        // 值是脚本表达式（包含 self.、var.、val.、Player. 等对象访问）
        if (/\b(self|var|val|Player|Chat|Screen|Packet|Number|String|Math|Thread|System)\b/.test(cleanValue)) return;

        let needsTilde = false;
        let hint = '';

        // 颜色值检测：r,g,b 或 r,g,b,a
        if (COLOR_PATTERN.test(cleanValue)) {
            needsTilde = true;
            hint = '颜色值需要加 ~ 前缀，否则会被当作脚本表达式编译';
        }
        // 路径值检测：包含 / 且以文件扩展名结尾
        else if (cleanValue.includes('/') && PATH_PATTERN.test(cleanValue)) {
            needsTilde = true;
            hint = '资源路径需要加 ~ 前缀，否则会被当作脚本表达式编译';
        }
        // 锚点值检测
        else if (ANCHOR_VALUES.has(cleanValue)) {
            needsTilde = true;
            hint = '锚点值需要加 ~ 前缀，否则会被当作变量名求值（得空）';
        }
        // slotType 枚举检测
        else if (key === 'slotType' && SLOT_TYPE_VALUES.has(cleanValue)) {
            needsTilde = true;
            hint = 'slotType 枚举值需要加 ~ 前缀，否则会被当作变量名求值';
        }
        // shape 枚举检测
        else if (key === 'shape' && SHAPE_VALUES.has(cleanValue)) {
            needsTilde = true;
            hint = 'shape 枚举值需要加 ~ 前缀，否则会被当作变量名求值';
        }
        // showType 枚举检测
        else if (key === 'showType' && ['none', 'HEAD', 'UPPER_BODY', 'LOWER_BODY', 'FOOT'].includes(cleanValue)) {
            needsTilde = true;
            hint = 'showType 枚举值需要加 ~ 前缀，否则会被当作变量名求值';
        }
        // alignment 枚举检测
        else if (key === 'alignment' && ['left', 'center', 'right'].includes(cleanValue)) {
            needsTilde = true;
            hint = 'alignment 枚举值需要加 ~ 前缀，否则会被当作变量名求值';
        }
        // 带 & 颜色码的文本
        else if (cleanValue.startsWith('&') || cleanValue.startsWith('§')) {
            needsTilde = true;
            hint = '带颜色码的文本需要加 ~ 前缀，否则 & 符号会导致脚本编译错误';
        }

        if (needsTilde) {
            const valueStartCol = line.indexOf(value);
            diagnostics.push(new vscode.Diagnostic(
                new vscode.Range(lineNum, valueStartCol, lineNum, valueStartCol + value.length),
                `${hint}（应为 ~${cleanValue}）`,
                vscode.DiagnosticSeverity.Warning
            ));
        }
    }

    /**
     * 检测 range() 浮点数陷阱
     * range(0, N) 返回的迭代变量是浮点数，用于字典 key 或控件名拼接时需要 .round
     */
    private checkRangeFloatTrap(trimmed: string, line: string, lineNum: number, diagnostics: vscode.Diagnostic[]) {
        // 检测 i + '' 或 i + '字符串' 模式（不带 .round）
        // 排除已有 .round 的行
        const rangeVarMatch = trimmed.match(/(\w+)\s*\+\s*['"]/);
        if (rangeVarMatch) {
            const varName = rangeVarMatch[1];
            // 检查同一行是否有 range( 调用，且变量名匹配
            if (trimmed.includes('range(') && trimmed.includes(`for(${varName}`)) {
                // 检查是否已有 .round
                if (!trimmed.includes(`${varName}.round`)) {
                    const matchCol = line.indexOf(`${varName} +`);
                    if (matchCol >= 0) {
                        diagnostics.push(new vscode.Diagnostic(
                            new vscode.Range(lineNum, matchCol, lineNum, matchCol + varName.length + 3),
                            `range() 返回浮点数，${varName} + '' 会得到 "${varName}.0" 而非 "${varName}"，建议使用 ${varName}.round`,
                            vscode.DiagnosticSeverity.Warning
                        ));
                    }
                }
            }
        }
    }

    private getIndent(line: string): number {
        let indent = 0;
        for (const char of line) {
            if (char === ' ') indent++;
            else if (char === '\t') indent += 4;
            else break;
        }
        return indent;
    }
}
