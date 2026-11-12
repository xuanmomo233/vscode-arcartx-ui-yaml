import * as vscode from 'vscode';
import { type_values } from '../completion/structure/rule/controlAttributeValue';
import { MappingEntry, directControlType, indentation, isAriaBlock, isControlPath, isMappingBlock, mappingEntry, scalarValue } from '../yamlContext';
import { AriaPunctuation } from '../aria/punctuation';

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
        const parents: MappingEntry[] = [];
        let aria: { start: MappingEntry; braces: number; punctuation: AriaPunctuation } | undefined;

        const finishBlock = (endLine: number) => {
            if (aria && aria.braces > 0) {
                diagnostics.push(new vscode.Diagnostic(
                    new vscode.Range(aria.start.line, aria.start.valueStart, endLine, 0),
                    'Aria 代码块中花括号未闭合（缺少 ' + aria.braces + " 个 '}'）",
                    vscode.DiagnosticSeverity.Error
                ));
            }
        };

        for (let i = 0; i < document.lineCount; i++) {
            const line = document.lineAt(i).text;
            const trimmed = line.trim();
            if (!trimmed) {
                continue;
            }
            const indent = indentation(line);
            if (aria && indent <= aria.start.indent) {
                finishBlock(i);
                aria = undefined;
            }
            const leadingWhitespace = line.match(/^[ \t]*/)?.[0] ?? '';
            if (leadingWhitespace.includes('\t') && leadingWhitespace.includes(' ')) {
                diagnostics.push(new vscode.Diagnostic(
                    new vscode.Range(i, 0, i, leadingWhitespace.length),
                    '混合使用 Tab 和空格缩进，建议统一使用空格',
                    vscode.DiagnosticSeverity.Warning
                ));
            }
            if (aria) {
                const block = aria;
                let hasCode = false;
                block.punctuation.scan(line, symbol => {
                    hasCode = true;
                    if (symbol === '{') {
                        block.braces++;
                    } else if (symbol === '}' && block.braces > 0) {
                        block.braces--;
                    }
                });
                if (hasCode) {
                    this.checkRangeFloatTrap(trimmed, line, i, diagnostics);
                }
                continue;
            }
            if (trimmed.startsWith('#') || trimmed.startsWith('//')) {
                continue;
            }
            while (parents.length && parents[parents.length - 1].indent >= indent) {
                parents.pop();
            }
            const entry = mappingEntry(line, i);
            if (!entry) {
                continue;
            }
            if (isAriaBlock(entry)) {
                aria = { start: entry, braces: 0, punctuation: new AriaPunctuation() };
                continue;
            }
            if (isMappingBlock(entry)) {
                parents.push(entry);
                continue;
            }

            const path = parents.map(parent => parent.key);
            const value = scalarValue(entry.value);
            const range = new vscode.Range(i, entry.valueStart, i, entry.valueStart + entry.value.length);
            if (entry.key === 'type' && isControlPath(path) && /^[\w-]+$/.test(value) && !/^\d+$/.test(value) &&
                !VALID_CONTROL_TYPES.has(value.toLowerCase())) {
                diagnostics.push(new vscode.Diagnostic(
                    range, '无效的控件类型: "' + value + '"', vscode.DiagnosticSeverity.Warning
                ));
            }

            if (path[path.length - 1] === 'attribute' && isControlPath(path.slice(0, -1))) {
                if (TILDE_REQUIRED_ATTRS.has(entry.key)) {
                    this.checkTildePrefix(entry.key, value, range, diagnostics);
                } else if (entry.key === 'flow' && (value === 'row' || value === 'column') &&
                    directControlType(document, parents[parents.length - 2])?.toLowerCase() === 'repeatgrid') {
                    diagnostics.push(new vscode.Diagnostic(
                        range, '固定排列方向可写为 ~' + value + '。',
                        vscode.DiagnosticSeverity.Information
                    ));
                }
            }

            if (indent % 2 !== 0) {
                diagnostics.push(new vscode.Diagnostic(
                    new vscode.Range(i, 0, i, leadingWhitespace.length),
                    '缩进为 ' + indent + ' 个空格，建议使用 2 的倍数',
                    vscode.DiagnosticSeverity.Information
                ));
            }
        }

        finishBlock(document.lineCount - 1);
        this.diagnosticCollection.set(document.uri, diagnostics);
    }

    /**
     * 检测 ~ 前缀缺失
     * 颜色值（r,g,b 或 r,g,b,a）、路径值（xxx.png）、锚点枚举、slotType 枚举、shape 枚举
     * 这些值如果不加 ~ 前缀，会被当作脚本表达式编译，导致报错或值为空
     */
    private checkTildePrefix(key: string, cleanValue: string, range: vscode.Range, diagnostics: vscode.Diagnostic[]) {
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
            diagnostics.push(new vscode.Diagnostic(
                range,
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

}
