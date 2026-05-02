# Desktop Recovery Mobile Reload Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 提升 desktop 主窗加载失败后的恢复能力，并统一 mobile 刷新与重试的反馈流程。

**Architecture:** Desktop 端仅在主进程加载失败时增加原生恢复动作；mobile 端在现有 AppMain 中抽出统一的 reload/recover 流程，不改变 WebView 主体结构。

**Tech Stack:** Electron、React Native、TypeScript、pnpm monorepo

---

### Task 1: 增强 Desktop 主窗失败恢复

**Files:**
- Modify: `client/desktop/src/main/main.ts`

- [ ] 为主窗加载失败增加重试动作
- [ ] 为主窗加载失败增加返回工作区选择动作
- [ ] 运行 `pnpm --dir /workspace/tailchat-source/client/desktop build`
- [ ] 提交：`feat(desktop): add main window recovery actions`

### Task 2: 统一 Mobile 刷新与重试流程

**Files:**
- Modify: `client/mobile/src/AppMain.tsx`

- [ ] 抽出统一恢复流程
- [ ] 统一刷新和重试时的状态反馈
- [ ] 运行 `yarn tsc --noEmit -p tsconfig.json`
- [ ] 提交：`feat(mobile): unify reload and retry behavior`

### Task 3: 文档与最终验证

**Files:**
- Modify: `CHANGELOG.md`
- Modify: `docs/2026-05-01-structure-capability-audit.md`

- [ ] 更新本轮客户端记录
- [ ] 运行：
  - `pnpm --dir /workspace/tailchat-source/client/desktop build`
  - `yarn tsc --noEmit -p tsconfig.json` in `client/mobile`
  - `pnpm --dir /workspace/tailchat-source build`
- [ ] 提交：`chore: close out desktop recovery mobile reload`
