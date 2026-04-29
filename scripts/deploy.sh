#!/usr/bin/env bash
set -euo pipefail

REPO_URL="https://github.com/AthenDrakomin-hub/tailchat-source.git"
APP_DIR="/var/www/tailchat-source"
BRANCH="main"

echo "[1/6] Ensure docker..."
if ! command -v docker >/dev/null 2>&1; then
  if [ -f /etc/os-release ]; then . /etc/os-release; fi
  if command -v apt-get >/dev/null 2>&1; then
    apt-get update
    apt-get install -y ca-certificates curl git
    install -m 0755 -d /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/${ID}/gpg -o /etc/apt/keyrings/docker.asc
    chmod a+r /etc/apt/keyrings/docker.asc
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/${ID} ${VERSION_CODENAME} stable" \
      > /etc/apt/sources.list.d/docker.list
    apt-get update
    apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
  else
    echo "Unsupported OS (no apt-get). Please install Docker manually." >&2
    exit 1
  fi
fi

echo "[2/6] Clone or update repo..."
mkdir -p "$(dirname "$APP_DIR")"
if [ ! -d "$APP_DIR/.git" ]; then
  rm -rf "$APP_DIR"
  git clone "$REPO_URL" "$APP_DIR"
fi
cd "$APP_DIR"
git fetch --all
git checkout "$BRANCH"
git pull --rebase

echo "[3/6] Ensure env file (docker-compose.env)..."
if [ ! -f docker-compose.env ]; then
  if [ -f docker-compose.env.example ]; then
    cp docker-compose.env.example docker-compose.env
    echo "Created docker-compose.env from example."
  else
    echo "Missing docker-compose.env and docker-compose.env.example" >&2
    exit 2
  fi
fi

upsert_env() {
  local key="$1"
  local value="${2:-}"
  local file="${3:-docker-compose.env}"
  if [ -z "${value}" ]; then
    return 0
  fi
  local esc
  esc="$(printf '%s' "$value" | sed -e 's/[\\/&]/\\&/g')"
  if grep -Eq "^${key}=" "$file"; then
    sed -i "s#^${key}=.*#${key}=${esc}#g" "$file"
  else
    printf "\n%s=%s\n" "$key" "$value" >>"$file"
  fi
}

echo "Injecting env values (if provided)..."
upsert_env "API_URL" "${API_URL:-}"
upsert_env "SECRET" "${SECRET:-}"
upsert_env "ADMIN_USER" "${ADMIN_USER:-}"
upsert_env "ADMIN_PASS" "${ADMIN_PASS:-}"
upsert_env "MINIO_ROOT_USER" "${MINIO_ROOT_USER:-}"
upsert_env "MINIO_ROOT_PASSWORD" "${MINIO_ROOT_PASSWORD:-}"
upsert_env "MINIO_URL" "${MINIO_URL:-}"
upsert_env "MINIO_USER" "${MINIO_USER:-}"
upsert_env "MINIO_PASS" "${MINIO_PASS:-}"
upsert_env "MINIO_BUCKET_NAME" "${MINIO_BUCKET_NAME:-}"
upsert_env "LIVEKIT_URL" "${LIVEKIT_URL:-}"
upsert_env "LIVEKIT_PUBLIC_URL" "${LIVEKIT_PUBLIC_URL:-}"
upsert_env "LIVEKIT_KEYS" "${LIVEKIT_KEYS:-}"
upsert_env "TRAEFIK_TRUSTED_PROXIES" "${TRAEFIK_TRUSTED_PROXIES:-}"
upsert_env "SOCKETIO_CORS_ORIGINS" "${SOCKETIO_CORS_ORIGINS:-}"
upsert_env "OIDC_REQUIRE_PKCE" "${OIDC_REQUIRE_PKCE:-}"
upsert_env "EXIT_ON_UNCAUGHT" "${EXIT_ON_UNCAUGHT:-}"
upsert_env "DEFENSE_SHARED_SECRET" "${DEFENSE_SHARED_SECRET:-}"
upsert_env "PROMETHEUS" "${PROMETHEUS:-}"

echo "Validating env..."
if [ -f "scripts/env-lint.sh" ]; then
  bash scripts/env-lint.sh "docker-compose.env"
fi

require_env() {
  local key="$1"
  local file="${2:-docker-compose.env}"
  local line
  line="$(grep -E "^${key}=" "$file" | tail -n 1 || true)"
  local v="${line#${key}=}"
  if [ -z "${v:-}" ] || echo "$v" | grep -Eq '^(CHANGE_ME|CHANGE_ME_.*)$'; then
    echo "❌ Missing required env: $key" >&2
    echo "   Please run again with: $key=... (export or inline env), or edit $APP_DIR/docker-compose.env" >&2
    exit 2
  fi
}

require_env "API_URL"
require_env "SECRET"
require_env "ADMIN_PASS"
require_env "MINIO_ROOT_PASSWORD"
require_env "DEFENSE_SHARED_SECRET"

echo "[4/6] Build..."
docker compose build --pull

echo "[5/6] Up..."
docker compose up -d --remove-orphans

echo "[6/6] Status:"
docker compose ps

echo "Healthcheck (optional):"
if [ -f "scripts/health-check.sh" ]; then
  bash scripts/health-check.sh || true
fi
