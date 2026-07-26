import * as vscode from 'vscode';
import { builtin_functions } from '../completion/structure/rule/ariaBuiltin';
import { type_values, point_values, slotType_values } from '../completion/structure/rule/controlAttributeValue';
import { control_attribute } from '../completion/structure/rule/controlAttribute';
import { control_actions } from '../completion/structure/rule/controlAction';
import { control_settings } from '../completion/structure/rule/controlSetting';
import { ui_actions } from '../completion/structure/rule/uiAction';
import { ui_options } from '../completion/structure/rule/ui';
import { packetHandler_options } from '../completion/structure/rule/uiPacketHandler';
import { task_type_values } from '../completion/structure/rule/uiTaskTypeValues';
import { task_settings } from '../completion/structure/rule/uiTaskSettings';
import { hud_names, match_values } from '../completion/structure/rule/uiValue';
import { self_functions } from '../completion/structure/rule/uiSelf';
import { control_self_functions } from '../completion/structure/rule/controlSelf';

interface DocItem {
    label: string;
    detail: string;
    documentation?: vscode.MarkdownString;
}

export class HoverProvider implements vscode.HoverProvider {
    // YAML 结构上下文使用的 map（属性名、设置项、触发器、类型值等）
    private yamlMap: Map<string, DocItem> = new Map();
    // 脚本上下文使用的 map（Aria 内置函数、self 函数等）
    private scriptMap: Map<string, DocItem> = new Map();
    // 通用 map（HUD 名称等，两个上下文都可匹配）
    private commonMap: Map<string, DocItem> = new Map();

    constructor() {
        this.buildDocMaps();
    }

    private buildDocMaps() {
        // YAML 结构项：属性名、控件设置、触发器、类型值、锚点值、槽位类型值、UI 选项、packetHandler、任务设置、任务类型、match 值
        const yamlItems: DocItem[] = [
            ...control_attribute,
            ...control_settings,
            ...control_actions,
            ...ui_actions,
            ...ui_options,
            ...packetHandler_options,
            ...task_settings,
            ...task_type_values,
            ...type_values,
            ...point_values,
            ...slotType_values,
            ...match_values,
        ];

        // 脚本项：Aria 内置函数、UI self 函数、控件 self 函数
        const scriptItems: DocItem[] = [
            ...builtin_functions,
            ...self_functions,
            ...control_self_functions,
        ];

        // 通用项：HUD 名称
        const commonItems: DocItem[] = [
            ...hud_names,
        ];

        // Aria 上下文关键字，不应作为独立悬停 key 注册
        const ariaKeywords = new Set(['self', 'val', 'var']);

        // 注册 YAML 结构项
        for (const item of yamlItems) {
            const labelLower = item.label.toLowerCase();
            if (!this.yamlMap.has(labelLower)) {
                this.yamlMap.set(labelLower, item);
            }
            // 只按 "." 拆分（不按 "()" 拆分，避免参数名污染）
            const parts = item.label.split('.').filter(p => p.length > 0);
            for (const part of parts) {
                const partLower = part.toLowerCase();
                if (ariaKeywords.has(partLower)) continue;
                if (!this.yamlMap.has(partLower)) {
                    this.yamlMap.set(partLower, item);
                }
            }
        }

        // 注册脚本项
        for (const item of scriptItems) {
            const labelLower = item.label.toLowerCase();
            if (!this.scriptMap.has(labelLower)) {
                this.scriptMap.set(labelLower, item);
            }
            // 只按 "." 拆分，跳过括号内的参数名
            const parts = item.label.split('.').filter(p => p.length > 0);
            for (const part of parts) {
                const partLower = part.toLowerCase();
                if (ariaKeywords.has(partLower)) continue;
                if (!this.scriptMap.has(partLower)) {
                    this.scriptMap.set(partLower, item);
                }
            }
        }

        // 注册通用项
        for (const item of commonItems) {
            const labelLower = item.label.toLowerCase();
            if (!this.commonMap.has(labelLower)) {
                this.commonMap.set(labelLower, item);
            }
            if (!this.yamlMap.has(labelLower)) {
                this.yamlMap.set(labelLower, item);
            }
            if (!this.scriptMap.has(labelLower)) {
                this.scriptMap.set(labelLower, item);
            }
        }
    }

