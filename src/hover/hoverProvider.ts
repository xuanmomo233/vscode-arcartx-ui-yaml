import * as vscode from 'vscode';
import { builtin_functions } from '../completion/structure/rule/ariaBuiltin';
import { type_values, point_values, slotType_values } from '../completion/structure/rule/controlAttributeValue';
import { control_attribute } from '../completion/structure/rule/controlAttribute';
import { control_actions } from '../completion/structure/rule/controlAction';
import { ui_actions } from '../completion/structure/rule/uiAction';
import { ui_options } from '../completion/structure/rule/ui';
import { packetHandler_options } from '../completion/structure/rule/uiPacketHandler';
import { task_type_values } from '../completion/structure/rule/uiTaskTypeValues';
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
            ...ui_actions,
            ...ui_options,
            ...packetHandler_options,
            ...task_type_values,
            ...self_functions,
            ...control_self_functions,
        ];

        for (const item of allItems) {
            this.docMap.set(item.label.toLowerCase(), item);
            const parts = item.label.split(/[.()]/).filter(p => p.length > 0);
            for (const part of parts) {
                const partLower = part.toLowerCase();
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

        const word = document.getText(range);
        const line = document.lineAt(position.line).text;
        const linePrefix = line.substring(0, range.start.character);

        // 尝试匹配带点号的完整名称（如 Screen.open）
        const fullMatch = line.substring(range.start.character, range.end.character);
        let docItem = this.docMap.get(fullMatch.toLowerCase());

        // 尝试匹配 "对象.方法" 模式
        if (!docItem) {
            const dotMatch = line.substring(0, range.end.character).match(/(\w+)\.(\w+)$/);
            if (dotMatch) {
                const fullKey = `${dotMatch[1]}.${dotMatch[2]}`;
                docItem = this.docMap.get(fullKey.toLowerCase());
            }
        }

        // 尝试匹配单个词
        if (!docItem) {
            docItem = this.docMap.get(word.toLowerCase());
        }

        // 尝试匹配属性值上下文（type: texture）
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

        if (!docItem || !docItem.documentation) return undefined;

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
