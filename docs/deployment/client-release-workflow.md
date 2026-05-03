# 客户端分包发布手册

## 目标

本手册用于统一管理以下事项：

- 主站更新
- Android 包在服务器上构建
- Windows / macOS / Linux 包发布到下载中心
- `/downloads` 页面与所有端安装包同步更新

## 固定目录

- 主站项目目录：`/var/www/tailchat-source`
- 下载配置：`server/public/downloads/client.json`
- 下载页面：`server/public/downloads/index.html`
- 安装包目录：`server/public/downloads/client/`

## 一次性更新主站

```bash
cd /var/www/tailchat-source
bash scripts/deploy-all.sh
```

这个脚本会自动执行：

- 拉取最新 `main`
- 校验 `docker-compose.env`
- `docker compose build --pull`
- `docker compose up -d --remove-orphans`
- 检查 `/`、`/admin/`、`/api/config/client`、`/downloads`、`/downloads/client.json`

## 在服务器上构建 Android 包并自动发布

前提：

- 已安装 Node / Yarn / Java / Android SDK
- `/etc/profile.d/caixun-build-env.sh` 可用

执行：

```bash
cd /var/www/tailchat-source
bash scripts/build-android-release.sh
```

这个脚本会自动：

- 写入最小 `client/mobile/.env`
- 安装移动端依赖
- 执行 `./gradlew --no-daemon assembleRelease`
- 将 APK 发布到 `server/public/downloads/client/caixun-android-release.apk`
- 更新 `server/public/downloads/client.json`
- 验证 `/downloads/client.json` 与 Android 下载地址

## 发布 Windows / macOS / Linux 包

说明：

- Windows 包建议在 Windows 环境构建
- macOS 包建议在 macOS 环境构建
- Linux 包可选，不是主推平台

将产物上传到服务器后执行：

```bash
cd /var/www/tailchat-source

bash scripts/publish-client-assets.sh \
  --windows /tmp/caixun-desktop-windows.zip --windows-version 1.0.0 \
  --macos /tmp/caixun-desktop-macos.dmg --macos-version 1.0.0 \
  --macos-arm64 /tmp/caixun-desktop-macos-arm64.dmg --macos-arm64-version 1.0.0
```

如需补 Linux 包：

```bash
cd /var/www/tailchat-source

bash scripts/publish-client-assets.sh \
  --linux /tmp/caixun-desktop-linux.AppImage --linux-version 1.0.0
```

## 全端同步更新推荐顺序

### 1. 更新主站

```bash
cd /var/www/tailchat-source
bash scripts/deploy-all.sh
```

### 2. 构建并发布 Android

```bash
cd /var/www/tailchat-source
bash scripts/build-android-release.sh
```

### 3. 发布 Windows / macOS / Linux 外部产物

```bash
cd /var/www/tailchat-source

bash scripts/publish-client-assets.sh \
  --windows /tmp/caixun-desktop-windows.zip --windows-version 1.0.0 \
  --macos /tmp/caixun-desktop-macos.dmg --macos-version 1.0.0 \
  --macos-arm64 /tmp/caixun-desktop-macos-arm64.dmg --macos-arm64-version 1.0.0
```

### 4. 终检

```bash
curl -m 10 -sS -o /dev/null -w "GET /downloads -> %{http_code}\n" http://127.0.0.1:11000/downloads
curl -m 10 -sS -o /dev/null -w "GET /downloads/client.json -> %{http_code}\n" http://127.0.0.1:11000/downloads/client.json
curl -m 10 -sS -o /dev/null -w "GET /downloads/client/caixun-android-release.apk -> %{http_code}\n" http://127.0.0.1:11000/downloads/client/caixun-android-release.apk
curl -m 10 -sS -o /dev/null -w "GET /downloads/client/caixun-desktop-windows.zip -> %{http_code}\n" http://127.0.0.1:11000/downloads/client/caixun-desktop-windows.zip
curl -m 10 -sS -o /dev/null -w "GET /downloads/client/caixun-desktop-macos.dmg -> %{http_code}\n" http://127.0.0.1:11000/downloads/client/caixun-desktop-macos.dmg
curl -m 10 -sS -o /dev/null -w "GET /downloads/client/caixun-desktop-macos-arm64.dmg -> %{http_code}\n" http://127.0.0.1:11000/downloads/client/caixun-desktop-macos-arm64.dmg
```

## iOS 说明

当前下载页中 iOS 入口为“即将推出”。

原因：

- iOS 不能像 Android APK 一样直接网页下载安装
- 一般需要 `TestFlight` 或 `App Store`
- 当前阶段建议先使用 Web 版作为 iPhone 访问入口

## 文件命名规范

下载中心统一使用以下文件名：

- `caixun-android-release.apk`
- `caixun-desktop-windows.zip`
- `caixun-desktop-macos.dmg`
- `caixun-desktop-macos-arm64.dmg`
- `caixun-desktop-linux.AppImage`
