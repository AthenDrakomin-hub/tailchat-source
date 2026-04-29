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

 - `API_URL`（例如 `https://goodpage.cn`）
- `SECRET`
- `ADMIN_PASS`
- `MINIO_ROOT_PASSWORD`
- `DEFENSE_SHARED_SECRET`

### 域名与自有证书（Nginx）

- 配置指南：[goodpage-domain-https.md](file:///workspace/docs/deployment/goodpage-domain-https.md)
- Nginx 示例配置：[nginx.goodpage.cn.example.conf](file:///workspace/docs/nginx.goodpage.cn.example.conf)

### 更新/发版

```bash
cd /var/www/tailchat-source
git pull --rebase
docker compose build --pull
docker compose up -d --remove-orphans
docker compose ps
```

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
