import type { Position, TextDocument } from 'vscode';

export interface MappingEntry {
    key: string;
    value: string;
    indent: number;
    line: number;
    valueStart: number;
}

export function indentation(text: string): number {
    return (text.match(/^[ \t]*/)?.[0] ?? '').replace(/\t/g, '    ').length;
}

export function mappingEntry(text: string, line: number): MappingEntry | undefined {
    const match = text.match(/^[ \t]*(?!-[ \t])("(?:\\.|[^"\\])*"|'(?:''|[^'])*'|[^\s#:[\]{}|>](?:(?!:[ \t]|[ \t]+#).)*?)[ \t]*:(?=[ \t]|$)[ \t]*/);
    if (!match) {
        return undefined;
    }
    const key = match[1].replace(/^(['"])(.*)\1$/, '$2');
    return { key, value: text.slice(match[0].length).trimEnd(), indent: indentation(text), line, valueStart: match[0].length };
}

export function isMappingBlock(entry: MappingEntry): boolean {
    return entry.value === '' || entry.value.startsWith('#');
}

export function isAriaBlock(entry: MappingEntry): boolean {
    return /^[|>](?:[1-9][-+]?|[-+][1-9]?)?(?:\s+#.*)?$/.test(entry.value);
}

export function yamlAncestors(document: TextDocument, line: number, indent: number): MappingEntry[] {
    const parents: MappingEntry[] = [];
    for (let previous = line - 1; previous >= 0 && indent > 0; previous--) {
        const entry = mappingEntry(document.lineAt(previous).text, previous);
        if (entry && entry.indent < indent && (isMappingBlock(entry) || isAriaBlock(entry))) {
            parents.unshift(entry);
            indent = entry.indent;
        }
    }
    return parents;
}

export function positionIndent(document: TextDocument, position: Position): number {
    const text = document.lineAt(position.line).text;
    return indentation(text.slice(0, position.character));
}

export function isControlPath(path: readonly string[]): boolean {
    const [root, ...rest] = path[0] === 'ui' ? path.slice(1) : path;
    // A control is root_control itself, or a named entry under controls, template or children.
    return (root === 'root_control' && rest.length % 2 === 0 && rest.every((part, i) => i % 2 !== 0 || part === 'children')) ||
        ((root === 'controls' || root === 'template') && rest.length % 2 === 1 && rest.every((part, i) => i % 2 === 0 || part === 'children'));
}

export function isTaskPath(path: readonly string[]): boolean {
    const task = path[0] === 'ui' ? path.slice(1) : path;
    return task.length === 2 && task[0] === 'tasks';
}

export function scalarValue(value: string): string {
    const quoted = value.match(/^(['"])(.*?)\1(?:\s+#.*)?$/);
    return quoted ? quoted[2] : value.replace(/\s+#.*$/, '').trim();
}

export function* directMappings(document: TextDocument, owner: MappingEntry): Iterable<MappingEntry> {
    let childIndent: number | undefined;
    for (let line = owner.line + 1; line < document.lineCount; line++) {
        const text = document.lineAt(line).text;
        if (!text.trim() || text.trimStart().startsWith('#')) {
            continue;
        }
        const indent = indentation(text);
        if (indent <= owner.indent) {
            break;
        }
        childIndent ??= indent;
        if (indent === childIndent) {
            const entry = mappingEntry(text, line);
            if (entry) {
                yield entry;
            }
        }
    }
}

export function directControlType(document: TextDocument, owner: MappingEntry): string | undefined {
    for (const entry of directMappings(document, owner)) {
        if (entry.key === 'type') {
            return scalarValue(entry.value);
        }
    }
    return undefined;
}

export function inlineValueStart(text: string, line: number): number | undefined {
    return text.match(/^[ \t]*-[ \t]+/)?.[0].length ?? mappingEntry(text, line)?.valueStart;
}

export function ariaContext(document: TextDocument, position: Position, parents: MappingEntry[]): 'ui' | 'control' | undefined {
    const path = parents.map(entry => entry.key);
    const block = parents.findIndex(isAriaBlock);
    if (block !== -1) {
        return path.slice(0, block).some((_, index) => isControlPath(path.slice(0, index + 1))) ? 'control' : 'ui';
    }
    const text = document.lineAt(position.line).text;
    const valueStart = inlineValueStart(text, position.line);
    if (valueStart === undefined || position.character < valueStart || /^['"]?[~#]/.test(text.slice(valueStart))) {
        return undefined;
    }
    if (path.some((part, index) => ['attribute', 'action', 'effect'].includes(part) && isControlPath(path.slice(0, index)))) {
        return 'control';
    }
    if ((path[0] === 'ui' && ['action', 'packetHandler'].includes(path[1])) ||
        (isTaskPath(path) && mappingEntry(text, position.line)?.key === 'run')) {
        return 'ui';
    }
    return undefined;
}
