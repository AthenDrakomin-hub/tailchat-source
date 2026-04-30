# Tailchat Source（二次开发版本）

这是一个基于 Tailchat 的二次开发仓库，包含：

- Web 客户端（含 PWA）：`client/web`
- 桌面端（Electron）：`client/desktop`
- 原生移动端（React Native）：`client/mobile`
- 服务端（含 Admin）：`server`

## 部署（生产推荐：单一路径）

本仓库只保留一种生产部署方式：

- 服务端通过 Docker Compose 在服务器本机构建镜像并启动
- 对外 HTTPS/域名由宿主机 Nginx 负责反代到 `127.0.0.1:11000`（Traefik 的 HTTP 入口）

### 一键部署

在新服务器执行：

```bash
curl -fsSL https://raw.githubusercontent.com/AthenDrakomin-hub/tailchat-source/main/scripts/deploy.sh | bash
```

### 必填环境变量（docker-compose.env）

编辑 `/var/www/tailchat-source/docker-compose.env`，至少配置：

 - `API_URL`（例如 `https://goodspage.cn`）
- `SECRET`
- `ADMIN_PASS`
- `MINIO_ROOT_PASSWORD`
- `DEFENSE_SHARED_SECRET`
- `EXECUTOR_SHARED_SECRET`（用于“系统控制台”一键启停 LiveKit）

### PWA / 离线缓存（可选）

Web 端默认包含 PWA（manifest + service worker）。在极少数情况下可能出现“缓存/更新异常”（旧资源无法更新、白屏、反复提示更新等）。

可通过构建期开关紧急禁用（需要重新构建镜像后生效）：

```bash
DISABLE_SERVICE_WORKER=true
```

禁用后建议用户在浏览器执行一次“强制刷新”，或到浏览器 Application → Service Workers 手动 Unregister 后再刷新。

### 域名与自有证书（Nginx）

- 配置指南：[goodspage-domain-https.md](file:///workspace/docs/deployment/goodspage-domain-https.md)
- Nginx 示例配置：[nginx.goodspage.cn.example.conf](file:///workspace/docs/nginx.goodspage.cn.example.conf)

### 系统控制台（运营面板 + 一键启停 LiveKit）

管理后台新增「系统控制台」页面，可在 Web 界面完成：

- LiveKit 一键启动/停止/重启（通过宿主机受控执行器）
- 伪直播开关（关闭后拒绝 start）
- 机器人小号轮播（按配置轮播发言）
- 防御系统总览（更详细切档仍在「防御控制系统」页）

受控执行器安装说明：`docs/deployment/ops-executor.md`

### LiveKit 生产建议

- 不建议使用 `livekit/livekit-server:latest` 与 `--dev`（升级不受控、配置不完整）
- 建议固定镜像版本并使用配置文件启动，生产网络环境建议配套 TURN

#### LiveKit 503/不可用排查（必看）

常见现象：

- Web 侧进入视频通话提示服务不可用/503
- `service-all-plugins` 日志出现：`miss env var: LIVEKIT_API_KEY, LIVEKIT_API_SECRET`

必须同时配置（且保持一致）：

- `LIVEKIT_URL=http://livekit:7880`（容器内访问 LiveKit）
- `LIVEKIT_PUBLIC_URL=wss://goodspage.cn/livekit`（客户端连接地址，必须是公网可访问的 WSS/HTTPS）
- `LIVEKIT_KEYS=your_key:your_secret`（LiveKit 服务自身使用）
- `LIVEKIT_API_KEY=your_key`、`LIVEKIT_API_SECRET=your_secret`（Tailchat LiveKit 插件后端使用）

若使用同域名 `https://goodspage.cn/livekit/` 反代 LiveKit，请确保宿主机 Nginx 已配置 `/livekit/` 反代，示例见：

- [nginx.goodspage.cn.example.conf](file:///workspace/docs/nginx.goodspage.cn.example.conf)

### 更新/发版

```bash
cd /var/www/tailchat-source
git pull --rebase
docker compose build --pull
docker compose up -d --remove-orphans
docker compose ps
```

### Docker 构建参数

- `TAILCHAT_CLI_VERSION`：固定 `tailchat-cli` 版本（默认 `1.5.14`），如需升级请在构建时显式指定
- `NODE_OPTIONS`：Node.js 启动参数（默认 `--max-old-space-size=1536`，4GB 机器建议 1536~2048）

## 开发（各端）

### Web（含 PWA）+ Server（推荐本地联调）

```bash
pnpm install
pnpm dev
```

### Admin（本地开发）

```bash
pnpm dev:admin
```

### 桌面端（Electron）

参考目录：[client/desktop](file:///workspace/client/desktop)

### 原生移动端（React Native）

参考目录：[client/mobile](file:///workspace/client/mobile)

## 目录导航

- 部署脚本：`scripts/`
- Docker Compose：`docker-compose.yml`、`docker-compose.env.example`
- 服务端：`server/`
- Web：`client/web/`
- Desktop：`client/desktop/`
- Mobile：`client/mobile/`
- 文档（部署/Nginx）：`docs/`

## License

遵循上游 Tailchat 相关开源许可与声明。
