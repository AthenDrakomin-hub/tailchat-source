#!/usr/bin/env bash
set -euo pipefail
cd /var/www/tailchat-source
git pull --rebase
docker compose build --no-cache
docker compose up -d
docker compose ps
