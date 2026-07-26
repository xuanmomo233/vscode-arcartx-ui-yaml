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
    private docMap: Map<string, DocItem> = new Map();

    constructor() {
        this.buildDocMap();
    }

    private buildDocMap() {
        const allItems: DocItem[] = [
            ...builtin_functions,
            ...type_values,
            ...point_values,
            ...slotType_values,
            ...control_attribute,
            ...control_actions,
            ...control_settings,
            ...ui_actions,
            ...ui_options,
            ...packetHandler_options,
            ...task_type_values,
            ...task_settings,
            ...hud_names,
            ...match_values,
            ...self_functions,
            ...control_self_functions,
        ];

        // Aria 上下文关键字，不应作为独立悬停 key 注册（仅跳过拆分段的注册，不跳过完整 label）
        const ariaKeywords = new Set(['self', 'val', 'var']);

        for (const item of allItems) {
            // 完整 label 始终注册（如 control_settings 的 "val" 属性）
            const labelLower = item.label.toLowerCase();
            if (!this.docMap.has(labelLower)) {
                this.docMap.set(labelLower, item);
            }
            // 拆分段注册时跳过 Aria 关键字（避免 Sound.self() 的 "self" 被注册）
            const parts = item.label.split(/[.()]/).filter(p => p.length > 0);
            for (const part of parts) {
                const partLower = part.toLowerCase();
                if (ariaKeywords.has(partLower)) continue;
                if (!this.docMap.has(partLower)) {
                    this.docMap.set(partLower, item);
                }
            }
        }
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

        // 清理前导/尾随点号（如 ".setDragYRatio" → "setDragYRatio"）
        const cleanWord = rawWord.replace(/^\.+|\.+$/g, '');

        let docItem: DocItem | undefined;

        // 1. 尝试完整 dotted 路径（如 "Math.round"、"self.wheelValue"）
        docItem = this.docMap.get(cleanWord.toLowerCase());

        // 2. 尝试 "对象.方法" 模式（从行文本中提取）
        if (!docItem) {
            const dotMatch = line.substring(0, range.end.character).match(/(\w+)\.(\w+)$/);
            if (dotMatch) {
                const fullKey = `${dotMatch[1]}.${dotMatch[2]}`;
                docItem = this.docMap.get(fullKey.toLowerCase());
            }
        }

        // 3. 尝试按 "." 拆分，从最长到最短逐段查找
        //    如 "self.parent['xxx'].setDragYRatio" → 尝试 "setDragYRatio"
        //    如 "self.wheelValue" → 尝试 "wheelValue"
        if (!docItem) {
            const segments = cleanWord.split(/[.\[\]'"]/).filter(s => s.length > 0);
            for (let i = segments.length - 1; i >= 0 && !docItem; i--) {
                docItem = this.docMap.get(segments[i].toLowerCase());
            }
        }

        // 4. 尝试单个词（清理后的）
        if (!docItem) {
            docItem = this.docMap.get(cleanWord.toLowerCase());
        }

        // 5. 尝试匹配属性值上下文（type: texture）
        if (!docItem) {
            const attrContext = line.match(/(\w+):\s*(\w+)/);
            if (attrContext) {
                const attrName = attrContext[1];
                const attrValue = attrContext[2];
                if (attrName === 'type') {
                    docItem = this.docMap.get(attrValue.toLowerCase());
                }
            }
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
}
