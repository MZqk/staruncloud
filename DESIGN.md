---
name: Starun
description: 把热爱，写进星空。面向深空摄影爱好者的全流程极客工具箱
colors:
  primary: "oklch(72% 0.125 42)"
  primary-deep: "oklch(67% 0.135 22)"
  primary-ink: "oklch(16% 0.02 42)"
  neutral-bg: "oklch(12.5% 0.027 290)"
  neutral-surface: "oklch(16% 0.03 290)"
  neutral-surface-raised: "oklch(20% 0.032 290)"
  neutral-ink: "oklch(96% 0.01 300)"
  neutral-ink-soft: "oklch(85% 0.017 298)"
  neutral-muted: "oklch(69% 0.026 295)"
  neutral-border: "oklch(27% 0.034 290)"
  neutral-border-subtle: "oklch(36% 0.04 292)"
  focus: "oklch(78% 0.13 45)"
typography:
  display:
    fontFamily: '"Songti SC", "Noto Serif CJK SC", "Source Han Serif SC", "STSong", "SimSun", Georgia, serif'
    fontSize: "clamp(2.75rem, 5vw + 1rem, 5.25rem)"
    fontWeight: 400
    lineHeight: 1.04
    letterSpacing: "-0.01em"
  display-code:
    fontFamily: '"Songti SC", "Noto Serif CJK SC", "Source Han Serif SC", "STSong", "SimSun", Georgia, serif'
    fontSize: "clamp(3rem, 5vw, 4.5rem)"
    fontWeight: 400
    lineHeight: 1
    letterSpacing: "normal"
  headline:
    fontFamily: '"Songti SC", "Noto Serif CJK SC", "Source Han Serif SC", "STSong", "SimSun", Georgia, serif'
    fontSize: "clamp(2rem, 2.5vw + 1rem, 3.5rem)"
    fontWeight: 400
    lineHeight: 1.14
    letterSpacing: "-0.01em"
  title:
    fontFamily: '"Songti SC", "Noto Serif CJK SC", "Source Han Serif SC", "STSong", "SimSun", Georgia, serif'
    fontSize: "clamp(1.25rem, 0.75vw + 0.875rem, 1.625rem)"
    fontWeight: 400
    lineHeight: 1.2
    letterSpacing: "normal"
  body:
    fontFamily: '-apple-system, BlinkMacSystemFont, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Noto Sans CJK SC", sans-serif'
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.55
    letterSpacing: "normal"
  label:
    fontFamily: 'ui-monospace, "SF Mono", "JetBrains Mono", Menlo, Consolas, monospace'
    fontSize: "0.8125rem"
    fontWeight: 400
    lineHeight: 1
    letterSpacing: "normal"
rounded:
  card: "10px"
  pill: "999px"
spacing:
  "3xs": "2px"
  "2xs": "4px"
  xs: "8px"
  sm: "12px"
  md: "16px"
  lg: "24px"
  xl: "40px"
  "2xl": "64px"
  "3xl": "96px"
  "4xl": "144px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-ink}"
    rounded: "{rounded.pill}"
    padding: "0 24px"
    height: "48px"
  button-primary-hover:
    backgroundColor: "{colors.neutral-ink}"
    textColor: "{colors.neutral-bg}"
  button-quiet:
    backgroundColor: "{colors.neutral-surface}"
    textColor: "{colors.neutral-ink}"
    rounded: "{rounded.pill}"
    padding: "0 24px"
    height: "48px"
  chip:
    backgroundColor: "{colors.neutral-bg}"
    textColor: "{colors.neutral-ink-soft}"
    rounded: "{rounded.pill}"
    padding: "0 16px"
    height: "44px"
  chip-selected:
    backgroundColor: "{colors.neutral-surface-raised}"
    textColor: "{colors.neutral-ink}"
  card:
    backgroundColor: "{colors.neutral-surface}"
    textColor: "{colors.neutral-ink}"
    rounded: "{rounded.card}"
    padding: "16px"
---

