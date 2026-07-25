# Change Log
### [0.0.1]
- Initial release

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