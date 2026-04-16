# 伪直播（MP4→HLS）+ 私信语音（禁用群语音） Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在群文本频道内由群管理上传 MP4 自动转 HLS 并发“直播卡片消息”（点击弹窗播放），同时仅保留私信语音入口、禁用群语音入口，补充普通账号 JWT 的定时发话术脚本，并限制插件只能从自家服务器安装。

**Architecture:** 以插件形式实现“伪直播”（server plugin 负责上传/转码/发卡片消息，web plugin 负责入口按钮/卡片渲染/弹窗播放）。Livekit 插件仅保留 DM Action 并强制语音模式。插件安装 URL 做白名单校验。自动发话术作为独立 Node 脚本运行。

**Tech Stack:** Node.js + TypeScript + Moleculer（Tailchat services）+ ffmpeg + HLS（m3u8/ts）+ Web（React）+ hls.js

---

## File Structure（将新增/修改的文件）

**Create**
- `server/plugins/com.msgbyte.pseudolive/package.json`
- `server/plugins/com.msgbyte.pseudolive/services/pseudolive.service.ts`
- `server/plugins/com.msgbyte.pseudolive/web/plugins/com.msgbyte.pseudolive/manifest.json`
- `server/plugins/com.msgbyte.pseudolive/web/plugins/com.msgbyte.pseudolive/package.json`
- `server/plugins/com.msgbyte.pseudolive/web/plugins/com.msgbyte.pseudolive/src/index.tsx`
- `server/plugins/com.msgbyte.pseudolive/web/plugins/com.msgbyte.pseudolive/src/UploadAndStartModal.tsx`
- `server/plugins/com.msgbyte.pseudolive/web/plugins/com.msgbyte.pseudolive/src/LiveCard.tsx`
- `server/plugins/com.msgbyte.pseudolive/web/plugins/com.msgbyte.pseudolive/src/PlayerModal.tsx`
- `scripts/pseudolive-bot.ts`（普通账号 JWT 定时发话术）
- `scripts/pseudolive-bot.example.json`

**Modify**
- `server/plugins/com.msgbyte.livekit/web/plugins/com.msgbyte.livekit/src/index.tsx`
- `client/web/src/plugin/manager.ts`

**Add dependency**
- `client/web/package.json`（引入 `hls.js`）

**Test**
- `server/plugins/com.msgbyte.pseudolive/test/pseudolive.spec.ts`（如仓库测试基础设施允许）

---

### Task 1: 禁用群语音入口，仅保留私信语音发起

**Files:**
- Modify: `server/plugins/com.msgbyte.livekit/web/plugins/com.msgbyte.livekit/src/index.tsx`

- [ ] **Step 1: 写一个最小可验证点（手工验收项）**
  - 群内不显示 livekit 群面板入口（原 `regGroupPanel`）
  - 私信界面仍有“发起通话”入口（原 DM action）

- [ ] **Step 2: 修改 livekit 插件入口，移除群相关注册**

在 `index.tsx` 中删除/注释以下注册（保留 DM action 与邀请弹窗逻辑）：
- `regGroupPanel(...)`
- `regGroupPanelBadge(...)`
- `regCustomPanel({ position: 'navbar-more', ... })`（群语音导航入口）
- `regCustomPanel({ position: 'personal', ... })`（个人面板入口，若你只要“在 DM 点按钮发起”也可一并移除）

- [ ] **Step 3: 强制语音模式（隐藏/禁用 camera）**
  - 在 livekit 的 UI 层隐藏摄像头按钮（实现点通常在其 ControlBar 传参/控件显示逻辑处）
  - 在 join 前强制 `videoEnabled=false`

- [ ] **Step 4: 本地验证**
Run: `pnpm -C client/web dev`
Expected:
- 群里看不到 livekit 群语音入口
- 私信里“发起通话”可用，且无摄像头按钮

---

### Task 2: 新增“伪直播”插件（前端）：群管理按钮 + 卡片渲染 + 弹窗播放器

**Files:**
- Create: `server/plugins/com.msgbyte.pseudolive/web/plugins/com.msgbyte.pseudolive/**`
- Modify: `client/web/package.json`

- [ ] **Step 1: 新增 web plugin skeleton**
创建 `manifest.json`，其中 `name` 为 `com.msgbyte.pseudolive`，url 指向 `{BACKEND}/plugins/com.msgbyte.pseudolive/index.js`。

- [ ] **Step 2: 注册群文本频道顶部按钮**
在 `src/index.tsx` 中使用 `regPluginPanelAction` 注册 `position: 'group'` 的按钮：
- label: `发起直播`
- icon: `mdi:video`
- onClick: 打开 `UploadAndStartModal`

