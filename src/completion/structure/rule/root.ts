import * as vscode from 'vscode';

export const ui_full = {
    label: 'ui-full',
    detail: '创建完整的UI配置模板(包含所有配置项)',
    insertText: [
        'ui:',
        '  # 值为默认时可省略该配置项',
        '',
        '  match: []           # 替换原版界面ID，支持[regex]前缀正则 [非脚本]',
        '  hide: []            # 隐藏的HUD列表 [非脚本]',
        '  itemSize: 16           # 拿起物品渲染大小 [脚本]',
        '  through: false   # 穿透点击 [脚本]',
        '  escClose: true  # ESC关闭 [脚本]',
        '  background: true # 渲染半透明背景 [脚本]',
        '  closeDied: true # 死亡时关闭 [脚本]',
        '  show: true      # 是否渲染 [脚本]',
        '  jei: false       # 显示JEI侧边栏 [脚本]',
        '  level: 0               # 渲染优先级，越大越靠后 [脚本]',
        '  isHud: false     # 标识为HUD类型 [非脚本]',
        '  defaultOpen: true # 加载后自动打开 [非脚本]',
        '  action:             # UI触发器',
        '  packetHandler:      # 数据包处理器',
    ].join('\n'),
    kind: vscode.CompletionItemKind.Snippet
}
export const ui_base = {
    label: 'ui-base',
    detail: 'ui基础设定',
    insertText: 'ui: # 输入 ? 触发补全添加更多配置项\n  match: []\n',
    kind: vscode.CompletionItemKind.Snippet
}
export const tips_base = {
    label: 'tip-base',
    detail: '创建基础Tip配置模板',
    insertText: [
        'tip:',
        '  match: ${1:匹配ID}',
        '',
        'root_control:',
        '  type: tip',
        '  children:',
        '    ${2:# Tip内容}',
    ].join('\n'),
    kind: vscode.CompletionItemKind.Snippet
}
export const tips_adaptive = {
    label: 'tip-adaptive',
    detail: '创建基础Tip配置模板（启用适配尺寸）',
    insertText: [
        'tip:',
        '  match: ${1:匹配ID}',
        '',
        'root_control:',
        '  type: tip',
        '  attribute:',
        '    width: ${2:1920}',
        '    height: ${3:1080}',
        '    autoScale: true',
        '  children:',
        '    ${4:# Tip内容}',
    ].join('\n'),
    kind: vscode.CompletionItemKind.Snippet
}
export const controls_empty = {
    label: 'controls-empty',
    detail: '空控件列表',
    insertText: 'controls:\n  ',
    kind: vscode.CompletionItemKind.Property
}
export const controls_with_adaptive = {
    label: 'controls-with-adaptive',
    detail: '创建基础控件结构(自适应布局)',
    insertText: [
        'controls:',
        '  adaptive:',
        '    type: Adaptive',
        '    attribute:',
        '      point: ~middle_center',
        '      width: 1920',
        '      height: 1080',
        '    children:',
        '      main:',
        '        type: Canvas',
        '        attribute:',
        '          point: ~middle_center',
        '          width: ${1:800}',
        '          height: ${2:600}',
        '        children:',
        '          ${3:# UI内容}',
    ].join('\n'),
    kind: vscode.CompletionItemKind.Snippet
}
export const entity_model_base = {
    label: 'entity-model',
    detail: '实体模型渲染配置模板',
    insertText: [
        '${1:example}:',
        '  matchName: "${2:123456}"           # 匹配名，无需颜色符号（生物名匹配建议加特殊符号）',
        '  modelID: "${3:test}"                # 模型ID',
        '  scale: ${4:1}                       # 模型缩放',
        '  hideNameTag: false       # 是否隐藏名称标签',
        '  hurtColor: true         # 受击渲染（关闭后挨打不会红温）',
        '  virtualWidth: ${5:-1}               # 虚拟体积（仅ADY实体有效）',
        '  virtualHeight: ${6:-1}              # 虚拟体积（仅ADY实体有效）',
        '  renderAlways: false      # 持续渲染（仅ADY实体有效）',
        '',
        '# 配置后将实体命名为 matchName 的名字即可看到生物模型',
    ].join('\n'),
    kind: vscode.CompletionItemKind.Snippet
}