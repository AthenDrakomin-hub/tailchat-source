# 財訊客户端下载目录

将客户端安装包放到当前目录后，主站会直接提供以下下载地址：

- `/downloads/client/caixun-android-release.apk`
- `/downloads/client/caixun-desktop-windows.zip`
- `/downloads/client/caixun-desktop-macos.dmg`
- `/downloads/client/caixun-desktop-macos-arm64.dmg`
- `/downloads/client/caixun-desktop-linux.AppImage`

如果你已经在服务器上通过 `docker compose` 部署主站，只需要：

1. 将安装包复制到 `server/public/downloads/client/`
2. 执行 `docker compose --env-file docker-compose.env up -d --remove-orphans`

无需单独发布 `website`。
