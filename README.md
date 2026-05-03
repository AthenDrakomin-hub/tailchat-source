# Tailchat Source

这是一个基于 Tailchat 的二次开发仓库，包含：

- Web 客户端：`client/web`
- 桌面端：`client/desktop`
- 原生移动端：`client/mobile`
- 服务端与管理后台：`server`

## 推荐部署方式

本仓库当前推荐并维护的生产部署方式只有一条：

- 应用使用 `Docker Compose` 在宿主机本机构建并启动
- 对外访问统一由宿主机 `Nginx` 反代到 `127.0.0.1:11000`

## 快速入口

### 新服务器首次部署

```bash
curl -fsSL https://raw.githubusercontent.com/AthenDrakomin-hub/tailchat-source/main/scripts/deploy.sh | bash
```

完整说明见：

- [`docs/deployment/redeploy-existing-server.md`](docs/deployment/redeploy-existing-server.md)

### 已部署服务器升级重部署

```bash
cd /var/www/tailchat-source
bash scripts/deploy-all.sh
```

完整说明见：

- [`docs/deployment/redeploy-existing-server.md`](docs/deployment/redeploy-existing-server.md)
- [`docs/deployment/client-release-workflow.md`](docs/deployment/client-release-workflow.md)

### 部署失败排查

常见问题统一放在：

- [`docs/deployment/troubleshooting.md`](docs/deployment/troubleshooting.md)

## 生产部署文档

- 已部署服务器升级重部署：[`docs/deployment/redeploy-existing-server.md`](docs/deployment/redeploy-existing-server.md)
- 自有证书 + 域名 HTTPS：[`docs/deployment/goodspage-domain-https.md`](docs/deployment/goodspage-domain-https.md)
- 受控执行器 / 系统控制台：[`docs/deployment/ops-executor.md`](docs/deployment/ops-executor.md)
- Admin 运行时联调基线：[`docs/deployment/admin-runtime-baseline.md`](docs/deployment/admin-runtime-baseline.md)

## 客户端下载分发

当前生产环境中的客户端下载页已并入主站静态目录，不再依赖独立 `website` 发布链路。

- 下载页入口：`/downloads`
- 下载配置：`server/public/downloads/client.json`
- 安装包目录：`server/public/downloads/client/`

推荐统一使用以下脚本：

```bash
cd /var/www/tailchat-source
bash scripts/build-android-release.sh
```

用于：

- 在服务器上构建 Android APK
- 自动发布到下载目录
- 自动更新 `client.json`
- 自动验证 Android 下载地址

如果你要发布 Windows / macOS / Linux 外部产物，使用：

```bash
cd /var/www/tailchat-source

bash scripts/publish-client-assets.sh \
  --windows /tmp/caixun-desktop-windows.zip --windows-version 1.0.0 \
  --macos /tmp/caixun-desktop-macos.dmg --macos-version 1.0.0 \
  --macos-arm64 /tmp/caixun-desktop-macos-arm64.dmg --macos-arm64-version 1.0.0
```

完整说明见：

- [`docs/deployment/client-release-workflow.md`](docs/deployment/client-release-workflow.md)

## 使用说明文档

- 群组内容语法说明：[`docs/usage/group-content-syntax.md`](docs/usage/group-content-syntax.md)
- 版本变更记录：[`CHANGELOG.md`](CHANGELOG.md)
- 已部署服务器重部署：[`docs/deployment/redeploy-existing-server.md`](docs/deployment/redeploy-existing-server.md)
- 客户端分包发布：[`docs/deployment/client-release-workflow.md`](docs/deployment/client-release-workflow.md)
- 部署排障手册：[`docs/deployment/troubleshooting.md`](docs/deployment/troubleshooting.md)

## 关键环境变量

生产环境至少应正确配置：

- `API_URL`
- `SECRET`
- `ADMIN_PASS`
- `MINIO_ROOT_PASSWORD`
- `MINIO_BUCKET_NAME`
- `DEFENSE_SHARED_SECRET`

如果你启用了系统控制台 / LiveKit，还应额外检查：

- `EXECUTOR_SHARED_SECRET`
- `OPS_EXECUTOR_URL`
- `LIVEKIT_URL`
- `LIVEKIT_PUBLIC_URL`
- `LIVEKIT_KEYS`
- `LIVEKIT_API_KEY`
- `LIVEKIT_API_SECRET`

## 可选构建开关

### PWA / Service Worker

当你需要临时禁用 Web 端离线缓存时：

```bash
DISABLE_SERVICE_WORKER=true
```

### Analytics

当你希望关闭构建期统计注入时：

```bash
DISABLE_ANALYTICS=true
```

## 本地开发

### Web + Server

```bash
pnpm install
pnpm dev
```

### Admin

```bash
pnpm dev:admin
```

## 目录导航

- 部署脚本：`scripts/`
- Docker Compose：`docker-compose.yml`、`docker-compose.env.example`
- 服务端：`server/`
- Web：`client/web/`
- Desktop：`client/desktop/`
- Mobile：`client/mobile/`
- 部署文档：`docs/deployment/`

## 版本与回滚

建议每次确认线上稳定后，都为 `main` 打一个 Git 标签，方便回滚与追溯。

本次稳定部署版本建议标签：

- `v1.11.10-r1`

## License

遵循上游 Tailchat 相关开源许可与声明。
