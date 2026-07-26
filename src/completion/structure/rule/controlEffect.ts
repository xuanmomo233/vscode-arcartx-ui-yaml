import * as vscode from 'vscode';

export const control_effects = [
    {
        label: 'stroke',
        detail: '描边 - 沿控件边缘绘制单色描边',
        insertText: 'stroke:\n  width: ${1:2}\n  color: ~${2:255,255,255}',
        kind: vscode.CompletionItemKind.Property,
        documentation: new vscode.MarkdownString(
            '## 描边 (stroke)\n\n' +
            '沿控件边缘绘制单色描边。\n\n' +
            '**参数**:\n' +
            '| 参数 | 说明 | 默认值 |\n' +
            '|------|------|--------|\n' +
            '| `width` | 描边宽度 | `2` |\n' +
            '| `color` | 描边颜色 (`~R,G,B` 或 `~R,G,B,A`) | `~255,255,255` |'
        )
    },
    {
        label: 'shadow',
        detail: '阴影 - 为控件添加投影阴影',
        insertText: 'shadow:\n  xOffset: ${1:3}\n  yOffset: ${2:3}\n  blur: ${3:6}\n  color: ~${4:0,0,0,100}',
        kind: vscode.CompletionItemKind.Property,
        documentation: new vscode.MarkdownString(
            '## 阴影 (shadow)\n\n' +
            '为控件添加投影阴影。\n\n' +
            '**参数**:\n' +
            '| 参数 | 说明 | 默认值 |\n' +
            '|------|------|--------|\n' +
            '| `xOffset` | X轴偏移 | `3` |\n' +
            '| `yOffset` | Y轴偏移 | `3` |\n' +
            '| `blur` | 模糊半径 | `6` |\n' +
            '| `color` | 阴影颜色 | `~0,0,0,100` |'
        )
    },
    {
        label: 'neon',
        detail: '霓虹 - 辉光效果',
        insertText: 'neon:\n  color: ~${1:0,0,100}\n  size: ${2:8}\n  intensity: ${3:1}\n  animated: ${4|true,false|}',
        kind: vscode.CompletionItemKind.Property,
        documentation: new vscode.MarkdownString(
            '## 霓虹 (neon)\n\n' +
            '为控件添加霓虹/辉光效果。\n\n' +
            '**参数**:\n' +
            '| 参数 | 说明 | 默认值 |\n' +
            '|------|------|--------|\n' +
            '| `color` | 发光颜色 | `~0,0,100` |\n' +
            '| `size` | 发光尺寸 | `8` |\n' +
            '| `intensity` | 强度 | `1` |\n' +
            '| `animated` | 是否动态闪烁 | `true` |'
        )
    },
    {
        label: 'ripple',
        detail: '波纹 - 点击时扩散水波纹',
        insertText: 'ripple:\n  duration: ${1:1200}\n  color: ~${2:255,255,255,100}\n  width: ${3:0.1}',
        kind: vscode.CompletionItemKind.Property,
        documentation: new vscode.MarkdownString(
            '## 波纹 (ripple)\n\n' +
            '点击时从点击位置扩散出水波纹，自动响应点击事件，无需额外触发器。\n\n' +
            '**参数**:\n' +
            '| 参数 | 说明 | 默认值 |\n' +
            '|------|------|--------|\n' +
            '| `duration` | 持续时间（毫秒） | `1200` |\n' +
            '| `color` | 波纹颜色 | `~255,255,255,100` |\n' +
            '| `width` | 波纹宽度比例 | `0.1` |'
        )
    },
    {
        label: 'gradient',
        detail: '渐变 - 填充渐变色彩',
        insertText: 'gradient:\n  color1: ~${1:255,0,0,100}\n  color2: ~${2:0,0,255,50}\n  type: ${3:1}\n  angleDeg: ${4:90}',
        kind: vscode.CompletionItemKind.Property,
        documentation: new vscode.MarkdownString(
            '## 渐变 (gradient)\n\n' +
            '为控件填充渐变色彩。\n\n' +
            '**参数**:\n' +
            '| 参数 | 说明 | 默认值 |\n' +
            '|------|------|--------|\n' +
            '| `color1` | 起始颜色 | `~255,0,0,100` |\n' +
            '| `color2` | 结束颜色 | `~0,0,255,50` |\n' +
            '| `type` | 渐变类型 | `1` |\n' +
            '| `angleDeg` | 渐变角度 | `90` |\n\n' +
            '**type 选项**: `0` 线性、`1` 径向、`2` 角度、`3` 菱形'
        )
    },
    {
        label: 'flow',
        detail: '流光 - 流动光效',
        insertText: 'flow:\n  color: ~${1:255,255,255}\n  speed: ${2:1}\n  width: ${3:0.1}\n  angleDeg: ${4:60}\n  mode: ${5:0}',
        kind: vscode.CompletionItemKind.Property,
        documentation: new vscode.MarkdownString(
            '## 流光 (flow)\n\n' +
            '在控件表面添加流动光效。\n\n' +
            '**参数**:\n' +
            '| 参数 | 说明 | 默认值 |\n' +
            '|------|------|--------|\n' +
            '| `color` | 流光颜色 | `~255,255,255` |\n' +
            '| `speed` | 流动速度 | `1` |\n' +
            '| `width` | 流光宽度 | `0.1` |\n' +
            '| `angleDeg` | 流动角度 | `60` |\n' +
            '| `mode` | 流动模式 | `0` |\n\n' +
            '**mode 选项**: `0` 线性、`1` 环形、`2` 对角线'
        )
    },
    {
        label: 'energy',
        detail: '能量 - 能量场特效',
        insertText: 'energy:\n  color: ~${1:0,0,255}\n  intensity: ${2:1}\n  frequency: ${3:1}\n  speed: ${4:1}\n  pattern: ${5:2}',
        kind: vscode.CompletionItemKind.Property,
        documentation: new vscode.MarkdownString(
            '## 能量 (energy)\n\n' +
            '为控件添加能量场特效。\n\n' +
            '**参数**:\n' +
            '| 参数 | 说明 | 默认值 |\n' +
            '|------|------|--------|\n' +
            '| `color` | 能量颜色 | `~0,0,255` |\n' +
            '| `intensity` | 强度 | `1` |\n' +
            '| `frequency` | 频率 | `1` |\n' +
            '| `speed` | 速度 | `1` |\n' +
            '| `pattern` | 图案 | `2` |\n\n' +
            '**pattern 选项**: `0` 脉冲、`1` 波浪、`2` 电弧、`3` 等离子'
        )
    },
    {
        label: 'pie',
        detail: '饼图剪裁 - 按饼图形状剪裁控件',
        insertText: 'pie:\n  startAngle: ${1:0}\n  endAngle: ${2:270}\n  centerX: ${3:0.5}\n  centerY: ${4:0.5}\n  feather: ${5:0.1}',
        kind: vscode.CompletionItemKind.Property,
        documentation: new vscode.MarkdownString(
            '## 饼图剪裁 (pie)\n\n' +
            '将控件按饼图形状剪裁，0 度位置为右侧中间。\n\n' +
            '**参数**:\n' +
            '| 参数 | 说明 | 默认值 |\n' +
            '|------|------|--------|\n' +
            '| `startAngle` | 起始角度 | `0` |\n' +
            '| `endAngle` | 结束角度 | `270` |\n' +
            '| `centerX` | 中心点X (0~1) | `0.5` |\n' +
            '| `centerY` | 中心点Y (0~1) | `0.5` |\n' +
            '| `feather` | 边缘羽化 | `0.1` |'
        )
    },
];
