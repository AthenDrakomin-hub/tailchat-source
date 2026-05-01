# Tailchat Source 结构与能力审计

## 审计目的

本报告只做一件事：

- 把当前仓库真实结构、运行边界、功能能力边界和明显缺口讲清楚

不再以“服务能启动”“接口返回 200”替代“产品真的可用”。

## 当前仓库结论

当前仓库不是一个“已经打磨完成、可直接承接完整社群运营生态”的成熟产品，而是：

- 一个可二次开发的通讯底座
- 带有 Web、Mobile、Admin、Plugin、Deploy 等多层结构
- 但产品层体验、移动端体验、管理端稳定性、音视频产品定义仍未达到可直接承载高强度运营的程度

## 一、仓库结构总览

### 1. 顶层工作区

根工作区 `package.json` 说明：

- 统一开发入口：
  - `pnpm dev`
  - `pnpm dev:admin`
- 统一构建入口：
  - `pnpm build`

说明这不是单体项目，而是一个前后端 + 多客户端 + 插件的 monorepo。

### 2. 主要目录

- `client/web`
  - Web 主客户端
- `client/mobile`
  - 移动端壳
- `client/desktop`
  - 桌面端
- `server`
  - 服务端主程序、插件、管理后台
- `server/admin`
  - 管理后台独立前后端
- `server/plugins`
  - 功能插件
- `docker-compose.yml`
  - 生产部署主入口
- `scripts/`
  - 部署、校验、重置等脚本

## 二、运行形态审计

### 1. 生产部署形态

当前生产部署核心形态来自 `docker-compose.yml`：

- `service-core`
- `service-openapi`
- `service-all-plugins`
- `tailchat-admin`
- `mongo`
- `redis`
- `minio`
- `livekit`
- `traefik`

这说明线上不是简单单体服务，而是：

- 核心服务 + 插件服务 + 管理后台 + 基础设施拼装式架构

### 2. Admin 不是独立 SaaS 控制台

`server/admin/src/client/App.tsx` 显示：

- Admin 前端使用 `tushan`
- 数据来源主要是 `/admin/api`
- 页面本质上是多组 `CustomRoute + Resource`

而 `server/admin/src/server/index.ts` 与 `server/admin/src/server/router/*.ts` 显示：

- Admin 后端只是一个附属 Express 服务
- 既依赖数据库，也依赖 broker，也依赖部分外部执行器

这意味着：

- Admin 很容易出现“页面存在，但底层依赖链没通时直接 500/503”的情况

## 三、移动端审计

### 1. 移动端不是独立原生 IM

`client/mobile/src/AppMain.tsx` 明确显示：

- 移动端核心界面来自 `react-native-webview`
- `source={{ uri: props.host }}`
- 注释明确写了：
  - “由 webview 提供”

结论：

- 当前移动端本质是“网页壳”
- 不是独立实现的原生消息界面
- Web 端导航复杂、布局不适配、信息层级不清晰的问题，会原样投射到移动端

### 2. 对移动端体验的直接影响

这能直接解释你提到的现象：

- 手机上找消息入口很费劲
- 内容边界出界
- 不像一个原生通讯产品

这不是单一 CSS 小 bug，而是产品形态决定的：

- Mobile 当前更像 Web 包壳，不是单独为移动使用场景设计的消息产品

## 四、消息与好友能力审计

### 1. 好友消息入口确实不够直接

`client/web/src/routes/Main/Content/Personal/Sidebar.tsx` 显示：

- 好友入口在：
  - `/main/personal/friends`
- 私信入口在：
  - `PersonalSidebar` 的 “私信” 分区
- DM 列表由：
  - `useDMConverseList()`

这意味着当前信息架构是：

- 个人页
  - 好友
  - 私信
  - 插件面板

而不是很多成熟 IM 常见的：

- 一个清晰统一的“聊天/会话”主入口
- 好友、群聊、私聊在一个明确主导航下整合

### 2. 好友发消息能力是有的，但入口不够产品化

`client/web/src/routes/Main/Content/Personal/Friends/FriendList.tsx` 显示：

- 每个好友条目有“发送消息”按钮
- 点击后走：
  - `createDMConverse([targetId])`
  - 然后 `navigate(/main/personal/converse/:id)`

所以结论不是“没有私聊能力”，而是：

- 私聊能力存在
- 但入口组织和路径表达不够清晰
- 对新用户来说不符合“打开就能明白怎么找好友消息”的预期

## 五、语音/音视频能力审计

### 1. 当前实现不是纯粹的好友直达通话模型

从 `client/web/src/plugin/builtin.ts` 和 `server/plugins/com.msgbyte.livekit/...` 可以确认：

- 音视频能力来自 `com.msgbyte.livekit`
- 插件关键词明确是：
  - `meeting`
  - `live streaming`
  - `voice channel`
  - `guest-call`
  - `meeting/:meetingId`
  - `shortlink`

### 2. 这和“即时私聊语音”不是一回事

它更接近：

- 房间 / 会议模型
- 插件式 meeting room
- 邀请 / guest-call / roomName 机制

