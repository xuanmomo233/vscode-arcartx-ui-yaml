import * as vscode from 'vscode';

// 控件对象(self)函数补全
export const control_self_functions = [
    // === 子控件操作 ===
    {
        label: 'getVisibleChildren()',
        detail: '获取可见的子控件列表',
        insertText: 'getVisibleChildren()',
        kind: vscode.CompletionItemKind.Function,
        documentation: new vscode.MarkdownString(
            '## 获取可见子控件\n\n' +
            '**参数**: 无\n\n' +
            '**返回值**: 列表（控件对象数组）\n\n' +
            '---\n\n' +
            '```aria\n' +
            'self.getVisibleChildren()\n' +
            '// 返回: [控件A, 控件B...]\n' +
            '```'
        )
    },
    {
        label: 'create()',
        detail: '在当前控件层级创建子控件',
        insertText: 'create(${1:tempID}, ${2:newName})',
        kind: vscode.CompletionItemKind.Function,
        documentation: new vscode.MarkdownString(
            '## 创建子控件\n\n' +
            '在当前控件层级通过模板创建控件。\n\n' +
            '**参数**:\n' +
            '- `tempID` - 模板ID\n' +
            '- `newName` - 新创建控件的ID\n\n' +
            '**返回值**: 控件对象\n\n' +
            '---\n\n' +
            '```aria\n' +
            'self.create(\'模板ID\', \'新控件ID\')\n' +
            '// 返回一个控件对象\n' +
            '```\n\n' +
            '对应的 template 配置:\n' +
            '```yaml\n' +
            'template:\n' +
            '  模板ID:\n' +
            '    type: Texture\n' +
            '    attribute:\n' +
            '      width: 100\n' +
            '      height: 100\n' +
            '```'
        )
    },
    {
        label: 'copy()',
        detail: '复制控件',
        insertText: 'copy(${1:newID})',
        kind: vscode.CompletionItemKind.Function,
        documentation: new vscode.MarkdownString(
            '## 复制控件\n\n' +
            '复制当前控件到新的ID。\n\n' +
            '**参数**:\n' +
            '- `newID` - 新控件的ID\n\n' +
            '**返回值**: 新控件对象\n\n' +
            '---\n\n' +
            '```aria\n' +
            'self.copy(\'新控件ID\')\n' +
            '// 返回新创建的控件对象\n' +
            '```'
        )
    },
    {
        label: 'childrenCount()',
        detail: '获取子级控件数量',
        insertText: 'childrenCount()',
        kind: vscode.CompletionItemKind.Function,
        documentation: new vscode.MarkdownString(
            '## 获取子级控件数量\n\n' +
            '获取当前控件的子级控件数量（仅限子级，孙级及以上不包含）。\n\n' +
            '**参数**: 无\n\n' +
            '**返回值**: 数字\n\n' +
            '---\n\n' +
            '```aria\n' +
            'self.childrenCount()\n' +
            '// 返回: 3\n' +
            '```'
        )
    },
    {
        label: 'remove()',
        detail: '移除当前控件',
        insertText: 'remove()',
        kind: vscode.CompletionItemKind.Function,
        documentation: new vscode.MarkdownString(
            '## 移除当前控件\n\n' +
            '移除当前控件。\n\n' +
            '**注意**: 该语句不应在进行copy操作后立即调用。\n\n' +
            '**参数**: 无\n\n' +
            '**返回值**: 无\n\n' +
            '---\n\n' +
            '```aria\n' +
            'self.remove()\n' +
            '```'
        )
    },
    {
        label: 'clear()',
        detail: '清除所有子级控件',
        insertText: 'clear()',
        kind: vscode.CompletionItemKind.Function,
        documentation: new vscode.MarkdownString(
            '## 清除子级控件\n\n' +
            '清除当前控件的所有子级控件。\n\n' +
            '**参数**: 无\n\n' +
            '**返回值**: 无\n\n' +
            '---\n\n' +
            '```aria\n' +
            'self.clear()\n' +
            '// 移除所有子控件\n' +
            '```'
        )
    },

    // === 拖拽相关 ===
    {
        label: 'getDragXRatio()',
        detail: '获取拖拽X比例 (0-1)',
        insertText: 'getDragXRatio()',
        kind: vscode.CompletionItemKind.Function,
        documentation: new vscode.MarkdownString(
            '## 获取拖拽X比例\n\n' +
            '返回0-1之间的值，用于滚动栏。\n\n' +
            '**返回值**: 数字 (0-1)'
        )
    },
    {
        label: 'getDragYRatio()',
        detail: '获取拖拽Y比例 (0-1)',
        insertText: 'getDragYRatio()',
        kind: vscode.CompletionItemKind.Function,
        documentation: new vscode.MarkdownString(
            '## 获取拖拽Y比例\n\n' +
            '返回0-1之间的值，用于滚动栏。\n\n' +
            '**返回值**: 数字 (0-1)'
        )
    },
    {
        label: 'setDragXRatio()',
        detail: '设置拖拽X比例',
        insertText: 'setDragXRatio(${1:value})',
        kind: vscode.CompletionItemKind.Function,
        documentation: new vscode.MarkdownString(
            '## 设置拖拽X比例\n\n' +
            '**参数**:\n' +
            '- `value` - 比率值 (数字类型)\n\n' +
            '**返回值**: 无\n\n' +
            '---\n\n' +
            '```aria\n' +
            'self.setDragXRatio(0.5)\n' +
            '// 设置X轴拖动比例为50%\n' +
            '```'
        )
    },
    {
        label: 'setDragYRatio()',
        detail: '设置拖拽Y比例',
        insertText: 'setDragYRatio(${1:value})',
        kind: vscode.CompletionItemKind.Function,
        documentation: new vscode.MarkdownString(
            '## 设置拖拽Y比例\n\n' +
            '**参数**:\n' +
            '- `value` - 比率值 (数字类型)\n\n' +
            '**返回值**: 无\n\n' +
            '---\n\n' +
            '```aria\n' +
            'self.setDragYRatio(0.5)\n' +
            '// 设置Y轴拖动比例为50%\n' +
            '```'
        )
    },

    // === 父子访问 ===
    {
        label: 'parent()',
        detail: '获取控件父级',
        insertText: 'parent()',
        kind: vscode.CompletionItemKind.Function,
        documentation: new vscode.MarkdownString(
            '## 获取控件父级\n\n' +
            '获取控件父级（如果是顶层控件返回的是UI对象）。\n\n' +
            '**参数**: 无\n\n' +
            '**返回值**: UI 或 控件\n\n' +
            '---\n\n' +
            '```aria\n' +
            'self.parent()\n' +
            '// 返回父控件对象\n' +
            '```'
        )
    },
    {
        label: 'get(index)',
        detail: '通过索引获取子控件',
        insertText: 'get(${1:index})',
        kind: vscode.CompletionItemKind.Function,
        documentation: new vscode.MarkdownString(
            '## 通过索引获取子控件\n\n' +
            '**参数**:\n' +
            '- `index` - 子控件索引 (数字类型)\n\n' +
            '**返回值**: 控件对象\n\n' +
            '---\n\n' +
            '```aria\n' +
            'self.get(0)\n' +
            '// 返回第一个子控件\n' +
            '```'
        )
    },
    {
        label: 'send()',
        detail: '发送聊天栏输入框内容 (ChatBox)',
        insertText: 'send()',
        kind: vscode.CompletionItemKind.Function,
        documentation: new vscode.MarkdownString(
            '## 发送聊天栏内容\n\n' +
            '发送聊天栏输入框的内容。\n\n' +
            '**适用**: ChatBox\n\n' +
            '**参数**: 无\n\n' +
            '**返回值**: 无\n\n' +
            '---\n\n' +
            '```aria\n' +
            'self.send()\n' +
            '```'
        )
    },
    {
        label: 'replay()',
        detail: '重新播放GIF (TextView)',
        insertText: 'replay()',
        kind: vscode.CompletionItemKind.Function,
        documentation: new vscode.MarkdownString(
            '## 重新播放GIF\n\n' +
            '重新播放gif动画。\n\n' +
            '**适用**: TextView\n\n' +
            '**参数**: 无\n\n' +
            '**返回值**: 无\n\n' +
            '---\n\n' +
            '```aria\n' +
            'self.replay()\n' +
            '```'
        )
    },

    // === 特殊控件方法 ===
    {
        label: 'getStackWidth()',
        detail: '获取堆叠宽度 (HStack)',
        insertText: 'getStackWidth()',
        kind: vscode.CompletionItemKind.Function,
        documentation: new vscode.MarkdownString(
            '## 获取堆叠宽度\n\n' +
            '获取当前控件的堆叠宽度。\n\n' +
            '**适用**: HStack\n\n' +
            '**参数**: 无\n\n' +
            '**返回值**: 数字\n\n' +
            '---\n\n' +
            '```aria\n' +
            'self.getStackWidth()\n' +
            '// 返回: 200\n' +
            '```'
        )
    },
    {
        label: 'getStackHeight()',
        detail: '获取堆叠高度 (VStack)',
        insertText: 'getStackHeight()',
        kind: vscode.CompletionItemKind.Function,
        documentation: new vscode.MarkdownString(
            '## 获取堆叠高度\n\n' +
            '获取当前控件的堆叠高度。\n\n' +
            '**适用**: VStack\n\n' +
            '**参数**: 无\n\n' +
            '**返回值**: 数字\n\n' +
            '---\n\n' +
            '```aria\n' +
            'self.getStackHeight()\n' +
            '// 返回: 150\n' +
            '```'
        )
    },
    {
        label: 'getSlotItemStack()',
        detail: '获取槽位物品 (Slot)',
        insertText: 'getSlotItemStack()',
        kind: vscode.CompletionItemKind.Function,
        documentation: new vscode.MarkdownString(
            '## 获取槽位物品\n\n' +
            '获取当前控件的物品堆。\n\n' +
            '**适用**: Slot\n\n' +
            '**参数**: 无\n\n' +
            '**返回值**: 物品堆对象\n\n' +
            '---\n\n' +
            '```aria\n' +
            'self.getSlotItemStack()\n' +
            '// 返回: ItemStack对象\n' +
            '```'
        )
    },
    {
        label: 'getItemValueSum()',
        detail: '获取相同物品总量 (Slot)',
        insertText: 'getItemValueSum(${1:key})',
        kind: vscode.CompletionItemKind.Function,
        documentation: new vscode.MarkdownString(
            '## 获取相同物品总量\n\n' +
            '获取整个UI中和当前控件中物品相同的槽位的物品量总和（当前控件数量不计入其中），用于做图纸插件的UI显示材料。\n\n' +
            '**适用**: Slot\n\n' +
            '**参数**:\n' +
            '- `key` - 物品键 (字符串类型)\n\n' +
            '**返回值**: 数字\n\n' +
            '---\n\n' +
            '```aria\n' +
            'self.getItemValueSum("minecraft:iron_ingot")\n' +
            '// 返回: 64\n' +
            '```'
        )
    },
    {
        label: 'getItemText()',
        detail: '获取物品Lore文本值 (Slot)',
        insertText: 'getItemText(${1:key})',
        kind: vscode.CompletionItemKind.Function,
        documentation: new vscode.MarkdownString(
            '## 获取物品Lore文本值\n\n' +
            '获取当前控件的物品文本值，比如有一行lore是`xxx: abc`，该函数用于获取冒号后面的内容。\n\n' +
            '**适用**: Slot\n\n' +
            '**参数**:\n' +
            '- `key` - 键内容 (字符串类型)\n\n' +
            '**返回值**: 字符串\n\n' +
            '---\n\n' +
            '```aria\n' +
            'self.getItemText("等级")\n' +
            '// 若lore为"等级: 5"，返回: "5"\n' +
            '```'
        )
    },
    {
        label: 'setItemIcon(item)',
        detail: '设置图标物品 (Slot Icon)',
        insertText: 'setItemIcon(${1:item})',
        kind: vscode.CompletionItemKind.Function,
        documentation: new vscode.MarkdownString(
            '## 设置图标物品\n\n' +
            '设置控件的图标物品。\n\n' +
            '**适用**: Slot (类型为Icon)\n\n' +
            '**参数**:\n' +
            '- `item` - 物品JSON (字符串类型，需要序列化物品)\n\n' +
            '**返回值**: 无\n\n' +
            '---\n\n' +
            '```aria\n' +
            'self.setItemIcon(\'{"id": "minecraft:stone","Count":1}\')\n' +
            '```'
        )
    },
    {
        label: 'getSameCount()',
        detail: '获取相同物品数量 (Slot)',
        insertText: 'getSameCount()',
        kind: vscode.CompletionItemKind.Function,
        documentation: new vscode.MarkdownString(
            '## 获取相同物品数量\n\n' +
            '获取当前容器中，有多少和当前Slot相同的物品数量。\n\n' +
            '**适用**: Slot\n\n' +
            '**参数**: 无\n\n' +
            '**返回值**: 数字\n\n' +
            '---\n\n' +
            '```aria\n' +
            'self.getSameCount()\n' +
            '// 返回: 32\n' +
            '```'
        )
    },
    {
        label: 'getContent()',
        detail: '获取文本框内容 (TextBox/ChatTextBox)',
        insertText: 'getContent()',
        kind: vscode.CompletionItemKind.Function,
        documentation: new vscode.MarkdownString(
            '## 获取文本框内容\n\n' +
            '获取文本框的内容。\n\n' +
            '**适用**: TextBox、ChatTextBox\n\n' +
            '**参数**: 无\n\n' +
            '**返回值**: 字符串\n\n' +
            '---\n\n' +
            '```aria\n' +
            'self.getContent()\n' +
            '// 返回: "用户输入的内容"\n' +
            '```'
        )
    },
    {
        label: 'setContent()',
        detail: '设置文本框内容 (TextBox/ChatTextBox)',
        insertText: 'setContent(${1:content})',
        kind: vscode.CompletionItemKind.Function,
        documentation: new vscode.MarkdownString(
            '## 设置文本框内容\n\n' +
            '设置文本框的内容。\n\n' +
            '**适用**: TextBox、ChatTextBox\n\n' +
            '**参数**:\n' +
            '- `content` - 内容 (字符串类型)\n\n' +
            '**返回值**: 无\n\n' +
            '---\n\n' +
            '```aria\n' +
            'self.setContent("exampleContent")\n' +
            '```'
        )
    },
    {
        label: 'insert()',
        detail: '在指针位置插入文字 (TextBox/ChatTextBox)',
        insertText: 'insert(${1:text})',
        kind: vscode.CompletionItemKind.Function,
        documentation: new vscode.MarkdownString(
            '## 插入文字\n\n' +
            '在当前指针位置插入文字。\n\n' +
            '**适用**: TextBox、ChatTextBox\n\n' +
            '**参数**:\n' +
            '- `text` - 插入的内容 (字符串类型)\n\n' +
            '**返回值**: 无\n\n' +
            '---\n\n' +
            '```aria\n' +
            'self.insert("exampleText")\n' +
            '```'
        )
    },
    {
        label: 'setFocus()',
        detail: '设置焦点状态 (TextBox/ChatTextBox)',
        insertText: 'setFocus(${1:value})',
        kind: vscode.CompletionItemKind.Function,
        documentation: new vscode.MarkdownString(
            '## 设置焦点状态\n\n' +
            '设置当前控件是否获取焦点。\n\n' +
            '**适用**: TextBox、ChatTextBox\n\n' +
            '**参数**:\n' +
            '- `value` - 布尔类型 (true表示获取焦点，false表示失去焦点)\n\n' +
            '**返回值**: 无\n\n' +
            '---\n\n' +
            '```aria\n' +
            'self.setFocus(true)\n' +
            '// 获取焦点\n' +
            '```'
        )
    },
    {
        label: 'needShowAll()',
        detail: '是否需要全部展示 (ChatTextBox)',
        insertText: 'needShowAll()',
        kind: vscode.CompletionItemKind.Function,
        documentation: new vscode.MarkdownString(
            '## 获取聊天栏展示状态\n\n' +
            '获取聊天栏控件此时是否需要全部展示。\n\n' +
            '**适用**: ChatTextBox\n\n' +
            '**参数**: 无\n\n' +
            '**返回值**: 布尔值\n\n' +
            '---\n\n' +
            '```aria\n' +
            'self.needShowAll()\n' +
            '// 返回: true/false\n' +
            '```'
        )
    },
    {
        label: 'isHovered()',
        detail: '是否鼠标悬停',
        insertText: 'isHovered()',
        kind: vscode.CompletionItemKind.Function,
        documentation: new vscode.MarkdownString(
            '## 获取鼠标悬停状态\n\n' +
            '获取控件此时是否鼠标悬停。\n\n' +
            '**参数**: 无\n\n' +
            '**返回值**: 布尔值\n\n' +
            '---\n\n' +
            '```aria\n' +
            'self.isHovered()\n' +
            '// 返回: true/false\n' +
            '```'
        )
    },
];
