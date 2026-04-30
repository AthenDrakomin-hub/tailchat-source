#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "=== 容器状态 ==="
(cd "$ROOT_DIR" && docker compose ps)
echo ""

echo "=== 执行器连通性 ==="
(cd "$ROOT_DIR" && docker compose exec -T tailchat-admin node -e "
const http = require('http');
const url = process.env.OPS_EXECUTOR_URL || 'http://172.18.0.1:9110';
http.get(url.replace(/\\/+$/, '') + '/livekit/status', res => { process.exit(0); }).on('error', () => { process.exit(1); });
") && echo "✅ 执行器可达" || echo "❌ 执行器不可达"