# Design System: Starun

## Overview

**Creative North Star: "The Deep-Sky Observatory"**

Starun 视觉系统是一座坐落于高山暗夜深处的深空天文台。在这里，视觉环境永远处于适合暗夜观测的低流明状态：界面以极深沉、微微泛着紫罗兰夜幕感的幽暗背景为基底，如同一方无垠的穹顶；操作与指示系统则继承自天文仪器的物理触感——精准的发丝刻度线、极度克制的陶土暖色信号灯，以及凝视苍穹般的中文古典宋体大标题。

整个系统拒绝一切平庸消费级 Web 的喧嚣感。这里没有浮夸的霓虹渐变、没有为了装饰而装饰的生硬阴影与毛玻璃，更没有刺眼的纯白高光。界面的每一抹光亮都如同长曝光后捕获的星芒，微弱但极其坚定。数据与专业参数以严谨等宽字体呈现，如同物镜旁记录曝光时长的读数表，既保持高度的工程理性，又蕴含对头顶星空的纯粹敬畏。

**Key Characteristics:**
- **夜幕流明色调 (Observatory Lumen)**：以基于 OKLCH 色域精心微调的暗夜紫黑梯阶为主视觉场域；
- **陶土稀缺信号 (Starlight Clay Signal)**：陶土暖橙作为唯一的强交互提示色，极度稀缺，绝不滥用；
- **古典宋体配现代排版 (Serif Display & Clean Body)**：以典雅宋体传递天文观测的人文历史厚重感，以系统无衬线保证专业参数与长文的极速阅读；
- **纯色阶平层深度 (Flat Tonal Layering)**：零模糊阴影，纯粹依靠深浅色阶与 1px 微发丝线划分视觉层级。

## Colors

全站色彩基于现代 OKLCH 色域精确建模，模拟天文台夜间红光工作环境与深空冷黑背景的真实对比。

### Primary
- **Starlight Clay (星火赤陶)** (`oklch(72% 0.125 42)`): 取材自 Starun 官方标志的赤陶原色。仅用于高优先级核心行动点（Primary CTA）、活动焦点与关键指示点，如同仪器操作面板上的激活按钮。
- **Vermilion Signal (朱砂星野)** (`oklch(67% 0.135 22)`): 饱和度与明度略深的朱砂色，专用于首屏标题中唯一着重词汇（如“星空”）的文字浸染。
- **Clay Ink (深褐赤墨)** (`oklch(16% 0.02 42)`): 高对比度按钮文本色，确保在陶土强调色背景上获得超过 6:1 的无障碍对比度。

### Neutral
- **Observatory Night Ground (暗夜基盘)** (`oklch(12.5% 0.027 290)`): 全站主画布背景色，略带紫蓝色向的深邃极暗场域，消除夜间视觉疲劳。
- **Tonal Surface (表面色阶)** (`oklch(16% 0.03 290)`): 卡片、浮动胶囊导航的基础底色，提供与基盘之间清晰但柔和的视觉分界。
- **Raised Surface (升阶夜色)** (`oklch(20% 0.032 290)`): 选中态芯片（Chip）、探索路径重点带状区域（Paths）的高一级底色。
- **Celestial Silver Ink (星辉银墨)** (`oklch(96% 0.01 300)`): 主标题与高权重文本，极高对比度（> 15:1），澄澈纯净。
- **Soft Silver Ink (柔光墨色)** (`oklch(85% 0.017 298)`): 副文本、导语段落与说明文字，对比度 > 10:1。
- **Muted Constellation (暗星注释)** (`oklch(69% 0.026 295)`): 元数据标签、侧边注释与技术细节文字，符合 WCAG AA 正文规范。
- **Hairline Rule (星轨准线)** (`oklch(27% 0.034 290)` / `oklch(36% 0.04 292)`): 1px 微弱发丝分割线与胶囊边框，如同精密光学刻度。
- **Amber Focus (流明对焦光)** (`oklch(78% 0.13 45)`): 全局键盘导航的外描边对焦环，保障高可见性。

