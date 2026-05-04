# Tailchat Source

这是财讯 IM 的主仓库。它不是一个“普通 Tailchat 二开集合”，而是一个有明确边界的**社群协作底座仓库**：

- 面向 Web、桌面端、移动端的统一聊天主站
- 面向服务端、Admin、下载分发、运维部署的一体化交付仓库
- 面向 OpenClaw 的接入底座，而不是在仓库内部继续承载完整的导演、剧本编排与 Agent 总控平面

## 项目蓝图
当前项目采用“双平面分层”蓝图。

### Tailchat 当前仓库负责
- 社群协作底座
- Web / Desktop / Mobile 客户端主站
- 服务端、Admin、部署、下载分发
- 群消息治理与阅读优化
- 角色消息样式与人格可见性
- 微信通知接入与后台管理
- OpenClaw Bridge / Agent Runtime 接入底座
- 数据分析、转化追踪、风控与合规边界
- 外部 Agent 接入配置、角色绑定、场景接入配置

### OpenClaw 负责
- 角色 Agent 总控后台
- 群剧本单元管理系统
- 剧本编排与策略引擎
- 导演 Agent 调度角色 Agent
- Agent 的人格、Prompt、记忆、工具与协同本体

### 一句话理解
**Tailchat 负责“入口、展示、连接、治理、运维、接入底座”，OpenClaw 负责“编排、导演、调度、推理和剧本系统”。**

## 当前主线状态
如果你第一次进入这个仓库，先看这个判断，不要先看部署命令。

### 已经落地的主线
- 群消息治理与可读性优化
- 群角色轻量识别与角色表现增强
- 搜索上下文与发送反馈优化
- 微信通知接入、默认事件、后台管理与发送日志
- 插件中心收敛与用户侧入口清理
- 多端验收脚本补齐
- 生产部署、客户端下载页与安卓构建发布脚本

### 正在收敛的方向
- 当前仓库继续保留 OpenClaw 接入底座能力
- 平台内“剧本模板 / 导演逻辑 / Agent 人格总控”不再作为当前仓库目标
- 相关能力统一迁移到 OpenClaw 仓库承接

### 不要误解为本仓库目标的内容
- 平台内剧本编排系统
- 平台内导演 Agent
- 平台内 Persona / Prompt 管理中心
- 平台内完整多 Agent 编排控制平面

## 蓝图导航
如果你想看项目为什么这样分层，建议按这个顺序读：

1. 蓝图状态审计：[`docs/superpowers/specs/2026-05-03-blueprint-status-audit.md`](docs/superpowers/specs/2026-05-03-blueprint-status-audit.md)
2. OpenClaw 分层对齐计划：[`docs/superpowers/plans/2026-05-03-openclaw-bottom-layer-alignment-plan.md`](docs/superpowers/plans/2026-05-03-openclaw-bottom-layer-alignment-plan.md)
3. 微信通知默认事件收敛：[`docs/superpowers/plans/2026-05-04-wechat-notify-default-events-plan.md`](docs/superpowers/plans/2026-05-04-wechat-notify-default-events-plan.md)
4. 微信通知与后台插件中心设计：[`docs/superpowers/specs/2026-05-04-wechat-wxpusher-notify-and-admin-plugin-center-design.md`](docs/superpowers/specs/2026-05-04-wechat-wxpusher-notify-and-admin-plugin-center-design.md)

## 仓库结构蓝图
### 客户端层
- `client/web`
  - Web 主站
- `client/desktop`
  - 桌面端壳工程
- `client/mobile`
  - 原生移动端壳工程与 Android 发布入口

### 服务与后台层
- `server`
  - 核心服务、插件服务、OpenAPI、Admin 与静态发布承载
- `server/admin`
  - 管理后台前端
- `server/public`
  - 主站静态文件与客户端下载分发目录

### 运维与部署层
- `scripts`
  - 标准部署、安卓构建、客户端下载分发、环境检查脚本
- `docker-compose.yml`
  - 生产推荐 Compose 拓扑
- `docker-compose.env.example`
  - 生产环境变量模板

### 文档层
- `docs/deployment`
  - 部署、重部署、客户端下载发布、排障手册
