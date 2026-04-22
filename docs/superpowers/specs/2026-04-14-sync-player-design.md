# 日斗投资财富交流会 - 视频演播室（Sync Player）架构设计

## 1. 业务背景
在“日斗投资财富交流会”群聊场景下，需要为管理员/老师提供一种轻量级、低成本、高清晰度的“视频讲课”方式。
本方案采用“伪直播、真同步”的技术路线：通过播放提前上传的高清视频文件，结合 Socket.IO 信令实现全群组的播放状态强同步，达到类似演播室直播的效果，且无需昂贵的推拉流服务器。

## 2. 核心需求
- **UI 入口**：群聊界面顶部悬浮的固定“演播室”播放器，不随聊天消息滚动。
- **权限控制**：
  - **控制端**：仅群主/管理员可见播放控制条（播放、暂停、进度跳转）。
  - **观看端**：普通群员只能观看，播放器自动隐藏控制条，且禁用点击暂停。
- **视频源**：老师在聊天面板上传视频后，通过消息上下文菜单或专属入口一键推送到演播室。
- **状态同步**：老师操作播放器时，全群用户的播放器必须在 200ms 内同步进度和播放/暂停状态。

## 3. 技术架构设计

本功能将开发为一个独立的 Tailchat 插件：`com.msgbyte.syncplayer`。

### 3.1 前端组件 (Client)
- **挂载点**：使用 `pluginCustomPanel` 或群聊布局的顶部注入点（如 `GroupPanelTop`）。
- **核心组件 `<SyncPlayer />`**：
  - 基于原生的 `<video>` 标签封装。
  - **权限判定**：通过读取当前用户的 `role` 或 `permissions`，动态决定是否渲染 `controls` 属性。
  - **事件拦截**：在控制端监听 `onPlay`、`onPause`、`onSeeked` 事件，将其转化为 Socket 请求发送至后端。
  - **状态订阅**：在观看端监听全局 Socket 事件 `plugin:com.msgbyte.syncplayer.sync_state`，收到后强制设置 `video.currentTime` 并调用 `.play()` 或 `.pause()`。

### 3.2 后端微服务 (Server)
- **微服务模块**：`syncplayer.service.ts`
- **核心数据结构**：
  在 Redis 中维护每个群组（Room）的当前演播室状态（Shared State）：
  ```typescript
  interface RoomPlayerState {
    roomId: string;
    videoUrl: string;       // 当前播放的视频地址
    isPlaying: boolean;     // 是否正在播放
    currentTime: number;    // 当前进度
    updatedAt: number;      // 状态最后更新的服务器时间戳
  }
  ```
- **核心接口 (Actions)**：
  - `syncplayer.push`：老师发起演播，设置视频 URL 并广播开启演播室。
  - `syncplayer.updateState`：老师更新播放状态（如拖动进度条），更新 Redis 并触发 `roomcastNotify` 广播给该群组。
  - `syncplayer.close`：老师关闭演播室，广播关闭事件。

### 3.3 核心交互时序图 (Data Flow)

1. **初始化**：群员进入群组，前端请求 `syncplayer.getState` 获取当前是否在演播中，若有则初始化播放器并 Seek 到计算后的正确时间点。
2. **状态同步**：
   - 老师拖动进度条 -> 前端发出 `syncplayer.updateState({ time: 15, isPlaying: true })`。
   - 后端接收并校验权限 -> 更新 Redis -> 调用 `this.roomcastNotify(ctx, roomId, 'sync_state', state)`。
   - 观看端收到 `sync_state` 事件 -> 执行 `video.currentTime = 15; video.play()`。

## 4. 边界与异常处理
- **时间漂移校准**：由于网络延迟，观众端收到指令时可能存在几十毫秒误差。观众端初始化时应结合服务器的 `updatedAt` 时间戳加上 `Date.now() - updatedAt` 作为实际的 `currentTime`。
- **缓冲卡顿**：如果个别观众网速慢导致缓冲（Buffering），其本地进度会落后。可设计“强同步机制”：每隔 10 秒观众端校验本地时间与理想时间的差值，若超过 2 秒则强制触发一次 `Seek`。
- **权限越界**：所有 `updateState` 请求到达后端时，必须在 Service 层面校验操作者是否为群组的 Owner 或具有相应权限，防止抓包伪造请求。

## 5. 后续扩展方向
- **在线人数统计**：旁路监听 Socket.IO 的 Room 订阅人数，实时在播放器右上角显示“演播室观看人数”。
- **数字人接入**：未来若采用外部流媒体，只需将 `videoUrl` 替换为 HLS/m3u8 协议链接，播放器内核替换为 `hls.js` 即可平滑升级为真直播。
