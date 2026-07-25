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

// ========== 智能类型模板 ==========
// 每种控件类型选择后自动生成的属性块模板
// 属性顺序：先通用(width/height/point)，再专属
interface PropTemplate {
    label: string;
    snippet: string; // snippet placeholder value
}

const type_templates: Record<string, PropTemplate[]> = {
    texture: [
        { label: 'width', snippet: '${1:width}' },
        { label: 'height', snippet: '${2:height}' },
        { label: 'normal', snippet: '~${3:resourcePath}' },
        { label: 'hover', snippet: '~${4:resourcePath}' },
    ],
    text: [
        { label: 'texts', snippet: "~${1:text}" },
        { label: 'fontSize', snippet: '${2:32}' },
        { label: 'shadow', snippet: '${3|true,false|}' },
    ],
    '9sliceTexture': [
        { label: 'width', snippet: '${1:width}' },
        { label: 'height', snippet: '${2:height}' },
        { label: 'normal', snippet: '~${3:resourcePath}' },
        { label: 'textureWidth', snippet: '${4:256}' },
        { label: 'textureHeight', snippet: '${5:256}' },
        { label: 'left', snippet: '${6:16}' },
        { label: 'right', snippet: '${7:16}' },
        { label: 'top', snippet: '${8:16}' },
        { label: 'bottom', snippet: '${9:16}' },
    ],
    textBox: [
        { label: 'width', snippet: '${1:350}' },
        { label: 'height', snippet: '${2:28}' },
        { label: 'fontSize', snippet: '${3:40}' },
        { label: 'emptyText', snippet: "~&a${4:请输入文本}" },
    ],
    chatTextBox: [
        { label: 'width', snippet: '${1:800}' },
        { label: 'height', snippet: '${2:30}' },
        { label: 'fontSize', snippet: '${3:20}' },
        { label: 'background', snippet: '~${4:0,0,0}' },
        { label: 'sendClose', snippet: '${5|true,false|}' },
    ],
    entity: [
        { label: 'scale', snippet: '${1:5}' },
        { label: 'hideTag', snippet: '${2|true,false|}' },
        { label: 'followMouse', snippet: '${3|true,false|}' },
        { label: 'uuid', snippet: '~${4:self}' },
    ],
    slot: [
        { label: 'width', snippet: '${1:80}' },
        { label: 'height', snippet: '${2:80}' },
        { label: 'normal', snippet: '~${3:resourcePath}' },
        { label: 'hover', snippet: '~${4:resourcePath}' },
        { label: 'itemScale', snippet: '${5:0.8}' },
        { label: 'slotType', snippet: '${6|~Backpack,~Container,~Extra,~Icon,~Hover|}' },
        { label: 'id', snippet: '${7:0}' },
    ],
    canvas: [
        { label: 'width', snippet: '${1:800}' },
        { label: 'height', snippet: '${2:600}' },
    ],
    adaptive: [
        { label: 'width', snippet: '${1:1920}' },
        { label: 'height', snippet: '${2:1080}' },
        { label: 'point', snippet: '~${3:top_left}' },
    ],
    hGrid: [
        { label: 'spaceBetweenX', snippet: '${1:10}' },
        { label: 'spaceBetweenY', snippet: '${2:10}' },
        { label: 'column', snippet: '${3:3}' },
    ],
    vGrid: [
        { label: 'spaceBetweenX', snippet: '${1:10}' },
        { label: 'spaceBetweenY', snippet: '${2:10}' },
        { label: 'row', snippet: '${3:3}' },
    ],
    hStack: [
        { label: 'spaceBetween', snippet: '${1:10}' },
        { label: 'height', snippet: '${2:100}' },
    ],
    vStack: [
        { label: 'spaceBetween', snippet: '${1:10}' },
        { label: 'width', snippet: '${2:100}' },
    ],
    scroll: [
        { label: 'moveX', snippet: '${1:0}' },
        { label: 'moveY', snippet: '${2:0}' },
    ],
    model: [
        { label: 'model', snippet: '~${1:modelId}' },
        { label: 'animation', snippet: '~${2:animation}' },
        { label: 'scale', snippet: '${3:1}' },
        { label: 'followMouse', snippet: '${4|true,false|}' },
    ],
    bossBar: [
        { label: 'textures', snippet: '~[${1:texture1.png,texture2.png}]' },
        { label: 'transitionTime', snippet: '${2:500}' },
    ],
    compass: [
        { label: 'width', snippet: '${1:400}' },
        { label: 'height', snippet: '${2:400}' },
        { label: 'background', snippet: '~${3:0,0,0,180}' },
        { label: 'tickInterval', snippet: '${4:5}' },
        { label: 'majorTickInterval', snippet: '${5:15}' },
    ],
    progress: [
        { label: 'width', snippet: '${1:200}' },
        { label: 'height', snippet: '${2:20}' },
        { label: 'texture', snippet: '~${3:255,255,255}' },
        { label: 'progress', snippet: '~${4:0.5}' },
        { label: 'time', snippet: '${5:100}' },
        { label: 'mode', snippet: '${6:0}' },
    ],
    import: [
        { label: 'node', snippet: '~${1:menu.uiId.adaptive.controlName}' },
    ],
    observer: [
        { label: 'maxSize', snippet: '${1:32}' },
        { label: 'subscribe', snippet: '~${2:global.dictVar}' },
        { label: 'target', snippet: 'val.${3:targetControl}' },
    ],
    chat: [
        { label: 'width', snippet: '${1:600}' },
        { label: 'height', snippet: '${2:300}' },
        { label: 'background', snippet: '~${3:0,0,0,175}' },
        { label: 'border', snippet: '${4:5}' },
        { label: 'spaceBetween', snippet: '${5:5}' },
        { label: 'showCard', snippet: '${6|true,false|}' },
    ],
    suggestion: [
        { label: 'fontSize', snippet: '${1:20}' },
        { label: 'maxShow', snippet: '${2:5}' },
        { label: 'textColor', snippet: '${3:#FFFFFF}' },
        { label: 'hoverTextColor', snippet: '${4:#87CEEB}' },
    ],
    bossBars: [
        { label: 'spaceBetween', snippet: '${1:10}' },
        { label: 'maxSize', snippet: '${2:3}' },
    ],
};

/**
 * 生成智能类型 snippet：type 值 + attribute 块 + 预填属性
 * @param type 控件类型名
 * @param baseIndent type 行的缩进字符串（如 "  " 或 "    "）
 * @returns SnippetString 内容
 */
export function getSmartTypeSnippet(type: string, baseIndent: string): string {
    const template = type_templates[type.toLowerCase()];
    if (!template || template.length === 0) {
        // 无专属属性的控件（canvas/adaptive），只生成空 attribute 块
        if (type_templates[type.toLowerCase()] && type_templates[type.toLowerCase()].length === 0) {
            return `${type}\n${baseIndent}attribute:\n${baseIndent}  `;
        }
        return type;
    }

    const attrIndent = baseIndent;
    const propIndent = baseIndent + '  ';

    const lines: string[] = [type];
    lines.push(`${attrIndent}attribute:`);
    for (const prop of template) {
        lines.push(`${propIndent}${prop.label}: ${prop.snippet}`);
    }

    return lines.join('\n');
}

/**
 * 判断某个类型是否有智能模板
 */
export function hasSmartTemplate(type: string): boolean {
    return type_templates.hasOwnProperty(type.toLowerCase());
}
