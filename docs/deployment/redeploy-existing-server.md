# 已部署服务器重部署手册

## 适用场景

本手册适用于以下情况：

- 服务器上已经部署过 Tailchat
- 当前只需要拉取最新 `main` 并升级
- 部署方式为宿主机 `Docker Compose`
- 对外入口由 `Nginx -> 127.0.0.1:11000`

如果你是全新服务器首次安装，也可以参考本手册，但首次安装更建议先执行：

```bash
curl -fsSL https://raw.githubusercontent.com/AthenDrakomin-hub/tailchat-source/main/scripts/deploy.sh | bash
```

## 标准重部署命令

在服务器执行：

```bash
cd /var/www/tailchat-source
bash scripts/deploy-all.sh
```

等价展开命令如下：

```bash
cd /var/www/tailchat-source
git fetch origin
git checkout main
git restore client/mobile/yarn.lock || true
git pull --rebase origin main
bash scripts/env-lint.sh docker-compose.env
docker compose --env-file docker-compose.env build --pull
docker compose --env-file docker-compose.env up -d --remove-orphans
docker compose --env-file docker-compose.env ps
```

## 重部署前检查

建议在升级前先确认以下几点：

### 1. 代码目录正确

```bash
cd /var/www/tailchat-source
pwd
git branch --show-current
```

应确认：

- 当前目录是 `/var/www/tailchat-source`
- 当前分支是 `main`

### 2. 环境变量文件存在

```bash
ls -l docker-compose.env
```

如果没有该文件，请先从示例复制：

```bash
cp docker-compose.env.example docker-compose.env
```

### 3. 执行环境变量校验

```bash
bash scripts/env-lint.sh docker-compose.env
```

至少要确认这些值不是空的：

- `API_URL`
- `SECRET`
- `ADMIN_PASS`
- `MINIO_ROOT_PASSWORD`
- `MINIO_BUCKET_NAME`
- `DEFENSE_SHARED_SECRET`

如果启用了系统控制台 / LiveKit，还应补齐：

- `EXECUTOR_SHARED_SECRET`
- `OPS_EXECUTOR_URL`
- `LIVEKIT_URL`
- `LIVEKIT_PUBLIC_URL`
- `LIVEKIT_KEYS`
- `LIVEKIT_API_KEY`
- `LIVEKIT_API_SECRET`

## 重部署后验证

### 1. 查看容器状态

```bash
docker compose --env-file docker-compose.env ps
```

重点确认以下服务为 `Up`：

- `service-core`
- `service-openapi`
- `service-all-plugins`
- `tailchat-admin`

### 2. 本机 HTTP 探活

```bash
curl -I http://127.0.0.1:11000/
curl -I http://127.0.0.1:11000/admin/
curl -I http://127.0.0.1:11000/api/config/client
```

理想情况下应返回：

- `/` -> `200`
- `/admin/` -> `200`
- `/api/config/client` -> `200`

### 3. 查看关键日志

```bash
docker compose logs --tail=100 service-core
docker compose logs --tail=100 tailchat-admin
docker compose logs --tail=100 service-all-plugins
```

重点关注：

- 是否持续报错
- 是否出现 `Exited` / `Restarting`
- 是否有 Mongo / Redis / MinIO / 插件初始化致命错误

### 4. 浏览器验收

建议至少手动确认：

- 首页可打开
- `/admin/` 可打开
- Admin 可登录
- Client 可登录
- 群组详情页可访问
- Socket.IO 连接正常

### 5. 客户端下载分发

客户端下载页已并入主站静态目录，不再依赖独立 `website` 发布链路。

下载相关文件位于：

- `server/public/downloads/index.html`
- `server/public/downloads/client.json`
- `server/public/downloads/client/`

如果你需要更新安装包，推荐直接使用：

```bash
cd /var/www/tailchat-source
bash scripts/build-android-release.sh
```

它会在服务器上构建 Android 并自动发布。

如果要发布 Windows / macOS / Linux 外部产物，请使用：

