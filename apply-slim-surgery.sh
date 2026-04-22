#!/usr/bin/env bash
set -euo pipefail

ROOT="$(pwd)"
test -f "$ROOT/docker-compose.yml" || { echo "ERROR: 请在仓库根目录运行（缺少 docker-compose.yml）"; exit 1; }

python3 - <<'PY'
from __future__ import annotations
from pathlib import Path
import re, shutil

root = Path(".").resolve()

def read(p: Path) -> str:
  return p.read_text("utf-8", errors="ignore")

def write(p: Path, s: str):
  p.parent.mkdir(parents=True, exist_ok=True)
  p.write_text(s, "utf-8")

def ensure_line_after_title(p: Path, title_prefix: str, line: str):
  s = read(p)
  if line in s:
    return
  lines = s.splitlines(True)
  for i, l in enumerate(lines):
    if l.startswith(title_prefix):
      lines.insert(i+1, "\n" + line + "\n")
      write(p, "".join(lines))
      return

def patch_readme_md():
  p = root / "README.md"
  if not p.exists():
    return
  s = read(p)
  s = s.replace("  * **强制语音**：通话界面不提供摄像头按钮，避免变成视频会议。",
                "  * **默认语音**：默认以语音通话为主；如业务确有需要也可开启视频能力（可通过配置开关强制纯语音）。")
  write(p, s)

def patch_readme_zh():
  p = root / "README.zh.md"
  if not p.exists():
    return
  ensure_line_after_title(p, "# Tailchat", "[本仓库精简定制版说明（伪直播 + 私信语音 + 机器人小号）](./README.custom.md)")

def ensure_readme_custom():
  p = root / "README.custom.md"
  if p.exists():
    return
  write(p, """# Tailchat 精简定制版（免费/开源方案）

本仓库主分支是基于 Tailchat 的**精简定制版**，目标是：

- **私信语音通话（DM Call）**：基于 **LiveKit（开源自建）**，只保留私信入口
- **伪直播（MP4 → HLS）**：基于 `com.msgbyte.pseudolive`（ffmpeg 转码 + HLS 播放）
- **机器人小号（不烧钱）**：用“普通账号 JWT + 话术脚本”活跃群聊，不接任何付费 AI API
- **删除所有付费/第三方集成插件**（Agora/个推/WxPusher/GitHub OAuth/会议/通知等）

> 手机 App：移动端为 **React Native WebView 壳**，加载同一个 Web 站点，因此 Web 端功能可直接在 App 使用（无需额外原生 SDK 集成）。

## 一键部署（Docker Compose）

```bash
docker compose build --no-cache
docker compose up -d
docker compose ps
curl -i http://127.0.0.1:11000/health
```

## LiveKit（语音通话）

关键环境变量（`docker-compose.env`）：
- `LIVEKIT_URL=http://livekit:7880`
- `LIVEKIT_PUBLIC_URL=wss://chat.yefeng.us.cc/livekit`
- `LIVEKIT_API_KEY` / `LIVEKIT_API_SECRET`（默认 devkey/devsecret 仅用于测试，正式环境请替换）

若使用仓库的 `docker/swag.yml` 做 HTTPS：
`docker/config/nginx.conf` 已增加 `/livekit/` 反代到宿主机 `127.0.0.1:7880`。

## 伪直播（MP4→HLS）

群管理上传 MP4 → 后端转 HLS → 频道出现直播卡片 → 群员点击播放。

## 机器人小号（JWT 话术脚本）

脚本：`scripts/pseudolive-bot.ts`
样例配置：`scripts/pseudolive-bot.example.json`
""")

