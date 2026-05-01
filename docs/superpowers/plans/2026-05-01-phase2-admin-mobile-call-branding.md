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

- [ ] 把初始化失败或关键依赖缺失时的页面行为统一到可理解的降级卡片
- [ ] 避免继续出现 toast 一闪而过、页面却没有明确状态的情况
- [ ] 保持 `tailchat-admin build` 通过

### Task 2: 移动端 WebView 继续修窄屏主路径

**Files:**
- Modify: `client/web/src/components/Panel/common/Header.tsx`
- Modify: `client/web/src/components/ChatBox/ChatMessageList/Item.tsx`
- Modify: `client/web/src/components/ChatBox/ChatReply.tsx`
- Modify: `client/web/src/routes/Main/Navbar/index.tsx`

- [ ] 补齐消息头部、回复条、消息项在窄屏下的文本截断和容器约束
- [ ] 继续减少横向撑出视口的问题
- [ ] 保持 `client/web` 类型检查和构建通过

### Task 3: 通话体验继续从“会议感”收口为“应用内通话感”

**Files:**
- Modify: `server/plugins/com.msgbyte.livekit/web/plugins/com.msgbyte.livekit/src/panel/LivekitMeetingPanel.tsx`
- Modify: `server/plugins/com.msgbyte.livekit/web/plugins/com.msgbyte.livekit/src/components/InviteCallNotification.tsx`
- Modify: `server/plugins/com.msgbyte.livekit/web/plugins/com.msgbyte.livekit/src/components/LivekitView.tsx`

- [ ] 让通话面板的标题、空状态、接听路径更像会话内通话
- [ ] 尽量弱化“会议房间 / 外部链接”的感知
- [ ] 保持整仓构建通过

### Task 4: 财讯化视觉第一阶段

**Files:**
- Modify: `client/web/src/routes/Main/Navbar/*.tsx`
- Modify: `client/web/src/routes/Main/Content/Personal/Sidebar.tsx`
- Modify: `client/web/src/routes/Main/Content/Groups/index.tsx`
- Modify: `server/admin/src/client/App.tsx`

- [ ] 在不破坏交互收口的前提下，开始统一颜色、图标和视觉语言
- [ ] 方向为“接近微信的清晰度 + 财讯品牌感”
- [ ] 避免过重装饰和无必要的视觉噪音

### Task 5: 记录与版本线

**Files:**
- Modify: `CHANGELOG.md`
- Modify: `docs/2026-05-01-structure-capability-audit.md`

- [ ] 持续记录已落地的结构改造和能力变化
- [ ] 在达到稳定检查点时准备新 tag
