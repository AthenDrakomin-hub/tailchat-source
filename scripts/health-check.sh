#!/usr/bin/env bash
set -euo pipefail

PROJECT_DIR="${TAILCHAT_DIR:-/var/www/tailchat-source}"
COMPOSE_FILE="${COMPOSE_FILE:-docker-compose.yml}"
ENV_FILE="${ENV_FILE:-docker-compose.env}"

echo "=== TIME/OS ==="; date; uname -a; echo
echo "=== DISK/MEM ==="; df -h / | tail -n 1 || true; free -h || true; echo

echo "=== NGINX TEST (optional) ==="
command -v nginx >/dev/null 2>&1 && nginx -t || echo "nginx not found, skip"
echo

echo "=== PORTS (80/443/11000/7880) ==="
command -v ss >/dev/null 2>&1 && ss -lntp | egrep ":80 |:443 |:11000 |:7880 " || true
echo

echo "=== DOCKER COMPOSE PS ==="
if [ -d "$PROJECT_DIR" ]; then
  (cd "$PROJECT_DIR" && docker compose -f "$COMPOSE_FILE" ps) || true
fi
echo

#
# NOTE:
# - 强制重建容器后，Traefik/后端服务会有一个短暂启动期；
# - 探活太早可能出现 404/502（通常等待几十秒后会恢复）。
#
sleep "${SLEEP_BEFORE_CHECK:-6}"

echo "=== ENV LINT ==="
if [ -d "$PROJECT_DIR" ] && [ -f "$PROJECT_DIR/scripts/env-lint.sh" ]; then
  (cd "$PROJECT_DIR" && bash scripts/env-lint.sh "$ENV_FILE") || true
fi
echo

http_code() {
  local url="$1"
  curl -sS -o /dev/null -w '%{http_code}' --max-time 5 "$url" || true
}

wait_http() {
  local url="$1"
  local ok_re="$2"
  local tries="${3:-60}"
  local sleep_s="${4:-2}"
  local i code
  for i in $(seq 1 "$tries"); do
    code="$(http_code "$url")"
    if echo "$code" | egrep -q "$ok_re"; then
      echo "✅ $url -> $code"
      return 0
    fi
    echo "⏳ [$i/$tries] $url -> $code (expect $ok_re)"
    sleep "$sleep_s"
  done
  echo "❌ $url still not ready" >&2
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

echo "=== HEALTHCHECK (internal first; bypass nginx) ==="
sleep "${SLEEP_BEFORE_CHECK:-6}"

wait_traefik_router "api-gw@docker" 30 1 || true
wait_traefik_router "admin@docker" 30 1 || true
wait_http "http://127.0.0.1:11000/health" "^(200|204)$" 60 2 || true
wait_http "http://127.0.0.1:11000/" "^(200|301|302|401|403)$" 60 2 || true
wait_http "http://127.0.0.1:11000/admin/" "^(200|301|302|401|403)$" 60 2 || true
echo

echo "External (optional):"
for u in "${CHECK_URL:-https://goodspage.cn}" "${CHECK_WM_URL:-}"; do
  [ -n "${u:-}" ] && echo "$u -> $(http_code "$u")"
done
echo

echo "LiveKit (optional):"
echo "http://127.0.0.1:7880 -> $(http_code "http://127.0.0.1:7880")"
echo

echo "=== RECENT ERRORS (nginx, optional) ==="
tail -n 60 /var/log/nginx/error.log 2>/dev/null || true
