# Change Log
### [0.0.1]
- Initial release

### [0.0.35]
- 新增 **侧边栏颜色面板**（活动栏图标入口）：
  - **RGBA 色块 Tab**：HSV 色谱选择器 + 色相条 + RGBA 滑块，实时预览色块
    - 输出 `~R,G,B,A`（控件属性值）、`~R,G,B`（不带 Alpha）、`#RRGGBBAA`（HEX）
  - **文字颜色 Tab**：HSV 色谱选择器 + RGB 滑块，深色背景预览
    - 输出 `§#RRGGBB`（自定义颜色）、`§s§#RRGGBB`（描边色）、`§^RRGGBB`（流光）、`§*RRGGBB`（荧光笔背景）
  - **渐变色 Tab**：双 HSV 色谱选择器（起始色 + 结束色）+ RGBA 滑块 + 渐变类型/角度参数
    - 输出 effect 渐变 YAML 块（`gradient: color1/color2/type/angleDeg`）
    - 输出文字渐变 `§~RRGGBB-RRGGBB`
    - 渐变预览（线性/径向/角度/菱形四种模式）
  - 所有输出支持"插入到编辑器"和"复制到剪贴板"

### [0.0.34]
- 新增 **颜色色块装饰器**：在 `~R,G,B` 或 `~R,G,B,A` 值旁实时显示颜色色块预览
  - 自动扫描文件中所有颜色值，在值前方渲染对应颜色的色块
  - 支持 Alpha 透明度可视化
  - 输入时实时更新
- 新增 **颜色选择器命令**：通过命令面板或右键菜单选择颜色
  - 提供 14 种预设颜色（红/绿/蓝/白/黑/黄/青/紫/橙/灰/半透明黑/半透明白/浅蓝等）
  - 支持自定义 RGBA 输入（分两步：先 RGB 再 Alpha）
  - 自动检测光标位置已有的颜色值并预填
  - 插入前预览确认，支持替换已有颜色或插入新颜色
  - 命令：`ArcartX: 选择颜色`，右键菜单也可触发

### [0.0.33]
- 修正 `shape`/`radius`/`shadow` 的适用范围：
  - `shape`/`radius` 从公共属性改为仅对有纹理渲染的控件生效（Texture/9SliceTexture/Slot/TextBox/ChatTextBox/Progress/Compass/Chat/BossBar）
  - `shadow` 从公共属性改为 Text 独有属性（§8.1 文档明确标注）
  - `alignment` 移到 Text 独有
  - Entity/Model/Canvas/Adaptive/HStack/VStack/HGrid/VGrid/Scroll/Import/Observer/BossBars 不再显示 shape/radius/shadow 补全

### [0.0.32]
- 对照知识文档和避坑指南全面优化：
  - **属性补全修正**：`shape`/`radius`/`shadow` 移为公共属性（所有控件可用）
  - **补充缺失属性**：`textures`/`transitionTime`(BossBar)、`autoScale`(Adaptive)、`itemEffect`(Slot)、`up`/`maxShow`/`backgroundBorder`/`hoverTextColor`(Suggestion)、`waypointIconWidth`/`waypointIconHeight`/`wayOffsetY`(Compass)
  - **类型属性映射修正**：Texture 增加 `loop`、Model 增加 `showType`、Chat 增加 `keep`、Adaptive 增加 `autoScale`、Slot 增加 `itemEffect`
  - **新增 `~` 前缀缺失诊断**：自动检测颜色值、资源路径、锚点枚举、slotType/shape/showType/alignment 枚举、`&` 颜色码文本缺少 `~` 前缀的情况，给出修正建议
  - **新增 `range()` 浮点数陷阱诊断**：检测 `for(i in range(...))` 中 `i + ''` 不带 `.round` 的常见错误

### [0.0.31]
- 修复 `effect:` 不会自动触发补全的问题：将 `effect` 加入 `blockKeys` 和 `isOnBlockHeader` 检测

### [0.0.30]
- 新增 `effect` 块补全：在控件的 `effect:` 下输入 `/` 或 `?` 可触发 8 种图形特效补全
  - `stroke`（描边）、`shadow`（阴影）、`neon`（霓虹）、`ripple`（波纹）
  - `gradient`（渐变）、`flow`（流光）、`energy`（能量）、`pie`（饼图剪裁）
  - 每种特效带完整参数模板和详细文档
- 修复 `isScriptContext` 正则中未转义的 `/` 导致编译失败

### [0.0.29]
- 重写悬停 provider，实现上下文感知查找：
  - 分离 `yamlMap`/`scriptMap`/`commonMap`，YAML 属性名位置优先匹配控件属性，脚本块内优先匹配函数
  - 修复函数参数名污染 `docMap`（如 `Number.round(x)` 的 `x` 被注册为独立 key）
  - 只按 `.` 拆分 label，不再按 `()` 拆分
