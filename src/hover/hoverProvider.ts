import * as vscode from 'vscode';
import { builtin_functions, builtin_object_descriptions } from '../completion/structure/rule/ariaBuiltin';
import { type_values, point_values, slotType_values, shape_values, alignment_values, showType_values, progress_mode_values } from '../completion/structure/rule/controlAttributeValue';
import { control_attribute } from '../completion/structure/rule/controlAttribute';
import { control_actions } from '../completion/structure/rule/controlAction';
import { control_effects } from '../completion/structure/rule/controlEffect';
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
    // 内置对象介绍 map（悬停对象名时显示对象介绍，而非具体函数）
    private objectMap: Map<string, DocItem> = new Map();
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
            ...control_effects,
            ...ui_actions,
            ...ui_options,
            ...packetHandler_options,
            ...task_settings,
            ...task_type_values,
            ...type_values,
            ...point_values,
            ...slotType_values,
            ...shape_values,
            ...alignment_values,
            ...showType_values,
            ...progress_mode_values,
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
            // 按 "." 拆分，去掉括号后注册各段（使 getFood 能匹配 getFood()）
            const parts = item.label.split('.').filter(p => p.length > 0);
            for (const part of parts) {
                // 去掉尾部括号，如 getFood() -> getFood
                const partClean = part.replace(/\(.*$/, '');
                const partLower = partClean.toLowerCase();
                if (ariaKeywords.has(partLower)) continue;
                if (!this.scriptMap.has(partLower)) {
                    this.scriptMap.set(partLower, item);
                }
            }
        }

        // 注册内置对象介绍（对象名 -> 对象介绍）
        for (const item of builtin_object_descriptions) {
            this.objectMap.set(item.label.toLowerCase(), item);
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
            if (/^\s*\w+:\s*\|-?\s*$/.test(lineText)) {
                return true;
            }
            // 如果遇到非缩进行（顶层 YAML 键），停止查找
            if (i < position.line && /^\S/.test(lineText)) {
                break;
            }
        }
        return false;
    }

    private ariaKeywords = new Set(['self', 'val', 'var']);

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
        if (!cleanWord) return undefined;

        // 拆分 dotted 路径为段
        const segments = cleanWord.split('.').filter(s => s.length > 0);
        if (segments.length === 0) return undefined;

        // 确定光标所在段索引
        const cursorOffset = position.character - range.start.character;
        let cursorSegIndex = 0;
        let accumLen = 0;
        for (let i = 0; i < segments.length; i++) {
            accumLen += segments[i].length;
            if (cursorOffset <= accumLen) {
                cursorSegIndex = i;
                break;
            }
            accumLen += 1; // dot
            cursorSegIndex = i + 1;
        }
        if (cursorSegIndex >= segments.length) cursorSegIndex = segments.length - 1;

        const cursorSegRaw = segments[cursorSegIndex];
        const cursorSeg = cursorSegRaw.replace(/\(.*$/, '').toLowerCase();

        // 跳过 Aria 关键字（self/val/var）
        if (this.ariaKeywords.has(cursorSeg)) return undefined;

        // 光标段的精确 range（只覆盖当前段，不覆盖整个 dotted 路径）
        let segStartChar = range.start.character;
        for (let i = 0; i < cursorSegIndex; i++) {
            segStartChar += segments[i].length + 1; // +1 for dot
        }
        const segRange = new vscode.Range(
            position.line, segStartChar,
            position.line, segStartChar + cursorSegRaw.length
        );

        // 构建查找路径前缀（从首段到光标段）
        const prefixPath = segments.slice(0, cursorSegIndex + 1).join('.').replace(/\(.*$/, '').toLowerCase();
        // 前一段 + 光标段（如 parent.height）
        const predecessorSeg = cursorSegIndex > 0
            ? segments[cursorSegIndex - 1].replace(/\(.*$/, '').toLowerCase()
            : null;
        const predecessorDotSeg = predecessorSeg ? `${predecessorSeg}.${cursorSeg}` : null;

        // 判断上下文
        const isYamlKey = this.isYamlKeyContext(line, range);
        const isScript = this.isScriptContext(document, position);

        let docItem: DocItem | undefined;

        if (isYamlKey && !isScript) {
            // YAML 键上下文：只查 yamlMap
            docItem = this.yamlMap.get(prefixPath) || this.yamlMap.get(cursorSeg);
        } else if (isScript) {
            // 脚本上下文：
            // 0. 如果光标在第一段（对象名），优先查 objectMap 显示对象介绍
            if (cursorSegIndex === 0 && this.objectMap.has(cursorSeg)) {
                docItem = this.objectMap.get(cursorSeg);
            }
            // 1. 路径前缀查找（如 player.getfood）→ 优先 scriptMap
            if (!docItem) {
                docItem = this.scriptMap.get(prefixPath);
                if (!docItem) docItem = this.yamlMap.get(prefixPath);
            }
            // 2. 前一段.光标段 查找（如 parent.height）→ 优先 scriptMap
            if (!docItem && predecessorDotSeg) {
                docItem = this.scriptMap.get(predecessorDotSeg);
                if (!docItem) docItem = this.yamlMap.get(predecessorDotSeg);
            }
            // 3. 单段查找 → 优先 yamlMap（属性优先于函数）
            //    如 height 在 yamlMap 是控件属性，在 scriptMap 是 Display.height()
            //    self.parent.height 中的 height 应匹配控件属性
            if (!docItem) {
                docItem = this.yamlMap.get(cursorSeg);
            }
            if (!docItem) {
                docItem = this.scriptMap.get(cursorSeg);
            }
        } else {
            // 模糊上下文：yamlMap 优先
            docItem = this.yamlMap.get(prefixPath) || this.yamlMap.get(cursorSeg);
            if (!docItem) {
                docItem = this.scriptMap.get(prefixPath) || this.scriptMap.get(cursorSeg);
            }
        }

        // 最后查通用 map
        if (!docItem) {
            docItem = this.commonMap.get(cursorSeg);
        }

        if (!docItem) return undefined;

        const contents = new vscode.MarkdownString();
        contents.isTrusted = true;
        contents.appendMarkdown(`**${docItem.label}**\n\n`);
        contents.appendMarkdown(`${docItem.detail}\n\n`);
        if (docItem.documentation) {
            contents.appendMarkdown(docItem.documentation.value);
        }

        return new vscode.Hover(contents, segRange);
    }
}
