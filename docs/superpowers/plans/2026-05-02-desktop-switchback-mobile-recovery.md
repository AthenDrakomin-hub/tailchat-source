# Desktop Switchback Mobile Recovery Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为 desktop 主窗增加主动返回工作区选择入口，并为 mobile 恢复成功增加更可感知的完成反馈。

**Architecture:** Desktop 端只在主进程增加一个返回选择器入口并复用现有欢迎窗口；mobile 端继续在 AppMain 内扩展恢复成功反馈，不引入新 UI 基础设施。

**Tech Stack:** Electron、React Native、TypeScript、pnpm monorepo

---

### Task 1: 增强 Desktop 主动返回工作区选择

**Files:**
- Modify: `client/desktop/src/main/main.ts`

- [ ] 增加返回工作区选择入口
- [ ] 运行 `pnpm --dir /workspace/tailchat-source/client/desktop build`
- [ ] 提交：`feat(desktop): add switchback to workspace selector`

### Task 2: 增强 Mobile 恢复完成反馈

**Files:**
- Modify: `client/mobile/src/AppMain.tsx`

- [ ] 增加恢复成功反馈
- [ ] 运行 `yarn tsc --noEmit -p tsconfig.json`
- [ ] 提交：`feat(mobile): add recovery completion feedback`

### Task 3: 文档与最终验证

**Files:**
- Modify: `CHANGELOG.md`
- Modify: `docs/2026-05-01-structure-capability-audit.md`

- [ ] 更新本轮客户端记录
- [ ] 运行：
  - `pnpm --dir /workspace/tailchat-source/client/desktop build`
  - `yarn tsc --noEmit -p tsconfig.json` in `client/mobile`
  - `pnpm --dir /workspace/tailchat-source build`
- [ ] 提交：`chore: close out desktop switchback mobile recovery`
