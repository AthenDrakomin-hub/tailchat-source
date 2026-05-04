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
git restore server/public/downloads/client.json || true
git pull --rebase origin main

echo "== 3. 校验环境变量 =="
bash scripts/env-lint.sh "$ENV_FILE"

echo "== 4. 重建并重启服务 =="
docker compose --env-file "$ENV_FILE" build --pull
docker compose --env-file "$ENV_FILE" up -d --remove-orphans

echo "== 5. 服务状态 =="
docker compose --env-file "$ENV_FILE" ps

check_endpoint() {
  local path="$1"
  local attempts="${2:-6}"
  local sleep_seconds="${3:-5}"
  local url="http://127.0.0.1:11000${path}"
  local code="000"

  for ((i=1; i<=attempts; i++)); do
    code="$(curl -m 15 -sS -o /dev/null -w "%{http_code}" "$url" || true)"
    if [[ "$code" == "200" ]]; then
      echo "GET ${path} -> ${code}"
      return 0
    fi

    if (( i < attempts )); then
      sleep "$sleep_seconds"
    fi
  done

  echo "GET ${path} -> ${code}"
  return 1
}

echo "== 6. 健康检查 =="
check_endpoint "/"
check_endpoint "/admin/"
check_endpoint "/api/config/client"
check_endpoint "/downloads"
check_endpoint "/downloads/client.json"

echo "== 完成 =="
