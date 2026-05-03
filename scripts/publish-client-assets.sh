#!/usr/bin/env bash
set -Eeuo pipefail

APP_DIR="${APP_DIR:-/var/www/tailchat-source}"
DOWNLOAD_DIR="$APP_DIR/server/public/downloads/client"
CONFIG_FILE="$APP_DIR/server/public/downloads/client.json"

ANDROID_PATH=""
WINDOWS_PATH=""
MACOS_PATH=""
MACOS_ARM64_PATH=""
LINUX_PATH=""

ANDROID_VERSION=""
WINDOWS_VERSION=""
MACOS_VERSION=""
MACOS_ARM64_VERSION=""
LINUX_VERSION=""

usage() {
  cat <<'EOF'
用法：
  bash scripts/publish-client-assets.sh [选项]

支持的安装包参数：
  --android <path>        Android APK 文件
  --windows <path>        Windows ZIP 文件
  --macos <path>          macOS DMG 文件
  --macos-arm64 <path>    macOS Apple Silicon DMG 文件
  --linux <path>          Linux AppImage 文件

版本号参数（可选）：
  --android-version <ver>
  --windows-version <ver>
  --macos-version <ver>
  --macos-arm64-version <ver>
  --linux-version <ver>

示例：
  bash scripts/publish-client-assets.sh \
    --android /tmp/app-release.apk --android-version git-abcd123 \
    --windows /tmp/caixun-win.zip --windows-version 1.0.0
EOF
}

while [ $# -gt 0 ]; do
  case "$1" in
    --android) ANDROID_PATH="$2"; shift 2 ;;
    --windows) WINDOWS_PATH="$2"; shift 2 ;;
    --macos) MACOS_PATH="$2"; shift 2 ;;
    --macos-arm64) MACOS_ARM64_PATH="$2"; shift 2 ;;
    --linux) LINUX_PATH="$2"; shift 2 ;;
    --android-version) ANDROID_VERSION="$2"; shift 2 ;;
    --windows-version) WINDOWS_VERSION="$2"; shift 2 ;;
    --macos-version) MACOS_VERSION="$2"; shift 2 ;;
    --macos-arm64-version) MACOS_ARM64_VERSION="$2"; shift 2 ;;
    --linux-version) LINUX_VERSION="$2"; shift 2 ;;
    -h|--help) usage; exit 0 ;;
    *) echo "未知参数: $1"; usage; exit 1 ;;
  esac
done

mkdir -p "$DOWNLOAD_DIR"

copy_if_present() {
  local source_file="$1"
  local target_file="$2"

  if [ -z "$source_file" ]; then
    return 0
  fi

  if [ ! -f "$source_file" ]; then
    echo "文件不存在: $source_file"
    exit 1
  fi

  cp "$source_file" "$target_file"
  chmod 644 "$target_file"
  echo "已发布: $target_file"
}

copy_if_present "$ANDROID_PATH" "$DOWNLOAD_DIR/caixun-android-release.apk"
copy_if_present "$WINDOWS_PATH" "$DOWNLOAD_DIR/caixun-desktop-windows.zip"
copy_if_present "$MACOS_PATH" "$DOWNLOAD_DIR/caixun-desktop-macos.dmg"
copy_if_present "$MACOS_ARM64_PATH" "$DOWNLOAD_DIR/caixun-desktop-macos-arm64.dmg"
copy_if_present "$LINUX_PATH" "$DOWNLOAD_DIR/caixun-desktop-linux.AppImage"

python3 - "$CONFIG_FILE" "$DOWNLOAD_DIR" \
  "$ANDROID_VERSION" "$WINDOWS_VERSION" "$MACOS_VERSION" "$MACOS_ARM64_VERSION" "$LINUX_VERSION" <<'PY'
import json
import os
import sys
from datetime import datetime, timezone

config_file, download_dir, android_v, windows_v, macos_v, macos_arm_v, linux_v = sys.argv[1:]

with open(config_file, "r", encoding="utf-8") as f:
    data = json.load(f)

mapping = {
    "android": ("caixun-android-release.apk", android_v),
    "windows": ("caixun-desktop-windows.zip", windows_v),
    "darwin": ("caixun-desktop-macos.dmg", macos_v),
    "darwin-arm64": ("caixun-desktop-macos-arm64.dmg", macos_arm_v),
    "linux": ("caixun-desktop-linux.AppImage", linux_v),
}

for key, (filename, version) in mapping.items():
    full_path = os.path.join(download_dir, filename)
    entry = data.setdefault(key, {})
    entry["url"] = f"/downloads/client/{filename}"
    entry["version"] = version or entry.get("version") or "latest"
    if os.path.exists(full_path):
      stat = os.stat(full_path)
      entry["sizeBytes"] = stat.st_size
      entry["updatedAt"] = datetime.fromtimestamp(stat.st_mtime, tz=timezone.utc).isoformat()

with open(config_file, "w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False, indent=2)
    f.write("\n")
PY

echo "== 当前下载目录 =="
ls -lh "$DOWNLOAD_DIR"

echo "== 当前下载配置 =="
cat "$CONFIG_FILE"

echo "== 本机验证 =="
curl -m 10 -sS -o /dev/null -w "GET /downloads/client.json -> %{http_code}\n" http://127.0.0.1:11000/downloads/client.json || true
for target in \
  "caixun-android-release.apk" \
  "caixun-desktop-windows.zip" \
  "caixun-desktop-macos.dmg" \
  "caixun-desktop-macos-arm64.dmg" \
  "caixun-desktop-linux.AppImage"
do
  if [ -f "$DOWNLOAD_DIR/$target" ]; then
    curl -m 10 -sS -o /dev/null -w "GET /downloads/client/$target -> %{http_code}\n" "http://127.0.0.1:11000/downloads/client/$target" || true
  fi
done
