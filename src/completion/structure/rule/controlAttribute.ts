import * as vscode from 'vscode';

export const control_attribute = [
    {
        label: 'enable',
        detail: '是否开启[默认: true] - 关闭后交互性触发器不会触发，影响子组件',
        insertText: 'enable: ${1|true,false|}',
        kind: vscode.CompletionItemKind.Property
    },
    {
        label: 'visible',
        detail: '是否可见[默认: true] - 关闭后不可见，影响子组件',
        insertText: 'visible: ${1|true,false|}',
        kind: vscode.CompletionItemKind.Property
    },
    {
        label: 'limitControl',
        detail: '限制显示所用的组件[默认: 空]',
        insertText: 'limitControl: ${1:组件对象}',
        kind: vscode.CompletionItemKind.Property
    },
    {
        label: 'minDragX',
        detail: '最小拖动X[默认: 0]',
        insertText: 'minDragX: ${1:0}',
        kind: vscode.CompletionItemKind.Property
    },
    {
        label: 'minDragY',
        detail: '最小拖动Y[默认: 0]',
        insertText: 'minDragY: ${1:0}',
        kind: vscode.CompletionItemKind.Property
    },
    {
        label: 'maxDragX',
        detail: '最大拖动X[默认: 0]',
        insertText: 'maxDragX: ${1:0}',
        kind: vscode.CompletionItemKind.Property
    },
    {
        label: 'maxDragY',
        detail: '最大拖动Y[默认: 0]',
        insertText: 'maxDragY: ${1:0}',
        kind: vscode.CompletionItemKind.Property
    },
    {
        label: 'scale',
        detail: '缩放比例[默认: 1]',
        insertText: 'scale: ${1:1}',
        kind: vscode.CompletionItemKind.Property
    },
    {
        label: 'width',
        detail: '宽度[默认: 0]',
        insertText: 'width: ${1:宽度}',
        kind: vscode.CompletionItemKind.Property
    },
    {
        label: 'height',
        detail: '高度[默认: 0]',
        insertText: 'height: ${1:高度}',
        kind: vscode.CompletionItemKind.Property
    },
    {
        label: 'x',
        detail: 'X坐标[默认: 0] - 相对于父组件',
        insertText: 'x: ${1:0}',
        kind: vscode.CompletionItemKind.Property
    },
    {
        label: 'y',
        detail: 'Y坐标[默认: 0] - 相对于父组件',
        insertText: 'y: ${1:0}',
        kind: vscode.CompletionItemKind.Property
    },
    {
        label: 'alpha',
        detail: '透明度[默认: 1]',
        insertText: 'alpha: ${1:1}',
        kind: vscode.CompletionItemKind.Property
    },
    {
        label: 'point',
        detail: '锚点[默认: top_left] - 详见锚点类型表',
        insertText: 'point: ~',
        kind: vscode.CompletionItemKind.Property,
        documentation: new vscode.MarkdownString(
            '## 锚点位置\n\n' +
            '**默认值**: `top_left`\n\n' +
            '设置控件的锚点位置，决定控件的对齐方式和坐标计算方式。\n\n' +
            '**注意**: 锚点只有顶层组件（父级是UI本身）或者父级是 Canvas、Adaptive 时才会生效。\n\n' +
            '**基础锚点（9点定位）**:\n' +
            '- `top_left` - 左上角\n' +
            '- `top_center` - 顶部中间\n' +
            '- `top_right` - 右上角\n' +
            '- `middle_left` - 左中间\n' +
            '- `middle_center` - 正中间\n' +
            '- `middle_right` - 右中间\n' +
            '- `bottom_left` - 左下角\n' +
            '- `bottom_center` - 底部中间\n' +
            '- `bottom_right` - 右下角\n\n' +
            '**拉伸锚点（需要父级为 Canvas/Adaptive/UI根）**:\n' +
            '- `horizontal_stretch_top` - 宽度跟随父级，置于顶部\n' +
            '- `horizontal_stretch_middle` - 宽度跟随父级，置于中间\n' +
            '- `horizontal_stretch_bottom` - 宽度跟随父级，置于底部\n' +
            '- `vertical_stretch_left` - 高度跟随父级，置于左侧\n' +
            '- `vertical_stretch_center` - 高度跟随父级，置于正中\n' +
            '- `vertical_stretch_right` - 高度跟随父级，置于右侧\n' +
            '- `stretch_all` - 完全跟随父级宽高\n\n' +
            '输入 `point: ~` 后会显示所有选项的详细说明。'
        )
    },
    {
        label: 'rotate',
        detail: '旋转角度[默认: 0]',
        insertText: 'rotate: ${1:0}',
        kind: vscode.CompletionItemKind.Property
    },
    {
        label: 'middleScale',
        detail: '中间缩放比例[默认: 1] - 从正中心缩放',
        insertText: 'middleScale: ${1:1}',
        kind: vscode.CompletionItemKind.Property
    },
    {
        label: 'tip',
        detail: '提示信息[默认: 空] - 只用于包含tip的组件',
        insertText: 'tip: ~${1:提示内容}',
        kind: vscode.CompletionItemKind.Property
    },
    {
        label: 'texts',
        detail: '文本内容[默认: 空] - 只用于包含文本显示的组件',
        insertText: 'texts: ~${1:文本内容}',
        kind: vscode.CompletionItemKind.Property
    },
    {
        label: 'center',
        detail: '文字居中[默认: false] - 只用于包含文本显示的组件',
        insertText: 'center: ${1|true,false|}',
        kind: vscode.CompletionItemKind.Property
    },
    {
        label: 'lineSpace',
        detail: '行间距[默认: 16] - 只用于包含文本显示的组件',
        insertText: 'lineSpace: ${1:16}',
        kind: vscode.CompletionItemKind.Property
    },
    {
        label: 'font',
        detail: '字体[默认: 空] - 只用于包含文本显示的组件',
        insertText: 'font: ~${1:字体.ttf}',
        kind: vscode.CompletionItemKind.Property
    },
    {
        label: 'fontSize',
        detail: '字体大小[默认: 16] - 只用于包含文本显示的组件',
        insertText: 'fontSize: ${1:16}',
        kind: vscode.CompletionItemKind.Property
    },
    {
        label: 'shadow',
        detail: '渲染阴影[默认: false] - 为文字添加投影，提升可读性 (Text、Texture含有)',
        insertText: 'shadow: ${1|true,false|}',
        kind: vscode.CompletionItemKind.Property
    },
    {
        label: 'limit',
        detail: '字数显示限制[默认: 999999] - 限制最大显示文字数',
        insertText: 'limit: ${1:999999}',
        kind: vscode.CompletionItemKind.Property
    },
    {
        label: 'through',
        detail: '是否穿透[默认: false] - true 时不阻挡下方组件交互事件，且不接受点击事件',
        insertText: 'through: ${1|true,false|}',
        kind: vscode.CompletionItemKind.Property
    },
    {
        label: 'normal',
        detail: '常态显示内容 (Texture、9SliceTexture、Slot含有) - 纹理表达式',
        insertText: 'normal: ~${1|~255\\,255\\,255,资源路径|}',
        kind: vscode.CompletionItemKind.Property
    },
    {
        label: 'hover',
        detail: '鼠标悬停显示内容 (Texture、9SliceTexture、Slot含有) - 不设置则悬停时渲染常态图',
        insertText: 'hover: ~${1|~255\\,255\\,255,资源路径|}',
        kind: vscode.CompletionItemKind.Property
    },
    {
        label: 'loop',
        detail: 'GIF是否循环[默认: false] - false时GIF停止于最后一帧 (Texture含有)',
        insertText: 'loop: ${1|true,false|}',
        kind: vscode.CompletionItemKind.Property
    },
    {
        label: 'left',
        detail: '左侧分割线宽度[默认: 0] - 从贴图边缘到分割线的像素距离 (9SliceTexture独有)',
        insertText: 'left: ${1:0}',
        kind: vscode.CompletionItemKind.Property
    },
    {
        label: 'right',
        detail: '右侧分割线宽度[默认: 0] - 从贴图边缘到分割线的像素距离 (9SliceTexture独有)',
        insertText: 'right: ${1:0}',
        kind: vscode.CompletionItemKind.Property
    },
    {
        label: 'top',
        detail: '上侧分割线高度[默认: 0] - 从贴图边缘到分割线的像素距离 (9SliceTexture独有)',
        insertText: 'top: ${1:0}',
        kind: vscode.CompletionItemKind.Property
    },
    {
        label: 'bottom',
        detail: '下侧分割线高度[默认: 0] - 从贴图边缘到分割线的像素距离 (9SliceTexture独有)',
        insertText: 'bottom: ${1:0}',
        kind: vscode.CompletionItemKind.Property
    },
    {
        label: 'textureWidth',
        detail: '原始贴图宽度[默认: 0] (9SliceTexture独有)',
        insertText: 'textureWidth: ${1:0}',
        kind: vscode.CompletionItemKind.Property
    },
    {
        label: 'textureHeight',
        detail: '原始贴图高度[默认: 0] (9SliceTexture独有)',
        insertText: 'textureHeight: ${1:0}',
        kind: vscode.CompletionItemKind.Property
    },
    {
        label: 'length',
        detail: '最大输入长度[默认: 99999] (TextBox独有)',
        insertText: 'length: ${1:99999}',
        kind: vscode.CompletionItemKind.Property
    },
    {
        label: 'allowNewLine',
        detail: '是否允许换行[默认: false] (TextBox独有)',
        insertText: 'allowNewLine: ${1|true,false|}',
        kind: vscode.CompletionItemKind.Property
    },
    {
        label: 'editable',
        detail: '是否可编辑[默认: true] (TextBox独有)',
        insertText: 'editable: ${1|true,false|}',
        kind: vscode.CompletionItemKind.Property
    },
    {
        label: 'cursorColor',
        detail: '光标颜色[默认: ~151,255,255] (TextBox独有)',
        insertText: 'cursorColor: ~${1:151,255,255}',
        kind: vscode.CompletionItemKind.Property
    },
    {
        label: 'uneditableTextColor',
        detail: '不可编辑时的文字颜色[默认: ~190,190,190] (TextBox独有)',
        insertText: 'uneditableTextColor: ~${1:190,190,190}',
        kind: vscode.CompletionItemKind.Property
    },
    {
        label: 'textColor',
        detail: '文字颜色[默认: ~255,255,255] (TextBox独有)',
        insertText: 'textColor: ~${1:255,255,255}',
        kind: vscode.CompletionItemKind.Property
    },
    {
        label: 'emptyText',
        detail: '输入框为空时的提示文本 (TextBox独有)',
        insertText: 'emptyText: ~${1:提示文本}',
        kind: vscode.CompletionItemKind.Property
    },
    {
        label: 'canLoseFocus',
        detail: '是否可以失去焦点[默认: true] (TextBox独有)',
        insertText: 'canLoseFocus: ${1|true,false|}',
        kind: vscode.CompletionItemKind.Property
    },
    {
        label: 'background',
        detail: '输入框背景颜色 (TextBox独有)',
        insertText: 'background: ~${1:255,255,255}',
        kind: vscode.CompletionItemKind.Property
    },
    {
        label: 'passwordChar',
        detail: '密码字符 (TextBox独有)',
        insertText: 'passwordChar: ~${1:※}',
        kind: vscode.CompletionItemKind.Property
    },
    {
        label: 'uuid',
        detail: '渲染实体uuid[默认: 当前客户端玩家自身uuid] (Entity独有)',
        insertText: 'uuid: ~${1:self}',
        kind: vscode.CompletionItemKind.Property
    },
    {
        label: 'hideTag',
        detail: '是否渲染名称标签[默认: false] (Entity独有)',
        insertText: 'hideTag: ${1|true,false|}',
        kind: vscode.CompletionItemKind.Property
    },
    {
        label: 'followMouse',
        detail: '视线是否跟随鼠标[默认: false] (Entity独有)',
        insertText: 'followMouse: ${1|true,false|}',
        kind: vscode.CompletionItemKind.Property
    },
    {
        label: 'slotType',
        detail: '槽位类型[默认: Backpack] (Slot独有)',
        insertText: 'slotType: ~',
        kind: vscode.CompletionItemKind.Property,
        documentation: new vscode.MarkdownString(
            '## 槽位类型\n\n' +
            '**默认值**: `Backpack`\n' +
            '**适用控件**: Slot（物品槽位）\n\n' +
            '设置物品槽位的类型，决定槽位可以存放和操作的物品类型。\n\n' +
            '**可选类型**:\n' +
            '- `Container` - 容器槽位\n' +
            '- `Backpack` - 背包槽位（玩家背包物品）\n' +
            '- `Extra` - 额外槽位\n' +
            '- `Icon` - 图标槽位\n' +
            '- `Hover` - 悬停槽位\n\n' +
            '输入 `slotType: ~` 后会显示所有选项的详细说明。'
        )
    },
    {
        label: 'id',
        detail: '槽位ID[默认: 0] - 拓展槽位为字符串，其余为数字 (Slot独有)',
        insertText: 'id: ${1:0}',
        kind: vscode.CompletionItemKind.Property
    },
    {
        label: 'itemScale',
        detail: '物品缩放比例[默认: 1.0] (Slot独有)',
        insertText: 'itemScale: ${1:1.0}',
        kind: vscode.CompletionItemKind.Property
    },
    {
        label: 'lock',
        detail: '锁定点击[默认: false] - 锁定后无法点击槽位物品（仅客户端） (Slot独有)',
        insertText: 'lock: ${1|true,false|}',
        kind: vscode.CompletionItemKind.Property
    },
    {
        label: 'cooldown',
        detail: '物品冷却状态贴图 (Slot独有) - 纹理表达式',
        insertText: 'cooldown: ~${1:255,255,255}',
        kind: vscode.CompletionItemKind.Property
    },
    {
        label: 'overwriteText',
        detail: '覆盖显示[默认: 无] - 替换物品右下角文字显示 (Slot独有)',
        insertText: 'overwriteText: ~${1:文字}',
        kind: vscode.CompletionItemKind.Property
    },
    {
        label: 'spaceBetweenX',
        detail: 'X轴间距[默认: 0] (HGrid、VGrid含有)',
        insertText: 'spaceBetweenX: ${1:0}',
        kind: vscode.CompletionItemKind.Property
    },
    {
        label: 'spaceBetweenY',
        detail: 'Y轴间距[默认: 0] (HGrid、VGrid含有)',
        insertText: 'spaceBetweenY: ${1:0}',
        kind: vscode.CompletionItemKind.Property
    },
    {
        label: 'column',
        detail: '列数[默认: 1] (HGrid独有)',
        insertText: 'column: ${1:1}',
        kind: vscode.CompletionItemKind.Property
    },
    {
        label: 'row',
        detail: '行数[默认: 1] (VGrid独有)',
        insertText: 'row: ${1:1}',
        kind: vscode.CompletionItemKind.Property
    },
    {
        label: 'spaceBetween',
        detail: '子控件间距[默认: 0] (HStack、VStack、BossBars含有)',
        insertText: 'spaceBetween: ${1:0}',
        kind: vscode.CompletionItemKind.Property
    },
    {
        label: 'maxSize',
        detail: '最大数量[默认: 64] - 超过后将移除最先加入的控件 (HStack、VStack、Observer、BossBars含有)',
        insertText: 'maxSize: ${1:64}',
        kind: vscode.CompletionItemKind.Property
    },
    {
        label: 'moveX',
        detail: '横向移动百分比[默认: 0] - 0~1，控制横向滚动位置 (Scroll独有)',
        insertText: 'moveX: ${1:0}',
        kind: vscode.CompletionItemKind.Property
    },
    {
        label: 'moveY',
        detail: '纵向移动百分比[默认: 0] - 0~1，控制纵向滚动位置 (Scroll独有)',
        insertText: 'moveY: ${1:0}',
        kind: vscode.CompletionItemKind.Property
    },
    // ========== Text 独有 ==========
    {
        label: 'alignment',
        detail: '文字对齐方式[默认: ~left] - ~left / ~center / ~right (Text独有)',
        insertText: 'alignment: ~${1|left,center,right|}',
        kind: vscode.CompletionItemKind.Property
    },
    // ========== Entity 独有 ==========
    {
        label: 'uuid',
        detail: '渲染实体UUID[默认: 当前客户端玩家自身UUID] (Entity独有)',
        insertText: 'uuid: ~${1:self}',
        kind: vscode.CompletionItemKind.Property
    },
    {
        label: 'hideTag',
        detail: '是否渲染名称标签[默认: false] (Entity独有)',
        insertText: 'hideTag: ${1|true,false|}',
        kind: vscode.CompletionItemKind.Property
    },
    {
        label: 'followMouse',
        detail: '视线是否跟随鼠标[默认: false] (Entity、Model含有)',
        insertText: 'followMouse: ${1|true,false|}',
        kind: vscode.CompletionItemKind.Property
    },
    // ========== Model 独有 ==========
    {
        label: 'model',
        detail: '模型ID (Model独有)',
        insertText: 'model: ~${1:模型ID}',
        kind: vscode.CompletionItemKind.Property
    },
    {
        label: 'animation',
        detail: '播放动作[默认: idle] (Model独有)',
        insertText: 'animation: ~${1:idle}',
        kind: vscode.CompletionItemKind.Property
    },
    {
        label: 'showType',
        detail: '显示部位类型[默认: none] - ~none / ~HEAD / ~UPPER_BODY / ~LOWER_BODY / ~FOOT (Model独有)',
        insertText: 'showType: ~${1|none,HEAD,UPPER_BODY,LOWER_BODY,FOOT|}',
        kind: vscode.CompletionItemKind.Property
    },
    // ========== Progress 独有 ==========
    {
        label: 'texture',
        detail: '填充纹理 (Progress独有) - 纹理表达式',
        insertText: 'texture: ~${1:255,255,255}',
        kind: vscode.CompletionItemKind.Property
    },
    {
        label: 'progress',
        detail: '进度比值[默认: 0] - 0~1，0完全空，1完全满 (Progress独有)',
        insertText: 'progress: ${1:0}',
        kind: vscode.CompletionItemKind.Property
    },
    {
        label: 'time',
        detail: '缓动时间[默认: 100] - 毫秒 (Progress独有)',
        insertText: 'time: ${1:100}',
        kind: vscode.CompletionItemKind.Property
    },
    {
        label: 'mode',
        detail: '进度模式[默认: 0] - 0左到右、1右到左、2上到下、3下到上 (Progress独有)',
        insertText: 'mode: ${1:0}',
        kind: vscode.CompletionItemKind.Property
    },
    // ========== Import 独有 ==========
    {
        label: 'node',
        detail: '节点路径 (Import独有) - 格式: <menu|hud>.<UI_ID>.<控件路径>',
        insertText: 'node: ~${1:menu.test.adaptive.chat}',
        kind: vscode.CompletionItemKind.Property
    },
    // ========== Observer 独有 ==========
    {
        label: 'subscribe',
        detail: '订阅变量 (Observer独有) - 必须是字典类型',
        insertText: 'subscribe: ${1:global.testMap}',
        kind: vscode.CompletionItemKind.Property
    },
    {
        label: 'target',
        detail: '目标控件 (Observer独有) - 增加键时复制该控件，减少键时删除对应控件',
        insertText: 'target: ${1:val.vStack[\'test\']}',
        kind: vscode.CompletionItemKind.Property
    },
    // ========== TextBox 独有 ==========
    {
        label: 'inputPattern',
        detail: '输入限制（正则）[默认: 无] (TextBox独有)',
        insertText: 'inputPattern: "${1:^[a-zA-Z0-9]*$}"',
        kind: vscode.CompletionItemKind.Property
    },
    // ========== ChatTextBox 独有 ==========
    {
        label: 'sendClose',
        detail: '发送后关闭UI[默认: true] (ChatTextBox独有)',
        insertText: 'sendClose: ${1|true,false|}',
        kind: vscode.CompletionItemKind.Property
    },
    // ========== Chat 独有 ==========
    {
        label: 'border',
        detail: '边框宽度[默认: 5] (Chat独有)',
        insertText: 'border: ${1:5}',
        kind: vscode.CompletionItemKind.Property
    },
    {
        label: 'filter',
        detail: '过滤[默认: 无] - 仅显示消息开头与该值匹配的消息 (Chat独有)',
        insertText: 'filter: ~${1:前缀}',
        kind: vscode.CompletionItemKind.Property
    },
    {
        label: 'showCard',
        detail: '显示卡片[默认: true] - 关闭后该聊天栏不显示卡片消息 (Chat独有)',
        insertText: 'showCard: ${1|true,false|}',
        kind: vscode.CompletionItemKind.Property
    },
    {
        label: 'exclude',
        detail: '排除[默认: 无] - 消息开头为该值时排除对应消息 (Chat独有)',
        insertText: 'exclude: ~${1:前缀}',
        kind: vscode.CompletionItemKind.Property
    },
    {
        label: 'keep',
        detail: '持续渲染[默认: false] - true时即使不在聊天屏幕中也持续显示所有消息 (Chat独有)',
        insertText: 'keep: ${1|true,false|}',
        kind: vscode.CompletionItemKind.Property
    },
    // ========== Compass 独有 ==========
    {
        label: 'textColor',
        detail: '文字颜色[默认: 255,255,255] (Compass独有)',
        insertText: 'textColor: ~${1:255,255,255}',
        kind: vscode.CompletionItemKind.Property
    },
    {
        label: 'tickColor',
        detail: '刻度颜色[默认: 255,255,255] (Compass独有)',
        insertText: 'tickColor: ~${1:255,255,255}',
        kind: vscode.CompletionItemKind.Property
    },
    {
        label: 'directionColor',
        detail: '方位颜色[默认: 255,255,255] (Compass独有)',
        insertText: 'directionColor: ~${1:255,255,255}',
        kind: vscode.CompletionItemKind.Property
    },
    {
        label: 'tickInterval',
        detail: '刻度间隔[默认: 5] (Compass独有)',
        insertText: 'tickInterval: ${1:5}',
        kind: vscode.CompletionItemKind.Property
    },
    {
        label: 'majorTickInterval',
        detail: '主要刻度间隔[默认: 15] (Compass独有)',
        insertText: 'majorTickInterval: ${1:15}',
        kind: vscode.CompletionItemKind.Property
    },
    {
        label: 'showWaypoints',
        detail: '显示路标图标[默认: true] (Compass独有)',
        insertText: 'showWaypoints: ${1|true,false|}',
        kind: vscode.CompletionItemKind.Property
    },
    {
        label: 'waypointFontSize',
        detail: '路标文字尺寸[默认: 32] (Compass独有)',
        insertText: 'waypointFontSize: ${1:32}',
        kind: vscode.CompletionItemKind.Property
    },
    // ========== 公共图形属性（仅纹理渲染控件生效）==========
    {
        label: 'shape',
        detail: '形状类型[默认: rect] - rect / round_rect / circle (Texture/9SliceTexture/Slot/TextBox/Progress/Compass/Chat/BossBar)',
        insertText: 'shape: ~${1|rect,round_rect,circle|}',
        kind: vscode.CompletionItemKind.Property
    },
    {
        label: 'radius',
        detail: '圆角半径[默认: 5] - round_rect 时生效 (Texture/9SliceTexture/Slot/TextBox/Progress/Compass/Chat/BossBar)',
        insertText: 'radius: ${1:5}',
        kind: vscode.CompletionItemKind.Property
    },
    // ========== BossBar 独有 ==========
    {
        label: 'textures',
        detail: '血条纹理列表 (BossBar独有) - 格式: ~[tex1.png,tex2.png]',
        insertText: 'textures: ~[${1:texture1.png,texture2.png}]',
        kind: vscode.CompletionItemKind.Property
    },
    {
        label: 'transitionTime',
        detail: '血条切换过渡时间[默认: 500] - 毫秒 (BossBar独有)',
        insertText: 'transitionTime: ${1:500}',
        kind: vscode.CompletionItemKind.Property
    },
    // ========== Adaptive 独有 ==========
    {
        label: 'autoScale',
        detail: '是否启用等比缩放[默认: false] - true时整树等比缩放到设计分辨率 (Adaptive独有)',
        insertText: 'autoScale: ${1|true,false|}',
        kind: vscode.CompletionItemKind.Property
    },
    // ========== Slot 补充 ==========
    {
        label: 'itemEffect',
        detail: '物品效果配置文件名 (Slot独有) - 填写 ItemEffect 配置文件名',
        insertText: 'itemEffect: ~${1:effectName}',
        kind: vscode.CompletionItemKind.Property
    },
    // ========== Suggestion 独有 ==========
    {
        label: 'up',
        detail: '是否向上展开[默认: false] (Suggestion独有)',
        insertText: 'up: ${1|true,false|}',
        kind: vscode.CompletionItemKind.Property
    },
    {
        label: 'maxShow',
        detail: '最大显示数量[默认: 5] (Suggestion独有)',
        insertText: 'maxShow: ${1:5}',
        kind: vscode.CompletionItemKind.Property
    },
    {
        label: 'backgroundBorder',
        detail: '背景边框宽度[默认: 0] (Suggestion独有)',
        insertText: 'backgroundBorder: ${1:0}',
        kind: vscode.CompletionItemKind.Property
    },
    {
        label: 'hoverTextColor',
        detail: '悬停文字颜色[默认: ~255,255,255] (Suggestion独有)',
        insertText: 'hoverTextColor: ~${1:255,255,255}',
        kind: vscode.CompletionItemKind.Property
    },
    // ========== Compass 补充 ==========
    {
        label: 'waypointIconWidth',
        detail: '路标图标宽度[默认: 16] (Compass独有)',
        insertText: 'waypointIconWidth: ${1:16}',
        kind: vscode.CompletionItemKind.Property
    },
    {
        label: 'waypointIconHeight',
        detail: '路标图标高度[默认: 16] (Compass独有)',
        insertText: 'waypointIconHeight: ${1:16}',
        kind: vscode.CompletionItemKind.Property
    },
    {
        label: 'wayOffsetY',
        detail: '路标Y轴偏移[默认: 0] (Compass独有)',
        insertText: 'wayOffsetY: ${1:0}',
        kind: vscode.CompletionItemKind.Property
    },
]