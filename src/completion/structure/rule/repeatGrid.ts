import * as vscode from 'vscode';
import { directControlType, isControlPath, MappingEntry } from '../../../yamlContext';

const wiki = 'https://wiki.arcartx.com/docs/arcartx_v2/8_ui/8_controls_type';

export const repeatGridType = {
    label: 'RepeatGrid',
    detail: '数据网格布局',
    insertText: 'RepeatGrid',
    kind: vscode.CompletionItemKind.EnumMember,
    documentation: new vscode.MarkdownString([
        '按 `items` 的顺序渲染数据，使用 `key` 复用和移动已有控件。',
        '在 `children` 中配置一个直接子控件作为模板。模板根控件读取 `self.item`，其直接子控件读取 `self.parent.item`。',
        `[控件类型文档](${wiki})`,
    ].join('\n\n')),
};

export const repeatGridAttributes = [
    ['items', 'Aria 列表表达式。按列表顺序生成和排列模板控件，默认空列表。', '${1:Player.getTabPlayers()}'],
    ['key', '列表元素为字典时用于标识条目的字段名。建议使用稳定的唯一值，省略时使用列表下标。', '~${1:uuid}'],
    ['flow', '排列方向，默认 `~column`。可使用 `~row` 按行排列。', '~${1|column,row|}'],
    ['row', '`flow: ~column` 时每列的行数，默认 20。', '${1:20}'],
    ['column', '`flow: ~row` 时每行的列数，默认 1。', '${1:1}'],
    ['spaceBetweenX', '水平间距，默认 0。', '${1:0}'],
    ['spaceBetweenY', '垂直间距，默认 0。', '${1:0}'],
    ['maxSize', '渲染条目上限，默认 80。超出时取列表的前几项。', '${1:80}'],
    ['updateInterval', '更新间隔，单位毫秒，默认 100。', '${1:100}'],
].map(([label, detail, value]) => ({
    label, detail, insertText: `${label}: ${value}`, kind: vscode.CompletionItemKind.Property,
    documentation: new vscode.MarkdownString(detail),
}));

export const repeatGridFlowValues = [
    { label: 'column', detail: '从上到下，达到 row 后换列（默认）', insertText: '~column', kind: vscode.CompletionItemKind.EnumMember },
    { label: 'row', detail: '从左到右，达到 column 后换行', insertText: '~row', kind: vscode.CompletionItemKind.EnumMember },
];

export const repeatGridItemProperties = [
    ['item', '当前列表元素'],
    ['key', '当前条目的唯一键'],
    ['index', '当前条目在列表中的下标'],
    ['row', '当前条目所在行'],
    ['column', '当前条目所在列'],
].map(([label, detail]) => ({
    label, detail, insertText: label, kind: vscode.CompletionItemKind.Property,
    documentation: new vscode.MarkdownString(`RepeatGrid 模板属性。${detail}。`),
}));

export const repeatGridTypeSnippet = [
    'RepeatGrid',
    'attribute:',
    '  items: ${2:Player.getTabPlayers()}',
    '  key: ~${3:uuid}',
    '  flow: ~column',
    '  row: ${4:20}',
    '  maxSize: ${5:80}',
    'children:',
    '  ${6:player}:',
    '    type: Text',
    '    attribute:',
    '      width: ${7:180}',
    '      height: ${8:20}',
    '      texts: "self.item[\'displayName\']"',
].join('\n');

export function selfParentDepth(prefix: string): number | undefined {
    const receiver = prefix.match(/(?:^|[^\p{L}\p{N}_.])self((?:\??\.parent(?:[ \t]*\([ \t]*\))?)*)\??\.$/u);
    if (receiver) {
        return receiver[1].split('.').length - 1;
    }
    return undefined;
}

export function isRepeatGridItem(document: vscode.TextDocument, parents: MappingEntry[], depth: number | undefined): boolean {
    if (depth === undefined) {
        return false;
    }
    const path = parents.map(entry => entry.key);
    let ownerIndex = path.length - 1;
    while (ownerIndex >= 0 && !isControlPath(path.slice(0, ownerIndex + 1))) {
        ownerIndex--;
    }
    const gridIndex = ownerIndex - (depth + 1) * 2;
    return gridIndex >= 0 && path[gridIndex + 1] === 'children' &&
        directControlType(document, parents[gridIndex])?.toLowerCase() === 'repeatgrid';
}
