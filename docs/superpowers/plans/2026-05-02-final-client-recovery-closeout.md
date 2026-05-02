# Final Client Recovery Closeout Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 完成 desktop 当前工作区操作和 mobile 恢复完成反馈节奏这两项最后一轮客户端恢复体验收口。

**Architecture:** Desktop 端通过主进程菜单暴露当前工作区操作并复用现有欢迎窗口；mobile 端继续在 `AppMain` 内扩展恢复成功反馈节奏，不引入新 UI 基础设施。

**Tech Stack:** Electron、React Native、TypeScript、pnpm monorepo

---

### Task 1: 增强 Desktop 当前工作区操作

**Files:**
- Modify: `client/desktop/src/main/menu.ts`
- Modify: `client/desktop/src/main/main.ts`

- [ ] 增加主窗当前工作区操作入口
- [ ] 运行 `pnpm --dir /workspace/tailchat-source/client/desktop build`
- [ ] 提交：`feat(desktop): add current workspace actions`

### Task 2: 增强 Mobile 恢复完成反馈节奏

**Files:**
- Modify: `client/mobile/src/AppMain.tsx`

- [ ] 增加恢复成功提示并区分首次加载
- [ ] 运行 `yarn tsc --noEmit -p tsconfig.json`
- [ ] 提交：`feat(mobile): refine recovery completion cadence`

### Task 3: 文档与最终验证

**Files:**
- Modify: `CHANGELOG.md`
- Modify: `docs/2026-05-01-structure-capability-audit.md`

- [ ] 更新本轮客户端记录
- [ ] 运行：
  - `pnpm --dir /workspace/tailchat-source/client/desktop build`
  - `yarn tsc --noEmit -p tsconfig.json` in `client/mobile`
  - `pnpm --dir /workspace/tailchat-source build`
- [ ] 提交：`chore: close out final client recovery`
