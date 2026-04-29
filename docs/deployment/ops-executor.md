# 受控执行器（Ops Executor）

用于在宿主机提供一个仅本机可访问的 HTTP 接口，给管理后台「系统控制台」调用，实现：

- LiveKit 一键启动 / 停止 / 重启

执行器默认只监听：`127.0.0.1:9110`，强烈建议不要对公网开放。

## A. 配置环境变量（docker-compose.env）

编辑：

```bash
nano /var/www/tailchat-source/docker-compose.env
```

必须有：

- `EXECUTOR_SHARED_SECRET=一段长随机字符串(>=32位)`
- `DEFENSE_SHARED_SECRET=一段长随机字符串(>=32位)`
- `API_URL=https://goodpage.cn`（不要反引号）

然后跑校验：

```bash
cd /var/www/tailchat-source
bash scripts/env-lint.sh docker-compose.env
```

## B. 安装并启动“受控执行器”（systemd）

需要宿主机具备：

- `python3`
- `docker`（以及 `docker compose` 插件）

复制 service 模板：

```bash
sudo mkdir -p /etc/systemd/system
sudo cp /var/www/tailchat-source/scripts/ops-executor/tailchat-ops-executor.service.example \
  /etc/systemd/system/tailchat-ops-executor.service
```

编辑并替换里面的：

- `EXECUTOR_SHARED_SECRET=...`（改成和 docker-compose.env 一样的值）

```bash
sudo nano /etc/systemd/system/tailchat-ops-executor.service
```

启动：

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now tailchat-ops-executor
sudo systemctl status tailchat-ops-executor --no-pager
```

自检（本机）：

```bash
curl -s http://127.0.0.1:9110/health
```

应返回：

```json
{"ok": true}
```

强烈建议加防火墙限制 9110（不要对公网开放）。如果你用 ufw：

```bash
sudo ufw deny 9110/tcp
```

## C. 重建并启动 Tailchat（让 Admin 能调用执行器）

```bash
cd /var/www/tailchat-source
docker compose build --pull
docker compose up -d --remove-orphans
docker compose ps
```

## D. 在 Admin 面板里使用

访问：

`https://goodpage.cn/admin/`

你会看到新增的「系统控制台」：

1) LiveKit 一键启停  
点“启动/停止/重启 LiveKit”，下方会显示 livekit ps 状态。

如果点了无反应：去看执行器日志

```bash
journalctl -u tailchat-ops-executor -f
```

## E. 常见问题排查

Admin 点 LiveKit 时报错 “executor unreachable”：

- 执行器没起来：`systemctl status tailchat-ops-executor`
- 9110 被防火墙挡了（需要允许 docker 网桥访问，但不能公网访问）
- Docker 版本太老不支持 `host.docker.internal:host-gateway`：执行 `docker --version` 后把输出发我
