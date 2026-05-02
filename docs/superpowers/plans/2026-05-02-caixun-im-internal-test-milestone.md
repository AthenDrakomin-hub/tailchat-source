# 財訊 IM Internal Test Milestone Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将当前主线推进到可内测状态，重点补齐群摘要信号、动态到群动作闭环、会话轻角色识别和动态详情承接收口。

**Architecture:** 服务端在 `openapi.account` 上继续增量扩展，围绕现有群摘要与 feed/group 链路增加信号字段和最小动作闭环。客户端仅在现有消息列表和动态详情群卡片上补轻量识别与承接状态，不新增复杂页面。

**Tech Stack:** React、TypeScript、Tailwind、TcService、Jest、pnpm monorepo

---

### Task 1: 增强群运营摘要与 feed 到群动作闭环

**Files:**
- Modify: `server/services/openapi/account.service.ts`
- Modify: `server/test/integration/openapi/account.spec.ts`

- [ ] 增加群摘要信号字段
- [ ] 增加 `sendFeedRelatedGroupMessage`
- [ ] 回跑 `pnpm --dir /workspace/tailchat-source/server test -- openapi/account.spec.ts`
- [ ] 提交：`feat(openapi): add internal test linkage actions`

### Task 2: 会话轻角色识别与动态详情承接收口

**Files:**
- Modify: `client/web/src/routes/Main/Content/SidebarItem.tsx`
- Modify: `client/web/src/routes/Main/Content/Personal/SidebarDMItem.tsx`
- Modify: `client/web/src/routes/Main/Content/Feed/FeedDetail.tsx`

- [ ] 为消息列表增加轻量角色标签
- [ ] 用摘要信号收紧动态详情群卡片状态文案
- [ ] 运行 `pnpm --dir /workspace/tailchat-source/client/web check:type`
- [ ] 提交：`feat(client): refine internal test interactions`

### Task 3: 文档与最终验证

**Files:**
- Modify: `CHANGELOG.md`
- Modify: `docs/2026-05-01-structure-capability-audit.md`

- [ ] 更新可内测里程碑进展
- [ ] 运行：
  - `pnpm --dir /workspace/tailchat-source/client/web check:type`
  - `pnpm --dir /workspace/tailchat-source/server check:type`
  - `pnpm --dir /workspace/tailchat-source/server test -- openapi/account.spec.ts`
  - `pnpm --dir /workspace/tailchat-source/website build`
  - `pnpm --dir /workspace/tailchat-source build`
- [ ] 提交：`chore: close out internal test milestone`
