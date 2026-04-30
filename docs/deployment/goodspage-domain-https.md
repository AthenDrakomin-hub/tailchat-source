# goodspage.cn 域名 + 自有证书 HTTPS（Nginx 反代）

## 背景与目标

- 域名：`goodspage.cn`（已解析到服务器 `45.32.248.214`）
- HTTPS 证书：自有证书（不使用 certbot / Let's Encrypt）
- Tailchat 对外入口：`http://127.0.0.1:11000`（Traefik 暴露的 HTTP 入口，仅本机可访问）

用户访问目标：

- `https://goodspage.cn/` 访问 Web
- `https://goodspage.cn/admin/` 访问后台

必须满足：

- `/socket.io` WebSocket（Socket.IO）连接正常（包含 Upgrade/Connection 等 Header）
- 允许大文件上传（`client_max_body_size 2048m`）

## 1. 上传证书到服务器

建议放到：

- `/etc/nginx/ssl/`

示例（文件名仅作参考，请以你购买证书的实际文件为准）：

- `/etc/nginx/ssl/goodspage.cn.fullchain.pem`
- `/etc/nginx/ssl/goodspage.cn.privkey.pem`

注意：

- 私钥文件权限建议收紧（例如仅 root 可读），避免泄露
- Nginx 配置中的 `ssl_certificate` / `ssl_certificate_key` 必须指向你实际放置的路径

## 2. 安装 Nginx 配置（80 跳转到 443）

仓库已提供示例配置：

- [nginx.goodspage.cn.example.conf](file:///workspace/docs/nginx.goodspage.cn.example.conf)

在服务器上执行（以 Debian/Ubuntu 的常见目录结构为例）：

```bash
cp /var/www/tailchat-source/docs/nginx.goodspage.cn.example.conf /etc/nginx/sites-available/tailchat.conf
ln -sf /etc/nginx/sites-available/tailchat.conf /etc/nginx/sites-enabled/tailchat.conf
```

然后编辑 `/etc/nginx/sites-available/tailchat.conf`：

- 确认 `server_name` 为 `goodspage.cn`
- 将证书路径替换成你的真实路径（示例文件中为 `/etc/nginx/ssl/...` 占位符）

## 3. 检查与重载 Nginx

```bash
nginx -t
systemctl reload nginx
```

## 4. 验证访问

浏览器验证：

- `https://goodspage.cn/`
- `https://goodspage.cn/admin/`

如启用 LiveKit 且采用同域名反代（推荐），还应验证：

- `https://goodspage.cn/livekit/`（应能返回 200/101 等，至少不应是 502/404）

并确保 `docker-compose.env` 中配置：

- `LIVEKIT_PUBLIC_URL=wss://goodspage.cn/livekit`

同时建议验证 WebSocket：

- 打开浏览器 DevTools → Network → WS，确认 `wss://goodspage.cn/socket.io/...` 可建立连接

## 5. LiveKit 同域名反代（Nginx）

若你希望客户端通过 `wss://goodspage.cn/livekit` 连接 LiveKit（推荐），需要在 Nginx 中加入 `/livekit/` 反代规则。

仓库示例配置文件 [nginx.goodspage.cn.example.conf](file:///workspace/docs/nginx.goodspage.cn.example.conf) 已包含：

```nginx
location = /livekit {
    return 301 /livekit/;
}

location ^~ /livekit/ {
    proxy_pass http://127.0.0.1:7880/;
    proxy_http_version 1.1;

    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;

    proxy_read_timeout 86400;
    proxy_send_timeout 86400;
    proxy_buffering off;
}
```

## 6. 端口与防火墙建议

- 对公网开放：`80`、`443`
- `11000` 建议仅本机访问（`127.0.0.1:11000`），由 Nginx 反代对外提供 HTTPS
- 不建议将 `11000` 直接暴露到公网，避免绕过 Nginx/HTTPS/域名策略并扩大攻击面
