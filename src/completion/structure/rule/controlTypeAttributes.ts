import * as vscode from 'vscode';
import { control_attribute } from './controlAttribute';

// 通用属性 — 所有控件都适用
const common_attr_labels = new Set([
    'enable', 'visible', 'limitControl', 'width', 'height', 'x', 'y',
    'scale', 'alpha', 'point', 'rotate', 'middleScale', 'through',
    'minDragX', 'minDragY', 'maxDragX', 'maxDragY', 'tip',
]);

// 文本相关属性 — texture、text、9sliceTexture 等含有 texts 的控件
const text_attr_labels = new Set([
    'texts', 'fontSize', 'center', 'lineSpace', 'font', 'limit',
]);

// 每种控件类型的专属属性（不含通用属性）
const type_specific_attrs: Record<string, string[]> = {
    texture: ['normal', 'hover', ...text_attr_labels],
    text: ['shadow', ...text_attr_labels],
    '9sliceTexture': ['normal', 'hover', 'left', 'right', 'top', 'bottom', 'textureWidth', 'textureHeight', ...text_attr_labels],
    entity: ['uuid', 'hideTag', 'followMouse'],
    slot: ['normal', 'hover', 'slotType', 'id', 'itemScale', 'lock', 'cooldown', 'overwriteText'],
    textBox: ['length', 'allowNewLine', 'editable', 'cursorColor', 'emptyText', 'canLoseFocus', 'background', 'passwordChar', 'inputPattern', 'textColor', 'uneditableTextColor', ...text_attr_labels],
    chatTextBox: ['length', 'editable', 'cursorColor', 'emptyText', 'canLoseFocus', 'background', 'sendClose', ...text_attr_labels],
    canvas: [],
    adaptive: [],
    hGrid: ['spaceBetweenX', 'spaceBetweenY', 'column'],
    vGrid: ['spaceBetweenX', 'spaceBetweenY', 'row'],
    hStack: ['spaceBetween', 'maxSize'],
    vStack: ['spaceBetween', 'maxSize'],
    scroll: ['moveX', 'moveY'],
    model: ['model', 'animation', 'followMouse'],
    bossBar: ['textures', 'transitionTime'],
    compass: ['background', 'textColor', 'tickColor', 'directionColor', 'tickInterval', 'majorTickInterval', 'showWaypoints', 'waypointFontSize', 'waypointIconWidth', 'waypointIconHeight', 'wayOffsetY'],
    progress: ['texture', 'progress', 'time', 'mode'],
    import: ['node'],
    observer: ['maxSize', 'subscribe', 'target'],
    chat: ['border', 'spaceBetween', 'background', 'filter', 'showCard', 'exclude'],
    suggestion: ['background', 'radius', 'spaceBetween', 'backgroundBorder', 'up', 'maxShow', 'textColor', 'hoverTextColor', ...text_attr_labels],
    bossBars: ['spaceBetween', 'maxSize'],
};

// 构建 label → attribute item 的索引
const attr_map = new Map<string, typeof control_attribute[number]>();
for (const attr of control_attribute) {
    attr_map.set(attr.label, attr);
}

/**
 * 根据控件类型获取过滤后的属性补全列表
 * 返回通用属性 + 该类型专属属性
 */
export function getAttributesByType(type: string): typeof control_attribute {
    const specific = type_specific_attrs[type.toLowerCase()];
    if (!specific) {
        // 未知类型，返回全部
        return control_attribute;
    }

    const allowedLabels = new Set([...common_attr_labels, ...specific]);
    return control_attribute.filter(attr => allowedLabels.has(attr.label));
}

/**
 * 从文档中检测当前控件块的 type 属性值
 * 向上扫描查找最近的 type: xxx 行
 */
export function detectControlType(document: vscode.TextDocument, position: vscode.Position): string | undefined {
    const currentLineText = document.lineAt(position.line).text;
    let currentIndent = 0;
    const trimmed = currentLineText.trim();
    if (trimmed && !trimmed.startsWith('#') && !trimmed.startsWith('//')) {
        currentIndent = getIndentLevel(currentLineText);
    } else {
        currentIndent = position.character;
    }

    // 向上遍历，查找最近的 type: xxx 行（缩进必须 >= 当前行，确保是同一控件块内）
    for (let lineNum = position.line; lineNum >= 0; lineNum--) {
        const line = document.lineAt(lineNum);
        const lineText = line.text.trim();
        if (!lineText || lineText.startsWith('#') || lineText.startsWith('//')) continue;

        const lineIndent = getIndentLevel(line.text);

        // 移除注释
        let actualContent = lineText;
        const hashIndex = lineText.indexOf('#');
        if (hashIndex !== -1) actualContent = lineText.substring(0, hashIndex).trim();
        const slashIndex = lineText.indexOf('//');
        if (slashIndex !== -1) actualContent = lineText.substring(0, slashIndex).trim();

        // 匹配 type: xxx
        const typeMatch = actualContent.match(/^type:\s*(.+)$/);
        if (typeMatch) {
            const typeValue = typeMatch[1].trim().replace(/['"]/g, '');
            // 必须是当前控件块内的 type（缩进 >= attribute 的缩进或与控件名同级）
            if (lineIndent <= currentIndent) {
                return typeValue;
            }
        }

        // 如果遇到缩进更小的非 type 行，可能是父控件，继续向上
        // 但不提前退出，因为 type 可能在任意上级
    }

    return undefined;
}

function getIndentLevel(line: string): number {
    let indent = 0;
    for (const char of line) {
        if (char === ' ') indent++;
        else if (char === '\t') indent += 4;
        else break;
    }
    return indent;
}
