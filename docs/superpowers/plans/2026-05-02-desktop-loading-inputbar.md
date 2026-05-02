# Desktop Loading Inputbar Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 提升 desktop 主窗加载工作区时的状态反馈，并增强 web 聊天输入区的稳定感与操作提示。

**Architecture:** Desktop 端只在主进程窗口事件中增加标题与进度反馈，不改窗口结构；web 端仅增强输入区下方辅助提示，不改发送逻辑。

**Tech Stack:** React、TypeScript、Electron、pnpm monorepo

---

### Task 1: 增强 Desktop 主窗加载反馈

**Files:**
- Modify: `client/desktop/src/main/main.ts`

- [ ] 为主窗加载流程增加标题反馈
- [ ] 为主窗加载流程增加进度反馈
- [ ] 运行 `pnpm --dir /workspace/tailchat-source/client/desktop build`
- [ ] 提交：`feat(desktop): add main window loading feedback`

### Task 2: 增强 Web 聊天输入区稳定感

**Files:**
- Modify: `client/web/src/components/ChatBox/ChatInputBox/index.tsx`

- [ ] 为输入区增加辅助提示栏
- [ ] 运行 `pnpm --dir /workspace/tailchat-source/client/web check:type`
- [ ] 提交：`feat(web): refine chat inputbar guidance`

### Task 3: 文档与最终验证

**Files:**
- Modify: `CHANGELOG.md`
- Modify: `docs/2026-05-01-structure-capability-audit.md`

- [ ] 更新本轮客户端记录
- [ ] 运行：
  - `pnpm --dir /workspace/tailchat-source/client/desktop build`
  - `pnpm --dir /workspace/tailchat-source/client/web check:type`
  - `pnpm --dir /workspace/tailchat-source build`
- [ ] 提交：`chore: close out desktop loading inputbar`
