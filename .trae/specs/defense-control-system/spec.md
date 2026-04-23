# 防御控制系统（混合档位 + 动态开关） Spec

## Why
项目希望实现一个“源站永远不暴露真实 IP”的防御体系，并支持按成本/风险动态切换防护等级（平时低成本，遇攻击一键启用 CDN/WAF/自建边缘节点）。
核心诉求是切换过程必须“不锁自己”，必须经过预检和试运行（不收口）才能真正提交（收口），一旦关键服务（主站/Admin/LiveKit）探活失败，必须能自动回滚。

## What Changes
- **新增控制面插件**：`com.ridou.defense-control`，负责管理防御配置、发起切档流程、展示执行状态及触发应用自保（禁注册/限流等）。
- **新增执行面控制器**：`defense-controller`（独立于 Tailchat 主进程），运行在源站本机，接收插件指令修改网络规则（iptables/nginx），并支持两阶段提交与自动回滚。
- **支持四级混合档位**：
  - **L0**：应用自保与观测（不改网络）
  - **L1**：低成本增强（基础限流/封禁）
  - **L2**：源站隐藏（Cloudflare 接管，仅允许其 IP 回源）
  - **L3**：混合增强（Cloudflare + 自建边缘节点，可选 mTLS）
- **实现切档状态机**：PRECHECK → DRYRUN → COMMIT → MONITOR → (ROLLBACK)
- **配置与探活模型**：增加防御系统全局配置 `DefenseConfig`，定义探活标准（主站包含RIDOU/manifest、健康接口 200、管理端不报 404/5xx、LiveKit WS 握手成功）。

## Impact
- Affected specs: Tailchat 插件体系、系统网络部署架构、运维安全管控
- Affected code:
  - `server/plugins/com.ridou.defense-control/` (新插件代码目录)
  - `scripts/defense-controller/` (本机执行器脚本或微服务)
  - `server/admin/src/client/routes/` (后台管理面板UI)
  - Nginx 配置及主机防火墙配置（由控制器间接操作）

## ADDED Requirements
### Requirement: 控制面插件 (com.ridou.defense-control)
系统 SHALL 提供一个专门的防御控制插件，用于可视化管理防御档位（L0-L3）、查看缺失配置及预检状态、发起切档流程，并触发 L0/L1 级别的应用自保（如禁注册、限上传、只读）。

#### Scenario: 发起高档位切换
- **WHEN** 管理员在插件面板点击切换到 L2 档位
- **THEN** 插件调用本机执行器依次执行 PRECHECK 和 DRYRUN，若探活全部 PASS，则进入 COMMIT 并收口网络，随后进入 MONITOR，并在面板展示近期切档审计日志。

### Requirement: 本机执行面 (defense-controller) 与回滚
系统 SHALL 在源站部署独立执行器，处理带签名的切档指令。执行器必须支持两阶段提交（DRYRUN 阶段并行放行，COMMIT 阶段收口）与 TTL 租约。

#### Scenario: 切档失败自动回滚
- **WHEN** 在 MONITOR 阶段，执行器连续 3 次探活失败（如主站返回 502、或 WS 握手失败）
- **THEN** 执行器自动回滚网络规则到上一可用快照，锁定 10 分钟避免抖动，并通知插件记录失败与回滚原因。

## MODIFIED Requirements
### Requirement: 全局探活与监控
要求 Tailchat 服务及 LiveKit 能够被本机控制器持续探活（包括 `/health`、`/admin/`、WS `/livekit`）。任何时候只要切档操作触发，探活就必须在 DRYRUN 和 COMMIT 后分别执行一次。