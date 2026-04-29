# Tailchat（投教机构版）生产加固 & 自动化运营：设计说明

## 目标
在不改变核心产品形态（Tailchat + 插件体系）的前提下，补齐面向机构投教场景所需的：

1. **生产安全基线**（反代、鉴权、CORS、OIDC、异常处理）
2. **稳定性与可观测性**（指标、日志、错误上报、可回滚）
3. **前端体验可控**（PWA/缓存不再导致“旧页面/白屏”）
4. **运营自动化的技术底座**（数据闭环 + 可配置开关）
5. **伪直播插件生产化**（异步任务化，避免阻塞/拖垮服务）

> 本设计的改动以“可配置、默认安全、可回滚”为原则；同时尽量减少对现有功能的破坏。

---

## 范围与非目标

### 本次包含
- docker-compose（Traefik、安全端口、metrics 暴露策略）
- 服务端：
  - Socket.IO CORS 收敛到生产域名
  - OIDC PKCE 生产默认开启（可通过 env 关闭）
  - unhandledRejection/uncaughtException 生产默认退出重启（可通过 env 关闭）
  - defense-control 插件默认密钥强制显式配置
- 前端：
  - 恢复 Service Worker 注册，并保留“发现新版本→提示刷新”的更新路径
  - Sentry/Posthog 由“官方域名判断”改为“构建期开关 + 域名兜底”
- 伪直播（pseudolive）：
  - 转码从同步阻塞改为队列/后台任务（单机并发=1 起步），写入任务状态，避免卡死插件服务
- 运维脚本：
  - 更新/自检脚本在探活前等待路由就绪，避免短暂 404/502 误判
  - env 自动修复/强校验，避免反引号、错误 URL 格式再次引发线上问题

### 本次不包含（后续迭代）
- 完整“社群运营引擎”（用户标签、触发器 DSL、内容日历后台 UI）
- 完整 WAF/风控策略（仅保留 defense-control 的安全落地点）
- 视觉“华丽包装”的大规模 UI 设计稿/主题系统重做（本次先打基础：可观测、可配置、可持续迭代）

---

## 关键设计决策

### 1) Traefik：默认安全 + 保持运维可用
- Dashboard/API 仅在 localhost 暴露（保持现状 `127.0.0.1:11001`），避免公网访问
- forwardedHeaders 不再使用 `insecure`，改为 `trustedIPs`（默认仅信任 `127.0.0.1/32`），并允许通过 env 扩展

### 2) Socket.IO：CORS 从 `*` 收敛到生产域名
由于投教机构场景包含敏感内容（群内讨论、投教材料），Socket.IO 允许任意 origin 会增加被第三方站点滥用连接/探测的风险。
- 默认允许：`https://goodpages.cn`
- 可通过 `SOCKETIO_CORS_ORIGINS`（逗号分隔）扩展
- 开发环境仍允许 `*`（或 `http://localhost:*`）

### 3) OIDC：生产默认强制 PKCE
OpenAPI/OIDC 面向第三方应用集成时，PKCE 默认关闭不符合生产安全基线。
- 生产默认：开启
- 可用 `OIDC_REQUIRE_PKCE=false` 关闭（仅建议测试使用）

### 4) 未捕获异常：生产默认“退出让容器重启”
“只打印不退出”会导致服务进入半故障状态，影响用户体验且难以观测。
- 生产默认：打印日志后退出（容器拉起）
- 可用 `EXIT_ON_UNCAUGHT=false` 关闭（排障时使用）

### 5) 伪直播：转码任务异步化
当前实现 `await ffmpeg` 同步阻塞 action，遇到大文件/并发会拖垮插件服务。
- 设计：引入任务队列（内存队列 + Mongo 任务表）
- 并发：默认 1（可配置）
- UI：先发“准备中”卡片，完成后更新/补发“可播放”卡片（最小实现优先：补发消息）

---

## 配置项（Env）汇总（新增/调整）

### 生产安全/运维
- `TRAEFIK_TRUSTED_PROXIES`：Traefik forwardedHeaders trusted IPs（默认 `127.0.0.1/32`）
- `SOCKETIO_CORS_ORIGINS`：Socket.IO 允许的 origin 列表（默认 `https://goodpages.cn`）
- `OIDC_REQUIRE_PKCE`：是否强制 PKCE（默认生产 `true`）
- `EXIT_ON_UNCAUGHT`：未捕获异常是否退出（默认生产 `true`）
- `DEFENSE_SHARED_SECRET`：defense-control HMAC 密钥（生产必须配置）

### 可观测性
- `PROMETHEUS=true`：开启 metrics（服务端已支持）

### 前端构建期开关（webpack DefinePlugin 注入）
- `ENABLE_SENTRY_PLUGIN=true/false`
- `ENABLE_POSTHOG_PLUGIN=true/false`
- `DISABLE_SERVICE_WORKER=true/false`

---

## 验收标准（Definition of Done）
1. 生产机执行 `bash scripts/deploy.sh` 不再因为短暂 404/502 误判失败（探活最终可稳定通过）
2. Socket.IO 仅允许 `https://goodpages.cn` 连接（可通过 env 扩展）
3. OIDC PKCE 在生产默认启用（且可配置关闭）
4. 发生未捕获异常时容器能自愈重启（且日志明确）
5. Prometheus metrics 仅在 localhost 暴露可抓取（不暴露公网）
6. PWA 恢复但不会造成“旧页面长期缓存”；有明确“发现新版本→提示刷新”机制
7. 伪直播转码不会阻塞插件服务；可观察任务状态与失败原因（至少日志可追踪）