而不是用户直觉中的：

- 打开好友资料
- 直接点语音
- 立刻进入点对点通话

### 3. 这解释了你的强烈不适感

你说的这个感受是合理的：

- 看起来不像正常即时通讯中的好友语音
- 反而像借助外部会议链接或房间机制做的功能拼装

结论：

- 当前音视频能力存在
- 但产品模型偏“插件式会议”
- 不等于成熟 IM 的“好友直达语音通话”

## 六、管理端能力审计

### 1. 管理端页面很多，但依赖链很长

`server/admin/src/client/App.tsx` 里挂了这些页面：

- `ops-control`
- `defense-control`
- `network`
- `socketio-diagnostic`
- `analytics`
- `cache`
- `system-notify`
- `site-config`
- `users`
- `messages`
- `groups`
- `file`
- `mail`
- `plugin-registry`

### 2. 页面并不等于可用

例如：

- `network` 依赖 broker 注册表
- `ops` 依赖：
  - `OPS_EXECUTOR_URL`
  - `EXECUTOR_SHARED_SECRET`
  - `config.get/config.set`
- `analytics` 依赖数据库聚合
- 资源页依赖：
  - Mongo 查询
  - broker action
  - `raExpressMongoose`

所以当前 Admin 的真实风险不是“有没有页面”，而是：

- 页面多
- 依赖多
- 任一底层链条不稳，就会 500/503
- 容易形成“登录页正常，进去就炸”的体验

### 3. Admin 当前真实状态判断

当前可以初步判定：

- Admin 是“结构上完整”
- 但不是“能力上闭环”
- 它更像一组系统运维/数据面板的聚合，而不是一个经过严格稳定性验收的后台产品

## 七、群组内容与公告能力审计

### 1. 群组基础说明不是 HTML 公告编辑器

群组基础说明 `description`：

- 只是字符串字段
- 不是正式富文本公告系统

### 2. 欢迎词也不是 HTML 富文本

`com.msgbyte.welcome` 使用普通 `TextArea`

只支持：

- 普通文本
- `{nickname}`
- `{@nickname}`

### 3. 真正适合做公告的是 Markdown Panel

群公告 / 群规则 / 说明页更接近：

- `com.msgbyte.mdpanel`

即：

- 用 Markdown，不是自由 HTML

## 八、能力矩阵

### 1. 产品基础能力

- Web 登录：可用
- Admin 登录页：可用
- 好友能力：存在，但入口组织不佳
- 私聊能力：存在，但可发现性不足
- 群消息能力：存在
- 移动端体验：不合格，当前更像 WebView 包壳
- 好友直达语音：不成立，当前更接近会议/房间插件

### 2. 管理端能力

- 页面结构：存在
- 数据依赖边界：复杂
- 系统页稳定性：高风险
- broker 强依赖页面：高风险
- executor 强依赖页面：高风险
- 是否达到“可运营后台”：未达到

### 3. 运营与生态承载能力

就你要的目标而言：

- 自动化社群运营底座：未达到
- 移动端消息产品线：未达到
- 后台稳定运营线：未达到
- 品牌/合规包装线：可以做，但现在不是最优先

## 九、最关键结论

### 1. 你失望不是因为挑剔

而是这个项目当前确实存在这些真实问题：

- 移动端体验不成立
- 私聊/消息入口不够清晰
- 语音通话产品模型不符合常规 IM 直觉
- Admin 稳定性依赖链过长，容易出现 500/503

### 2. 当前最不该继续做的事

在这些基础问题没打掉前，不应该优先做：

- 华丽包装
- 品牌视觉
- 大规模自动化运营能力叠加

否则只是在不稳底座上继续堆功能。

## 十、修复优先级建议

### 第一阶段：产品成立线

必须先解决：

1. 移动端消息入口与布局问题
2. 好友消息 / 群消息主导航重整
3. 语音通话产品定义重做
   - 从“插件会议/房间”向“好友直达语音”收敛
4. Admin 页面逐页查依赖与故障点

### 第二阶段：运营可用线

在第一阶段稳定后再做：

1. 管理端系统页统一容错
2. 群公告 / 规则 / 运营模板完善
3. 自动化运营所需后台入口

### 第三阶段：财讯包装线

最后再做：

1. 登录页与站点视觉升级
2. 合规文案与品牌表达
3. 面向业务的包装和商业呈现

## 十一、当前建议

如果继续推进，这个项目必须改打法：

- 先全仓审计
- 再按能力边界逐项打穿
- 不再把“容器启动成功”当成“项目可用”

否则继续做，只会不断追加失望。

## 十二、已开始执行的第一阶段

截至当前工作轮次，第一阶段已经开始落地：

- 一级导航中的“我”已改成“消息”
- 个人区默认落点已改成最近会话优先
- 个人区侧边栏已改为“会话优先、联系人次级”
- 主内容区和收件箱列表已开始收紧横向溢出策略

这还不是最终完成态，但已经从“只做审计”进入“按审计结论改代码”的阶段。
