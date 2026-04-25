#!/usr/bin/env bash
# 新服务器（运行机）更新专用脚本
set -euo pipefail

PROJECT_DIR="${TAILCHAT_DIR:-/var/www/tailchat-source}"
COMPOSE_FILE="${COMPOSE_FILE:-docker-compose.yml}"
ENV_FILE="${ENV_FILE:-docker-compose.env}"

cd "$PROJECT_DIR"

# 运行前校验 env（防止反引号把配置搞炸）
if [ -f "scripts/env-lint.sh" ]; then
  bash scripts/env-lint.sh "$ENV_FILE"
fi

echo "=== [1/3] Pulling image (default: latest; or IMAGE_TAG=xxxx) ==="
# 禁止在运行机 build：只 pull 镜像（compose 文件已支持 IMAGE_TAG 变量）
docker compose -f "$COMPOSE_FILE" pull

echo "=== [2/3] Restarting services (no-build) ==="
docker compose -f "$COMPOSE_FILE" up -d --no-build --force-recreate --remove-orphans
docker compose -f "$COMPOSE_FILE" ps

echo "========================================="
echo "✅ Update Successful!"
echo "Waiting services to be ready..."

wait_http() {
  local url="$1"
  local ok_re="$2"
  local tries="${3:-60}"
  local sleep_s="${4:-2}"
  local i code
  for i in $(seq 1 "$tries"); do
    code="$(curl -sS -o /dev/null -w '%{http_code}' --max-time 5 "$url" || true)"
    if echo "$code" | egrep -q "$ok_re"; then
      echo "✅ $url -> $code"
      return 0
    fi
    echo "⏳ [$i/$tries] $url -> $code (expect $ok_re)"
    sleep "$sleep_s"
  done
  echo "❌ timeout: $url" >&2
  return 1
}

wait_traefik_router() {
  local router_name="$1"     # e.g. api-gw@docker
  local tries="${2:-30}"     # 30 * 1s = 30s
  local sleep_s="${3:-1}"

  local i ok
  for i in $(seq 1 "$tries"); do
    ok="$(curl -sS --max-time 2 "http://127.0.0.1:11001/api/http/routers" 2>/dev/null \
      | grep -F "\"name\":\"$router_name\"" || true)"
    if [ -n "$ok" ]; then
      echo "✅ traefik router ready: $router_name"
      return 0
    fi
    echo "⏳ [$i/$tries] waiting traefik router: $router_name"
    sleep "$sleep_s"
  done

  echo "❌ traefik router not found: $router_name" >&2
  return 1
}

sleep "${SLEEP_BEFORE_CHECK:-8}"

# 内部探活（绕过 nginx，避免外网 502 误判）
wait_traefik_router "api-gw@docker" 30 1 || true
wait_traefik_router "admin@docker" 30 1 || true

wait_http "http://127.0.0.1:11000/health" "^(200|204)$" 60 2 || true
wait_http "http://127.0.0.1:11000/" "^(200|301|302|401|403)$" 60 2 || true
wait_http "http://127.0.0.1:11000/admin/" "^(200|301|302|401|403)$" 60 2 || true

echo "External check (optional):"
curl -I "${CHECK_URL:-https://goodspage.cn}" --max-time 8 | head -n 5 || true
echo "========================================="

echo "Cleaning up dangling images..."
docker image prune -f
