#!/usr/bin/env bash
set -Eeuo pipefail

APP_DIR="${APP_DIR:-/var/www/tailchat-source}"
ENV_FILE="${ENV_FILE:-docker-compose.env}"

echo "== 1. 进入项目目录 =="
cd "$APP_DIR"

echo "== 2. 更新代码 =="
git fetch origin
git checkout main
git restore client/mobile/yarn.lock || true
git pull --rebase origin main

echo "== 3. 校验环境变量 =="
bash scripts/env-lint.sh "$ENV_FILE"

echo "== 4. 重建并重启服务 =="
docker compose --env-file "$ENV_FILE" build --pull
docker compose --env-file "$ENV_FILE" up -d --remove-orphans

echo "== 5. 服务状态 =="
docker compose --env-file "$ENV_FILE" ps

echo "== 6. 健康检查 =="
curl -m 10 -sS -o /dev/null -w "GET / -> %{http_code}\n" http://127.0.0.1:11000/
curl -m 10 -sS -o /dev/null -w "GET /admin/ -> %{http_code}\n" http://127.0.0.1:11000/admin/
curl -m 10 -sS -o /dev/null -w "GET /api/config/client -> %{http_code}\n" http://127.0.0.1:11000/api/config/client
curl -m 10 -sS -o /dev/null -w "GET /downloads -> %{http_code}\n" http://127.0.0.1:11000/downloads
curl -m 10 -sS -o /dev/null -w "GET /downloads/client.json -> %{http_code}\n" http://127.0.0.1:11000/downloads/client.json

echo "== 完成 =="
