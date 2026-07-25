# Change Log
### [0.0.1]
- Initial release

### [0.0.21]
- 统一补全缩进逻辑：
  - `getSmartTypeSnippet` 新增 `baseIndent` 参数，`type:` 智能模板的 `attribute` 块跟随当前行缩进
  - `structure.ts` 顶部统一计算 `currentLineIndent`，section 2、2.5、3 共用
  - `action:` / `attribute:` / `children:` 块头子项缩进恢复为 `当前行缩进 + 2 空格`

### [0.0.20]
- 修复 `action:` 子项触发器缩进过宽问题，改为固定 2 空格缩进

### [0.0.19]
- 移除 `action:` 的“换行”垃圾补全，改为直接显示触发器列表
- `action:`、`attribute:`、`children:` 输入后现在会显示对应子项（触发器/属性/控件模板）
- 在块头行选择子项时，自动在下一行插入并带正确子缩进

### [0.0.18]
- 修复 `:` 触发补全的全面问题：
  - 块级关键字（`action:`、`attribute:`、`children:`）输入冒号后返回换行+缩进补全
  - 非块级关键字（`x:`、`width:` 等）输入冒号后不返回任何补全
  - 所有含换行的 snippet 模板现在会根据当前缩进自动调整子行缩进
  - 块级关键字模板末尾添加 `$0` 占位符确保光标定位正确

### [0.0.17]
- 修复任意 `xxx:` 都会触发控件模板补全的问题：改为仅在用户未输入 key 时显示 Snippet 模板，已输入 key: 时过滤掉模板

### [0.0.16]
- 修复 `:` 作为触发字符导致任意 `xxx:` 都会触发结构补全的问题：仅在属性名存在于 attributeValueMap 时才显示属性值补全，否则不返回补全

### [0.0.15]
- 修复 type: 带空格补全时出现双空格的问题：检测冒号后是否已有空格，仅在无空格时添加

### [0.0.14]
- 修复 type: 补全后 type 值与冒号之间仍然缺少空格的问题：使用 CompletionItem.range 替换 partialInput，并在 snippet 前保留空格

### [0.0.13]
- 修复 hGrid/hStack/vGrid/vStack 等驼峰命名控件无法匹配智能模板的问题：type_templates key 全部改为小写
- 修复 type: 补全后插入文本与冒号之间缺少空格的问题

### [0.0.12]
- 重写所有控件智能模板：基于真实 UI 文件常用写法，使用真实默认值而非占位符
- 模板新增常用通用属性（point、x、y、alpha、through 等），不再仅包含专属属性
- texture: 默认值改为 100x100、point:middle_center、normal/hover 使用 RGBA 色值、新增 alpha
- text: 默认 fontSize 改为 49，新增 point/x/y/center/shadow 属性
- slot: normal/hover 改为真实路径示例，slotType 改为枚举选择
- adaptive: point 默认值改为 stretch_all
- canvas: 新增 point 和 through 属性
- chat/chatTextBox/suggestion: 默认值对齐真实聊天 UI 写法（fontSize:64、Frosted 背景等）
- progress: 新增 point 属性，texture 改为 RGBA 色值，移除不常用的 time 属性
- 布局控件（hGrid/vGrid/hStack/vStack）：新增 point/x/y 属性
- scroll 系列模板：新增 point 属性
- button 快捷模板：normal/hover 改为 RGBA 色值，新增 point 属性

### [0.0.11]
- 修复控件模板中 `${CURRENT_SECONDS_UNIX}` 原样输出的问题：SnippetString API 不支持该变量

### [0.0.10]
- 补全列表所有项都显示描述：将 detail 合并到 label 中，不选中也能看清每个选项

### [0.0.9]
- 修复智能模板缩进翻倍问题：snippet 不再包含基础缩进，由 VS Code 自动处理

### [0.0.8]
- 添加 `:` 为补全触发字符：输入 type: 后立即弹出控件类型选项

### [0.0.7]
- 修复输入 type: 后无补全反应的问题：属性名: 后立即显示全部选项

### [0.0.6]
- 智能类型模板：选择控件类型后自动生成 type + attribute 块 + 预填专属属性
- 修复 UI action 和控件 action 触发器列表混淆问题
- 触发器内部编写脚本时仅显示 Aria 函数，不再显示触发器补全
- 修复通配符路径匹配过度宽松导致 action 匹配到 action/click 等深层路径

### [0.0.5]
- 新增控件类型感知的属性补全：根据控件的 type 自动过滤只显示相关属性
- 在 attribute 块中编辑时，自动检测当前控件类型并过滤不相关属性

### [0.0.4]
- 修复数值类型的 type 属性（如 gradient.type: 0）误报为无效控件类型

### [0.0.3]
- 修复控件类型诊断大小写敏感问题（Adaptive 等合法类型误报为无效）

### [0.0.2]
- Shimmer → Aria 全面重命名
- 新增 Hover 悬停文档 Provider
- 新增 Signature Help 签名提示 Provider
- 新增 Diagnostics 代码诊断（无效控件类型、混合缩进、未闭合代码块）
- 新增 Definition 跳转定义（变量、控件名、模板ID、UI ID）