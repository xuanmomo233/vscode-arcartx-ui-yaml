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
        { label: 'width', snippet: '${1:100}' },
        { label: 'height', snippet: '${2:100}' },
        { label: 'point', snippet: '~${3:middle_center}' },
        { label: 'normal', snippet: '~${4:255,255,255,255}' },
        { label: 'hover', snippet: '~${5:200,200,200,255}' },
        { label: 'alpha', snippet: '${6:1}' },
    ],
    text: [
        { label: 'texts', snippet: "~${1:&f文本}" },
        { label: 'fontSize', snippet: '${2:49}' },
        { label: 'point', snippet: '~${3:top_left}' },
        { label: 'x', snippet: '${4:0}' },
        { label: 'y', snippet: '${5:0}' },
        { label: 'center', snippet: '${6|true,false|}' },
        { label: 'shadow', snippet: '${7|true,false|}' },
    ],
    '9slicetexture': [
        { label: 'width', snippet: '${1:100}' },
        { label: 'height', snippet: '${2:100}' },
        { label: 'point', snippet: '~${3:middle_center}' },
        { label: 'normal', snippet: '~${4:resourcePath}' },
        { label: 'textureWidth', snippet: '${5:256}' },
        { label: 'textureHeight', snippet: '${6:256}' },
        { label: 'left', snippet: '${7:16}' },
        { label: 'right', snippet: '${8:16}' },
        { label: 'top', snippet: '${9:16}' },
        { label: 'bottom', snippet: '${10:16}' },
    ],
    textbox: [
        { label: 'width', snippet: '${1:350}' },
        { label: 'height', snippet: '${2:28}' },
        { label: 'point', snippet: '~${3:middle_center}' },
        { label: 'fontSize', snippet: '${4:40}' },
        { label: 'emptyText', snippet: "~&a${5:请输入文本}" },
    ],
    chattextbox: [
        { label: 'fontSize', snippet: '${1:64}' },
        { label: 'background', snippet: '~${2:Frosted:30;0,0,0,80}' },
        { label: 'point', snippet: '~${3:horizontal_stretch_bottom}' },
        { label: 'height', snippet: '${4:45}' },
        { label: 'canLoseFocus', snippet: '${5|true,false|}' },
    ],
    entity: [
        { label: 'scale', snippet: '${1:5}' },
        { label: 'point', snippet: '~${2:middle_center}' },
        { label: 'hideTag', snippet: '${3|true,false|}' },
        { label: 'followMouse', snippet: '${4|true,false|}' },
        { label: 'uuid', snippet: '~${5:self}' },
    ],
    slot: [
        { label: 'width', snippet: '${1:80}' },
        { label: 'height', snippet: '${2:80}' },
        { label: 'normal', snippet: '~${3:inventory/item.png}' },
        { label: 'hover', snippet: '~${4:inventory/item_.png}' },
        { label: 'slotType', snippet: '${5|~Backpack,~Container,~Extra,~Icon,~Hover|}' },
        { label: 'itemScale', snippet: '${6:0.8}' },
        { label: 'id', snippet: '${7:0}' },
    ],
    canvas: [
        { label: 'width', snippet: '${1:800}' },
        { label: 'height', snippet: '${2:600}' },
        { label: 'point', snippet: '~${3:middle_center}' },
        { label: 'through', snippet: '${4|true,false|}' },
    ],
    adaptive: [
        { label: 'width', snippet: '${1:1920}' },
        { label: 'height', snippet: '${2:1080}' },
        { label: 'point', snippet: '~${3:stretch_all}' },
    ],
    hgrid: [
        { label: 'spaceBetweenX', snippet: '${1:10}' },
        { label: 'spaceBetweenY', snippet: '${2:10}' },
        { label: 'column', snippet: '${3:3}' },
        { label: 'point', snippet: '~${4:top_left}' },
        { label: 'x', snippet: '${5:0}' },
        { label: 'y', snippet: '${6:0}' },
    ],
    vgrid: [
        { label: 'spaceBetweenX', snippet: '${1:10}' },
        { label: 'spaceBetweenY', snippet: '${2:10}' },
        { label: 'row', snippet: '${3:3}' },
        { label: 'point', snippet: '~${4:top_left}' },
        { label: 'x', snippet: '${5:0}' },
        { label: 'y', snippet: '${6:0}' },
    ],
    hstack: [
        { label: 'spaceBetween', snippet: '${1:10}' },
        { label: 'point', snippet: '~${2:top_left}' },
        { label: 'x', snippet: '${3:0}' },
        { label: 'y', snippet: '${4:0}' },
        { label: 'height', snippet: '${5:100}' },
    ],
    vstack: [
        { label: 'spaceBetween', snippet: '${1:10}' },
        { label: 'point', snippet: '~${2:top_left}' },
        { label: 'x', snippet: '${3:0}' },
        { label: 'y', snippet: '${4:0}' },
        { label: 'width', snippet: '${5:100}' },
    ],
    scroll: [
        { label: 'width', snippet: '${1:800}' },
        { label: 'height', snippet: '${2:500}' },
        { label: 'point', snippet: '~${3:top_left}' },
        { label: 'x', snippet: '${4:0}' },
        { label: 'y', snippet: '${5:0}' },
        { label: 'moveX', snippet: '${6:0}' },
        { label: 'moveY', snippet: '${7:0}' },
    ],
    model: [
        { label: 'model', snippet: '~${1:modelId}' },
        { label: 'animation', snippet: '~${2:animation}' },
        { label: 'scale', snippet: '${3:1}' },
        { label: 'point', snippet: '~${4:middle_center}' },
        { label: 'followMouse', snippet: '${5|true,false|}' },
    ],
    bossbar: [
        { label: 'textures', snippet: '~[${1:texture1.png,texture2.png}]' },
        { label: 'transitionTime', snippet: '${2:500}' },
        { label: 'point', snippet: '~${3:middle_center}' },
    ],
    compass: [
        { label: 'width', snippet: '${1:400}' },
        { label: 'height', snippet: '${2:400}' },
        { label: 'point', snippet: '~${3:middle_center}' },
        { label: 'background', snippet: '~${4:0,0,0,180}' },
        { label: 'tickInterval', snippet: '${5:5}' },
        { label: 'majorTickInterval', snippet: '${6:15}' },
    ],
    progress: [
        { label: 'width', snippet: '${1:200}' },
        { label: 'height', snippet: '${2:20}' },
        { label: 'point', snippet: '~${3:top_left}' },
        { label: 'texture', snippet: '~${4:255,255,255,255}' },
        { label: 'progress', snippet: '${5:0.5}' },
        { label: 'mode', snippet: '${6:0}' },
    ],
    import: [
        { label: 'node', snippet: '~${1:menu.uiId.adaptive.controlName}' },
        { label: 'point', snippet: '~${2:middle_center}' },
    ],
    observer: [
        { label: 'maxSize', snippet: '${1:32}' },
        { label: 'subscribe', snippet: '~${2:global.dictVar}' },
        { label: 'target', snippet: 'val.${3:targetControl}' },
    ],
    chat: [
        { label: 'fontSize', snippet: '${1:64}' },
        { label: 'background', snippet: '~${2:0,0,0,120}' },
        { label: 'point', snippet: '~${3:horizontal_stretch_top}' },
        { label: 'height', snippet: '${4:495}' },
        { label: 'lineSpace', snippet: '${5:10}' },
        { label: 'showCard', snippet: '${6|true,false|}' },
    ],
    suggestion: [
        { label: 'up', snippet: '${1|true,false|}' },
        { label: 'fontSize', snippet: '${2:64}' },
        { label: 'background', snippet: '~${3:0,0,0,200}' },
        { label: 'backgroundBorder', snippet: '${4:10}' },
        { label: 'maxShow', snippet: '${5:5}' },
    ],
    bossbars: [
        { label: 'spaceBetween', snippet: '${1:10}' },
        { label: 'maxSize', snippet: '${2:3}' },
        { label: 'point', snippet: '~${3:top_left}' },
    ],
};

/**
 * 生成智能类型 snippet：type 值 + attribute 块 + 预填属性
 * @param type 控件类型名
 * @param baseIndent type 行的缩进字符串（如 "  " 或 "    "）
 * @returns SnippetString 内容
 */
export function getSmartTypeSnippet(type: string): string {
    const template = type_templates[type.toLowerCase()];
    if (!template || template.length === 0) {
        // 无专属属性的控件（canvas/adaptive），只生成空 attribute 块
        if (type_templates[type.toLowerCase()] && type_templates[type.toLowerCase()].length === 0) {
            return `${type}\nattribute:\n  `;
        }
        return type;
    }

    const lines: string[] = [type];
    lines.push('attribute:');
    for (const prop of template) {
        lines.push(`  ${prop.label}: ${prop.snippet}`);
    }

    return lines.join('\n');
}

/**
 * 判断某个类型是否有智能模板
 */
export function hasSmartTemplate(type: string): boolean {
    return type_templates.hasOwnProperty(type.toLowerCase());
}
