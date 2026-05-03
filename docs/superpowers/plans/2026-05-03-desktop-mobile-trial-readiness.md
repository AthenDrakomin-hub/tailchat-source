# Desktop Mobile Trial Readiness Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 补齐 desktop 与 mobile 进入试运营阶段前最后一批高价值支持能力与运营文档。

**Architecture:** Desktop 端在现有启动器中增加试运营支持模块；mobile 端在入口页增加起步与支持模块；文档层补齐两端独立试运营上线清单。

**Tech Stack:** Electron、React Native、TypeScript、pnpm monorepo

---

### Task 1: 增强 Desktop 试运营支持中心

**Files:**
- Modify: `client/desktop/src/renderer/App.tsx`
- Modify: `client/desktop/src/renderer/App.css`

- [ ] 增加 desktop 试运营支持区
- [ ] 增加帮助动作入口
- [ ] 运行 `pnpm --dir /workspace/tailchat-source/client/desktop build`

### Task 2: 增强 Mobile 试运营入口指引

**Files:**
- Modify: `client/mobile/src/Entry.tsx`

- [ ] 增加 mobile 试运营起步建议与帮助动作
- [ ] 运行 `yarn tsc --noEmit -p tsconfig.json`

### Task 3: 补齐运营文档与最终验证

**Files:**
- Create: `docs/2026-05-03-desktop-trial-launch-checklist.md`
- Create: `docs/2026-05-03-mobile-trial-launch-checklist.md`
- Modify: `CHANGELOG.md`
- Modify: `docs/2026-05-01-structure-capability-audit.md`

- [ ] 补齐两端试运营清单
- [ ] 更新本轮记录
- [ ] 运行：
  - `pnpm --dir /workspace/tailchat-source/client/desktop build`
  - `yarn tsc --noEmit -p tsconfig.json` in `client/mobile`
  - `pnpm --dir /workspace/tailchat-source build`
