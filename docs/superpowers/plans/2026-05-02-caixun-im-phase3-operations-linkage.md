# 財訊 IM Phase 3 Operations Linkage Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 继续强化“内容互动 -> 群承接 -> 账号读取上下文 -> 继续运营动作”的运营链路，让財訊 IM 更适合持续自动化运营。

**Architecture:** 在 Phase 2 既有 feed detail、user feed 和 `openapi.account` 基础上继续增量扩展。前台只增强必要的动态视图和群头部承接；服务端补上下文读取类 action，并通过 `openapi.account` 统一暴露。

**Tech Stack:** React、React Router、Tailwind、TypeScript、TcService、Typegoose、Jest、pnpm monorepo

---

### Task 1: 动态视图与互动状态增强

**Files:**
- Modify: `client/web/src/routes/Main/Content/Feed/index.tsx`
- Modify: `client/web/src/routes/Main/Content/Feed/FeedDetail.tsx`
- Modify: `client/web/src/routes/Main/Content/Feed/FeedCard.tsx`

- [ ] 增加全部动态 / 我的动态视图切换
- [ ] 动态详情页展示评论数和点赞数
- [ ] 评论新增后即时更新统计
- [ ] 运行 `pnpm --dir /workspace/tailchat-source/client/web check:type`
- [ ] 提交：`feat(client): enhance feed operation views`

### Task 2: 群头部承接增强

**Files:**
- Modify: `client/web/src/routes/Main/Content/Group/GroupHeader.tsx`

- [ ] 让群头部直接展示更明显的群说明 / 公告摘要
- [ ] 保持现有权限菜单不受影响
- [ ] 运行 `pnpm --dir /workspace/tailchat-source/client/web check:type`
- [ ] 提交：`feat(client): surface group announcement summary`

### Task 3: 扩展上下文读取类服务动作

**Files:**
- Modify: `server/services/core/feed/feed.service.ts`
- Modify: `server/services/core/group/group.service.ts`
- Modify: `server/services/openapi/account.service.ts`
- Modify: `server/test/integration/openapi/account.spec.ts`

- [ ] 增加 `feed.listPostComments`
- [ ] 增加 `feed.likePost` 的 facade 暴露
- [ ] 增加 `group.listGroupMembers`
- [ ] 增加 `openapi.account.getConversationDetail`
- [ ] 增加 `openapi.account.listConversationMessages`
- [ ] 回跑 `pnpm --dir /workspace/tailchat-source/server test -- openapi/account.spec.ts`
- [ ] 提交：`feat(openapi): add context reading actions`

### Task 4: 文档与最终验证

**Files:**
- Modify: `CHANGELOG.md`
- Modify: `docs/2026-05-01-structure-capability-audit.md`

- [ ] 更新第三阶段进展记录
- [ ] 运行：
  - `pnpm --dir /workspace/tailchat-source/client/web check:type`
  - `pnpm --dir /workspace/tailchat-source/server check:type`
  - `pnpm --dir /workspace/tailchat-source/server test -- openapi/account.spec.ts`
  - `pnpm --dir /workspace/tailchat-source/website build`
  - `pnpm --dir /workspace/tailchat-source build`
- [ ] 提交：`chore: close out caixun im phase 3 operations linkage`