def patch_docker_compose_env():
  p = root / "docker-compose.env"
  if not p.exists():
    raise SystemExit("docker-compose.env not found")
  s = read(p)

  if "LIVEKIT_URL=" not in s:
    s += "\n\n# LiveKit (开源语音通话)\n"
    s += "LIVEKIT_URL=http://livekit:7880\n"
    s += "LIVEKIT_PUBLIC_URL=wss://chat.yefeng.us.cc/livekit\n"
    s += "LIVEKIT_API_KEY=devkey\n"
    s += "LIVEKIT_API_SECRET=devsecret\n"
    s += "LIVEKIT_FORCE_AUDIO_ONLY=0\n"

  write(p, s)

def patch_nginx_conf():
  p = root / "docker/config/nginx.conf"
  if not p.exists():
    return
  s = read(p)
  if "location ^~ /livekit/" in s:
    return

  marker = "location / {\n        proxy_pass http://127.0.0.1:11000;\n    }\n"
  block = """    # LiveKit (WebSocket + HTTP)
    # 将 /livekit/ 反代到宿主机 7880（docker compose 的 livekit 服务映射端口）
    # 说明：proxy_pass 末尾带 / 用于去掉前缀 /livekit
    location ^~ /livekit/ {
        proxy_pass http://127.0.0.1:7880/;
        proxy_http_version 1.1;
        proxy_redirect off;
        proxy_request_buffering off;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection $connection_upgrade;
        proxy_read_timeout 86400;
        proxy_set_header Host $http_host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

"""
  if marker not in s:
    raise SystemExit("nginx.conf marker not found; please add /livekit/ block manually")
  write(p, s.replace(marker, block + marker, 1))

def patch_livekit_server_plugin():
  p = root / "server/plugins/com.msgbyte.livekit/services/livekit.service.ts"
  if not p.exists():
    return
  s = read(p)
  if "get livekitPublicUrl()" not in s:
    s = s.replace(
      "  get livekitUrl() {\n    return process.env.LIVEKIT_URL;\n  }\n",
      "  get livekitUrl() {\n    return process.env.LIVEKIT_URL;\n  }\n\n  /**\n   * 给客户端返回的 LiveKit 连接地址（应为公网可访问的 WSS/HTTPS）\n   * - 示例：wss://chat.yefeng.us.cc/livekit\n   * - 若未配置，则回退使用 LIVEKIT_URL\n   */\n  get livekitPublicUrl() {\n    return process.env.LIVEKIT_PUBLIC_URL || this.livekitUrl;\n  }\n",
      1,
    )
  s = s.replace("      url: this.livekitUrl,", "      url: this.livekitPublicUrl,", 1)
  write(p, s)

def patch_livekit_web_dm_only():
  p = root / "server/plugins/com.msgbyte.livekit/web/plugins/com.msgbyte.livekit/src/index.tsx"
  if not p.exists():
    return
  s = read(p)
  s = s.replace("import { usePersionPanelIsShow } from './navbar/useIconIsShow';\n", "")
  s = s.replace("  useIsShow: usePersionPanelIsShow,", "  useIsShow: () => false,", 1)
  write(p, s)

def patch_livekit_defaults_audio():
  p = root / "server/plugins/com.msgbyte.livekit/web/plugins/com.msgbyte.livekit/src/components/LivekitView.tsx"
  if not p.exists():
    return
  s = read(p)
  s = s.replace("audioEnabled: false,", "audioEnabled: true,", 1)
  write(p, s)

def patch_builtin_plugin_list():
  p = root / "client/web/src/plugin/builtin.ts"
  if not p.exists():
    return
  s = read(p)
  s = re.sub(r"\n\s*\{\n\s*label: 'Identity and Access Management'[\s\S]*?requireRestart: true,\n\s*\},\n", "\n", s, count=1)
  s = re.sub(r"\n\s*\{\n\s*label: 'Audio and video service \$WIP\$'[\s\S]*?requireRestart: true,\n\s*\},\n", "\n", s, count=1)
  write(p, s)

