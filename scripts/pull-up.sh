#!/usr/bin/env bash
# 新服务器（运行机）更新专用脚本
set -e

if [ -z "${TAG:-}" ]; then
  echo "Error: You must provide a TAG variable."
  echo "Usage: TAG=20260423-1045 ./scripts/pull-up.sh"
  exit 1
fi

cd /var/www/tailchat-source

echo "=== [1/3] Updating docker-compose.yml to use new TAG: $TAG ==="
# 只精确替换 athendrakomin/caifu-chat 相关的 image tag
perl -0777 -pi -e "s/image:\s*athendrakomin\/caifu-chat:[^\s]+/image: athendrakomin\/caifu-chat:$ENV{TAG}/g" docker-compose.yml

echo "=== [2/3] Pulling new image ==="
docker compose pull

echo "=== [3/3] Restarting services ==="
docker compose up -d
docker compose ps

echo "========================================="
echo "✅ Update to $TAG Successful!"
echo "Running healthcheck..."
curl -I "https://goodspage.cn" | head -n 5 || true
echo "========================================="
