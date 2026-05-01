# Phase 3 Product Path Refinement Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在第二阶段完成管理端稳态、窄屏修补和第一批视觉统一后，继续把产品主路径、通话一致性和主区体验推进到更像成熟 IM 的层级。

**Architecture:** 第三阶段聚焦“产品路径清晰度”而不是继续铺更多页面。优先统一客户端个人区的会话语义、保留旧路由兼容、继续弱化插件感，并把零散页面统一到同一套主区语言。

**Tech Stack:** React、React Router、Tailwind、Tailchat shared hooks、LiveKit plugin、Tushan Admin

---

### Task 1: 个人区 DM 主路径继续收口

**Files:**
- Add: `client/web/src/utils/personal-route.ts`
- Modify: `client/web/src/routes/Main/Content/Personal/index.tsx`
- Modify: `client/web/src/routes/Main/Content/Personal/Sidebar.tsx`
- Modify: `client/web/src/routes/Main/Content/Personal/SidebarDMItem.tsx`
- Modify: `client/web/src/routes/Main/Content/Personal/Friends/FriendList.tsx`
- Modify: `client/web/src/components/modals/CreateDMConverse.tsx`
- Modify: `client/web/src/components/QuickSwitcher/useQuickSwitcherAllAction.ts`
- Modify: `client/web/src/components/JumpToButton.tsx`
- Modify: `client/web/src/components/popover/UserPopover/GroupUserPopover.tsx`

- [ ] 将主客户端 DM 路径从旧的 `converse` 语义继续收口为更明确的 `chats`
- [ ] 保留旧路径兼容跳转，避免历史收藏链接与旧入口失效
- [ ] 保持 `client/web` 类型检查和构建通过

### Task 2: 会话内体验继续去插件感

**Files:**
- Modify: `server/plugins/com.msgbyte.livekit/web/plugins/com.msgbyte.livekit/src/components/lib/Chat.tsx`
- Modify: `server/plugins/com.msgbyte.livekit/web/plugins/com.msgbyte.livekit/src/components/lib/ParticipantList.tsx`
- Modify: `server/plugins/com.msgbyte.livekit/web/plugins/com.msgbyte.livekit/src/components/lib/VideoConference.tsx`

- [ ] 弱化默认会议组件感过重的区域
- [ ] 让通话中的附属区域更像会话内工具面板
- [ ] 保持整仓构建通过

### Task 3: 主区剩余页面继续统一

**Files:**
- Modify: `client/web/src/components/NotFound.tsx`
- Modify: `client/web/src/components/Problem.tsx`
- Modify: `client/web/src/routes/Main/Content/Personal/**/*.tsx`
- Modify: `client/web/src/routes/Main/Content/Group/**/*.tsx`
- Modify: `client/web/src/routes/Main/Content/Inbox/**/*.tsx`

- [ ] 继续减少主区内部不同页面之间的割裂感
- [ ] 统一内容边距、占位组件、标题与列表层级
- [ ] 避免引入新的窄屏溢出

### Task 4: 记录与阶段检查点

**Files:**
- Modify: `CHANGELOG.md`
- Modify: `docs/2026-05-01-structure-capability-audit.md`

- [ ] 持续记录第三阶段的结构收口
- [ ] 在阶段稳定时准备下一次检查点
