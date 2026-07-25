# Change Log
### [0.0.1]
- Initial release

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