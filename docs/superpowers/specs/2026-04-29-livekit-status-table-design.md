# 系统控制台：LiveKit 状态结构化输出与表格展示设计

## 背景

当前「系统控制台」展示 LiveKit 状态主要依赖执行器返回的文本（stdout）。这会导致：

- 前端需要解析文本格式，脆弱且难维护
- 无法稳定展示结构化字段（状态、端口、运行时长等）

目标是让后端（严格说是宿主机受控执行器）返回结构化字段，前端仅做表格展示。

## 目标

- 新增 LiveKit 状态结构化接口
- Admin 控制台以 Table 展示 LiveKit 状态，不解析文本
- 保留“最近日志入口”（一键复制命令），便于排障

## 非目标

- 不新增/不改动 LiveKit 容器本身的镜像或启动参数
- 不引入第三方运维平台

## 设计

### 1) 执行器：新增状态接口

新增接口：

- `GET /livekit/status`

实现策略（优先级从高到低）：

1. 优先执行 `docker compose ps --format json livekit`
   - 直接获取结构化输出
2. 若宿主机 Docker 版本不支持 `--format json`，回退为解析 `docker compose ps livekit` 文本

响应结构（示例）：

```json
{
  "ok": true,
  "service": "livekit",
  "state": "running",
  "containerName": "tailchat-source-livekit-1",
  "image": "livekit/livekit-server:latest",
  "ports": ["0.0.0.0:7880->7880/tcp", "0.0.0.0:7881->7881/tcp", "0.0.0.0:50000-50100->50000-50100/udp"],
  "uptime": "Up 3 minutes",
  "logCommand": "cd /var/www/tailchat-source && docker compose logs -n 200 livekit"
}
```

`state` 取值规则：

- `running`：容器存在且为运行状态
- `exited`：容器存在但已退出
- `not_found`：未找到容器/服务（例如未创建或 compose 不包含）

### 2) Admin Server：透传接口

新增接口：

- `GET /admin/api/ops/livekit/status`

后端调用执行器：

- URL：`${OPS_EXECUTOR_URL}/livekit/status`
- Header：`X-Executor-Secret: ${EXECUTOR_SHARED_SECRET}`

失败处理：

- 执行器不可达/超时：返回可读错误信息，前端提示 “executor unreachable”
- 执行器返回非 2xx：将错误透传给前端展示

### 3) 前端：表格展示（默认列）

在「系统控制台」增加/替换 LiveKit 状态展示区为 Table，默认列：

- 运行状态（state + 颜色标签）
- 容器名（containerName）
- 镜像（image）
- 端口（ports）
- 运行时长（uptime）
- 最近日志入口（logCommand，一键复制）

交互：

- 提供“刷新状态”按钮
- 启停/重启操作后自动刷新一次状态

## 验收标准

- 执行器 `GET /livekit/status` 返回结构化字段（至少包含 state/containerName/image/ports/uptime/logCommand）
- Admin 页面以 Table 展示，不再依赖文本解析
- “复制日志命令”可用，命令默认指向 `/var/www/tailchat-source`
