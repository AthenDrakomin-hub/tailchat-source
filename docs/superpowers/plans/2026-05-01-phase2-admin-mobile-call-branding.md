# Phase 2 Admin Mobile Call Branding Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在第一阶段完成主导航和基础布局收口后，继续把管理端稳定性、移动端体验、通话体验和财讯化视觉推进到下一层。

**Architecture:** 第二阶段不再只做入口信息架构，而是从后台故障兜底、WebView 适配、通话路径内聚和视觉统一四条线并行推进。优先维持现有功能可编译、可构建、可部署，不在没有证据的情况下大拆底层服务结构。

**Tech Stack:** React、React Router、Tailwind、Tushan、LiveKit 插件体系、管理端 Express + Vite

---

### Task 1: 管理端高风险页面继续统一降级态

**Files:**
- Modify: `server/admin/src/client/routes/cache.tsx`
- Modify: `server/admin/src/client/routes/system/notify.tsx`
- Modify: `server/admin/src/client/routes/defense-control/index.tsx`
- Modify: `server/admin/src/client/components/FeatureStatusCard.tsx`

- [x] 把初始化失败或关键依赖缺失时的页面行为统一到可理解的降级卡片
- [x] 避免继续出现 toast 一闪而过、页面却没有明确状态的情况
- [x] 保持 `tailchat-admin build` 通过

### Task 2: 移动端 WebView 继续修窄屏主路径

**Files:**
- Modify: `client/web/src/components/Panel/common/Header.tsx`
- Modify: `client/web/src/components/ChatBox/ChatMessageList/Item.tsx`
- Modify: `client/web/src/components/ChatBox/ChatReply.tsx`
- Modify: `client/web/src/routes/Main/Navbar/index.tsx`

- [x] 补齐消息头部、回复条、消息项在窄屏下的文本截断和容器约束
- [x] 继续减少横向撑出视口的问题
- [x] 保持 `client/web` 类型检查和构建通过

### Task 3: 通话体验继续从“会议感”收口为“应用内通话感”

**Files:**
- Modify: `server/plugins/com.msgbyte.livekit/web/plugins/com.msgbyte.livekit/src/panel/LivekitMeetingPanel.tsx`
- Modify: `server/plugins/com.msgbyte.livekit/web/plugins/com.msgbyte.livekit/src/components/InviteCallNotification.tsx`
- Modify: `server/plugins/com.msgbyte.livekit/web/plugins/com.msgbyte.livekit/src/components/LivekitView.tsx`

- [x] 让通话面板的标题、空状态、接听路径更像会话内通话
- [x] 尽量弱化“会议房间 / 外部链接”的感知
- [x] 保持整仓构建通过

### Task 4: 财讯化视觉第一阶段

**Files:**
- Modify: `client/web/src/routes/Main/Navbar/*.tsx`
- Modify: `client/web/src/routes/Main/Content/Personal/Sidebar.tsx`
- Modify: `client/web/src/routes/Main/Content/Groups/index.tsx`
- Modify: `server/admin/src/client/App.tsx`

- [x] 在不破坏交互收口的前提下，开始统一颜色、图标和视觉语言
- [x] 方向为“接近微信的清晰度 + 财讯品牌感”
- [x] 避免过重装饰和无必要的视觉噪音

### Task 5: 记录与版本线

**Files:**
- Modify: `CHANGELOG.md`
- Modify: `docs/2026-05-01-structure-capability-audit.md`

- [x] 持续记录已落地的结构改造和能力变化
- [x] 在达到稳定检查点时准备新 tag

## Completion Note

第二阶段已完成收尾，实际落地范围包括：

- 管理端核心诊断页、系统页、分析页、防御页、缓存页、系统通知页的降级态与反馈增强
- WebView / 窄屏下消息列表、输入区、回复条、页头、空状态、通知详情、群组侧栏与列表层级的持续修补
- LiveKit 私聊通话路径改为应用内直达，并弱化会议 / 房间感知
- 主导航、侧栏、通知列表、群组列表与主区占位组件的第一批统一视觉语言

阶段完成验证：

- `pnpm --dir /workspace/tailchat-source/client/web check:type`
- `pnpm --dir /workspace/tailchat-source/client/web build:ci`
- `pnpm --dir /workspace/tailchat-source/server/admin build`
- `pnpm --dir /workspace/tailchat-source build`
