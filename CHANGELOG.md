# Changelog

本文件记录仓库内值得回滚、排障、部署追踪的重要版本变化。

## Unreleased

### 正在进行

- 开始第一阶段“微信式信息架构收口”改造
- 将一级“我”入口改为更符合通讯产品直觉的“消息”入口
- 个人区默认落点改为最近会话优先，不再默认落到好友页
- 收紧主内容区与收件箱侧栏的横向溢出策略，先降低移动端消息出界风险
- 将 `Inbox` 的产品语义重新收口为“通知”，降低与真实聊天主入口的混淆
- 继续收紧群侧栏、通知详情和通用侧栏项的窄屏溢出问题
- 将群组入口从顶部图标堆改成清晰的一级“群组”入口
- 新增群组列表页，开始把“找群”从图标记忆改成清晰导航
- 将“好友”界面逐步收口为“联系人”语义，并兼容旧路由跳转
- 将聊天主面板、消息列表和输入框进一步补齐窄屏/WebView 的基础布局约束
- 将私聊通话的默认体验从“独立窗口/类外部会议”收口为“应用内直达通话”
- 为系统配置页和系统控制台补充明确的降级态，减少初始化失败时的白屏/碎错误体验
- 继续收紧消息头、回复条和消息项的窄屏显示，降低 WebView 深层布局溢出
- 为防御控制页和分析页内部图表补充统一降级态，减少半失效时的空白页面
- 继续把通话文案与邀请链接语义从“会议/房间”收口为“通话/邀请”
- 开始统一主导航与侧边栏的视觉层级，减少灰块堆叠感并强化主入口辨识度
- 修复通话预加入面板中游客昵称不会正确参与校验的问题，并继续收口其视觉层级
- 继续统一侧栏列表项与底部信息区的视觉语言，强化主区一致性
- 补强缓存管理与系统通知页面的实际操作反馈，降低误操作与弱错误提示问题
- 将页面区块标题和空状态占位继续统一到同一套主区视觉语言
- 将通知列表条目的未读态、激活态和信息层级继续收口到新的主区视觉语言
- 继续统一群页分组层级、通知详情内容区与 Socket.IO 诊断页的信息展示方式
- 弱化通话面板中的插件悬浮状态条与在线状态块的默认样式，并统一 `NotFound` 主区占位风格
- 完成第二阶段计划文档和结构审计文档的阶段封口
- 进入第三阶段，开始将个人区私聊主路径从旧的 `converse` 语义继续收口为更明确的 `chats`

## v1.11.10-r1 - 2026-04-30

Tag:

- `v1.11.10-r1`

稳定基线说明：

- 这是一次已经完成真实服务器重部署验证的稳定版本
- 适合作为后续生产问题排查与回滚基线

### 本次发布重点

- 完成 admin / client 双端运行时打通
- 修复完整主服务在缺少部分基础设施时的启动阻塞问题
- 修复管理端运行时请求、结构化错误提示与可用性问题
- 修复 client 群组详情权限菜单不刷新的问题
- 修复生产构建链中的无效 `pnpm patch` 和 Admin TypeScript 构建错误
- 新增服务器重部署手册、排障手册与 Admin 运行时基线说明

### 关键修复

#### 运行时与主服务

- 完整主服务改为更稳的生产基座
- `defense-control`、`socketio`、`minio` 等能力在环境不完整时改为降级启动，而不是直接阻塞服务
- Admin 通过显式 broker peer 与主服务稳定联通

#### Client

- 修复本地/生产联调中的同源访问问题
- 修复群组详情页管理菜单因状态时序导致的缺失问题
- 完成真实页面级成员移除与 invite 加回闭环验证

#### 构建与部署

- 移除无效的 `pnpm patch` 依赖，恢复 `--frozen-lockfile` 构建稳定性
- 修复 `server/admin` 中 `lean()` 列表结果的类型错误，消除生产构建时报错

### 文档

- 重构 `README.md` 为入口导航页
- 新增：
  - `docs/deployment/redeploy-existing-server.md`
  - `docs/deployment/troubleshooting.md`
- 新增群组内容语法说明：
  - `docs/usage/group-content-syntax.md`

### 回滚方式

如需回滚到该稳定版本：

```bash
cd /var/www/tailchat-source
git fetch --tags origin
git checkout main
git reset --hard v1.11.10-r1
docker compose --env-file docker-compose.env build --pull
docker compose --env-file docker-compose.env up -d --remove-orphans
```

### 相关提交

- `359dba8` `fix(runtime): harden admin and client dual-end linkage`
- `f098ec2` `fix(build): remove invalid pnpm patches`
- `2d788c6` `fix(admin): resolve mongoose lean list typing`
- `0af0587` `docs(deployment): reorganize server deployment guides`
