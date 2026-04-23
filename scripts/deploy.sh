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

echo "[3/6] Ensure env file..."
if [ ! -f docker-compose.env ]; then
  if [ -f docker-compose.env.example ]; then
    cp docker-compose.env.example docker-compose.env
    echo "Created docker-compose.env from example."
    echo "Please edit: $APP_DIR/docker-compose.env"
    exit 2
  else
    echo "Missing docker-compose.env and docker-compose.env.example" >&2
    exit 2
  fi
fi

echo "[4/6] Pull images..."
docker compose pull

echo "[5/6] Up..."
docker compose up -d

echo "[6/6] Status:"
docker compose ps