### Named Rules
**The Clay Rarity Rule.** 陶土强调色在任何单屏视口内的像素面积占比严控在 ≤ 5% 以内。它的稀缺性是其形成视觉引力的根本所在。严禁大面积铺陈暖色，严禁将两个强调色按钮并置。

**The Tonal Silence Rule.** 严禁在有色背景容器上使用浮夸的外发光或深色投影。整个界面依靠地面色阶（12.5% → 16% → 20%）的纯粹物理落差建立空间秩序。

## Typography

**Display Font:** `"Songti SC", "Noto Serif CJK SC", "Source Han Serif SC", "STSong", "SimSun", Georgia, serif`  
**Body Font:** `-apple-system, BlinkMacSystemFont, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Noto Sans CJK SC", sans-serif`  
**Label/Mono Font:** `ui-monospace, "SF Mono", "JetBrains Mono", Menlo, Consolas, "Liberation Mono", monospace`

**Character:** 古典宋体的刀刻笔触带来守望星空沉淀千年的静谧人文气质；系统无衬线正文带来零延迟、不卡顿的高清可读性；等宽数字保证科学仪器般的测量与读数秩序。

### Hierarchy
- **Display** (400, `clamp(2.75rem, 5vw + 1rem, 5.25rem)`, 1.04): 首页英雄区主标（"把热爱，写进星空。"），使用平衡断句，字距微收 `-0.01em`。
- **Headline** (400, `clamp(2rem, 2.5vw + 1rem, 3.5rem)`, 1.14): 页面主要区块大标题（如“为星空，做一点东西”），最大宽度控制在 30ch。
- **Title** (400, `clamp(1.25rem, 0.75vw + 0.875rem, 1.625rem)`, 1.2): 项目卡片标题与模块小标，笔触端庄。
- **Body** (400, `1rem` / `0.875rem`, 1.55): 正文与说明，行长严格约束在 52ch–65ch 最佳阅读宽度。
- **Label** (400, `0.8125rem`, 1, tabular-nums): 筛选计数、端口、状态等测量读数，字距平实。

### Named Rules
**The Serif Restraint Rule.** 衬线体（Songti）仅授权用于展示性大标题与落款签名，绝对禁止侵入交互控件、按钮文字、筛选胶囊与正文列表。
**The Tabular Precision Rule.** 凡涉及数量、年份、参数、时间或指标数据的排版，必须强制声明 `font-variant-numeric: tabular-nums`，确保垂直视觉列严整对齐。

## Layout

- **Container Model**: 全局最大内容宽度 `1440px`，边距采用动态响应式尺度（桌面 `64px`，平板 `24px`，手机 `16px`）；
- **Vertical Rhythm**: 区块间距遵循舒展的梯阶尺度（大间距 `176px` / `144px`，移动端自动缩进为 `96px` / `72px`），留白慷慨；
- **3D Layered Carousel Deck**: 项目展示区采用立体景深层叠轮播架构（`perspective: 1200px`），当前选中的项目居中呈现实质全貌，前后相邻项目在两侧带有物理透视旋转（`rotateY(±10deg)`）、比例缩放（`scale(0.86)`）与半透层叠，形成深邃的天文仪器卡片轮播体验。

## Elevation & Depth

本系统为纯粹的 **Tonal Layering（色阶平层结构）**。

在暗夜环境下，传统的模糊投影要么难以察觉，要么会形成不自然的浑浊脏感。因此 Starun 彻底摒弃一切常规 `box-shadow`。界面从底到高构建了三层纯净的物理阶地：
1. **地表层 (Base Ground)**：`--color-paper`，承载全局整体视界；
2. **构筑层 (Surfaces & Cards)**：`--color-paper-2`，配合 1px `--color-rule-2` 边缘线收束浮动感；
3. **高光层 (Raised Highlights)**：`--color-paper-3`，用于区分当前活跃区域（如探索路径）。

