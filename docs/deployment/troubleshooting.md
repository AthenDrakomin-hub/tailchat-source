# 部署排障手册

## 适用范围

本手册主要覆盖以下场景：

- `git pull` 后重新部署
- `docker compose build --pull` 失败
- `docker compose up -d` 后页面仍异常
- Admin / Client / 插件 / MinIO / LiveKit 相关问题

## 先确认一个原则

### `up -d` 成功，不代表升级成功

如果前面的 `docker compose build` 失败，后面的：

```bash
docker compose up -d --remove-orphans
```

通常只是在复用旧镜像，不代表你已经成功升级到新代码。

所以排障时必须区分：

- 是构建失败
- 还是启动失败
- 还是服务起来了但业务异常

## 一、构建失败

### 1. `ERR_PNPM_LOCKFILE_CONFIG_MISMATCH`

现象：

```bash
ERR_PNPM_LOCKFILE_CONFIG_MISMATCH
Cannot proceed with the frozen installation
```

原因：

- `package.json` 中的 `pnpm` 配置与 `pnpm-lock.yaml` 不一致
- 常见于 `patchedDependencies`、`overrides` 或 lockfile 未同步

处理：

```bash
git fetch origin
git checkout main
git pull --rebase origin main
docker compose --env-file docker-compose.env build --pull
```

如果仓库已经修复，重新拉最新 `main` 即可。

### 2. `ERR_PNPM_INVALID_PATCH`

现象：

```bash
ERR_PNPM_INVALID_PATCH
Applying patch ... failed
```

原因：

- `patches/*.patch` 文件格式不合法
- patch 文件与当前依赖版本不匹配

处理：

- 优先拉取最新 `main`
- 不建议在生产机手改 patch
- 如仍存在，说明仓库版本本身有问题，需要先在代码仓库修复再部署

### 3. Admin TypeScript 编译失败

现象示例：

```bash
error TS2352
Conversion of type 'any[] | LeanDocument<any>[]'
```

原因：

- 管理端服务端 TypeScript 类型不兼容
- 常见于 `lean()` 返回数组但被强转成单个文档

处理：

- 拉最新 `main`
- 重新执行：

```bash
docker compose --env-file docker-compose.env build --pull
```

### 4. `esbuild: Failed to install correctly`

现象：

```bash
Error: esbuild: Failed to install correctly
```

原因通常是：

- 依赖未正确安装
- 构建环境残留了不一致的 `node_modules`

处理：

在代码仓库已经修复的前提下，重新完整构建镜像即可：

```bash
docker compose --env-file docker-compose.env build --pull
```

不要在生产容器内手动改依赖，优先依赖 Docker 重新构建。

## 二、容器启动后页面异常

### 1. 首页打不开 / `/admin/` 打不开

先检查：

```bash
docker compose --env-file docker-compose.env ps
curl -I http://127.0.0.1:11000/
curl -I http://127.0.0.1:11000/admin/
curl -I http://127.0.0.1:11000/api/config/client
```

如果这三项不通，再看：

```bash
docker compose logs --tail=100 service-core
docker compose logs --tail=100 tailchat-admin
docker compose logs --tail=100 traefik
```

### 2. 容器是 `Up`，但页面仍旧不对

可能原因：

- `build` 没成功，`up -d` 复用了旧镜像
- 浏览器缓存未刷新
- 反代 / Nginx 配置仍指向旧入口

先确认版本：

```bash
git rev-parse --short HEAD
docker compose --env-file docker-compose.env ps
```

再确认浏览器是否命中新版本资源。

## 三、MinIO / 文件上传问题

### 1. `InvalidBucketNameError: Invalid bucket name : undefined`

说明：

- `MINIO_BUCKET_NAME` 没配置

检查：

```bash
grep -E '^MINIO_BUCKET_NAME=' docker-compose.env
```

修复：

```bash
echo 'MINIO_BUCKET_NAME=tailchat' >> docker-compose.env
docker compose --env-file docker-compose.env up -d --remove-orphans
```

更推荐手动编辑 `docker-compose.env`，避免重复写入。

### 2. 主服务已启动，但上传失败

检查以下变量：

- `MINIO_ROOT_PASSWORD`
- `MINIO_BUCKET_NAME`
- `MINIO_URL`
- `MINIO_USER`
- `MINIO_PASS`

以及服务日志：

```bash
docker compose logs --tail=100 service-core
docker compose logs --tail=100 minio
```

## 四、LiveKit / 系统控制台问题

### 1. 视频功能不可用 / 返回 503

检查以下变量是否同时存在且相互一致：

- `LIVEKIT_URL`
- `LIVEKIT_PUBLIC_URL`
- `LIVEKIT_KEYS`
- `LIVEKIT_API_KEY`
- `LIVEKIT_API_SECRET`

### 2. Admin 系统控制台操作 LiveKit 无反应

检查：

```bash
curl -s http://127.0.0.1:9110/health
systemctl status tailchat-ops-executor --no-pager
journalctl -u tailchat-ops-executor -f
```

若使用执行器，还需确认：

- `EXECUTOR_SHARED_SECRET`
- `OPS_EXECUTOR_URL`

## 五、推荐的一键检查

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

## 六、推荐回滚方式

如果某次升级后确认有问题，建议按 tag 回滚，而不是凭感觉回退：

```bash
cd /var/www/tailchat-source
git fetch --tags origin
git checkout main
git reset --hard v1.11.10-r1
docker compose --env-file docker-compose.env build --pull
docker compose --env-file docker-compose.env up -d --remove-orphans
```

## 相关文档

- 已部署服务器重部署：[`redeploy-existing-server.md`](./redeploy-existing-server.md)
- HTTPS / Nginx：[`goodspage-domain-https.md`](./goodspage-domain-https.md)
- 受控执行器：[`ops-executor.md`](./ops-executor.md)
