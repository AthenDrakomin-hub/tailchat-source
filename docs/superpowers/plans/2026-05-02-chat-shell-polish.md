# Chat Shell Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 提升 web 会话主路径可理解性，并补齐 mobile WebView 原生壳的基础导航与反馈。

**Architecture:** Web 端只增强个人消息侧栏空状态和联系人页引导，不调整现有聊天路由；mobile 端继续保留 WebView 主体，但增强返回、加载、错误和重试等原生容器行为。

**Tech Stack:** React、TypeScript、React Native、WebView、pnpm monorepo

---

### Task 1: 增强 Web 会话主路径

**Files:**
- Modify: `client/web/src/routes/Main/Content/Personal/Sidebar.tsx`
- Modify: `client/web/src/routes/Main/Content/Personal/Friends/index.tsx`

- [ ] 为最近聊天空状态补引导
- [ ] 为联系人页顶部补说明卡片
- [ ] 运行 `pnpm --dir /workspace/tailchat-source/client/web check:type`
- [ ] 提交：`feat(web): improve chat mainflow guidance`

### Task 2: 增强 Mobile 原生壳反馈

**Files:**
- Modify: `client/mobile/src/AppMain.tsx`

- [ ] 增加返回能力
- [ ] 增加加载反馈
- [ ] 增加错误提示和重试
- [ ] 运行 `yarn tsc --noEmit -p tsconfig.json`
- [ ] 提交：`feat(mobile): improve shell feedback states`

### Task 3: 文档与最终验证

**Files:**
- Modify: `CHANGELOG.md`
- Modify: `docs/2026-05-01-structure-capability-audit.md`

- [ ] 更新本轮客户端收口记录
- [ ] 运行：
  - `pnpm --dir /workspace/tailchat-source/client/web check:type`
  - `yarn tsc --noEmit -p tsconfig.json` in `client/mobile`
  - `pnpm --dir /workspace/tailchat-source build`
- [ ] 提交：`chore: close out chat shell polish`