所有的悬浮与聚焦反馈，均通过底色亮度阶跃或微发丝边框明度变化表达，保持视觉场域的至静至美。

## Shapes

- **Card Radius (`10px`)**: 为所有的内容卡片、代码块与结构化容器赋予微圆角，外刚内柔，维持工整的仪器感；
- **Pill Radius (`999px`)**: 专属于高层级可交互元素（浮动导航栏胶囊、操作按钮、筛选 Chips、Skip Link），以圆润的跑道造型提供极其明确的触碰暗示；
- **Hairline Borders (`1px`)**: 所有的界面分割线与边框均采用纯单像素超细发丝线（`var(--rule-hair)`），拒绝任何粗重边框。

## Components

### Buttons
- **Shape:** 胶囊圆角 (`999px`)，标准高度 `48px`（触摸设备保底 `44px`），水平内边距 `24px`；
- **Primary:** 背景填涂陶土色 (`{colors.primary}`)，文字为深褐墨色 (`{colors.primary-ink}`)，字重 `500`；悬浮时反白至银墨高对比色；
- **Quiet:** 表面暗色背景 (`{colors.neutral-surface}`) 配发丝线边框，文字为星辉银墨，用于安静的辅助跳转；
- **Hover / Active:** 毫秒级微平移反馈（`:active { transform: translateY(1px); }`），配合平滑色彩渐进。

### Chips
- **Style:** 胶囊跑道外形，高度 `44px`，`16px` 水平内边距，内置单行等宽数字计数器；
- **State:** 未选中态为地表色底配合发丝边框；激活选中态（`aria-pressed="true"`）切换为升级夜色底（`--color-paper-3`）与银白文字。

### Cards / Containers
- **Corner Style:** `10px` 圆角，内容溢出严格采用 `overflow: clip`；
- **Background:** `--color-paper-2` 表面色阶，内嵌 `16px 16px 24px` 舒展内边距；
- **Image Integration:** 卡片顶部图片严格保持 `16:10` 黄金比例，边缘携带内发丝线防溢出，与深空底色天然融为一体。

### Navigation
- **Floating Mast Pill:** 居中浮动的半岛式玻璃胶囊导航，维持 `56px` 高度，内部采用均衡的 `8px 24px` 舒畅内衬，桌面端携带完整品牌标与项目跳转，移动端自动精简。

### Signature Component: 3D Layered Carousel Deck
- **形态与行为:** 全量 7 款项目集中于统一的立体景深舞台中；选中的当前项（`pos=0`）置顶居中并可直接点击进入，左右相邻项作为景深切片呈现；支持多维分类无缝过滤重排、左右箭头步进、底部位置指示圆点直达、键盘左右键（`ArrowLeft / ArrowRight`）导航以及触控屏滑动手势。

## Do's and Don'ts

### Do:
- **Do** 严格保持正文行长在 52ch–65ch 之间，确保深夜暗光下阅读的舒适度与节奏感；
- **Do** 在所有触控交互元素上维持不小于 44x44px 的有效命中区域；
- **Do** 为所有具有状态变更的组件配置显式的 `:focus-visible` 琥珀色对焦环；
- **Do** 坚持使用真实的系统运行截屏与严谨的天文元数据图表；
- **Do** 在有色背景模块上保持不少于 16px–24px 的充分内嵌内边距。

### Don't:
- **Don't** 使用任何文字渐变（Gradient text）——权重的对比足以表达力量；
- **Don't** 在标题上方添加任何装饰性的眉标（Eyebrow / Kicker）——让标题直接传达核心观点；
- **Don't** 滥用或发明第三种暖色——整个色相空间仅允许陶土色独享高光；
- **Don't** 添加生硬强烈的 `box-shadow`（如 4px 4px 0 块状阴影或浓黑光晕）——纯色阶平层结构是系统的立身之本；
- **Don't** 在正文和表格中使用宋体或展示性字体；
- **Don't** 引入未压缩的重型外部 WebFont 字体包阻塞用户首屏呈现。
