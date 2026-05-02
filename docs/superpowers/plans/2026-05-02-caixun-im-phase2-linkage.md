# 財訊 IM Phase 2 Linkage Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 强化“动态 -> 群 -> 账号控制”主链路，让动态成为可运营内容场、群组成为更强承接场，并让统一账号控制接口覆盖这条链路的关键动作。

**Architecture:** 基于 Phase 1 现有 feed service、FeedPage 和 `openapi.account` facade 继续增量增强，不推翻现有主导航和群结构。服务端优先补 `feed` 详情/用户动态/删除/评论列表，再在客户端补动态详情页、个人动态页与群导流，最后扩展 facade 把相关账号操作统一暴露。

**Tech Stack:** React、React Router、Tailwind、Jest、tailchat-shared、TcService、Typegoose、pnpm monorepo

---

### Task 1: 补强 feed 服务核心动作

**Files:**
- Modify: `server/services/core/feed/feed.service.ts`
- Create: `server/test/integration/feed/feed-detail.spec.ts`

- [ ] 增加 `getPostDetail`、`listUserPosts`、`removePost`、`listPostComments` action
- [ ] 运行服务端类型检查：`pnpm --dir /workspace/tailchat-source/server check:type`
- [ ] 提交：`feat(feed): add detail and user timeline actions`

### Task 2: 客户端动态详情与个人动态页

**Files:**
- Modify: `client/shared/model/feed.ts`
- Modify: `client/web/src/routes/Main/Content/Feed/index.tsx`
- Modify: `client/web/src/routes/Main/Content/Feed/FeedCard.tsx`
- Modify: `client/web/src/routes/Main/Content/Feed/FeedDetail.tsx`
- Create: `client/web/src/routes/Main/Content/Feed/UserFeedPage.tsx`
- Create: `client/web/src/routes/Main/Content/Feed/CommentList.tsx`
- Create: `client/web/src/routes/Main/Content/Feed/CommentComposer.tsx`

- [ ] 让动态卡片可进入详情页
- [ ] 让动态详情页展示正文、评论列表和评论发布
- [ ] 新增个人动态页 `/main/feed/user/:userId`
- [ ] 运行客户端测试与类型检查
- [ ] 提交：`feat(client): add feed detail and user feed pages`

### Task 3: 群组与动态导流增强

**Files:**
- Modify: `client/web/src/routes/Main/Content/Feed/FeedSidebar.tsx`
- Modify: `client/web/src/routes/Main/Content/Group/Sidebar.tsx`
- Modify: `client/web/src/routes/Main/Content/Feed/FeedCard.tsx`

- [ ] 在动态侧栏增加“推荐回到群组 / 当前群组视图”信息
- [ ] 在群侧栏保持“关联动态”入口并增强说明
- [ ] 动态卡片中展示发布者入口和群入口
- [ ] 运行 `pnpm --dir /workspace/tailchat-source/client/web build:ci`
- [ ] 提交：`feat(client): strengthen feed and group linkage`

### Task 4: 扩展 openapi.account 主链路接口

**Files:**
- Modify: `server/services/openapi/account.service.ts`
- Modify: `server/test/integration/openapi/account.spec.ts`

- [ ] 增加 `getFeedPostDetail`
- [ ] 增加 `listOwnFeedPosts`
- [ ] 增加 `commentFeedPost`
- [ ] 增加 `removeFeedPost`
- [ ] 增加 `getGroupDetail`
- [ ] 增加 `updateGroupAnnouncement`
- [ ] 回跑 `pnpm --dir /workspace/tailchat-source/server test -- openapi/account.spec.ts`
- [ ] 提交：`feat(openapi): extend account linkage actions`

### Task 5: 文档与最终验证

**Files:**
- Modify: `CHANGELOG.md`
- Modify: `docs/2026-05-01-structure-capability-audit.md`

- [ ] 更新第二阶段进展记录
- [ ] 运行：
  - `pnpm --dir /workspace/tailchat-source/client/web check:type`
  - `pnpm --dir /workspace/tailchat-source/client/web build:ci`
  - `pnpm --dir /workspace/tailchat-source/server check:type`
  - `pnpm --dir /workspace/tailchat-source/server test -- openapi/account.spec.ts`
  - `pnpm --dir /workspace/tailchat-source/website build`
  - `pnpm --dir /workspace/tailchat-source build`
- [ ] 提交：`chore: close out caixun im phase 2 linkage`
