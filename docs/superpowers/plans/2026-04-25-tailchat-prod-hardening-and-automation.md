# Tailchat 生产加固 & 自动化运营底座 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将当前 Tailchat 二开版本升级为面向机构投教的“默认安全、可观测、可回滚、可自动化迭代”的生产基线，并对伪直播等高负载能力做生产化处理。

**Architecture:** 以“配置化开关 + 最小侵入”为核心。安全与运维通过 docker-compose/Traefik + 服务端 env 参数落地；前端通过 webpack DefinePlugin 注入构建期开关；伪直播通过任务队列化避免同步阻塞。

**Tech Stack:** Docker Compose, Traefik v2, Node.js/Moleculer, MongoDB, Redis, MinIO, Webpack + Workbox, Tailchat plugin system

---

## 文件变更清单（锁定边界）

**Modify**
- `docker-compose.yml`
- `docker-compose.env.example`（同步新增 env 示例）
- `scripts/pull-up.sh`
- `scripts/health-check.sh`
- `scripts/env-lint.sh`（增强校验与提示）
- `server/mixins/socketio.mixin.ts`
- `server/services/openapi/oidc/oidc.service.ts`
- `server/packages/sdk/src/index.ts`
- `server/plugins/com.ridou.defense-control/services/defense.service.ts`
- `server/plugins/com.ridou.defense-control/executor/executor.js`
- `client/web/build/webpack.config.ts`
- `client/web/src/plugin/builtin.ts`
- `client/web/src/utils/sw-helper.ts`
- `server/plugins/com.msgbyte.pseudolive/services/pseudolive.service.ts`

**Create**
- `scripts/fix-env.sh`（可选，一键修复常见 env 问题）
- `server/plugins/com.msgbyte.pseudolive/models/task.ts`（伪直播任务表）

---

## Task 1: 运维脚本健壮性（避免 404/502 短暂误判）

**Files:**
- Modify: `scripts/pull-up.sh`
- Modify: `scripts/health-check.sh`

- [ ] Step 1: 在 `pull-up.sh` 增加启动缓冲 `SLEEP_BEFORE_CHECK` 与 Traefik router 就绪等待（`api-gw@docker`/`admin@docker`）
- [ ] Step 2: 在 `health-check.sh` 同步增加启动缓冲与 router 等待
- [ ] Step 3: Shell 语法检查

Run:
```bash
bash -n scripts/pull-up.sh
bash -n scripts/health-check.sh
```

- [ ] Step 4: Commit

---

## Task 2: env 校验与一键修复脚本

**Files:**
- Modify: `scripts/env-lint.sh`
- Create: `scripts/fix-env.sh`
- Modify: `docker-compose.env.example`

- [ ] Step 1: `env-lint.sh` 增强：检测反引号/全角反引号/意外的包裹符号、并对关键项（API_URL/LIVEKIT_URL/MINIO_URL）给出明确修复提示
- [ ] Step 2: 新增 `fix-env.sh`：自动移除反引号、修正常见拼写，执行后再跑 `env-lint.sh`
- [ ] Step 3: 更新 `docker-compose.env.example`：补齐新增 env 示例项（CORS、PKCE、PROMETHEUS 等）
- [ ] Step 4: Shell 语法检查并 Commit

---

## Task 3: Traefik 生产安全加固

**Files:**
- Modify: `docker-compose.yml`

- [ ] Step 1: 将 `forwardedHeaders.insecure` 改为 `forwardedHeaders.trustedIPs`（默认 `127.0.0.1/32`，可用 env 扩展）
- [ ] Step 2: 保持 dashboard 仅 localhost 暴露；补充注释说明生产安全边界
- [ ] Step 3: 仅本机暴露 Prometheus（下一任务会用到端口映射）
- [ ] Step 4: `docker compose config` 校验并 Commit

Run:
```bash
docker compose config >/dev/null
```

---

## Task 4: Socket.IO CORS 收敛到生产域名

**Files:**
- Modify: `server/mixins/socketio.mixin.ts`

- [ ] Step 1: 将 `cors.origin='*'` 改为读取 `SOCKETIO_CORS_ORIGINS`（逗号分隔），默认 `https://goodspage.cn`
- [ ] Step 2: 开发环境保留宽松策略（避免本地开发阻断）
- [ ] Step 3: TypeScript 编译检查并 Commit

