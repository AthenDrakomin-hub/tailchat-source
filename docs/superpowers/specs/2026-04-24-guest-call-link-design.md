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
- **多人访问行为（一对一限制）**：
  - **阅后即焚（单次有效）机制**：既然定位是“一对一通话”，短链只能被**第一个**接听的访客使用。
  - 当第一个访客点击【接听】并成功向后端请求获取 `Token` 时，后端立即将 Redis 中该短链的状态标记为“已使用”或直接删除。
  - 后续任何其他人再点击这个短链，或者第一个人退出了再想点进来，都会提示“通话链接已被使用或已失效”。这样完美保证了房间内永远只有你和对方两个人，绝不会有“第三者”闯入。

### 2.2 微信防封控 (Anti-WeChat-Blocker)
- **需求**：微信内置浏览器（TBS/X5）对 WebRTC 兼容差（无法获取麦克风），且长链接带有 `meeting` 等字眼极易被系统拦截。
- **策略**：
  - 在 API Gateway（如 `gateway.service.ts` 或 Nginx 路由层，推荐在 Node.js Gateway 层处理）增加拦截器，监听 `/t/:code`。
  - 读取请求头的 `User-Agent`，如果匹配 `MicroMessenger`，直接输出一个带有防封引导图（提示“点击右上角在浏览器中打开”）的纯静态 HTML。不加载任何 React 脚本，彻底规避封禁。
  - 如果是非微信浏览器，则返回 `302 Redirect` 到真实的通话前端页面 `/#/call/:code`。

### 2.3 极简拟真来电 UI 与 双向挂断机制
- **需求**：外部访客不需要输入昵称，打开后要有类似接听电话的仪式感。双方都能挂断通话，一端挂断另一端也要联动。
- **策略**：
  - 新增前端路由 `/#/call/:code`。
  - 页面加载时请求 `getShortLinkInfo?code=xxx` 获取邀请人昵称和头像。
  - 渲染全屏暗色背景的 `IncomingCallUI`，中间为邀请人头像（带呼吸脉冲动画），下方显示“邀请人昵称 邀请您进行语音通话”。
  - 去除手动输入昵称的 `PreJoinView`。
  - 点击“接听”时，自动生成 `Guest_随机数` 并调用 `generateGuestToken` 加入房间。
  - **双向挂断机制 (Bidirectional Hang-up)**：
    - 在访客端 UI 和 主人端 UI 均提供醒目的红色【挂断】按钮。
    - **访客主动挂断**：访客点击挂断，立即退出 LiveKit 房间，页面变为“通话已结束”。主人端会看到访客离开房间。
    - **主人主动挂断**：主人点击挂断退出房间，前端监听 LiveKit 房间成员状态（或房间关闭事件），一旦检测到主人离线，访客端自动强制挂断，弹出提示“对方已结束通话”，彻底断开连接。

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
- **短链失效/过期/已被他人接听**：访客打开时 UI 显示“该通话链接已失效或正在进行中，无法加入”。
- **接听失败/无麦克风权限**：弹出 Toast 提示用户检查浏览器权限设置。
- **并发访问控制（一对一）**：利用 Redis 的原子性操作（如 `GETDEL` 或 `SETNX`），确保在高并发下（如多人在同一毫秒点击），只有第一个发出的请求能成功获取到 Token，其余人全部被拦截并返回 403 / 410 失效错误。

## 5. 依赖项 (Dependencies)
- Redis 服务（已有）
- LiveKit 服务器（已有）
- Node.js Express 路由层（已有）