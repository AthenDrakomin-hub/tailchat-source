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

#
# NOTE:
# - 首次拉起/强制重建后，Traefik 需要一点时间从 Docker 读取 labels 并生成路由；
# - service-core 也需要时间完成启动并开始监听 3000 端口；
# - 若探活太早，可能出现短暂的 404/502（并不代表最终启动失败）。
#
# 可通过环境变量调整等待时间：
#   SLEEP_BEFORE_CHECK=10 IMAGE_TAG=xxxx bash scripts/pull-up.sh
#
sleep "${SLEEP_BEFORE_CHECK:-8}"

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

# 等待 Traefik 加载到关键路由（避免“路由尚未加载完成”导致的误判）
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
  echo "   Hint: check traefik routers and logs:" >&2
  echo "     curl -s http://127.0.0.1:11001/api/http/routers | head -n 200" >&2
  echo "     docker logs --tail=200 tailchat-source-traefik-1" >&2
  return 1
}

# 先等路由加载完成（即使失败也不阻断后续探活输出，便于定位）
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