Run:
```bash
pnpm -C server check:type || true
```

---

## Task 5: OIDC 生产默认开启 PKCE

**Files:**
- Modify: `server/services/openapi/oidc/oidc.service.ts`

- [ ] Step 1: `pkce.required` 改为：生产默认 true，允许通过 `OIDC_REQUIRE_PKCE=false` 关闭
- [ ] Step 2: 增加单元/最小启动验证说明（不强制写测试，至少保证编译通过）
- [ ] Step 3: Commit

---

## Task 6: 未捕获异常处理（生产默认退出自愈）

**Files:**
- Modify: `server/packages/sdk/src/index.ts`

- [ ] Step 1: `unhandledRejection/uncaughtException` 生产默认 `process.exit(1)`，并允许 `EXIT_ON_UNCAUGHT=false` 关闭
- [ ] Step 2: 保证日志包含 error + stack
- [ ] Step 3: Commit

---

## Task 7: defense-control 生产化落地（默认密钥强制）

**Files:**
- Modify: `server/plugins/com.ridou.defense-control/services/defense.service.ts`
- Modify: `server/plugins/com.ridou.defense-control/executor/executor.js`

- [ ] Step 1: 移除默认弱密钥，若 `DEFENSE_SHARED_SECRET` 未配置则拒绝启用敏感动作并给出明确日志
- [ ] Step 2: executor 同步要求该 env，避免两边不一致
- [ ] Step 3: Commit

---

## Task 8: 可观测性（Prometheus 本机暴露 + Sentry/Posthog 开关）

**Files:**
- Modify: `docker-compose.yml`
- Modify: `client/web/build/webpack.config.ts`
- Modify: `client/web/src/plugin/builtin.ts`

- [ ] Step 1: `docker-compose.yml` 为 `service-core` 增加 `127.0.0.1:13030:13030`（只暴露一个，避免端口冲突）
- [ ] Step 2: webpack DefinePlugin 注入 `ENABLE_SENTRY_PLUGIN/ENABLE_POSTHOG_PLUGIN/DISABLE_SERVICE_WORKER`
- [ ] Step 3: builtin 插件逻辑由 “官方域名判断” 改为 “开关启用 + 域名兜底”
- [ ] Step 4: Commit

---

## Task 9: PWA 恢复但可控更新（解决旧缓存问题）

**Files:**
- Modify: `client/web/src/utils/sw-helper.ts`

- [ ] Step 1: 恢复 `navigator.serviceWorker.register('/service-worker.js')` 并复用现有更新提示逻辑
- [ ] Step 2: 增加 `DISABLE_SERVICE_WORKER=true` 时跳过注册（紧急开关）
- [ ] Step 3: Commit

---

## Task 10: 伪直播任务化（避免 ffmpeg 阻塞）

**Files:**
- Create: `server/plugins/com.msgbyte.pseudolive/models/task.ts`
- Modify: `server/plugins/com.msgbyte.pseudolive/services/pseudolive.service.ts`

- [ ] Step 1: 新增任务表：`queued/running/done/failed`，记录 streamId、groupId/panelId、发起人、错误信息、耗时等
- [ ] Step 2: `start` action 改为：创建任务→立即返回 streamId/status，并先发“准备中”消息（或卡片）
- [ ] Step 3: 后台 worker（单并发）执行：下载 mp4 → ffmpeg → 上传 ts/m3u8 → 发“已就绪”消息（包含可播放 hlsUrl）
- [ ] Step 4: 加并发保护与超时；失败要写入任务表并发失败消息
- [ ] Step 5: Commit

---

## Task 11: 集成验证（给部署方可执行的自检命令）

**Files:**
- Modify: `README.md`（或新增 `docs/ops/production-checklist.md`，二选一）

- [ ] Step 1: 补充生产机验证命令：health、traefik routers、metrics、websocket
- [ ] Step 2: 明确 env 必填项（API_URL/SECRET/MINIO_BUCKET_NAME/DEFENSE_SHARED_SECRET 等）
- [ ] Step 3: Commit

---

## 交付与回滚策略
- 每个 Task 形成独立 commit（虽然最终合并为单 PR，但 commit 粒度便于回滚）
- docker-compose 与服务端变更均提供 env 开关，线上出现问题可快速关闭（例如 DISABLE_SERVICE_WORKER、EXIT_ON_UNCAUGHT）

