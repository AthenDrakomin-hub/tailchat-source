#!/usr/bin/env bash
# 检查 env 文件中是否含有非法字符（比如反引号）
set -euo pipefail

ENV_FILE="${1:-docker-compose.env}"

if [ ! -f "$ENV_FILE" ]; then
  echo "⚠️ env-lint: $ENV_FILE not found, skip."
  exit 0
fi

if grep -Fq '`' "$ENV_FILE"; then
  echo "❌ ERROR: Found backticks (\`) in $ENV_FILE!"
  echo "   This will break docker-compose variable interpolation."
  echo "   Please remove or replace them (e.g. use single/double quotes)."
  echo "   You can fix it by running: perl -pi -e 's/\`//g' $ENV_FILE"
  exit 1
fi

echo "✅ env-lint: $ENV_FILE looks good."
exit 0