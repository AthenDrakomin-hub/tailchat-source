# Web Trial Readiness Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 把 web 端补成更适合直接进入试运营的主入口。

**Architecture:** 在现有 web 主区和设置页基础上，增量补齐试运营状态中心、起步引导和帮助入口，不改动消息/群组/动态等核心数据链路。

**Tech Stack:** React、TypeScript、Ant Design、pnpm monorepo

---

### Task 1: 增强试运营状态中心

**Files:**
- Modify: `client/web/src/components/modals/SettingsView/Status.tsx`

- [ ] 增加整体健康度总结
- [ ] 增加试运营帮助与下一步建议
- [ ] 运行 `pnpm --dir /workspace/tailchat-source/client/web check:type`

### Task 2: 增强主链路起步承接

**Files:**
- Modify: `client/web/src/routes/Main/Content/Personal/Friends/index.tsx`

- [ ] 增加试运营起步建议区域
- [ ] 引导至动态、群组、私信主链路
- [ ] 运行 `pnpm --dir /workspace/tailchat-source/client/web check:type`

### Task 3: 增强帮助入口与最终验证

**Files:**
- Modify: `client/web/src/components/modals/SettingsView/About.tsx`
- Modify: `CHANGELOG.md`
- Modify: `docs/2026-05-01-structure-capability-audit.md`

- [ ] 增加试运营帮助入口
- [ ] 更新本轮记录
- [ ] 运行：
  - `pnpm --dir /workspace/tailchat-source/client/web check:type`
  - `pnpm --dir /workspace/tailchat-source build`
