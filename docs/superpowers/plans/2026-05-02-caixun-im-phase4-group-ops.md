# 財訊 IM Phase 4 Group Operations Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 继续强化群运营上下文读取和群关联内容承接，让动态详情与群运营能力连接得更自然。

**Architecture:** 在现有 `openapi.account` 基础上继续增量扩展，复用 `group.getGroupLobbyConverseId` 与 `chat.message.fetchConverseMessage` 组合出群最近消息读取能力。客户端仅在动态详情页补群摘要卡片，不引入新的复杂页面。

**Tech Stack:** React、TypeScript、Tailwind、TcService、Jest、pnpm monorepo

---

### Task 1: 扩展群运营显式接口

**Files:**
- Modify: `server/services/openapi/account.service.ts`
- Modify: `server/test/integration/openapi/account.spec.ts`

- [ ] 增加 `getGroupAnnouncement`
- [ ] 增加 `getGroupLobbyConversation`
- [ ] 增加 `listGroupRecentMessages`
- [ ] 回跑 `pnpm --dir /workspace/tailchat-source/server test -- openapi/account.spec.ts`
- [ ] 提交：`feat(openapi): add group operations context actions`

### Task 2: 动态详情补群摘要卡片

**Files:**
- Modify: `client/web/src/routes/Main/Content/Feed/FeedDetail.tsx`
- Modify: `client/shared/model/group.ts` 或复用既有 group basic info 能力

- [ ] 在动态详情页展示关联群摘要卡片
- [ ] 卡片包含群名称、成员数量、群说明摘要与进入群按钮
- [ ] 运行 `pnpm --dir /workspace/tailchat-source/client/web check:type`
- [ ] 提交：`feat(client): add related group summary card`

### Task 3: 文档与最终验证

**Files:**
- Modify: `CHANGELOG.md`
- Modify: `docs/2026-05-01-structure-capability-audit.md`

- [ ] 更新第四阶段进展记录
- [ ] 运行：
  - `pnpm --dir /workspace/tailchat-source/client/web check:type`
  - `pnpm --dir /workspace/tailchat-source/server check:type`
  - `pnpm --dir /workspace/tailchat-source/server test -- openapi/account.spec.ts`
  - `pnpm --dir /workspace/tailchat-source/website build`
  - `pnpm --dir /workspace/tailchat-source build`
- [ ] 提交：`chore: close out caixun im phase 4 group ops`
