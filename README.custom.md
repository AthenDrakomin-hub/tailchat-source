# Tailchat 精简定制版（免费/开源方案）

本仓库主分支是基于 Tailchat 的**精简定制版**，目标是：

- **私信语音通话（DM Call）**：基于 **LiveKit（开源自建）**，只保留私信入口
- **伪直播（MP4 → HLS）**：基于 `com.msgbyte.pseudolive`（ffmpeg 转码 + HLS 播放）
- **机器人小号（不烧钱）**：用“普通账号 JWT + 话术脚本”活跃群聊，不接任何付费 AI API
- **删除所有付费/第三方集成插件**（Agora/个推/WxPusher/GitHub OAuth/会议/通知等）

> 手机 App：移动端为 **React Native WebView 壳**，加载同一个 Web 站点，因此 Web 端功能可直接在 App 使用（无需额外原生 SDK 集成）。

## 一键部署（Docker Compose）

```bash
docker compose build --no-cache
docker compose up -d
docker compose ps
curl -i http://127.0.0.1:11000/health
```

## LiveKit（语音通话）

关键环境变量（`docker-compose.env`）：
- `LIVEKIT_URL=http://livekit:7880`
- `LIVEKIT_PUBLIC_URL=wss://chat.yefeng.us.cc/livekit`
- `LIVEKIT_API_KEY` / `LIVEKIT_API_SECRET`（默认 devkey/devsecret 仅用于测试，正式环境请替换）

若使用仓库的 `docker/swag.yml` 做 HTTPS：
`docker/config/nginx.conf` 已增加 `/livekit/` 反代到宿主机 `127.0.0.1:7880`。

## 伪直播（MP4→HLS）

群管理上传 MP4 → 后端转 HLS → 频道出现直播卡片 → 群员点击播放。

## 机器人小号（JWT 话术脚本）

脚本：`scripts/pseudolive-bot.ts`
样例配置：`scripts/pseudolive-bot.example.json`