注意：`TextPanel` 已经会把 `pluginPanelActions`（group position）渲染为顶部按钮（见 [TextPanel.tsx](file:///workspace/client/web/src/components/Panel/group/TextPanel.tsx#L99-L120)），无需改 core。

- [ ] **Step 3: 引入 hls.js**
在 `client/web/package.json` 增加依赖：
```json
{
  "dependencies": {
    "hls.js": "^1.5.0"
  }
}
```
然后 `pnpm install`。

- [ ] **Step 4: 实现 LiveCard 渲染（消息额外解析）**
使用 `regMessageExtraParser` 注册渲染器：当 `payload.meta?.pseudolive?.hlsUrl` 存在时，渲染一个卡片组件 `LiveCard`：
- 展示：标题、开播者（userId→昵称可用现有 `useCachedUserInfo`）、状态
- 点击：打开 `PlayerModal`（弹窗）并播放 HLS

实现提示：消息渲染会调用 `pluginMessageExtraParsers`（见 [Item.tsx](file:///workspace/client/web/src/components/ChatBox/ChatMessageList/Item.tsx#L174-L182)）。

- [ ] **Step 5: 实现 PlayerModal**
使用现有 Modal 基础设施（`openModal` 等，已对插件导出，见 [plugin/common/index.ts](file:///workspace/client/web/src/plugin/common/index.ts#L14-L21)）：
- 弹窗中渲染 `<video>` 元素
- Chrome/Edge：用 hls.js attach 到 video
- Safari：直接把 m3u8 赋给 video.src

- [ ] **Step 6: 手工验证**
Run: `pnpm -C client/web dev`
Expected:
- 群文本频道顶部出现“发起直播”按钮（仅群管理可见，权限控制在后端最终裁决，前端先做权限隐藏）
- 收到带 `meta.pseudolive` 的消息时显示直播卡片
- 点击卡片弹出播放器并播放

---

### Task 3: 新增“伪直播”插件（后端）：上传 MP4 → ffmpeg 转 HLS → 发卡片消息

**Files:**
- Create: `server/plugins/com.msgbyte.pseudolive/services/pseudolive.service.ts`
- Create: `server/plugins/com.msgbyte.pseudolive/package.json`
- Modify: `server/moleculer.config.ts`（或插件自动加载机制对应文件）

- [ ] **Step 1: 定义服务 actions**
服务名：`plugin:com.msgbyte.pseudolive`
Actions（建议）：
- `startUpload`（返回一次性 upload token 或直接走 multipart）
- `uploadAndStart`（multipart 上传 + 触发转码 + 发消息）
- `getStreamInfo`（用于卡片状态刷新，可选）

- [ ] **Step 2: 权限校验（服务端）**
在 action 中通过 `group.getUserAllPermissions` 获取当前用户对 group 的权限（见 [group.service.ts](file:///workspace/server/services/core/group/group.service.ts#L208-L218)），要求至少包含 `PERMISSION.core.managePanel`。
不满足直接抛 `NoPermissionError`。

- [ ] **Step 3: 保存 MP4 到私有目录**
目录建议：`/data/pseudolive/raw/<streamId>.mp4`（容器内目录，可通过 volume 挂载）
不要将该 mp4 放入 `server/public`，避免形成“可直接下载”的链接。

- [ ] **Step 4: ffmpeg 转码 HLS 到 public/streams**
输出目录建议：`server/public/streams/<streamId>/index.m3u8` + segment files。
以固定分片时长（例如 4s）生成 HLS。

- [ ] **Step 5: 发“直播卡片消息”**
调用 `chat.message.sendMessage`，content 使用一段短文案（例如 `正在直播：${title}`），并在 meta 中写入：
```ts
{
  pseudolive: {
    streamId,
    title,
    status: 'ready',
    hlsUrl: `${config.apiUrl}/streams/${streamId}/index.m3u8`,
    startedBy: ctx.meta.userId,
    startedAt: Date.now()
  }
}
```

注意：`chat.message.sendMessage` 已支持 `meta` 字段（见 [message.service.ts](file:///workspace/server/services/core/chat/message.service.ts#L48-L56)）。

- [ ] **Step 6: 手工验证（最小闭环）**
Run:
- `pnpm -C server dev`
- `pnpm -C client/web dev`
Expected:
- 群管理上传 MP4 后，群里收到直播卡片消息
- 点击可播放 HLS

---

### Task 4: 插件安装限制：仅允许自家服务器 URL

**Files:**
- Modify: `client/web/src/plugin/manager.ts`

- [ ] **Step 1: 为 installPlugin 增加 URL 校验**
在 `installPlugin(manifest)` 前校验 `manifest.url`：
- 允许：以 `/plugins/` 开头
- 允许：以 `{BACKEND}/plugins/` 开头（如果 url 里仍保留占位符就按占位符规则）
- 其他一律拒绝，并给出 toast 错误提示

- [ ] **Step 2: 手工验证**
Expected:
- 输入第三方域名插件 url 无法安装
- 自家 `/plugins/...` 可安装

---

### Task 5: 普通账号 JWT 自动发话术脚本

**Files:**
- Create: `scripts/pseudolive-bot.ts`
- Create: `scripts/pseudolive-bot.example.json`

- [ ] **Step 1: 定义配置文件结构**
example.json（示例）：
```json
{
  "server": "http://127.0.0.1:11000",
  "email": "bot@example.com",
  "password": "******",
  "jobs": [
    {
      "cron": "*/10 * * * *",
      "converseId": "xxx",
      "groupId": "yyy",
      "messages": ["话术1", "话术2"]
    }
  ]
}
```

- [ ] **Step 2: 实现脚本**
功能：
- 调 `POST /api/user/login` 获取 token
- 周期性执行 job：调 `POST /api/chat/message/sendMessage` 发消息（带上 `X-Token` header）
- token 失效自动重登

- [ ] **Step 3: 验证**
Run: `node scripts/pseudolive-bot.ts --config scripts/pseudolive-bot.example.json`
Expected: 目标频道收到定时消息

---

## Self-Review
- [ ] 覆盖所有需求：DM-only 语音、伪直播卡片、权限、插件自家加载、自动发话术
- [ ] 无占位符/无 TODO
- [ ] 每一步都有可执行验证方式

