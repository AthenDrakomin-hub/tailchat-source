# Desktop Workspace Web Mainstage Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 增强 desktop 当前工作区在主窗中的存在感，并继续统一 web 私信聊天主场表达。

**Architecture:** Desktop 端继续在主进程菜单层扩展当前工作区相关信息与操作；web 端在聊天主场增加统一提示条，不改变消息数据流与发送逻辑。

**Tech Stack:** Electron、React、TypeScript、pnpm monorepo

---

### Task 1: 增强 Desktop 当前工作区表达

**Files:**
- Modify: `client/desktop/src/main/menu.ts`

- [ ] 增加当前工作区信息与操作表达
- [ ] 运行 `pnpm --dir /workspace/tailchat-source/client/desktop build`
- [ ] 提交：`feat(desktop): refine current workspace actions`

### Task 2: 统一 Web 聊天主场提示

**Files:**
- Modify: `client/web/src/components/ChatBox/index.tsx`

- [ ] 增加统一聊天主场提示条
- [ ] 运行 `pnpm --dir /workspace/tailchat-source/client/web check:type`
- [ ] 提交：`feat(web): unify converse stage hints`

### Task 3: 文档与最终验证

**Files:**
- Modify: `CHANGELOG.md`
- Modify: `docs/2026-05-01-structure-capability-audit.md`

- [ ] 更新本轮客户端记录
- [ ] 运行：
  - `pnpm --dir /workspace/tailchat-source/client/desktop build`
  - `pnpm --dir /workspace/tailchat-source/client/web check:type`
  - `pnpm --dir /workspace/tailchat-source build`
- [ ] 提交：`chore: close out desktop workspace web mainstage`