```bash
cd /var/www/tailchat-source

bash scripts/publish-client-assets.sh \
  --windows /tmp/caixun-desktop-windows.zip --windows-version 1.0.0 \
  --macos /tmp/caixun-desktop-macos.dmg --macos-version 1.0.0 \
  --macos-arm64 /tmp/caixun-desktop-macos-arm64.dmg --macos-arm64-version 1.0.0
```

下载中心统一使用以下文件名：

- `caixun-android-release.apk`
- `caixun-desktop-windows.zip`
- `caixun-desktop-macos.dmg`
- `caixun-desktop-macos-arm64.dmg`
- `caixun-desktop-linux.AppImage`

然后验证：

```bash
curl -m 10 -sS -o /dev/null -w "GET /downloads -> %{http_code}\n" http://127.0.0.1:11000/downloads
curl -m 10 -sS -o /dev/null -w "GET /downloads/client.json -> %{http_code}\n" http://127.0.0.1:11000/downloads/client.json
curl -m 10 -sS -o /dev/null -w "GET /downloads/client/caixun-android-release.apk -> %{http_code}\n" http://127.0.0.1:11000/downloads/client/caixun-android-release.apk
```

更完整的多端发布流程见：

- [`client-release-workflow.md`](./client-release-workflow.md)

## 版本确认

建议每次重部署后记录当前提交：

```bash
git rev-parse --short HEAD
```

如果当前版本已经确认稳定，建议立即打标签，便于后续回滚：

```bash
git tag -a v1.11.10-r1 -m "Stable deploy baseline"
git push origin v1.11.10-r1
```

## 常见误区

### 误区 1：`docker compose up -d` 成功就代表升级成功

不是。

如果前面的 `build` 失败，`up -d` 只是把旧镜像重新拉起来，并不代表代码已经升级。

### 误区 2：容器状态是 `Up` 就代表页面一定没问题

不是。

`Up` 只说明进程活着，不代表：

- 路由正常
- Admin 正常
- API 正常
- Socket 正常

所以必须补 `curl` 探活和浏览器验证。

### 误区 3：MinIO 没配置完整也没关系

不完全对。

主服务可能能降级启动，但文件上传等能力会受影响。至少要保证：

- `MINIO_ROOT_PASSWORD`
- `MINIO_BUCKET_NAME`

## 推荐的一键验证指令

```bash
APP_DIR="/var/www/tailchat-source" && \
cd "$APP_DIR" && \
echo "== 1. Git版本 ==" && \
git rev-parse --short HEAD && \
echo && \
echo "== 2. 容器状态 ==" && \
docker compose --env-file docker-compose.env ps && \
echo && \
echo "== 3. 本机HTTP探活 ==" && \
curl -sS -o /tmp/tailchat_home.out -w "GET / -> %{http_code}\n" http://127.0.0.1:11000/ && \
curl -sS -o /tmp/tailchat_admin.out -w "GET /admin/ -> %{http_code}\n" http://127.0.0.1:11000/admin/ && \
curl -sS -o /tmp/tailchat_config.out -w "GET /api/config/client -> %{http_code}\n" http://127.0.0.1:11000/api/config/client && \
echo && \
echo "== 4. 关键日志尾部 ==" && \
docker compose logs --tail=30 service-core tailchat-admin service-all-plugins | tail -n 120 && \
echo && \
echo "== 5. MinIO配置 ==" && \
grep -E '^MINIO_BUCKET_NAME=' docker-compose.env || echo 'MINIO_BUCKET_NAME=未配置' && \
echo && \
echo "== 6. 快速判定 ==" && \
( docker compose --env-file docker-compose.env ps | grep -q 'service-core.*Up' && \
  docker compose --env-file docker-compose.env ps | grep -q 'tailchat-admin.*Up' && \
  grep -q '200' /tmp/tailchat_config.out ) && \
echo '验证结论: 核心服务已启动，HTTP入口可访问，部署基本成功' || \
echo '验证结论: 仍有异常，请继续排查'
```

## 相关文档

- HTTPS / Nginx：[`goodspage-domain-https.md`](./goodspage-domain-https.md)
- 受控执行器：[`ops-executor.md`](./ops-executor.md)
- Admin 运行时联调基线：[`admin-runtime-baseline.md`](./admin-runtime-baseline.md)
- 排障手册：[`troubleshooting.md`](./troubleshooting.md)
