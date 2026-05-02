# 財訊 IM Phase 5 Group Lobby Linkage Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 强化动态内容与群大厅之间的联动，让用户能先看到群最近氛围，账号也能直接向群大厅发言。

**Architecture:** 服务端在 `openapi.account` 上继续封装群大厅发送动作；客户端在动态详情页的关联群摘要卡片中增加最近消息预览，复用现有群大厅会话和消息读取能力，不新增复杂页面。

**Tech Stack:** React、TypeScript、Tailwind、TcService、Jest、pnpm monorepo

---

### Task 1: 增加群大厅直发接口

**Files:**
- Modify: `server/services/openapi/account.service.ts`
- Modify: `server/test/integration/openapi/account.spec.ts`

- [ ] 增加 `sendGroupLobbyMessage`
- [ ] 回跑 `pnpm --dir /workspace/tailchat-source/server test -- openapi/account.spec.ts`
- [ ] 提交：`feat(openapi): add send group lobby message action`

### Task 2: 动态详情补群最近消息预览

**Files:**
- Modify: `client/shared/model/group.ts`
- Modify: `client/shared/index.tsx`
- Modify: `client/web/src/routes/Main/Content/Feed/FeedDetail.tsx`

- [ ] 暴露群大厅会话读取能力
- [ ] 动态详情卡片中显示最近消息预览
- [ ] 运行 `pnpm --dir /workspace/tailchat-source/client/web check:type`
- [ ] 提交：`feat(client): preview group lobby messages in feed detail`

### Task 3: 文档与最终验证

**Files:**
- Modify: `CHANGELOG.md`
- Modify: `docs/2026-05-01-structure-capability-audit.md`

- [ ] 更新第五阶段进展记录
- [ ] 运行：
  - `pnpm --dir /workspace/tailchat-source/client/web check:type`
  - `pnpm --dir /workspace/tailchat-source/server check:type`
  - `pnpm --dir /workspace/tailchat-source/server test -- openapi/account.spec.ts`
  - `pnpm --dir /workspace/tailchat-source/website build`
  - `pnpm --dir /workspace/tailchat-source build`
- [ ] 提交：`chore: close out caixun im phase 5 group lobby linkage`
