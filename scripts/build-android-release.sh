#!/usr/bin/env bash
set -Eeuo pipefail

APP_DIR="${APP_DIR:-/var/www/tailchat-source}"
PROFILE_FILE="${PROFILE_FILE:-/etc/profile.d/caixun-build-env.sh}"
ANDROID_VERSION="${ANDROID_VERSION:-git-$(git -C "$APP_DIR" rev-parse --short HEAD 2>/dev/null || echo latest)}"

if [ -f "$PROFILE_FILE" ]; then
  # shellcheck disable=SC1090
  source "$PROFILE_FILE"
fi

export NODE_OPTIONS="${NODE_OPTIONS:---max-old-space-size=1024}"
export GRADLE_OPTS="${GRADLE_OPTS:--Dorg.gradle.daemon=false -Dorg.gradle.jvmargs=-Xmx768m}"

echo "== 1. 检查环境 =="
node -v
yarn -v
java -version

echo "== 2. 准备移动端配置 =="
mkdir -p "$APP_DIR/client/mobile/android"
cat > "$APP_DIR/client/mobile/.env" <<'EOF'
GETUI_APPID=
GETUI_HUAWEI_APP_ID=
ENABLE_GETUI_PUSH=false
EOF

if [ ! -f "$APP_DIR/client/mobile/android/local.properties" ] && [ -n "${ANDROID_HOME:-}" ]; then
  cat > "$APP_DIR/client/mobile/android/local.properties" <<EOF
sdk.dir=${ANDROID_HOME}
EOF
fi

echo "== 3. 安装移动端依赖 =="
cd "$APP_DIR/client/mobile"
yarn install --network-timeout 600000

echo "== 4. 清理旧产物 =="
rm -rf android/.gradle
rm -rf android/app/build

echo "== 5. 构建 Android APK =="
cd "$APP_DIR/client/mobile/android"
chmod +x gradlew
./gradlew --no-daemon assembleRelease

APK_PATH="$APP_DIR/client/mobile/android/app/build/outputs/apk/release/app-release.apk"
if [ ! -f "$APK_PATH" ]; then
  echo "未找到 APK: $APK_PATH"
  exit 1
fi

echo "== 6. 发布到下载目录 =="
"$APP_DIR/scripts/publish-client-assets.sh" \
  --android "$APK_PATH" \
  --android-version "$ANDROID_VERSION"

echo "== 7. APK 产物 =="
ls -lh "$APK_PATH"
