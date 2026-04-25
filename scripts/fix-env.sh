#!/usr/bin/env bash
# 一键修复 docker-compose.env 中常见的“复制粘贴/符号”问题
# - 去掉反引号/全角反引号
# - 去掉 API_URL/LIVEKIT_URL/MINIO_URL 的首尾引号
# - 修正常见的 “URL 被包裹成 `https://...` / 'https://...' / \"https://...\" ”
set -euo pipefail

ENV_FILE="${1:-docker-compose.env}"

if [ ! -f "$ENV_FILE" ]; then
  echo "❌ fix-env: $ENV_FILE not found"
  exit 1
fi

echo "✅ fix-env: cleaning $ENV_FILE ..."

# 1) 去掉反引号
perl -pi -e "s/\\x60//g; s/｀//g" "$ENV_FILE"

# 2) 去掉关键字段的首尾引号（只处理成对的单引号/双引号）
strip_wrap() {
  local key="$1"
  # 使用 perl 精准替换：KEY="xxx" -> KEY=xxx；KEY='xxx' -> KEY=xxx
  perl -pi -e "s/^(${key})=\\\"(.*)\\\"\\s*\$/\\1=\\2/; s/^(${key})='(.*)'\\s*\$/\\1=\\2/" "$ENV_FILE"
}

strip_wrap "API_URL"
strip_wrap "LIVEKIT_URL"
strip_wrap "MINIO_URL"

echo "✅ fix-env: done."
echo "   Next: bash scripts/env-lint.sh $ENV_FILE"