- `docs/superpowers`
  - 蓝图、方案、计划、设计记录

## 推荐部署方式
本仓库当前推荐并维护的生产部署方式只有一条：

- 应用使用 `Docker Compose` 在宿主机本机构建并启动
- 对外访问统一由宿主机 `Nginx` 反代到 `127.0.0.1:11000`

## 最常用入口
### 新服务器首次部署
```bash
curl -fsSL https://raw.githubusercontent.com/AthenDrakomin-hub/tailchat-source/main/scripts/deploy.sh | bash
```

### 已部署服务器升级重部署
```bash
cd /var/www/tailchat-source
bash scripts/deploy-all.sh
```

### 部署失败排查
- [`docs/deployment/troubleshooting.md`](docs/deployment/troubleshooting.md)

## 生产部署文档
- 已部署服务器升级重部署：[`docs/deployment/redeploy-existing-server.md`](docs/deployment/redeploy-existing-server.md)
- 自有证书 + 域名 HTTPS：[`docs/deployment/goodspage-domain-https.md`](docs/deployment/goodspage-domain-https.md)
- 受控执行器 / 系统控制台：[`docs/deployment/ops-executor.md`](docs/deployment/ops-executor.md)
- Admin 运行时联调基线：[`docs/deployment/admin-runtime-baseline.md`](docs/deployment/admin-runtime-baseline.md)

## 客户端下载分发
当前生产环境中的客户端下载页已并入主站静态目录，不再依赖独立 `website` 发布链路。

- 下载页入口：`/downloads`
- 下载配置：`server/public/downloads/client.json`
- 安装包目录：`server/public/downloads/client/`

### 服务器构建 Android APK
```bash
cd /var/www/tailchat-source
bash scripts/build-android-release.sh
```

### 发布 Windows / macOS / Linux 外部产物
```bash
cd /var/www/tailchat-source

bash scripts/publish-client-assets.sh \
  --windows /tmp/caixun-desktop-windows.zip --windows-version 1.0.0 \
  --macos /tmp/caixun-desktop-macos.dmg --macos-version 1.0.0 \
  --macos-arm64 /tmp/caixun-desktop-macos-arm64.dmg --macos-arm64-version 1.0.0
```

完整说明见：
- [`docs/deployment/client-release-workflow.md`](docs/deployment/client-release-workflow.md)

## 关键环境变量
生产环境至少应正确配置：

- `API_URL`
- `SECRET`
- `ADMIN_PASS`
- `MONGO_URL`
- `REDIS_URL`
- `MINIO_URL`
- `MINIO_USER`
- `MINIO_PASS`
- `MINIO_ROOT_PASSWORD`
- `MINIO_BUCKET_NAME`
- `DEFENSE_SHARED_SECRET`

如果你启用了系统控制台 / LiveKit，还应额外检查：

- `EXECUTOR_SHARED_SECRET`
- `OPS_EXECUTOR_URL`
- `LIVEKIT_URL`
- `LIVEKIT_PUBLIC_URL`
- `LIVEKIT_KEYS`
- `LIVEKIT_API_KEY`
- `LIVEKIT_API_SECRET`

## 本地开发
### Web + Server
```bash
pnpm install
pnpm dev
```

### Admin
```bash
pnpm dev:admin
```

## 版本与回滚
建议每次确认线上稳定后，都为 `main` 打一个 Git 标签，方便回滚与追溯。

当前建议稳定标签：
- `v1.11.10-r1`

## 参考文档
- 群组内容语法说明：[`docs/usage/group-content-syntax.md`](docs/usage/group-content-syntax.md)
- 版本变更记录：[`CHANGELOG.md`](CHANGELOG.md)
- 已部署服务器重部署：[`docs/deployment/redeploy-existing-server.md`](docs/deployment/redeploy-existing-server.md)
- 客户端分包发布：[`docs/deployment/client-release-workflow.md`](docs/deployment/client-release-workflow.md)
- 部署排障手册：[`docs/deployment/troubleshooting.md`](docs/deployment/troubleshooting.md)

## License
遵循上游 Tailchat 相关开源许可与声明。
