# 財訊客户端下载目录

主站会直接提供以下下载地址：

- `/downloads/client/caixun-android-release.apk`
- `/downloads/client/caixun-desktop-windows.zip`
- `/downloads/client/caixun-desktop-macos.dmg`
- `/downloads/client/caixun-desktop-macos-arm64.dmg`
- `/downloads/client/caixun-desktop-linux.AppImage`

推荐不要手工复制文件，而是统一使用：

## Android 服务器构建并发布

```bash
cd /var/www/tailchat-source
bash scripts/build-android-release.sh
```

## Windows / macOS / Linux 外部产物发布

```bash
cd /var/www/tailchat-source

bash scripts/publish-client-assets.sh \
  --windows /tmp/caixun-desktop-windows.zip --windows-version 1.0.0 \
  --macos /tmp/caixun-desktop-macos.dmg --macos-version 1.0.0 \
  --macos-arm64 /tmp/caixun-desktop-macos-arm64.dmg --macos-arm64-version 1.0.0
```

这样会同时：

- 将文件复制到当前目录
- 更新 `server/public/downloads/client.json`
- 验证下载地址是否可访问
