import * as vscode from 'vscode';


const texture = {
    label: 'texture',
    detail: '创建纹理控件',
    insertText: [
        '${1:texture_}:',
        '  type: texture',
        '  attribute:',
        '    width: ${2:100}',
        '    height: ${3:100}',
        '    point: ~${4:middle_center}',
        '    normal: ~${5:255,255,255,255}',
        '    hover: ~${6:200,200,200,255}',
        '    alpha: ${7:1}'
    ].join('\n'),
    kind: vscode.CompletionItemKind.Snippet
}
const text = {
    label: 'text',
    detail: '创建文字控件',
    insertText: [
        '${1:text_}:',
        '  type: text',
        '  attribute:',
        '    texts: ~${2:&f文本}',
        '    fontSize: ${3:49}',
        '    point: ~${4:top_left}',
        '    x: ${5:0}',
        '    y: ${6:0}',
        '    center: ${7|true,false|}',
        '    shadow: ${8|true,false|}',
    ].join('\n'),
    kind: vscode.CompletionItemKind.Snippet
}
const _9sliceTexture = {
    label: '9sliceTexture',
    detail: '创建九宫格纹理控件',
    insertText: [
        '${1:nineSliceTexture_}:',
        '  type: 9sliceTexture',
        '  attribute:',
        '    width: ${2:100}',
        '    height: ${3:100}',
        '    point: ~${4:middle_center}',
        '    normal: ~${5:resourcePath}',
        '    textureWidth: ${6:256}',
        '    textureHeight: ${7:256}',
        '    left: ${8:16}',
        '    right: ${9:16}',
        '    top: ${10:16}',
        '    bottom: ${11:16}'
    ].join('\n'),
    kind: vscode.CompletionItemKind.Snippet
}
const textInput = {
    label: 'textInput',
    detail: '创建常规文本输入框控件',
    insertText: [
        '${1:textInput_}:',
        '  type: textbox',
        '  attribute:',
        '    width: ${2:350}',
        '    height: ${3:28}',
        '    point: ~${4:middle_center}',
        '    fontSize: ${5:40}',
        '    emptyText: ~&a${6:请输入文本}'
    ].join('\n'),
    kind: vscode.CompletionItemKind.Snippet
};
const passwordInput = {
    label: 'passwordInput',
    detail: '创建密码输入框控件',
    insertText: [
        '${1:passwordInput_}:',
        '  type: textbox',
        '  attribute:',
        '    width: ${2:350}',
        '    height: ${3:28}',
        '    point: ~${4:middle_center}',
        '    fontSize: ${5:40}',
        '    emptyText: ~&a${6:请输入登录密码}',
        '    passwordChar: ~${7:※}'
    ].join('\n'),
    kind: vscode.CompletionItemKind.Snippet
};
const entity = {
    label: 'entity',
    detail: '创建实体控件',
    insertText: [
        '${1:entity_}:',
        '  type: entity',
        '  attribute:',
        '    scale: ${2:5}',
        '    point: ~${3:middle_center}',
        '    hideTag: ${4|true,false|}',
        '    followMouse: ${5|true,false|}',
        '    uuid: ~${6:self}'
    ].join('\n'),
    kind: vscode.CompletionItemKind.Snippet
}
const slot =  {
    label: 'slot',
    detail: '创建槽位控件',
    insertText: [
        '${1:slot_}:',
        '  type: slot',
        '  attribute:',
        '    width: ${2:80}',
        '    height: ${3:80}',
        '    normal: ~${4:inventory/item.png}',
        '    hover: ~${5:inventory/item_.png}',
        '    slotType: ~${6|Backpack,Container,Extra,Icon,Hover|}',
        '    itemScale: ${7:0.8}',
        '    id: ${8:0}'
    ].join('\n'),
    kind: vscode.CompletionItemKind.Snippet
}
const canvas = {
    label: 'canvas',
    detail: '创建画布控件',
    insertText: [
        '${1:canvas_}:',
        '  type: canvas',
        '  attribute:',
        '    width: ${2:800}',
        '    height: ${3:600}',
        '    point: ~${4:middle_center}',
        '    through: ${5|true,false|}'
    ].join('\n'),
    kind: vscode.CompletionItemKind.Snippet
}
const adaptive = {
    label: 'adaptive',
    detail: '创建自适应控件',
    insertText: [
        '${1:adaptive_}:',
        '  type: adaptive',
        '  attribute:',
        '    width: ${2:1920}',
        '    height: ${3:1080}',
        '    point: ~${4:stretch_all}'
    ].join('\n'),
    kind: vscode.CompletionItemKind.Snippet
}
const hGrid = {
    label: 'hGrid',
    detail: '创建水平网格控件',
    insertText: [
        '${1:hGrid_}:',
        '  type: hGrid',
        '  attribute:',
        '    spaceBetweenX: ${2:10}',
        '    spaceBetweenY: ${3:10}',
        '    column: ${4:3}',
        '    point: ~${5:top_left}',
        '    x: ${6:0}',
        '    y: ${7:0}'
    ].join('\n'),
    kind: vscode.CompletionItemKind.Snippet
}
const vGrid = {
    label: 'vGrid',
    detail: '创建垂直网格控件',
    insertText: [
        '${1:vGrid_}:',
        '  type: vGrid',
        '  attribute:',
        '    spaceBetweenX: ${2:10}',
        '    spaceBetweenY: ${3:10}',
        '    row: ${4:3}',
        '    point: ~${5:top_left}',
        '    x: ${6:0}',
        '    y: ${7:0}'
    ].join('\n'),
    kind: vscode.CompletionItemKind.Snippet
}
const hStack = {
    label: 'hStack',
    detail: '创建水平堆栈控件',
    insertText: [
        '${1:hStack_}:',
        '  type: hStack',
        '  attribute:',
        '    spaceBetween: ${2:10}',
        '    point: ~${3:top_left}',
        '    x: ${4:0}',
        '    y: ${5:0}',
        '    height: ${6:100}'
    ].join('\n'),
    kind: vscode.CompletionItemKind.Snippet
};
const vStack = {
    label: 'vStack',
    detail: '创建垂直堆栈控件',
    insertText: [
        '${1:vStack_}:',
        '  type: vStack',
        '  attribute:',
        '    spaceBetween: ${2:10}',
        '    point: ~${3:top_left}',
        '    x: ${4:0}',
        '    y: ${5:0}',
        '    width: ${6:100}'
    ].join('\n'),
    kind: vscode.CompletionItemKind.Snippet
};
const scroll_full = {
    label: 'scroll-full',
    detail: '创建完整滚动栏组件(包含垂直、水平滑块)',
    insertText: [
        '${1:scroll_}:',
        '  type: canvas',
        '  attribute:',
        '    width: ${2:800}',
        '    height: ${3:500}',
        '    point: ~${4:middle_center}',
        '  children:',
        '    vButton:',
        '      type: texture',
        '      attribute:',
        '        point: ~top_right',
        '        width: 25',
        '        height: 80',
        '        normal: ~255,255,255',
        '        maxDragY: |',
        '          self.parent.height - self.height',
        '    hButton:',
        '      type: texture',
        '      attribute:',
        '        point: ~bottom_left',
        '        width: 80',
        '        height: 25',
        '        normal: ~255,255,255',
        '        maxDragX: |',
        '          self.parent.width - self.width',
        '    scroll:',
        '      type: scroll',
        '      attribute:',
        '        width: |',
        '          self.parent.width - self.parent[\'vButton\'].width',
        '        height: |',
        '          self.parent.height - self.parent[\'hButton\'].height',
        '        moveY: |',
        '          self.parent[\'vButton\'].getDragYRatio()',
        '        moveX: |',
        '          self.parent[\'hButton\'].getDragXRatio()',
        '      children:',
        '        container:',
        '          type: ${5:canvas}',
        '          attribute:',
        '            width: ${6:1270}',
        '            height: ${7:1000}',
        '          children:',
        '            ${8:# 在这里添加滚动内容}'
    ].join('\n'),
    kind: vscode.CompletionItemKind.Snippet
}
const scroll_v = {
    label: 'scroll-v',
    detail: '创建完整滚动栏组件(仅垂直滚动)',
    insertText: [
        '${1:scroll_}:',
        '  type: canvas',
        '  attribute:',
        '    width: ${2:800}',
        '    height: ${3:500}',
        '    point: ~${4:middle_center}',
        '  children:',
        '    vButton:',
        '      type: texture',
        '      attribute:',
        '        point: ~top_right',
        '        width: 25',
        '        height: 80',
        '        normal: ~255,255,255',
        '        maxDragY: |',
        '          self.parent.height - self.height',
        '    scroll:',
        '      type: scroll',
        '      attribute:',
        '        width: |',
        '          self.parent.width - self.parent[\'vButton\'].width',
        '        height: |',
        '          self.parent.height',
        '        moveY: |',
        '          self.parent[\'vButton\'].getDragYRatio()',
        '      children:',
        '        container:',
        '          type: ${5:canvas}',
        '          attribute:',
        '            width: |',
        '              self.parent.width',
        '            height: ${6:1000}',
        '          children:',
        '            ${7:# 在这里添加滚动内容}'
    ].join('\n'),
    kind: vscode.CompletionItemKind.Snippet
}
const scroll_h = {
    label: 'scroll-h',
    detail: '创建完整滚动栏组件(仅水平滚动)',
    insertText: [
        '${1:scroll_}:',
        '  type: canvas',
        '  attribute:',
        '    width: ${2:800}',
        '    height: ${3:500}',
        '    point: ~${4:middle_center}',
        '  children:',
        '    hButton:',
        '      type: texture',
        '      attribute:',
        '        point: ~bottom_center',
        '        width: 80',
        '        height: 25',
        '        normal: ~255,255,255',
        '        maxDragX: |',
        '          self.parent.width - self.width',
        '    scroll:',
        '      type: scroll',
        '      attribute:',
        '        width: |',
        '          self.parent.width',
        '        height: |',
        '          self.parent.height - self.parent[\'hButton\'].height',
        '        moveX: |',
        '          self.parent[\'hButton\'].getDragXRatio()',
        '      children:',
        '        container:',
        '          type: ${5:canvas}',
        '          attribute:',
        '            width: ${6:1000}',
        '            height: |',
        '              self.parent.height',
        '          children:',
        '            ${7:# 在这里添加滚动内容}'
    ].join('\n'),
    kind: vscode.CompletionItemKind.Snippet
}
const button = {
    label: 'fast-button',
    detail: '快速创建按钮',
    insertText: [
        '${1:button_}:',
        '  type: texture',
        '  attribute:',
        '    width: ${2:100}',
        '    height: ${3:30}',
        '    point: ~${4:middle_center}',
        '    normal: ~${5:100,100,100,255}',
        '    hover: ~${6:150,150,150,255}',
        '  action:',
        '    click: |-',
        '      ${7:// 点击事件}'
    ].join('\n'),
    kind: vscode.CompletionItemKind.Snippet
}
const button_text = {
    label: 'fast-button-text',
    detail: '快速创建按钮(带背景和文字)',
    insertText: [
        '${1:button_}:',
        '  type: texture',
        '  attribute:',
        '    width: ${2:100}',
        '    height: ${3:30}',
        '    point: ~${4:middle_center}',
        '    normal: ~${5:100,100,100,255}',
        '    hover: ~${6:150,150,150,255}',
        '    texts: ~${7:&0按钮文字}',
        '    fontSize: ${8:49}',
        '    center: ${9|true,false|}',
        '  action:',
        '    click: |-',
        '      ${10:// 点击事件}'
    ].join('\n'),
    kind: vscode.CompletionItemKind.Snippet
}
const inv_slots = {
    label: 'fast-inventory-slots',
    detail: '创建背包槽位网格(带自动生成)',
    insertText: [
        '${1:inventory_slots_}:',
        '  type: grid',
        '  attribute:',
        '    spaceBetweenY: ${2:60}',
        '    spaceBetweenX: ${3:10}',
        '    column: 9',
        '  action:',
        '    create: |-',
        '      for(i in range(1,26)){',
        '        self[\'slot0\'].copy(\"slot{i.round(0)}\").id += i ',
        '      }',
        '  children:',
        '    slot0:',
        '      type: slot',
        '      attribute:',
        '        width: ${4:80}',
        '        height: ${5:80}',
        '        normal: ~${6:inventory/item.png}',
        '        hover: ~${7:inventory/item_.png}',
        '        slotType: ~Backpack',
        '        itemScale: ${8:0.8}',
        '        id: 9'
    ].join('\n'),
    kind: vscode.CompletionItemKind.Snippet
}
const hotbar_slots = {
    label: 'fast-hotbar-slots',
    detail: '创建快捷栏槽位(带自动生成)',
    insertText: [
        '${1:hotbar_slots_}:',
        '  type: hStack',
        '  attribute:',
        '    spaceBetween: ${2:40}',
        '  action:',
        '    create: |-',
        '      for(i in range(1,9)){',
        '        self[\'slot0\'].copy(\"slot{i.round(0)}\").id += i ',
        '      }',
        '  children:',
        '    slot0:',
        '      type: slot',
        '      attribute:',
        '        width: ${3:80}',
        '        height: ${4:80}',
        '        normal: ~${5:inventory/item.png}',
        '        hover: ~${6:inventory/item_.png}',
        '        itemScale: ${7:0.8}',
        '        id: 36'
    ].join('\n'),
    kind: vscode.CompletionItemKind.Snippet
}

