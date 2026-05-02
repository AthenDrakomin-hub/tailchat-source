# Desktop Chat Continuity Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 提升 desktop 从选择工作区到进入主窗口的连续反馈，并继续收口 web 私信会话主场。

**Architecture:** Desktop 端仅在启动器渲染层增加进入中状态和反馈，不改主进程窗口结构；web 端仅增强私信会话头部和消息区起始提示，不改消息流实现。

**Tech Stack:** React、TypeScript、Electron、Ant Design、pnpm monorepo

---

### Task 1: 增强 Desktop 进入工作区连续反馈

**Files:**
- Modify: `client/desktop/src/renderer/App.tsx`
- Modify: `client/desktop/src/renderer/App.css`
- Modify: `client/desktop/src/renderer/ServerItem.tsx`
- Modify: `client/desktop/src/renderer/ServerItem.css`

- [ ] 为 desktop 启动器增加进入中状态
- [ ] 为工作区项增加连接中的视觉反馈
- [ ] 运行 `pnpm --dir /workspace/tailchat-source/client/desktop build`
- [ ] 提交：`feat(desktop): improve workspace entering continuity`

### Task 2: 收口 Web 私信会话主场

**Files:**
- Modify: `client/web/src/components/Panel/personal/ConversePanel.tsx`
- Modify: `client/web/src/components/ChatBox/index.tsx`

- [ ] 继续增强会话头部辅助信息
- [ ] 继续收口空会话起始提示
- [ ] 运行 `pnpm --dir /workspace/tailchat-source/client/web check:type`
- [ ] 提交：`feat(web): refine converse stage continuity`

### Task 3: 文档与最终验证

**Files:**
- Modify: `CHANGELOG.md`
- Modify: `docs/2026-05-01-structure-capability-audit.md`

- [ ] 更新本轮客户端记录
- [ ] 运行：
  - `pnpm --dir /workspace/tailchat-source/client/desktop build`
  - `pnpm --dir /workspace/tailchat-source/client/web check:type`
  - `pnpm --dir /workspace/tailchat-source build`
- [ ] 提交：`chore: close out desktop chat continuity`
