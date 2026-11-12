import * as vscode from 'vscode';
import { control_attribute } from './controlAttribute';
import { repeatGridAttributes } from './repeatGrid';
import { controlTypeBodies } from './control';
import { directControlType, isControlPath, MappingEntry } from '../../../yamlContext';

// 通用属性 — 所有控件都适用
const common_attr_labels = new Set([
    'enable', 'visible', 'limitControl', 'width', 'height', 'x', 'y',
    'scale', 'alpha', 'point', 'rotate', 'middleScale', 'through',
    'minDragX', 'minDragY', 'maxDragX', 'maxDragY', 'tip',
]);

// 图形属性 — 仅对有纹理渲染/背景的控件生效
const shape_attr_labels = new Set(['shape', 'radius']);

// 文本相关属性 — texture、text、9sliceTexture 等含有 texts 的控件
const text_attr_labels = new Set([
    'texts', 'fontSize', 'center', 'lineSpace', 'font', 'limit',
]);

// 每种控件类型的专属属性（不含通用属性）
// 注意：键必须全部小写，因为 getAttributesByType 使用 type.toLowerCase() 查询，
// 这样无论 yaml 中 type 写成 VGrid / vgrid / VGRID 都能大小写不敏感地匹配。
const type_specific_attrs: Record<string, string[]> = {
    texture: ['normal', 'hover', 'loop', ...shape_attr_labels, ...text_attr_labels],
    text: ['shadow', 'alignment', ...text_attr_labels],
    '9slicetexture': ['normal', 'hover', 'left', 'right', 'top', 'bottom', 'textureWidth', 'textureHeight', ...shape_attr_labels, ...text_attr_labels],
    entity: ['uuid', 'hideTag', 'followMouse'],
    slot: ['normal', 'hover', 'slotType', 'id', 'itemScale', 'lock', 'cooldown', 'overwriteText', 'itemEffect', ...shape_attr_labels],
    textbox: ['length', 'allowNewLine', 'editable', 'cursorColor', 'emptyText', 'canLoseFocus', 'background', 'passwordChar', 'inputPattern', 'textColor', 'uneditableTextColor', ...shape_attr_labels, ...text_attr_labels],
    chattextbox: ['length', 'editable', 'cursorColor', 'emptyText', 'canLoseFocus', 'background', 'sendClose', ...shape_attr_labels, ...text_attr_labels],
    canvas: [],
    adaptive: ['autoScale'],
    tip: ['autoScale', 'follow'],
    hgrid: ['spaceBetweenX', 'spaceBetweenY', 'column'],
    vgrid: ['spaceBetweenX', 'spaceBetweenY', 'row'],
    hstack: ['spaceBetween', 'maxSize'],
    vstack: ['spaceBetween', 'maxSize'],
    scroll: ['moveX', 'moveY'],
    model: ['model', 'animation', 'followMouse', 'showType'],
    bossbar: ['textures', 'transitionTime', ...shape_attr_labels],
    compass: ['background', 'textColor', 'tickColor', 'directionColor', 'tickInterval', 'majorTickInterval', 'showWaypoints', 'waypointFontSize', 'waypointIconWidth', 'waypointIconHeight', 'wayOffsetY', ...shape_attr_labels],
    progress: ['texture', 'progress', 'time', 'mode', ...shape_attr_labels],
    import: ['node'],
    observer: ['maxSize', 'subscribe', 'target'],
    chat: ['border', 'spaceBetween', 'background', 'filter', 'showCard', 'exclude', 'keep', ...shape_attr_labels],
    suggestion: ['background', 'radius', 'spaceBetween', 'backgroundBorder', 'up', 'maxShow', 'textColor', 'hoverTextColor', ...text_attr_labels],
    bossbars: ['spaceBetween', 'maxSize'],
};

function canonicalType(type: string): string {
    const lower = type.toLowerCase();
    if (lower === 'grid') {
        return 'hgrid';
    }
    if (lower === 'stack') {
        return 'hstack';
    }
    return lower;
}

/**
 * 根据控件类型获取过滤后的属性补全列表
 * 返回通用属性 + 该类型专属属性
 */
export function getAttributesByType(type: string) {
    const canonical = canonicalType(type);
    if (canonical === 'repeatgrid') {
        return [...control_attribute.filter(attr => common_attr_labels.has(attr.label)), ...repeatGridAttributes];
    }
    const specific = type_specific_attrs[canonical];
    if (!Array.isArray(specific)) {
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
export function detectControlType(document: vscode.TextDocument, parents: MappingEntry[]): string | undefined {
    const ownerPath = parents.map(entry => entry.key);
    if (ownerPath[ownerPath.length - 1] === 'attribute') {
        ownerPath.pop();
    }
    return isControlPath(ownerPath) ? directControlType(document, parents[ownerPath.length - 1]) : undefined;
}

export function getSmartTypeSnippet(type: string): string | undefined {
    const body = controlTypeBodies.get(canonicalType(type));
    return body === undefined ? undefined : type + '\n' + body;
}
