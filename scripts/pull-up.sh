#!/usr/bin/env bash
# 新服务器（运行机）更新专用脚本
set -e

cd /var/www/tailchat-source

echo "=== [1/2] Pulling latest image ==="
docker compose pull

echo "=== [2/2] Restarting services ==="
docker compose up -d --force-recreate --remove-orphans
docker compose ps

echo "========================================="
echo "✅ Update to 'latest' Successful!"
echo "Running healthcheck..."
curl -I "https://goodspage.cn" | head -n 5 || true
echo "========================================="

echo "Cleaning up dangling images..."
docker image prune -f
