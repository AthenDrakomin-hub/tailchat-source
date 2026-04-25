#!/usr/bin/env bash
# 老服务器（构建机）发版专用脚本
set -e

cd /var/www/tailchat-source

echo "=== [1/3] Syncing latest source code from GitHub ==="
git fetch --all
git checkout main
git pull --rebase

DOCKERHUB_USER="athendrakomin"
IMAGE="caifu-chat"
TAG="$(date +%Y%m%d-%H%M)"
FULL_IMAGE_NAME="$DOCKERHUB_USER/$IMAGE:$TAG"

echo "=== [2/3] Building new image ==="
docker build -t athendrakomin/caifu-chat:latest --no-cache \
  --build-arg VERSION="$TAG" \
  --build-arg ENABLE_SENTRY_PLUGIN="${ENABLE_SENTRY_PLUGIN:-}" \
  --build-arg ENABLE_POSTHOG_PLUGIN="${ENABLE_POSTHOG_PLUGIN:-}" \
  --build-arg DISABLE_SERVICE_WORKER="${DISABLE_SERVICE_WORKER:-}" \
  .

echo "=== [3/3] Tagging and pushing to Docker Hub ==="
docker tag athendrakomin/caifu-chat:latest "$FULL_IMAGE_NAME"
docker push "$FULL_IMAGE_NAME"

echo "========================================="
echo "✅ Build & Push Successful!"
echo "👉 NEW_IMAGE=$FULL_IMAGE_NAME"
echo "Please use this TAG ($TAG) to update the new server."
echo "========================================="
