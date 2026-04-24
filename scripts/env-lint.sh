#!/usr/bin/env bash
# 检查 env 文件中是否含有非法字符/非法格式（比如反引号、错误的 MINIO_URL）
set -euo pipefail

ENV_FILE="${1:-docker-compose.env}"

if [ ! -f "$ENV_FILE" ]; then
  echo "⚠️ env-lint: $ENV_FILE not found, skip."
  exit 0
fi

if grep -Fq '`' "$ENV_FILE" || grep -Fq '｀' "$ENV_FILE"; then
  echo "❌ ERROR: Found backticks (\` or ｀) in $ENV_FILE!"
  echo "   This will break shell parsing / env parsing and cause extremely confusing runtime bugs."
  echo "   Fix: remove them (recommended):"
  echo "        perl -pi -e \"s/\\x60//g; s/｀//g\" $ENV_FILE"
  exit 1
fi

# MINIO_URL 只能是 host:port（例如 minio:9000），不能带 http(s)://
MINIO_URL="$(awk -F= '/^MINIO_URL=/{print $2}' "$ENV_FILE" | tail -n 1 || true)"
if [ -n "${MINIO_URL:-}" ]; then
  if echo "$MINIO_URL" | grep -Eqi '^https?://'; then
    echo "❌ ERROR: MINIO_URL must be host:port (e.g. minio:9000), NOT a URL with scheme."
    echo "   Current: MINIO_URL=$MINIO_URL"
    echo "   Fix: set MINIO_URL=minio:9000"
    exit 1
  fi
  if echo "$MINIO_URL" | grep -q '/'; then
    echo "❌ ERROR: MINIO_URL must not contain '/', only host:port is allowed."
    echo "   Current: MINIO_URL=$MINIO_URL"
    echo "   Fix: set MINIO_URL=minio:9000"
    exit 1
  fi
fi

# API_URL 必须带 http(s)://（用于客户端生成正确的请求地址）
API_URL="$(awk -F= '/^API_URL=/{print $2}' "$ENV_FILE" | tail -n 1 || true)"
if [ -n "${API_URL:-}" ] && ! echo "$API_URL" | grep -Eqi '^https?://'; then
  echo "❌ ERROR: API_URL must start with http:// or https://"
  echo "   Current: API_URL=$API_URL"
  exit 1
fi

echo "✅ env-lint: $ENV_FILE looks good."
exit 0