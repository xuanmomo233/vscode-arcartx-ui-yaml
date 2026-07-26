# ArcartX Aria UI

![Version](https://img.shields.io/badge/version-0.0.23-blue.svg)
![License](https://img.shields.io/badge/license-Apache%202.0-green.svg)
![VSCode](https://img.shields.io/badge/VSCode-%3E%3D1.100.0-007ACC.svg)

## 概述

ArcartX Aria UI 是一个为 ArcartX 开发者设计的 VSCode 扩展，旨在简化 ArcartX UI 的 YAML 配置工作。通过提供智能代码片段、上下文感知补全、Aria 脚本高亮与补全等功能，帮助开发者快速构建复杂的用户界面。

## 功能特点

### 语法高亮
- ✨ YAML + Aria 脚本混合语法高亮，在 `|-` / `|` 代码块中自动切换 Aria 语法
- 🎨 内置 Aria 语义着色主题（变量、函数、关键字、字符串、数字等独立颜色）

### 智能补全
- 🧠 **上下文感知的 UI 结构补全** — 根据当前 YAML 路径自动推断补全上下文
  - 根级别：UI 模板、tips、controls、entity_model 等
  - `controls` 下：控件模板（texture、text、slot、hGrid 等）
  - 控件内部：`type`、`attribute`、`children`、`action` 等属性
  - `attribute:` 下：根据控件 `type` 自动过滤只显示相关属性
  - `action:` 下：触发器列表（click、hover、tick、create 等）
  - `children:` 下：子控件模板
  - `tasks` 下：定时任务模板与属性
- 📝 **Aria 脚本补全** — 在 `|-` / `|` 代码块中提供 Aria 函数、对象补全
  - `self.` / `val.` / `var.` 后自动弹出上下文相关函数列表
  - UI 级别与控件级别自动区分，显示不同的 self 函数
- 🔄 **智能类型模板** — 输入 `type:` 选择控件类型后，自动生成 `attribute` 块并预填专属属性
- 🎨 **控件结构模板化** — 完整控件模板（含控件名、type、attribute、默认值），一键插入

### 触发方式
| 触发方式 | 说明 |
|----------|------|
| `?` | 在任意位置输入 `?` 触发当前上下文的补全列表 |
| `/` | 在任意位置输入 `/` 触发当前上下文的补全列表 |
| `:` | 输入属性名 + `:` 后自动触发属性值补全（如 `type:` → 控件类型列表）|
| `.` | 输入 `self.` / `val.` / `var.` 后触发函数补全 |

### 开发辅助
- 💡 **悬停文档** — 鼠标悬停在控件类型、属性名、Aria 函数上显示详细文档和示例
- 🔧 **签名提示** — 输入 Aria 函数调用时弹出参数提示，显示参数名和类型
- 🩺 **代码诊断** — 自动检测无效控件类型、混合缩进、未闭合代码块等常见错误
- 🔗 **跳转定义** — `Ctrl+点击` 变量名、控件名、模板 ID 快速跳转到声明位置

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
| `texture` | 普通图片控件 |
| `text` | 文本控件 |
| `9sliceTexture` | 九宫格图片（可拉伸） |
| `textbox` | 文本输入框 |
| `entity` | 实体渲染控件 |
| `slot` | 物品槽位 |
| `canvas` | 画布容器 |
| `adaptive` | 自适应容器 |
| `hGrid` / `vGrid` | 水平 / 垂直网格布局 |
| `hStack` / `vStack` | 水平 / 垂直堆叠布局 |
| `scroll` | 滚动容器 |
| `button` | 按钮（快捷模板） |
| `progress` | 进度条 |
| `chat` / `chatTextBox` | 聊天框 |

## 致谢

- YAML 语法高亮配置基于 [vscode-yaml](https://github.com/redhat-developer/vscode-yaml)，基于 MIT 协议

## 问题反馈

- 如果你遇到任何问题或有功能建议，请在 GitHub 仓库提交 issue：
- [https://github.com/ArcartXProject/vscode-arcartx-ui-yaml/issues](https://github.com/ArcartXProject/vscode-arcartx-ui-yaml/issues)

## 版权和许可

- Copyright (c) 2025 17Artist, MayIHaveK
- 根据 Apache License 2.0 协议发布
