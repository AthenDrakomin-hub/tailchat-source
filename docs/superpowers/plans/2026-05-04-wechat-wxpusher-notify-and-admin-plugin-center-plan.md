# 财讯微信通知授权与后台插件中心 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为财讯补齐“微信通知授权 + @你 消息微信提醒”最小闭环，并让管理后台恢复可见的插件中心总览页。

**Architecture:** 服务端新增一个轻量 `wxnotify` 服务，负责 WxPusher 绑定状态、二维码授权会话、解绑和 @消息推送；客户端在设置页提供“微信通知”产品入口；管理后台把现有插件注册表页升级为插件中心总览页。当前仓库未找到 `com.msgbyte.wxpusher` 插件源码，因此实现采用“财讯内置兼容层 + WxPusher 官方接口”的方式直接落地。

**Tech Stack:** React、TypeScript、Jest、Tailchat Shared、Moleculer Service、got

---

## 文件结构与职责

- `server/services/core/notify/wxnotify.service.ts`
  - 微信通知服务：状态、创建授权会话、轮询扫码结果、解绑、事件推送
- `server/services/core/notify/__tests__/wxnotify.spec.ts`
  - 覆盖绑定状态解析与 @消息摘要构建
- `client/shared/model/wxnotify.ts`
  - 客户端访问微信通知服务接口
- `client/shared/index.tsx`
  - 导出微信通知模型
- `client/web/src/components/modals/SettingsView/WechatNotify.tsx`
  - 客户端“微信通知”设置页
- `client/web/src/components/modals/SettingsView/wxNotifyStatus.ts`
  - 状态文案 helper
- `client/web/src/components/modals/SettingsView/__tests__/wxNotifyStatus.spec.ts`
  - 状态 helper 测试
- `client/web/src/components/modals/SettingsView/index.tsx`
  - 把“微信通知”入口加入设置菜单
- `server/admin/src/client/routes/plugin-permissions.tsx`
  - 升级为后台插件中心总览页
- `server/admin/src/client/App.tsx`
  - 调整后台插件中心入口位置
- `server/admin/src/client/i18n/zh.ts`
- `server/admin/src/client/i18n/en.ts`
  - 插件中心路由文案

## 任务拆分

### Task 1: 服务端微信通知服务
- [ ] 写 `wxnotify` helper 失败测试
- [ ] 跑测试确认失败
- [ ] 实现状态解析和 @消息摘要 helper
- [ ] 实现 `wxnotify` 服务的状态、创建二维码、轮询绑定、解绑、推送动作
- [ ] 复跑服务端测试

### Task 2: 客户端微信通知设置入口
- [ ] 写状态 helper 失败测试
- [ ] 跑测试确认失败
- [ ] 实现状态 helper
- [ ] 实现 `WechatNotify` 设置面板
- [ ] 把入口接入设置页
- [ ] 跑前端测试和类型检查

### Task 3: 管理后台插件中心
- [ ] 升级插件注册表页为插件中心总览页
- [ ] 明确显示 wxpusher 是否已在注册表中
- [ ] 把后台入口移动到“运营与配置”
- [ ] 更新中英文路由名称
- [ ] 跑后台相关类型检查

### Task 4: @你 消息推送闭环
- [ ] 把 `chat.message.updateMessage` 的 mentions 事件接到 `wxnotify`
- [ ] 仅对已绑定用户发送推送
- [ ] 推送消息包含发送者、摘要、场景
- [ ] 跑服务端类型检查

### Task 5: 总体验证与提交
- [ ] 跑服务端测试
- [ ] 跑客户端测试
- [ ] 跑前端类型检查
- [ ] 跑服务端类型检查
- [ ] 提交实现

## 执行方式

Plan complete and saved to `docs/superpowers/plans/2026-05-04-wechat-wxpusher-notify-and-admin-plugin-center-plan.md`。  
按用户要求，直接采用 **Inline Execution** 执行，不等待额外确认。