// ========== 游戏内容显示（续）==========
const model = {
    label: 'model',
    detail: '创建模特控件',
    insertText: [
        '${1:model_}:',
        '  type: model',
        '  attribute:',
        '    model: ~${2:modelId}',
        '    animation: ~${3:animation}',
        '    scale: ${4:1}',
        '    point: ~${5:middle_center}',
        '    followMouse: ${6|true,false|}'
    ].join('\n'),
    kind: vscode.CompletionItemKind.Snippet
}
const bossBar = {
    label: 'bossBar',
    detail: '创建多层血条控件',
    insertText: [
        '${1:bossBar_}:',
        '  type: bossBar',
        '  attribute:',
        '    textures: ~[${2:texture1.png,texture2.png}]',
        '    transitionTime: ${3:500}',
        '    point: ~${4:middle_center}'
    ].join('\n'),
    kind: vscode.CompletionItemKind.Snippet
}

// ========== 特殊控件 ==========
const compass = {
    label: 'compass',
    detail: '创建罗盘控件',
    insertText: [
        '${1:compass_}:',
        '  type: compass',
        '  attribute:',
        '    width: ${2:400}',
        '    height: ${3:400}',
        '    point: ~${4:middle_center}',
        '    background: ~0,0,0,180',
        '    textColor: ~255,255,255',
        '    tickColor: ~255,255,255',
        '    directionColor: ~255,255,255',
        '    tickInterval: ${5:5}',
        '    majorTickInterval: ${6:15}'
    ].join('\n'),
    kind: vscode.CompletionItemKind.Snippet
}
const progress = {
    label: 'progress',
    detail: '创建进度条控件',
    insertText: [
        '${1:progress_}:',
        '  type: progress',
        '  attribute:',
        '    width: ${2:200}',
        '    height: ${3:20}',
        '    point: ~${4:top_left}',
        '    texture: ~${5:255,255,255,255}',
        '    progress: ${6:0.5}',
        '    mode: ${7:0}'
    ].join('\n'),
    kind: vscode.CompletionItemKind.Snippet
}
const _import = {
    label: 'import',
    detail: '创建导入器控件',
    insertText: [
        '${1:import_}:',
        '  type: import',
        '  attribute:',
        '    node: ~${2:menu.uiId.adaptive.controlName}',
        '    point: ~${3:middle_center}'
    ].join('\n'),
    kind: vscode.CompletionItemKind.Snippet
}
const observer = {
    label: 'observer',
    detail: '创建观察者控件',
    insertText: [
        '${1:observer_}:',
        '  type: observer',
        '  attribute:',
        '    maxSize: ${2:32}',
        '    subscribe: ~${3:global.dictVar}',
        '    target: val.${4:targetControl}'
    ].join('\n'),
    kind: vscode.CompletionItemKind.Snippet
}