- 对照知识文档全面审计并修正控件属性描述：
  - 修正 `scale`（从左上角缩放，非正中心）、`through`（补充"不接受点击事件"）
  - 修正 `shadow` 适用范围（Text、Texture 含有）、`normal`/`hover` 补充"纹理表达式"说明
  - 修正 9SliceTexture 的 `left`/`right`/`top`/`bottom` 描述为"从贴图边缘到分割线的像素距离"
  - 修正 `slotType` 的 `id` 描述为"拓展槽位为字符串，其余为数字"
  - 修正 `moveX`/`moveY` 补充"0~1，控制滚动位置"
  - 修正 `spaceBetween` 适用范围增加 BossBars
- 补充大量缺失控件属性：
  - `loop`（Texture GIF循环）、`lock`/`cooldown`/`overwriteText`（Slot）
  - `alignment`（Text 文字对齐）、`uuid`/`hideTag`/`followMouse`（Entity）
  - `model`/`animation`/`showType`/`followMouse`（Model）
  - `texture`/`progress`/`time`/`mode`（Progress）
  - `node`（Import）、`subscribe`/`target`/`maxSize`（Observer）
  - `inputPattern`（TextBox）、`sendClose`（ChatTextBox）
  - `border`/`filter`/`showCard`/`exclude`/`keep`（Chat）
  - `textColor`/`tickColor`/`directionColor`/`tickInterval`/`majorTickInterval`/`showWaypoints`/`waypointFontSize`（Compass）
  - `shape`/`radius`（图形效果）
- 补充缺失 UI 选项：`transfer`、`screenScale`、`controls`、`template`、`tasks`
- 补充缺失控件触发器：`wheel`、`keyPress`、`keyRelease`
- 补充 `effect` 控件设置项
- 修正控件类型列表：`9sliceTexture` → `9SliceTexture`，补充 `model`/`progress`/`compass`/`import`/`observer`/`chatTextBox`/`suggestion`/`chat`/`card`/`bossBar`/`bossBars`
- 修正 Text 类型文档：移除错误的 `right` 属性，改为 `alignment`
- 修正 Model 类型 `animation` 默认值为 `idle`，补充 `showType` 属性
- 补充 Chat 类型 `keep` 属性
- 新增 `card` 卡片消息控件类型

### [0.0.28]
- 全面修复悬停功能，补全所有遗漏的数据源和逻辑问题：
  - 新增导入 `control_settings`（`val`/`type`/`attribute`/`children`/`action`）、`task_settings`（`type`/`time`/`cycle`/`run`）、`hud_names`（30个HUD名称）、`match_values`
  - `ariaKeywords` 跳过逻辑改为仅跳过拆分段注册，不跳过完整 label 注册，确保 `val` 属性可悬停
  - 完整 label 注册改为 `!has` 保护，避免后注册的覆盖先注册的更精确匹配

### [0.0.27]
- 修复控件属性悬停无效问题：只有 `point` 和 `slotType` 有 `documentation` 字段，其他属性被跳过
  - 现在 `documentation` 为空时使用 `detail` 作为悬停内容，所有属性均可悬停

### [0.0.26]
- 修复 `self.parent` 悬停误识别为 `Sound.self()` 的问题：
  - `Sound.self()` 的 label 拆分后 `self` 被注册为 docMap 独立 key
  - 现在跳过 Aria 上下文关键字（`self`/`val`/`var`），不再作为独立悬停 key 注册

### [0.0.25]
- 修复链式调用中悬停无法识别函数的问题：
  - 清理捕获词的前后点号（`.setDragYRatio` → `setDragYRatio`）
  - 按 `.` / `[` / `]` / `'` / `"` 拆分，从最后一段逐段向前查找 docMap
  - 现在 `self.parent['纵向滑块'].setDragYRatio(...)` 中的 `setDragYRatio`、`self.wheelValue` 中的 `wheelValue`、`.round(1)` 中的 `round` 均可正确悬停

### [0.0.24]
- 修复悬停文档大小写敏感问题：`docMap` 的 key 和所有查找改为 `.toLowerCase()`，现在 `Text`、`Texture`、`HGrid` 等首字母大写也能正确悬停

### [0.0.23]
- 修复缩进翻倍问题（根因：VSCode auto-indent 自动为新行补基础缩进，代码又手动加了 currentLineIndent）：
  - `blockChildIndent` 从 `currentLineIndent + '  '` 改为仅 `'  '`（相对缩进）
  - 非块头行多行 snippet 不再手动添加 `currentLineIndent`
  - `getSmartTypeSnippet` 的 `baseIndent` 参数传空串，依赖 VSCode auto-indent

### [0.0.22]
- 修复 `action:` / `attribute:` / `children:` 输入冒号后显示错误补全列表的根因：
  - `findMatchingConfig` 的 tie-breaking 逻辑未优先末尾段精确匹配，导致 `['controls', '*']` 错误胜过 `['*', 'action']`
  - 现在 `action:` 正确显示触发器列表（`click`、`hover` 等），`attribute:` 正确显示属性列表，`children:` 正确显示控件模板

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