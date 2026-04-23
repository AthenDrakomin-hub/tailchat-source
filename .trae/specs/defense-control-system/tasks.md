# Tasks

- [x] Task 1: 搭建 L0/L1 基础框架（控制面插件骨架与自保机制）
  - [x] SubTask 1.1: 初始化 `com.ridou.defense-control` 插件结构，注册 `defense` 相关后端 API。
  - [x] SubTask 1.2: 在数据库定义 `DefenseConfig` 模型与相关接口，支持 mode (L0-L3), cloudflare, selfEdges 等字段的存取。
  - [x] SubTask 1.3: 实现 L0 的“应用自保”拦截器中间件（基于配置限制注册、上传接口的访问速率或状态）。
  - [x] SubTask 1.4: 在 Admin 侧开发防御控制面板，展示当前档位、配置表单与近期切档审计日志。

- [x] Task 2: 实现执行面 `defense-controller` 的基础服务
  - [x] SubTask 2.1: 创建一个轻量级本机 Node/Bash 执行器脚本，监听本机的内部管理端口，并校验请求签名（shared secret）。
  - [x] SubTask 2.2: 实现执行器的切档状态机逻辑框架（IDLE, PRECHECK, DRYRUN, COMMIT, MONITOR, ROLLBACK）。
  - [x] SubTask 2.3: 实现内部探活模块（请求 `https://goodspage.cn/`, `/health`, `/admin/`, `wss://goodspage.cn/livekit`），供各状态调用。

- [x] Task 3: 联调 L2（Cloudflare）档位核心逻辑
  - [x] SubTask 3.1: 在控制面完善 L2 的配置完整性检查（必须填写 Cloudflare 凭证才能通过 PRECHECK）。
  - [x] SubTask 3.2: 在执行器端实现 DRYRUN 逻辑：拉取 Cloudflare IP 段并临时加入 allowlist（不移除其他来源）。
  - [x] SubTask 3.3: 在执行器端实现 COMMIT 逻辑：收口源站真实端口（443/11000/7880），仅允许 CF IP 段访问，并记录快照。
  - [x] SubTask 3.4: 在执行器端实现 MONITOR 的 5秒轮询机制与 TTL 自动回滚逻辑。

- [x] Task 4: 联调 L3（混合增强）档位核心逻辑
  - [x] SubTask 4.1: 扩展配置支持自建边缘节点列表及 mTLS 信息。
  - [x] SubTask 4.2: 在执行器中支持对边缘节点的回源收口配置。
  - [x] SubTask 4.3: 验证 L3 一键降级回滚至 L2 或 L0 的逻辑。

# Task Dependencies
- [Task 2] 依赖于 [Task 1] 的配置接口。
- [Task 3] 依赖于 [Task 2] 提供的执行器。
- [Task 4] 依赖于 [Task 3] 提供的收口能力。