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
