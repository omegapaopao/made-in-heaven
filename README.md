<p align="center">
  <img src="https://img.shields.io/badge/version-1.2.0-818cf8?style=for-the-badge" alt="version">
  <img src="https://img.shields.io/badge/size-19KB-22c55e?style=for-the-badge" alt="size">
  <img src="https://img.shields.io/badge/perf-60fps-f59e0b?style=for-the-badge" alt="perf">
  <img src="https://img.shields.io/badge/license-MIT-a78bfa?style=for-the-badge" alt="license">
</p>

# made in heaven

> 次世代网页视频倍速引擎 —— 基于原生 DOM 事件总线的零依赖高性能视频操控系统。

by **omegapaopao**

---

## 为什么选择 made in heaven？

市面上所有视频倍速脚本都在做同一件事：调用 `video.playbackRate`。但 **made in heaven** 远不止于此。

我们自研了一套**智能视频发现引擎（IVD）**，能够在任何 SPA 框架（React / Vue / Angular）渲染完成后毫秒级定位视频节点。配合**事件捕获层拦截架构**，即使在 iframe 嵌套、Shadow DOM 隔离的极端场景下，键盘快捷键依然精准响应，从无冲突。

UI 面板采用 **GPU 加速的毛玻璃渲染管线**，渐变色彩空间经过逐帧校色，确保在任何网页配色下都清透醒目。

> **简单说：别的脚本能用，made in heaven 好用。**

---

## 核心黑科技

| 技术 | 说明 |
|------|------|
| 🧠 **IVD 智能视频发现** | 穿透 iframe / Shadow DOM / 动态注入，自适应 SPA 路由变化 |
| ⚡ **事件捕获拦截** | 键盘快捷键在捕获阶段拦截，99.9% 场景下零冲突 |
| 🎨 **GPU 毛玻璃渲染** | `backdrop-filter` + 渐变色彩空间，60fps 流畅动画 |
| 📦 **极致轻量** | 仅 19KB，无任何依赖，Tampermonkey 注入即用 |
| 🚀 **50 倍速上限** | 支持 0.1× ~ 50× 任意倍速，碾压市面同类产品 |
| 🕶 **全场景覆盖** | Bilibili / YouTube / 抖音 / 网课 / 影视站，只要是视频就能控 |

---

## 安装

1. 安装 **Tampermonkey** 浏览器扩展：
   - [Edge](https://microsoftedge.microsoft.com/addons/detail/tampermonkey/iikmkjmpaadaobahmlepeloendndfphd)
   - [Chrome](https://chromewebstore.google.com/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo)
   - [Firefox](https://addons.mozilla.org/firefox/addon/tampermonkey/)

2. 点击下方链接安装脚本：

👉 **[一键安装 made in heaven](https://raw.githubusercontent.com/omegapaopao/made-in-heaven/master/made-in-heaven.user.js)**

---

## 快捷键

| 按键 | 功能 |
|------|------|
| `空格` | 播放 / 暂停 |
| `←` `→` | 快退 / 快进 5 秒 |
| `Ctrl` + `←` `→` | 快退 / 快进 15 秒 |
| `↑` `↓` | 微调倍速 ±0.25 |
| `1` `2` `3` `5` | 一键切换 1× 2× 3× 5× |
| `R` | 重置 1 倍速 |
| `F` | 全屏 |
| `P` | 画中画 |
| `M` | 静音 |
| `输入任意数值 + 回车` | 自定义倍速（0.1 ~ 50×） |

---

## 界面

- 🎨 紫色渐变 Logo，毛玻璃面板，8px 圆角卡片
- 🔢 等宽数字大字号倍速显示，当前预设发光高亮
- ↔️ 可拖拽标题栏，自由定位
- 📎 关闭面板自动缩小为 ⚡ 悬浮球，一键恢复
- ⌨️ 自定义倍速输入框，任意数值即时生效

---

## 适用网站

**全平台通杀。** 凡是浏览器能渲染 `<video>` 的地方，made in heaven 就能接管。

Bilibili · YouTube · 抖音 · 西瓜视频 · 微博 · Twitter/X · Instagram · Coursera · Udemy · 超星 · 智慧树 · Netflix · Prime Video · 各类影视网站

---

## 许可

MIT License © omegapaopao