// ========== 聊天相关 ==========
const chatTextBox = {
    label: 'chatTextBox',
    detail: '创建聊天栏输入框控件',
    insertText: [
        '${1:chatInput_}:',
        '  type: chatTextBox',
        '  attribute:',
        '    fontSize: ${2:64}',
        '    background: ~${3:Frosted:30;0,0,0,80}',
        '    point: ~${4:horizontal_stretch_bottom}',
        '    height: ${5:45}',
        '    canLoseFocus: ${6|true,false|}',
        '  children:',
        '    suggestion:',
        '      type: suggestion',
        '      attribute:',
        '        up: ${7|true,false|}',
        '        fontSize: ${8:64}',
        '        background: ~${9:0,0,0,200}',
        '        backgroundBorder: ${10:10}',
        '        maxShow: ${11:5}'
    ].join('\n'),
    kind: vscode.CompletionItemKind.Snippet
}
const suggestion = {
    label: 'suggestion',
    detail: '创建命令补全器控件',
    insertText: [
        '${1:suggestion_}:',
        '  type: suggestion',
        '  attribute:',
        '    up: ${2|true,false|}',
        '    fontSize: ${3:64}',
        '    background: ~${4:0,0,0,200}',
        '    backgroundBorder: ${5:10}',
        '    maxShow: ${6:5}'
    ].join('\n'),
    kind: vscode.CompletionItemKind.Snippet
}
const chat = {
    label: 'chat',
    detail: '创建聊天栏控件',
    insertText: [
        '${1:chat_}:',
        '  type: chat',
        '  attribute:',
        '    fontSize: ${2:64}',
        '    background: ~${3:0,0,0,120}',
        '    point: ~${4:horizontal_stretch_top}',
        '    height: ${5:495}',
        '    lineSpace: ${6:10}',
        '    showCard: ${7|true,false|}'
    ].join('\n'),
    kind: vscode.CompletionItemKind.Snippet
}

// ========== 布局型（续）==========
const bossBars = {
    label: 'bossBars',
    detail: '创建血条排列器控件',
    insertText: [
        '${1:bossBars_}:',
        '  type: bossBars',
        '  attribute:',
        '    spaceBetween: ${2:10}',
        '    maxSize: ${3:3}',
        '    point: ~${4:top_left}'
    ].join('\n'),
    kind: vscode.CompletionItemKind.Snippet
}

export const controls = [
    // 基础显示
    texture, text, _9sliceTexture,
    // 输入
    textInput, passwordInput,
    // 游戏内容显示
    entity, slot, model, bossBar,
    // 布局型
    canvas, adaptive, hGrid, vGrid, hStack, vStack,
    // 滚动
    scroll_full, scroll_v, scroll_h,
    // 特殊控件
    compass, progress, _import, observer,
    // 聊天相关
    chatTextBox, suggestion, chat,
    bossBars,
    // 快捷模板
    button, button_text,
    inv_slots, hotbar_slots
]