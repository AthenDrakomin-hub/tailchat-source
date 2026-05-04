# 财讯微信通知默认事件收敛 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 把微信通知客户端收敛成固定说明页，并让服务端默认只处理好友私信、语音电话来电、群组 `@所有人` 三类微信提醒。

**Architecture:** 客户端删除偏好和测试入口，只保留绑定与固定说明；服务端把通知事件统一为 `directMessage`、`voiceCall`、`mentionAll` 三类，并在 LiveKit 邀请动作与群消息事件中触发；保留免打扰校验，不再依赖客户端偏好字段。

**Tech Stack:** React、TypeScript、Jest、Tailchat Shared、Moleculer Service

---

### Task 1: 服务端默认通知事件

**Files:**
- Modify: `server/services/core/notify/wxnotify.helper.ts`
- Modify: `server/services/core/notify/wxnotify.service.ts`
- Modify: `server/services/core/notify/__tests__/wxnotify.spec.ts`
- Modify: `server/plugins/com.msgbyte.livekit/services/livekit.service.ts`

- [ ] 写失败测试，锁定 `mentionAll` / `voiceCall` / 默认规则
- [ ] 跑测试确认失败
- [ ] 实现默认事件判断与文案 helper
- [ ] 把 LiveKit 来电邀请接入微信通知
- [ ] 跑服务端测试和类型检查

### Task 2: 客户端微信通知页收敛

**Files:**
- Modify: `client/web/src/components/modals/SettingsView/WechatNotify.tsx`
- Modify: `client/shared/model/wxnotify.ts`
- Modify: `client/shared/index.tsx`
- Modify: `client/web/src/components/modals/SettingsView/__tests__/wxNotifyPreference.spec.ts`
- Create: `client/web/src/components/modals/SettingsView/wxNotifyDefaultRules.ts`
- Create: `client/web/src/components/modals/SettingsView/__tests__/wxNotifyDefaultRules.spec.ts`

- [ ] 写失败测试，锁定默认通知规则文案
- [ ] 跑测试确认失败
- [ ] 删除客户端偏好与测试按钮
- [ ] 增加固定规则说明 helper
- [ ] 跑前端测试和类型检查

### Task 3: 总体验证与提交

**Files:**
- Modify: `docs/superpowers/specs/2026-05-04-wechat-notify-default-events-design.md`
- Modify: `docs/superpowers/plans/2026-05-04-wechat-notify-default-events-plan.md`

- [ ] 跑服务端测试
- [ ] 跑前端测试
- [ ] 跑前端类型检查
- [ ] 跑服务端类型检查
- [ ] 提交实现