def remove_simplenotify_sdk():
  p = root / "client/packages/tailchat-client-sdk/src/index.ts"
  if p.exists():
    write(p, read(p).replace("export * from './plugins/simplenotify';\n", ""))
  sp = root / "client/packages/tailchat-client-sdk/src/plugins/simplenotify.ts"
  if sp.exists():
    sp.unlink()

def patch_docker_compose_yml():
  p = root / "docker-compose.yml"
  s = read(p)

  if "SERVICES: plugins/com.msgbyte.pseudolive" not in s:
    s = s.replace(
      "  service-all-plugins:\n    <<: *tailchat-base\n    environment:\n      SERVICEDIR: plugins\n",
      "  service-all-plugins:\n    <<: *tailchat-base\n    depends_on:\n      - mongo\n      - redis\n      - minio\n      - livekit\n    environment:\n      SERVICEDIR: plugins\n      # 只加载“免费且必需”的插件服务，避免无关插件缺少 env 或不兼容导致容器反复重启\n      SERVICES: plugins/com.msgbyte.pseudolive/services/*.service.js,plugins/com.msgbyte.livekit/services/*.service.js\n",
      1,
    )

  marker = "\n  # Database\n  mongo:\n"
  if "\n  livekit:\n" not in s:
    if marker not in s:
      raise SystemExit("docker-compose.yml marker not found for inserting livekit service")
    livekit_block = """\n  # LiveKit Server (Open Source)\n  # - 提供 WebRTC SFU，用于私信语音通话\n  # - 说明：若要在复杂网络/移动网络更稳定，通常还需要 TURN（可后续增加）\n  livekit:\n    image: livekit/livekit-server:latest\n    restart: unless-stopped\n    networks:\n      - internal\n    env_file: docker-compose.env\n    ports:\n      - \"7880:7880\"\n      - \"7881:7881/tcp\"\n      - \"50000-50100:50000-50100/udp\"\n    command: >\n      sh -lc '\n      cat > /livekit.yaml <<EOF\n      port: 7880\n      rtc:\n        tcp_port: 7881\n        udp_port: 7881\n        port_range_start: 50000\n        port_range_end: 50100\n        use_external_ip: true\n      keys:\n        ${LIVEKIT_API_KEY}: ${LIVEKIT_API_SECRET}\n      EOF\n      livekit-server --config /livekit.yaml\n      '\n\n"""
    s = s.replace(marker, livekit_block + marker, 1)

  write(p, s)

def delete_paid_plugins():
  to_delete = [
    "server/plugins/com.msgbyte.agora",
    "server/plugins/com.msgbyte.getui",
    "server/plugins/com.msgbyte.wxpusher",
    "server/plugins/com.msgbyte.github",
    "server/plugins/com.msgbyte.iam",
    "server/plugins/com.msgbyte.meeting",
    "server/plugins/com.msgbyte.simplenotify",
  ]
  for rel in to_delete:
    d = root / rel
    if d.exists():
      shutil.rmtree(d)

def delete_getui_demo():
  d = root / "server/test/demo/getui"
  if d.exists():
    shutil.rmtree(d)

patch_readme_md()
patch_readme_zh()
ensure_readme_custom()
patch_docker_compose_env()
patch_docker_compose_yml()
patch_nginx_conf()
patch_livekit_server_plugin()
patch_livekit_web_dm_only()
patch_livekit_defaults_audio()
patch_builtin_plugin_list()
remove_simplenotify_sdk()
delete_paid_plugins()
delete_getui_demo()

print("OK: surgery changes applied to working tree")
PY

echo
echo "== 下一步（复制执行）=="
echo "git status"
echo "docker compose down --remove-orphans"
echo "docker compose build --no-cache"
echo "docker compose up -d"
echo "docker compose ps"
echo "curl -i http://127.0.0.1:11000/health"
echo
echo "如果你用 docker/swag.yml 做 HTTPS，需要重启 swag 应用 nginx.conf："
echo "docker compose -f docker/swag.yml up -d --build"
