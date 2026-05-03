# Desktop Reconnect Mobile Stability Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为 desktop 当前工作区增加重连动作，并为 mobile 恢复后增加持续稳定状态表达。

**Architecture:** Desktop 端继续扩展主进程菜单和现有重连链路；mobile 端继续在 `AppMain` 内扩展稳定状态展示，不改变 WebView 主体结构。

**Tech Stack:** Electron、React Native、TypeScript、pnpm monorepo

---

### Task 1: 增强 Desktop 当前工作区重连

**Files:**
- Modify: `client/desktop/src/main/menu.ts`
- Modify: `client/desktop/src/main/main.ts`

- [ ] 增加当前工作区重连动作
- [ ] 运行 `pnpm --dir /workspace/tailchat-source/client/desktop build`

### Task 2: 增强 Mobile 稳定状态表达

**Files:**
- Modify: `client/mobile/src/AppMain.tsx`

- [ ] 增强恢复后的稳定状态展示
- [ ] 运行 `yarn tsc --noEmit -p tsconfig.json`

### Task 3: 文档与最终验证

**Files:**
- Modify: `CHANGELOG.md`
- Modify: `docs/2026-05-01-structure-capability-audit.md`

- [ ] 更新本轮客户端记录
- [ ] 运行：
  - `pnpm --dir /workspace/tailchat-source/client/desktop build`
  - `yarn tsc --noEmit -p tsconfig.json` in `client/mobile`
  - `pnpm --dir /workspace/tailchat-source build`