    /**
     * 判断光标是否在 YAML 属性名位置（如 "  width: 100" 中的 width）
     * 或 YAML 键位置（如 "  click: |-" 中的 click）
     */
    private isYamlKeyContext(line: string, range: vscode.Range): boolean {
        // 检查光标所在词是否在冒号之前（即 YAML 键位置）
        const beforeWord = line.substring(0, range.start.character);
        const afterWord = line.substring(range.end.character);
        // 属性名模式：行首空白 + 词 + 冒号（可能带空格）
        if (/^\s*$/.test(beforeWord) && /^\s*:/.test(afterWord)) {
            return true;
        }
        // 值上下文中的 type 值（如 "type: texture" 中的 texture）
        const attrMatch = line.match(/^\s*(\w+):\s*(\w+)/);
        if (attrMatch) {
            const attrValueStart = line.indexOf(attrMatch[2]);
            const attrValueEnd = attrValueStart + attrMatch[2].length;
            if (range.start.character >= attrValueStart && range.end.character <= attrValueEnd) {
                return true;
            }
        }
        return false;
    }

    /**
     * 判断光标是否在脚本上下文中（|- 或 | 代码块内）
     */
    private isScriptContext(document: vscode.TextDocument, position: vscode.Position): boolean {
        // 向上查找最近的 |- 或 | 行
        for (let i = position.line; i >= 0; i--) {
            const lineText = document.lineAt(i).text;
            // 匹配 "xxx: |-" 或 "xxx: |" 模式
            if (/^\s*\w+:\s*\|/-?\s*$/.test(lineText)) {
                return true;
            }
            // 如果遇到非缩进行（顶层 YAML 键），停止查找
            if (i < position.line && /^\S/.test(lineText)) {
                break;
            }
        }
        return false;
    }

    provideHover(
        document: vscode.TextDocument,
        position: vscode.Position,
        token: vscode.CancellationToken
    ): vscode.Hover | undefined {
        const range = document.getWordRangeAtPosition(position, /[\w.]+/);
        if (!range) return undefined;

        const rawWord = document.getText(range);
        const line = document.lineAt(position.line).text;

        // 清理前导/尾随点号
        const cleanWord = rawWord.replace(/^\.+|\.+$/g, '');

        // 判断上下文
        const isYamlKey = this.isYamlKeyContext(line, range);
        const isScript = this.isScriptContext(document, position);

        let docItem: DocItem | undefined;

        if (isYamlKey && !isScript) {
            // YAML 键上下文：优先查 yamlMap
            docItem = this.lookupInMap(this.yamlMap, cleanWord, line, range);
        } else if (isScript) {
            // 脚本上下文：优先查 scriptMap
            docItem = this.lookupInMap(this.scriptMap, cleanWord, line, range);
            // 脚本上下文中也查 yamlMap 作为补充（如 self.wheelValue 中的 wheelValue 可能是控件属性）
            if (!docItem) {
                docItem = this.lookupInMap(this.yamlMap, cleanWord, line, range);
            }
        } else {
            // 模糊上下文：先查 yamlMap，再查 scriptMap
            docItem = this.lookupInMap(this.yamlMap, cleanWord, line, range);
            if (!docItem) {
                docItem = this.lookupInMap(this.scriptMap, cleanWord, line, range);
            }
        }

        // 最后查通用 map
        if (!docItem) {
            docItem = this.commonMap.get(cleanWord.toLowerCase());
        }

        if (!docItem) return undefined;

        const contents = new vscode.MarkdownString();
        contents.isTrusted = true;
        contents.appendMarkdown(`**${docItem.label}**\n\n`);
        contents.appendMarkdown(`${docItem.detail}\n\n`);
        if (docItem.documentation) {
            contents.appendMarkdown(docItem.documentation.value);
        }

        return new vscode.Hover(contents, range);
    }

    private lookupInMap(
        map: Map<string, DocItem>,
        cleanWord: string,
        line: string,
        range: vscode.Range
    ): DocItem | undefined {
        let docItem: DocItem | undefined;

        // 1. 尝试完整 dotted 路径
        docItem = map.get(cleanWord.toLowerCase());

        // 2. 尝试 "对象.方法" 模式
        if (!docItem) {
            const dotMatch = line.substring(0, range.end.character).match(/(\w+)\.(\w+)$/);
            if (dotMatch) {
                const fullKey = `${dotMatch[1]}.${dotMatch[2]}`;
                docItem = map.get(fullKey.toLowerCase());
            }
        }

        // 3. 按拆分段从后向前查找
        if (!docItem) {
            const segments = cleanWord.split(/[.\[\]'"]/).filter(s => s.length > 0);
            for (let i = segments.length - 1; i >= 0 && !docItem; i--) {
                docItem = map.get(segments[i].toLowerCase());
            }
        }

        // 4. 尝试单个词
        if (!docItem) {
            docItem = map.get(cleanWord.toLowerCase());
        }

        return docItem;
    }
}
