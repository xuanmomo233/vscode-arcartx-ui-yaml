# ArcartX Aria UI

![Version](https://img.shields.io/badge/version-0.0.72-blue.svg)
![License](https://img.shields.io/badge/license-Apache%202.0-green.svg)
![VSCode](https://img.shields.io/badge/VSCode-%3E%3D1.100.0-007ACC.svg)

## 概述

ArcartX Aria UI 是一个为 ArcartX 开发者设计的 VSCode 扩展，旨在简化 ArcartX UI 的 YAML 配置工作。通过提供智能代码片段、上下文感知补全、Aria 脚本高亮与补全、颜色装饰渲染、侧边栏工具箱等功能，帮助开发者快速构建复杂的用户界面。

## 功能特点

### 语法高亮
- ✨ 在 UI YAML 的脚本块和独立 `.aria` 文件中高亮 Aria，支持 `match`、异常处理、类、模块语法、`await`、`?.`、`??`、展开运算符和字符串插值
- Aria 代码片段可在两种语言模式中使用，例如 `match`、`fn`、`try`、`importfrom` 和 `nullish`
- 🎨 内置 Aria 语义着色主题（变量、函数、关键字、字符串、数字等独立颜色）

### 智能补全
- 🧠 **上下文感知的 UI 结构补全** — 根据当前 YAML 路径自动推断补全上下文
  - 根级别：UI 模板、tips、controls、entity_model 等
  - `controls` 下：控件模板（Texture、Text、Slot、HGrid 等）
  - 控件内部：`type`、`attribute`、`children`、`action` 等属性
  - `attribute:` 下：根据控件 `type` 自动过滤只显示相关属性
  - `action:` 下：触发器列表（click、hover、tick、create 等）
  - `children:` 下：子控件模板
  - `tasks` 下：定时任务模板与属性
- 📝 **Aria 脚本补全** — 在 `|-` / `|` 代码块中提供 Aria 函数、对象补全
  - `self.` 与 `Player.` 等对象补全成员，`val.` / `var.` 等作用域补全文档中的变量
  - UI 级别与控件级别自动区分，显示不同的 self 函数
- 🔄 **智能类型模板** — 控件还没有 `attribute` 和 `children` 时，从空白的 `type:` 行选择类型可插入模板。编辑带引号或行尾注释的类型时，仅替换类型值
- 🎨 **控件结构模板化** — 完整控件模板（含控件名、type、attribute、默认值），一键插入

### 触发方式
| 触发方式 | 说明 |
|----------|------|
| `?` | 在任意位置输入 `?` 触发当前上下文的补全列表 |
| `/` | 在任意位置输入 `/` 触发当前上下文的补全列表 |
| `:` | 输入属性名 + `:` 后自动触发属性值补全（如 `type:` → 控件类型列表）|
| `.` | 输入 `self.` / `val.` / `var.` 后触发函数补全 |

### 开发辅助
- 💡 **悬停文档** — 鼠标悬停在控件类型、属性名、属性值（锚点、形状、对齐等）、Aria 函数上显示详细文档和示例
- 🔧 **签名提示** — 显示 Aria 函数参数名和当前参数位置，支持多行调用和嵌套调用
- 🩺 **代码诊断** — 自动检测无效控件类型、混合缩进、未闭合代码块等常见错误
- 🔗 **跳转定义** — `Ctrl+点击` 变量名、控件名、模板 ID 快速跳转到声明位置

### 颜色装饰渲染
- 🎨 **RGBA 色块** — `~R,G,B,A` 值旁自动显示对应颜色色块，直观预览
- 🌫️ **Frosted 色块** — `Frosted:blur;R,G,B,A` 毛玻璃语法旁显示 RGBA 色块，直观预览颜色
- 🌈 **§# 文字着色** — `§#RRGGBB` 颜色码后的文字直接以该颜色渲染，颜色码本身显示色块标记
- ✨ **§~ 渐变逐字插值** — `§~RRGGBB-RRGGBB` 颜色码后的文字逐字在两个颜色之间线性插值，每个字符显示不同的渐变色，颜色码本身显示双色块标记
- 🎮 **§a / &b Minecraft 颜色码** — `§0`-`§f` 和 `&0`-`&f` 共 16 种标准颜色码显示色块标记并着色后续文字，遇到下一个颜色码或 `§r` / `&r` 自动停止

### 侧边栏工具箱
- 📦 **ArcartX 工具箱面板** — 活动栏中的多功能侧边栏面板，标题随 Tab 切换动态更新
  - **RGBA 色块** — 可视化色板选择器，滑块调节 RGBA 值，一键插入 `~R,G,B,A` 格式
  - **毛玻璃 Frosted** — 模糊度 + RGBA 滑块，实时预览毛玻璃效果，插入 `~Frosted:blur;R,G,B,A` 格式
  - **文字颜色** — 选择颜色后插入 `§#RRGGBB` 格式码
  - **渐变色** — 双色选择器，预览渐变效果，插入 `§~RRGGBB-RRGGBB` 格式码
  - **色板** — 预设常用颜色快速选取
  - **控件模板** — 在 `controls` 或 `children` 下插入控件。可用 `repeat-grid-data` 预填静态数据网格，或选用带示例内容的横向、纵向和双向滚动区
  - **特效模板** — 在控件的 `effect` 下插入特效，可通过选项切换渐变、流光和能量图案
  - **UI 模板** — 包含可交互菜单、Tooltip、BossBar 配置和定时任务，卡片会提示插入位置
  - **自定义模板** — 用户自建模板，支持添加 / 删除 / 复制 / 插入 / 预览，持久化存储

内置模板的「插入」会按当前缩进放置内容。用 Tab 切换可编辑字段。「复制」与「预览」显示填入默认值后的 YAML。

## 安装方法

### 从 VSCode Marketplace 安装
1. 打开 VSCode
2. 转到扩展视图（`Ctrl+Shift+X`）
3. 搜索 "ArcartX Aria UI"
4. 点击安装

### 从 VSIX 安装
1. 从 [GitHub Releases](https://github.com/ArcartXProject/vscode-arcartx-ui-yaml/releases) 下载 `.vsix` 文件
2. 在 VSCode 中执行命令 `Extensions: Install from VSIX...`
3. 选择下载的 `.vsix` 文件

## 使用方法

1. 打开或创建一个 `.arx` 文件（或手动在右下角选择 "ArcartX UI YAML" 语言模式）
2. 输入 `?` 或 `/` 触发当前上下文的补全列表
3. 输入属性名 + `:` 自动触发属性值补全（如 `type:` → 控件类型列表）
4. 在 `|-` 或 `|` 代码块中编写 Aria 脚本，输入 `self.` / `val.` 触发函数补全

```yaml
# 单行代码模式【使用 YAML 语法的 '|' 文本块模式】
# 注意：以这种方式只为了激活 Aria 代码高亮和补全，请不要在此编写多行代码
# 因为 YAML 读取时会将其视为单行
codeSingle: |
    Message.chat('123')

# 多行代码模式【使用 YAML 语法的 '|-' 文本块模式】
codeMultiple: |-
    Message.chat('123')
    Message.chat('456')
```

## 支持的控件类型

| 类型 | 说明 |
|------|------|
| `Texture` | 普通图片控件 |
| `Text` | 文本控件 |
| `9SliceTexture` | 九宫格图片（可拉伸） |
| `TextBox` | 文本输入框 |
| `RepeatGrid` | 按列表顺序创建、复用和排列子控件 |
| `Entity` | 实体渲染控件 |
| `Model` | 模型渲染控件（支持部位裁剪） |
| `Slot` | 物品槽位 |
| `Canvas` | 画布容器 |
| `Adaptive` | 自适应容器（等比缩放） |
| `HGrid` / `VGrid` | 水平 / 垂直网格布局 |
| `HStack` / `VStack` | 水平 / 垂直堆叠布局 |
| `Scroll` | 滚动容器 |
| `Progress` | 进度条 |
| `Compass` | 指南针 / 路标控件 |
| `BossBar` | Boss 血条控件 |
| `Chat` / `ChatTextBox` | 聊天框 / 聊天输入框 |
| `Suggestion` | 命令建议提示控件 |
| `Observer` | 数据驱动列表控件 |
| `Import` | 跨 UI 导入控件 |
| `Card` | 聊天卡片根控件 |
| `BossBars` | 血条排列器 |

### 用 RepeatGrid 渲染玩家列表

在 `controls` 或 `children` 中选择 `RepeatGrid` 模板，即可插入原版 Tab 玩家列表示例。模板也可从工具箱插入。

- `items: Player.getTabPlayers()` 读取原版 Tab 的有序玩家数据，`key: ~uuid` 让同一个玩家在顺序变化后仍使用原来的控件。
- `flow: ~column` 按列填充，以 `row` 控制每列行数。使用 `flow: ~row` 时，以 `column` 控制每行列数。
- 在 `children` 下放一个直接子控件作为模板。在模板根控件的脚本中输入 `self.` 可补全 `item`、`key`、`index`、`row` 和 `column`。它的直接子控件通过 `self.parent.item` 访问当前数据，使用 `self.parent().` 时也可以补全这些字段。

[控件类型文档](https://wiki.arcartx.com/docs/arcartx_v2/8_ui/8_controls_type) · [玩家 API 文档](https://wiki.arcartx.com/docs/arcartx_v2/777_client_aria/1_functions/12_player) · [Aria 语言参考](https://wiki.arcartx.com/docs/aria)

## 致谢

- YAML 语法高亮配置基于 [vscode-yaml](https://github.com/redhat-developer/vscode-yaml)，基于 MIT 协议

## 问题反馈

- 如果你遇到任何问题或有功能建议，请在 GitHub 仓库提交 issue：
- [https://github.com/ArcartXProject/vscode-arcartx-ui-yaml/issues](https://github.com/ArcartXProject/vscode-arcartx-ui-yaml/issues)

## 版权和许可

- Copyright (c) 2025 17Artist, MayIHaveK
- 根据 Apache License 2.0 协议发布
