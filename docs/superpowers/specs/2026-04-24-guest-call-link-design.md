# 专属虚拟电话局 (Guest Call Link & Anti-WeChat-Blocker) Design Spec

## 1. 核心目标 (Goals)
将 Tailchat 内置的 LiveKit 通话功能封装为一个“免登录、极短链、防微信风控、高拟真来电 UI”的访客通话分享工具。

## 2. 需求分析与策略 (Requirements & Strategy)

### 2.1 短链与时效控制
- **需求**：原链接过长（含 plugin ID、房间名等），容易被风控，不便分享。
- **策略**：
  - 后端提供 `generateShortLink` 接口，生成 6 位随机字符串（如 `a8Xb9Y`）。
  - 将 `{ roomId, inviterName, inviterAvatar }` 存入 Redis，TTL 设为 `86400`（24小时自动过期）。
  - 过期后访问该短链，提示“通话链接已过期”。
- **多人访问行为**：
  - 同一个短链支持分享给多人。多人点击后会同时加入同一个 LiveKit 房间，变成“多人语音群聊”（每人分配独立 Guest ID）。适合临时小群会话或一对一聊天。

### 2.2 微信防封控 (Anti-WeChat-Blocker)
- **需求**：微信内置浏览器（TBS/X5）对 WebRTC 兼容差（无法获取麦克风），且长链接带有 `meeting` 等字眼极易被系统拦截。
- **策略**：
  - 在 API Gateway（如 `gateway.service.ts` 或 Nginx 路由层，推荐在 Node.js Gateway 层处理）增加拦截器，监听 `/t/:code`。
  - 读取请求头的 `User-Agent`，如果匹配 `MicroMessenger`，直接输出一个带有防封引导图（提示“点击右上角在浏览器中打开”）的纯静态 HTML。不加载任何 React 脚本，彻底规避封禁。
  - 如果是非微信浏览器，则返回 `302 Redirect` 到真实的通话前端页面 `/#/call/:code`。

### 2.3 极简拟真来电 UI
- **需求**：外部访客不需要输入昵称，打开后要有类似接听电话的仪式感，显示邀请人的真实身份。
- **策略**：
  - 新增前端路由 `/#/call/:code`。
  - 页面加载时请求 `getShortLinkInfo?code=xxx` 获取邀请人昵称和头像。
  - 渲染全屏暗色背景的 `IncomingCallUI`，中间为邀请人头像（带呼吸脉冲动画），下方显示“邀请人昵称 邀请您进行语音通话”。
  - 去除手动输入昵称的 `PreJoinView`。
  - 点击“接听”时，自动生成 `Guest_随机数` 并调用 `generateGuestToken` 加入房间。

### 2.4 分享入口前置
- **策略**：在私信面板或个人资料卡片等显眼位置，增加【生成专属通话链接】按钮。点击后直接向后端请求并复制 `https://域名/t/xxxxxx`。

## 3. 架构与 API 设计 (Architecture & API)

### 3.1 后端 API (com.msgbyte.livekit 插件)
- `POST /api/plugin:com.msgbyte.livekit/generateShortLink`
  - 参数：`roomId` (string)
  - 逻辑：获取当前用户信息（`nickname`, `avatar`），生成 6 位 `code`，存入 Redis（键名 `livekit:shortlink:<code>`），TTL 24小时。
  - 返回：`code`
- `GET /api/plugin:com.msgbyte.livekit/getShortLinkInfo`
  - 参数：`code` (string)
  - 逻辑：查询 Redis。如果不存在返回错误（链接已失效）。
  - 返回：`{ roomId, inviterName, inviterAvatar }`

### 3.2 网关层 (Gateway) 拦截
修改 `server/services/core/gateway.service.ts`：
```typescript
// 伪代码示例
this.express.get('/t/:code', async (req, res) => {
  const ua = req.headers['user-agent'] || '';
  if (ua.includes('MicroMessenger')) {
    // 返回静态防封 HTML
    res.send('<html>...请点击右上角在浏览器中打开...</html>');
  } else {
    // 重定向到前端接听页
    res.redirect(`/#/call/${req.params.code}`);
  }
});
```

### 3.3 前端组件
- 路由注册：在 `src/index.tsx` 增加 `regCustomRoute({ path: '/call/:code', component: GuestCallView })`。
- `GuestCallView`：负责获取数据、显示接听 UI、处理 WebRTC 连接与房间内的挂断逻辑。

## 4. 边界情况处理 (Edge Cases)
- **短链失效/过期**：访客打开时 UI 显示“该通话链接已过期或失效”。
- **接听失败/无麦克风权限**：弹出 Toast 提示用户检查浏览器权限设置。
- **并发访问**：支持多人同时接入同一个房间。

## 5. 依赖项 (Dependencies)
- Redis 服务（已有）
- LiveKit 服务器（已有）
- Node.js Express 路由层（已有）