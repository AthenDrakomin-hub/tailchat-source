# 財訊 IM Phase 7 Group Summary Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 把群运营上下文进一步收口成可直接用于决策的摘要接口，并增强动态详情中对群活跃度的判断提示。

**Architecture:** 服务端在已有 `getGroupOperationsContext` 基础上做轻聚合，导出 `getGroupOperationsSummary`。客户端继续增强 `FeedDetail` 中的群摘要卡片，只增加活跃时间和状态提示，不扩复杂交互。

**Tech Stack:** React、TypeScript、Tailwind、TcService、Jest、pnpm monorepo

---

### Task 1: 增加群运营摘要接口

**Files:**
- Modify: `server/services/openapi/account.service.ts`
- Modify: `server/test/integration/openapi/account.spec.ts`

- [ ] 增加 `getGroupOperationsSummary`
- [ ] 回跑 `pnpm --dir /workspace/tailchat-source/server test -- openapi/account.spec.ts`
- [ ] 提交：`feat(openapi): add group operations summary`

### Task 2: 增强动态详情群活跃判断

**Files:**
- Modify: `client/web/src/routes/Main/Content/Feed/FeedDetail.tsx`

- [ ] 展示最近活跃时间
- [ ] 无消息时展示更明确静态状态
- [ ] 强化参与提示文案
- [ ] 运行 `pnpm --dir /workspace/tailchat-source/client/web check:type`
- [ ] 提交：`feat(client): improve group activity cues`

### Task 3: 文档与最终验证

**Files:**
- Modify: `CHANGELOG.md`
- Modify: `docs/2026-05-01-structure-capability-audit.md`

- [ ] 更新第七阶段进展记录
- [ ] 运行：
  - `pnpm --dir /workspace/tailchat-source/client/web check:type`
  - `pnpm --dir /workspace/tailchat-source/server check:type`
  - `pnpm --dir /workspace/tailchat-source/server test -- openapi/account.spec.ts`
  - `pnpm --dir /workspace/tailchat-source/website build`
  - `pnpm --dir /workspace/tailchat-source build`
- [ ] 提交：`chore: close out caixun im phase 7 group summary`
