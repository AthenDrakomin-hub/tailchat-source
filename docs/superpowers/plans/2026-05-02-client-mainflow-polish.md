# Client Mainflow Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 提升 web 与 mobile 的进入后主路径体验，让客户端更像真实产品而不是只完成入口切换。

**Architecture:** Web 端只增强动态首页、群组总览和通知未选中状态的第一屏表达；mobile 端继续维持 WebView 主体架构，但在原生层增加顶部导航和工作区切换能力。

**Tech Stack:** React、TypeScript、React Native、WebView、pnpm monorepo

---

### Task 1: 收口 Web 主路径第一屏

**Files:**
- Modify: `client/web/src/routes/Main/Content/Feed/index.tsx`
- Modify: `client/web/src/routes/Main/Content/Groups/index.tsx`
- Modify: `client/web/src/routes/Main/Content/Inbox/index.tsx`

- [ ] 增强动态首页顶部引导
- [ ] 增强群组总览未选择状态
- [ ] 增强通知页未选择状态
- [ ] 运行 `pnpm --dir /workspace/tailchat-source/client/web check:type`
- [ ] 提交：`feat(web): polish mainflow empty and guide states`

### Task 2: 收口 Mobile 进入后主路径

**Files:**
- Modify: `client/mobile/src/App.tsx`
- Modify: `client/mobile/src/AppMain.tsx`
- Modify: `client/mobile/src/store/server.ts`

- [ ] 为 mobile 主内容增加顶部原生栏
- [ ] 增加切换工作区入口
- [ ] 增加刷新能力
- [ ] 运行 `yarn tsc --noEmit -p tsconfig.json`
- [ ] 提交：`feat(mobile): add native shell topbar for app main`

### Task 3: 文档与最终验证

**Files:**
- Modify: `CHANGELOG.md`
- Modify: `docs/2026-05-01-structure-capability-audit.md`

- [ ] 更新客户端主路径收口记录
- [ ] 运行：
  - `pnpm --dir /workspace/tailchat-source/client/web check:type`
  - `yarn tsc --noEmit -p tsconfig.json` in `client/mobile`
  - `pnpm --dir /workspace/tailchat-source build`
- [ ] 提交：`chore: close out client mainflow polish`
