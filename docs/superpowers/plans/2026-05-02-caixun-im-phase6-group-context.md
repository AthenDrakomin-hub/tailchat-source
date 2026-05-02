# 財訊 IM Phase 6 Group Context Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 强化动态详情到群的承接可信度，并为运营账号提供一次性群上下文打包接口。

**Architecture:** 服务端在 `openapi.account` 上聚合现有群与消息读取能力，提供 `getGroupOperationsContext`。客户端仅增强动态详情里的关联群卡片，补发送者、时间和更明确的进群提示，不增加新页面。

**Tech Stack:** React、TypeScript、Tailwind、TcService、Jest、pnpm monorepo

---

### Task 1: 增加群上下文打包接口

**Files:**
- Modify: `server/services/openapi/account.service.ts`
- Modify: `server/test/integration/openapi/account.spec.ts`

- [ ] 增加 `getGroupOperationsContext`
- [ ] 回跑 `pnpm --dir /workspace/tailchat-source/server test -- openapi/account.spec.ts`
- [ ] 提交：`feat(openapi): add group operations context bundle`

### Task 2: 动态详情增强群消息预览表达

**Files:**
- Modify: `client/web/src/routes/Main/Content/Feed/FeedDetail.tsx`

- [ ] 为群最近消息预览补发送者昵称
- [ ] 为群最近消息预览补时间
- [ ] 增加“去群里参与讨论”行动提示
- [ ] 运行 `pnpm --dir /workspace/tailchat-source/client/web check:type`
- [ ] 提交：`feat(client): enrich related group message preview`

### Task 3: 文档与最终验证

**Files:**
- Modify: `CHANGELOG.md`
- Modify: `docs/2026-05-01-structure-capability-audit.md`

- [ ] 更新第六阶段进展记录
- [ ] 运行：
  - `pnpm --dir /workspace/tailchat-source/client/web check:type`
  - `pnpm --dir /workspace/tailchat-source/server check:type`
  - `pnpm --dir /workspace/tailchat-source/server test -- openapi/account.spec.ts`
  - `pnpm --dir /workspace/tailchat-source/website build`
  - `pnpm --dir /workspace/tailchat-source build`
- [ ] 提交：`chore: close out caixun im phase 6 group context`
