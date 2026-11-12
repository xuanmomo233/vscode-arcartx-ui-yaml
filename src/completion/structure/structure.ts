import * as vscode from 'vscode';
import { completionConfigs, CompletionConfig, attributeValueMap } from './rule';
import { self_functions } from './rule/uiSelf';
import { control_self_functions } from './rule/controlSelf';
import { builtin_functions, builtin_objects } from './rule/ariaBuiltin';
import { task_type_values } from './rule/uiTaskTypeValues';
import { getAttributesByType, detectControlType, getSmartTypeSnippet } from './rule/controlTypeAttributes';
import { isRepeatGridItem, repeatGridFlowValues, repeatGridItemProperties, selfParentDepth } from './rule/repeatGrid';
import { ariaContext, isAriaBlock, isControlPath, isTaskPath, mappingEntry, positionIndent, yamlAncestors, directMappings } from '../../yamlContext';

type Completion = CompletionConfig['completions'][number];

export class StructureCompletionProvider implements vscode.CompletionItemProvider {
    provideCompletionItems(document: vscode.TextDocument, position: vscode.Position): vscode.CompletionItem[] {
        const text = document.lineAt(position.line).text;
        const prefix = text.slice(0, position.character);
        const parents = yamlAncestors(document, position.line, positionIndent(document, position));
        const path = parents.map(entry => entry.key);
        const script = ariaContext(document, position, parents);
        const trigger = /[/?]$/.test(prefix) ? prefix.slice(-1) : '';
        if (script && parents.some(isAriaBlock)) {
            return this.completeAria(document, position, prefix, parents, script);
        }

        const valueMatch = prefix.match(/^\s*(\w+)[ \t]*:([ \t]*)(['"]?)(~?)([\w-]*)([/?]?)$/);
        if (valueMatch) {
            const [, key, space, quote, tilde, partial, manualTrigger] = valueMatch;
            const controlOwner = isControlPath(path) ? parents[parents.length - 1] : undefined;
            const repeatFlow = key === 'flow' && path[path.length - 1] === 'attribute' &&
                detectControlType(document, parents)?.toLowerCase() === 'repeatgrid';
            let options: Completion[] | undefined;
            if (key === 'type') {
                options = isTaskPath(path) ? task_type_values :
                    controlOwner || path.length === 0 ? attributeValueMap.get(key) : undefined;
            } else {
                options = repeatFlow ? repeatGridFlowValues : attributeValueMap.get(key);
            }
            if (options) {
                const tail = text.slice(position.character);
                const suffixLength = tail.match(/^[\w-]*/)?.[0].length ?? 0;
                const hasClosingQuote = quote !== '' && tail[suffixLength] === quote;
                const end = position.translate(0, suffixLength + Number(hasClosingQuote));
                const start = position.translate(0, -(quote.length + tilde.length + partial.length + manualTrigger.length));
                // Keep the rest of the type line in place, including a trailing YAML comment.
                const canInsertTemplate = key === 'type' && quote === '' && text.slice(end.character).trim() === '' &&
                    controlOwner && !Array.from(directMappings(document, controlOwner))
                        .some(entry => entry.key === 'attribute' || entry.key === 'children');
                return options
                    .filter(option => (option.label !== 'Tip' || (path.length === 1 && controlOwner?.key === 'root_control')) &&
                        option.label.replace(/^~/, '').toLowerCase().includes(partial.toLowerCase()))
                    .map(option => {
                        const template = canInsertTemplate ? getSmartTypeSnippet(option.label) : undefined;
                        const snippet = template ?? option.insertText.trimStart();
                        const item = this.completionItem(option, (space ? '' : ' ') + quote + snippet + quote);
                        item.range = new vscode.Range(start, end);
                        item.filterText = quote + tilde + (manualTrigger ? partial + manualTrigger : '') + option.label.replace(/^~/, '');
                        return item;
                    });
            }
        }

        if (script) {
            return this.completeAria(document, position, prefix, parents, script);
        }

        const header = mappingEntry(trigger ? prefix.slice(0, -1) : prefix, position.line);
        const onBlockHeader = header?.value === '' &&
            ['ui', 'action', 'attribute', 'children', 'effect', 'controls', 'template', 'tasks'].includes(header.key);
        if (onBlockHeader) {
            path.push(header.key);
            parents.push(header);
        } else if (valueMatch) {
            return [];
        }

        const config = this.findMatchingConfig(path);
        const type = path[path.length - 1] === 'attribute' ? detectControlType(document, parents) : undefined;
        const entries = type ? getAttributesByType(type) : config?.completions ?? [];
        return entries.map(entry => {
            const snippet = onBlockHeader ? '\n' + entry.insertText.replace(/^/gm, '  ') : entry.insertText;
            const item = this.completionItem(entry, snippet);
            if (trigger) {
                item.range = new vscode.Range(position.translate(0, -1), position);
                item.filterText = trigger + entry.label;
            }
            return item;
        });
    }

    private completeAria(
        document: vscode.TextDocument,
        position: vscode.Position,
        prefix: string,
        parents: ReturnType<typeof yamlAncestors>,
        script: 'ui' | 'control'
    ): vscode.CompletionItem[] {
        const member = prefix.match(/\.(\w*)$/);
        if (member) {
            const partial = member[1];
            const beforeMember = prefix.slice(0, prefix.length - partial.length);
            const receiver = beforeMember.match(/(?:^|[^\p{L}\p{N}_.])([A-Za-z_]\w*)\??\.$/u)?.[1];
            const parentDepth = selfParentDepth(beforeMember);
            const controlChain = /(?:^|[^\w.])self\b[\w.[\]'"\-(),\s]*[)\]]\??\.$/.test(beforeMember);
            let entries: Completion[];
            if (receiver === 'self' && script === 'ui') {
                entries = self_functions;
            } else if (parentDepth !== undefined || controlChain) {
                entries = script === 'control' && isRepeatGridItem(document, parents, parentDepth)
                    ? [...repeatGridItemProperties, ...control_self_functions]
                    : control_self_functions;
            } else if (receiver === 'args') {
                entries = [{ label: 'length', detail: '参数数量', insertText: 'length', kind: vscode.CompletionItemKind.Property }];
            } else {
                entries = receiver && builtin_objects.includes(receiver)
                    ? builtin_functions.filter(fn => fn.label.startsWith(receiver + '.'))
                    : [];
            }
            const tail = document.lineAt(position.line).text.slice(position.character);
            const suffixLength = tail.match(/^\w*/)?.[0].length ?? 0;
            const range = new vscode.Range(position.translate(0, -partial.length), position.translate(0, suffixLength));
            const hasArguments = /^[ \t]*\(/.test(tail.slice(suffixLength));
            return entries.map(entry => {
                const insertText = hasArguments && entry.kind === vscode.CompletionItemKind.Function
                    ? entry.insertText.split('(')[0] : entry.insertText;
                const item = this.completionItem(entry, insertText);
                item.range = range;
                item.filterText = entry.label.replace(/^[^.]+\./, '');
                return item;
            });
        }

        const trigger = /(?:^|\s)[/?]$/.test(prefix) ? prefix.slice(-1) : '';
        return builtin_functions.map(entry => {
            const qualifier = entry.label.match(/^\w+\./)?.[0] ?? '';
            const item = this.completionItem(entry, qualifier + entry.insertText);
            if (trigger) {
                item.range = new vscode.Range(position.translate(0, -1), position);
                item.filterText = trigger + entry.label;
            }
            return item;
        });
    }

    private completionItem(entry: Completion, insertText = entry.insertText): vscode.CompletionItem {
        const item = new vscode.CompletionItem(entry.label, entry.kind ?? vscode.CompletionItemKind.Property);
        item.detail = entry.detail;
        item.insertText = new vscode.SnippetString(insertText);
        item.documentation = entry.documentation ?? new vscode.MarkdownString(entry.detail);
        item.sortText = '0' + entry.label;
        return item;
    }

    /**
     * 查找匹配当前路径的配置
     * 支持智能前缀匹配：如果配置路径是当前路径的前缀，则匹配成功
     */
    private findMatchingConfig(currentPath: string[]): CompletionConfig | undefined {
        // 1. 首先尝试精确匹配
        const exactMatch = completionConfigs.find(config => {
            if (config.path.length !== currentPath.length) return false;
            return config.path.every((pathPart, index) => pathPart === currentPath[index]);
        });
        if (exactMatch) {
            return exactMatch;
        }

        // 2. 尝试前缀匹配（如果配置路径是当前路径的前缀）
        // 例如：当前路径 ['ui', 'controls', '遮罩', 'attribute'] 可以匹配配置 ['controls', '*', 'attribute']
        const prefixMatches = completionConfigs.filter(config => {
            return config.path.length > 0 && this.isPrefixMatch(config.path, currentPath);
        });

        if (prefixMatches.length > 0) {
            // 选择最佳匹配项：
            // 1. 优先选择末尾段非通配符且精确匹配当前路径末尾段的配置
            // 2. 其次选择路径更长的
            // 3. 长度相同时，优先选择非通配符更多的（更精确）
            const currentLast = currentPath[currentPath.length - 1];
            const bestMatch = prefixMatches.reduce((best, current) => {
                const currentLastExact = current.path[current.path.length - 1] !== '*' &&
                    current.path[current.path.length - 1] === currentLast;
                const bestLastExact = best.path[best.path.length - 1] !== '*' &&
                    best.path[best.path.length - 1] === currentLast;

                // 末尾精确匹配优先
                if (currentLastExact && !bestLastExact) return current;
                if (!currentLastExact && bestLastExact) return best;

                // 都精确或都不精确，用长度和非通配符数量比较
                if (current.path.length > best.path.length) {
                    return current;
                } else if (current.path.length === best.path.length) {
                    const currentNonWildcards = current.path.filter(p => p !== '*').length;
                    const bestNonWildcards = best.path.filter(p => p !== '*').length;
                    return currentNonWildcards > bestNonWildcards ? current : best;
                }
                return best;
            });
            return bestMatch;
        }

        // 3. 尝试通配符匹配（仅用于没有通过前缀匹配的配置）
        const wildcardMatch = completionConfigs.find(config => {
            return this.isWildcardMatch(config.path, currentPath);
        });
        return wildcardMatch;
    }

    /**
     * 检查配置路径是否是当前路径的前缀
     * 例如：
     * - ['controls', '*', 'attribute'] 可以匹配 ['ui', 'controls', 'xxx', 'attribute']
     * - ['*', 'attribute'] 可以匹配 ['controls', 'xxx', 'attribute']（后缀匹配）
     */
    private isPrefixMatch(configPath: string[], currentPath: string[]): boolean {
        // 如果配置路径包含通配符，使用通配符前缀匹配
        if (configPath.includes('*')) {
            return this.isWildcardPrefixMatch(configPath, currentPath);
        }

        // 纯前缀匹配（不含通配符）
        if (configPath.length > currentPath.length) return false;
        for (let i = 0; i < configPath.length; i++) {
            if (configPath[i] !== currentPath[i]) {
                return false;
            }
        }
        return true;
    }

    /**
     * 通配符前缀匹配
     *
     * 规则：
     * - '*' 匹配**一个**路径段
     * - 从末尾开始对齐匹配（支持后缀匹配）
     * - 配置路径长度不能超过当前路径长度
     *
     * 例如：
     * - ['controls', '*'] 匹配 ['controls', 'xxx']（长度2），但不匹配 ['controls', 'xxx', 'yyy']（长度3）
     * - ['*', 'attribute'] 从末尾对齐匹配 ['controls', 'xxx', 'attribute']（末尾是 attribute）
     * - ['*', '*', 'attribute'] 从末尾对齐匹配 ['controls', 'xxx', 'yyy', 'attribute']（末尾是 attribute）
     */
    private isWildcardPrefixMatch(configPath: string[], currentPath: string[]): boolean {
        // 配置路径长度不能超过当前路径长度
        if (configPath.length > currentPath.length) {
            return false;
        }

        // 如果长度相同，使用精确通配符匹配
        if (configPath.length === currentPath.length) {
            return this.isWildcardMatch(configPath, currentPath);
        }

        // 从末尾开始对齐匹配
        let configIndex = configPath.length - 1;
        let currentIndex = currentPath.length - 1;

        while (configIndex >= 0 && currentIndex >= 0) {
            const configPart = configPath[configIndex];
            const currentPart = currentPath[currentIndex];

            if (configPart === '*') {
                // 通配符匹配一个路径段
                configIndex--;
                currentIndex--;
            } else if (configPart === currentPart) {
                // 精确匹配
                configIndex--;
                currentIndex--;
            } else {
                // 不匹配，直接返回 false
                // 不再使用 "剩余全通配符" 捷径，因为它会导致 ['*', 'action'] 错误匹配 ['...', 'action', 'click']
                return false;
            }
        }

        // 检查剩余的配置路径部分是否都是通配符
        while (configIndex >= 0) {
            if (configPath[configIndex] !== '*') {
                return false;
            }
            configIndex--;
        }

        return true;
    }

    /**
     * 检查通配符路径是否精确匹配当前路径（保留用于向后兼容）
     *
     * 规则：
     * - '*' 匹配任意单个路径段
     * - 配置路径长度必须等于当前路径长度
     */
    private isWildcardMatch(configPath: string[], currentPath: string[]): boolean {
        // 长度必须相同
        if (configPath.length !== currentPath.length) {
            return false;
        }

        for (let i = 0; i < configPath.length; i++) {
            const configPart = configPath[i];
            const currentPart = currentPath[i];
            // '*' 匹配任意值，其他必须精确匹配
            if (configPart !== '*' && configPart !== currentPart) {
                return false;
            }
        }
        return true;
    }
}
