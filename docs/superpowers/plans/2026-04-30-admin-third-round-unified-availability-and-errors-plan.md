# Admin Third-Round Unified Availability And Errors Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为管理端建立统一能力状态类型，并把站点配置与后端关键错误返回收敛为结构化协议。

**Architecture:** 保持最小改动策略，不改现有整体框架，只补一个共享 `FeatureState` 类型，收口 `站点配置` 错误处理，并统一后端 `auth`、`file`、`config` 三条关键链路的错误返回结构。继续以 Node 原生测试和前端构建作为验收。

**Tech Stack:** React, TypeScript, Express, Node.js test runner, Vite

---

## 文件边界

**Create**
- `server/admin/src/client/utils/feature-state.ts`

**Modify**
- `server/admin/src/client/routes/system/index.tsx`
- `server/admin/src/server/middleware/auth.ts`
- `server/admin/src/server/router/file.ts`
- `server/admin/src/server/router/config.ts`
- `server/admin/tests/admin-hardening.test.mjs`

**Verify**
- `node --test server/admin/tests/admin-hardening.test.mjs`
- `pnpm --filter tailchat-admin build:client`
