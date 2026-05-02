# Client Readiness Milestone Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将项目推进到更适合内部用户直接体验的客户端优先状态，重点增强 web、desktop、mobile 与 downloads 页的入口表达。

**Architecture:** 仅在现有客户端入口层和官网分发页做增量优化，不改动底层通讯架构。Web 端负责承担主入口，desktop/mobile 端负责承担明确的客户端定位和内测引导。

**Tech Stack:** React、TypeScript、React Native、Electron、Docusaurus、pnpm monorepo

---

### Task 1: 优化 desktop 与 mobile 入口体验

**Files:**
- Modify: `client/desktop/src/renderer/App.tsx`
- Modify: `client/desktop/src/renderer/App.css`
- Modify: `client/desktop/src/renderer/ServerItem.tsx`
- Modify: `client/desktop/src/renderer/ServerItem.css`
- Modify: `client/mobile/src/Entry.tsx`

- [ ] 将 desktop 启动器收口为財訊桌面客户端入口
- [ ] 将 mobile 入口页收口为更像真实客户端的入口页
- [ ] 运行 desktop 构建验证
- [ ] 运行 mobile TypeScript 验证
- [ ] 提交：`feat(client): refine desktop and mobile entry experience`

### Task 2: 优化 website downloads 与 web 登录导流

**Files:**
- Modify: `website/src/pages/downloads.tsx`
- Modify: `client/web/src/routes/Entry/LoginView.tsx`

- [ ] 将下载页改成更可信的分发页表达
- [ ] 为 web 登录页增加多端导流和内测说明
- [ ] 运行 `pnpm --dir /workspace/tailchat-source/website build`
- [ ] 运行 `pnpm --dir /workspace/tailchat-source/client/web check:type`
- [ ] 提交：`feat(client): refine downloads and login guidance`

### Task 3: 文档与最终验证

**Files:**
- Modify: `CHANGELOG.md`
- Modify: `docs/2026-05-01-structure-capability-audit.md`

- [ ] 更新客户端优先里程碑记录
- [ ] 运行：
  - `pnpm --dir /workspace/tailchat-source/client/web check:type`
  - `pnpm --dir /workspace/tailchat-source/website build`
  - `pnpm --dir /workspace/tailchat-source/client/desktop build`
  - `npx tsc --noEmit -p /workspace/tailchat-source/client/mobile/tsconfig.json`
  - `pnpm --dir /workspace/tailchat-source build`
- [ ] 提交：`chore: close out client readiness milestone`
