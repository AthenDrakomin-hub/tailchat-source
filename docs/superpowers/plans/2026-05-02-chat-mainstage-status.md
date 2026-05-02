# Chat Mainstage Status Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 继续增强 web 私信会话主场和 mobile 当前工作区壳层状态反馈，让客户端更像适合长期使用的产品。

**Architecture:** Web 端仅增强私信会话标题区与空会话信息层级；mobile 端继续基于现有 WebView 容器增强状态反馈，不新增原生网络依赖。

**Tech Stack:** React、TypeScript、React Native、WebView、pnpm monorepo

---

### Task 1: 增强 Web 聊天主场信息层级

**Files:**
- Modify: `client/web/src/components/Panel/personal/ConversePanel.tsx`
- Modify: `client/web/src/components/ChatBox/index.tsx`

- [ ] 为私信会话头部补辅助说明
- [ ] 继续收紧空会话聊天起始态
- [ ] 运行 `pnpm --dir /workspace/tailchat-source/client/web check:type`
- [ ] 提交：`feat(web): refine converse stage presentation`

### Task 2: 增强 Mobile 状态反馈表达

**Files:**
- Modify: `client/mobile/src/AppMain.tsx`

- [ ] 增加更明确的状态提示文案
- [ ] 增加恢复加载时的反馈
- [ ] 运行 `yarn tsc --noEmit -p tsconfig.json`
- [ ] 提交：`feat(mobile): refine shell status messaging`

### Task 3: 文档与最终验证

**Files:**
- Modify: `CHANGELOG.md`
- Modify: `docs/2026-05-01-structure-capability-audit.md`

- [ ] 更新本轮客户端记录
- [ ] 运行：
  - `pnpm --dir /workspace/tailchat-source/client/web check:type`
  - `yarn tsc --noEmit -p tsconfig.json` in `client/mobile`
  - `pnpm --dir /workspace/tailchat-source build`
- [ ] 提交：`chore: close out chat mainstage status`
