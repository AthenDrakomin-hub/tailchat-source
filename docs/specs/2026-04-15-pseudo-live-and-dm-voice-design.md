# 伪直播（MP4→HLS）+ 私信语音（禁用群语音）设计说明

**目标（Goal）**
- 只保留“私信一键发起语音通话”，不提供任何群语音频道/群语音面板入口。
- 群管理可在某个群文本频道内“上传 MP4 并开播”，系统自动把视频以 **HLS 分片流** 形式发布，并在群里发送一条“直播卡片消息”；群成员点击卡片即可观看。
- 自动活跃不使用 openapiBot：改用“普通账号 JWT + 定时任务”方式发话术。
- 允许外部插件安装，但只允许加载 **自家服务器** 提供的插件资源。
- 内网/外网切换走运维策略（网络层开关）；切到内网后依赖外网的插件不可用可接受。
- 企业登录不做，继续使用共享口令/邀请码门槛。

---

## 1. 范围与非目标

### 1.1 范围（In Scope）
- Web 端：移除/禁用 Livekit 群语音入口，仅保留私信发起通话入口，并强制“语音模式”（不允许开启摄像头）。
- 新增“伪直播”插件（前后端一体）：
  - 群管理：上传 MP4 → 后端转码 HLS → 自动发卡片消息到当前频道
  - 群成员：从卡片打开播放器观看 HLS
- 新增一个可部署的“自动发话术”任务脚本（使用普通账号登录获取 JWT 并发送消息）。
- 插件安装 URL 白名单：仅允许 `{BACKEND}/plugins/**` 或 `/plugins/**` 这类自家插件资源。

### 1.2 非目标（Out of Scope）
- 不做 DRM、也不承诺“无法被录屏/抓包”。HLS 只能 **提高取走原始 MP4 的门槛**。
- 不做 OBS/RTMP 真推流（你选择的是上传 MP4 自动转 HLS）。
- 不做企业 SSO/LDAP/OIDC 登录体系。

---

## 2. 私信语音（Livekit DM Only）

### 2.1 现状能力
- Livekit 插件已支持私信会话发起通话（DM action），入口代码见：
  - [livekit index.tsx](file:///workspace/server/plugins/com.msgbyte.livekit/web/plugins/com.msgbyte.livekit/src/index.tsx#L94-L127)

### 2.2 改造点
- **禁用群入口**：移除/不注册 `regGroupPanel`、`regGroupPanelBadge`、以及与群语音相关的导航入口（保留 DM 发起通话按钮即可）。
- **强制语音模式**：
  - 前端隐藏摄像头相关控件（camera toggle）
  - 加入房间时强制 `videoEnabled = false`
  - 允许麦克风（audioEnabled 可默认 false，或按你偏好默认 true）

验收标准：
- 群内任意位置不出现“语音频道/群通话”入口。
- 私信窗口可点击“发起通话”，通话界面不出现摄像头按钮或无法开启摄像头。

---

## 3. 伪直播：MP4 上传 → 转码 HLS → 群内直播卡片

### 3.1 用户体验
- 群管理在某个 **文本频道** 顶部操作区点击“发起直播”（插件提供）。
- 选择一个 MP4 文件（可选：填写标题/封面）。
- 系统显示“转码中/开播中”提示；转码完成后自动在该频道发送一条“直播卡片消息”：
  - 文案类似“正在直播：{标题}”
  - 显示封面、直播状态、开播者
  - 点击卡片打开播放（弹窗/侧边栏/独立路由三选一；实现阶段推荐弹窗）
- 群成员无需安装额外客户端，Web 端可直接播放。

### 3.2 技术架构（高层）
- 新增一个前后端一体插件：`com.msgbyte.pseudolive`（名称可在实现阶段确认，核心是“独立于 core 的插件”）。
- 后端插件负责：
  1) 校验群管理权限
  2) 接收 MP4 上传（走网关 `/upload` 的 multipart）
  3) 用 `ffmpeg` 转成 HLS
  4) 将 HLS 输出到可被 Web 访问的位置（建议持久化目录 + 通过现有静态服务代理）
  5) 调用 `chat.message.sendMessage` 向目标频道发送“直播卡片消息”（用 meta 承载卡片数据）
- 前端插件负责：
  1) 在群文本频道顶部注册一个操作按钮（`regPluginPanelAction position=group`）
  2) 上传 MP4（到后端插件的 upload action）
  3) 注册一个 `regMessageExtraParser`：当检测到消息 meta 为“伪直播卡片”时，渲染卡片 UI 并提供播放入口
  4) 播放器使用 `hls.js`（Chrome 等浏览器需要）

### 3.3 卡片消息数据结构（Message Meta）
使用现有 `chat.message.sendMessage` 的 `meta` 字段承载，不引入新的 message type。

建议 meta（示例）：
```json
{
  "pseudolive": {
    "streamId": "pl_20260415_xxx",
    "title": "晚间策略复盘",
    "status": "ready",
    "hlsUrl": "{BACKEND}/streams/pl_20260415_xxx/index.m3u8",
    "coverUrl": "{BACKEND}/streams/pl_20260415_xxx/cover.jpg",
    "startedBy": "userId",
    "startedAt": 1710000000000
  }
}
```

### 3.4 上传与权限
- 入口：群文本频道顶部操作区（TextPanel prefixActions）。
- 权限：仅允许具备 `PERMISSION.core.managePanel`（或你指定的更高权限）的人开播/停播。
- 服务端必须二次校验权限（前端只做提示，不作为安全边界）。

### 3.5 存储与访问路径
为避免暴露原始 MP4：
- MP4 上传后存放于 **私有临时目录**（不走 `/static` 对象存储直链）。
- 转码后的 HLS 输出到一个“对外可访问的目录”，例如：
  - `server/public/streams/<streamId>/index.m3u8`
  - `server/public/streams/<streamId>/segment_00001.ts`（或 fmp4）
- 网关现有 `/` 静态代理已经会把 `public` 目录暴露出去（见 [gateway.service.ts](file:///workspace/server/services/core/gateway.service.ts#L314-L341)），因此 `/streams/**` 可以直接访问。

部署建议：
- Docker/宿主机上对 `streams/` 做持久化挂载，避免容器重启丢失直播内容。
- 增加过期清理策略：例如保留 N 天或按容量阈值清理旧 stream。

### 3.6 转码策略（ffmpeg）
目标：生成“更像直播”的 HLS（减少拖动/回看能力）。

建议采用 HLS EVENT（可回放但更像直播）或 LIVE（更严格）：
- EVENT：`-hls_playlist_type event`
- LIVE：不写 playlist_type，结合 `-hls_list_size` 控制窗口

实现阶段会给出具体 `ffmpeg` 命令与参数（包括分片时长、编码、音轨）。

### 3.7 播放器
Web 播放需考虑浏览器兼容：
- Safari 可原生播放 m3u8
- Chrome/Edge 需 `hls.js`

播放器 UI 约束：
- 普通成员只看，不显示“下载”入口
- 可选：隐藏 seek bar（实现方式为 UI 限制；并不阻止技术用户抓包）

验收标准：
- 群管理上传 MP4 后，群里出现一条直播卡片消息。
- 群成员点击卡片可观看，Chrome 下可正常播放（hls.js 生效）。
- 聊天记录中不出现“附件 MP4 文件消息”（仅卡片）。

---

## 4. 自动发话术（普通账号 JWT）

### 4.1 运行方式
新增一个独立脚本（或单独进程）：
- 使用普通账号（邮箱/手机号 + 密码）调用 `user.login` 获取 JWT
- 周期性刷新 JWT（例如 1 小时刷新一次，或捕获 401 后自动重登）
- 按 cron 配置向目标频道调用 `chat.message.sendMessage`

### 4.2 风控与权限
- 该“运营账号”应当是一个独立账号，权限与可见范围可控（只在指定群/频道发言）。
- 话术模板建议本地化配置（文件/DB），并支持开关。

---

## 5. 插件外部安装限制（仅自家服务器）

目标：允许“安装插件”，但不允许加载第三方域名 JS。

策略：
- 插件安装/更新时校验 manifest.url：
  - 仅允许 `/plugins/**` 或 `{BACKEND}/plugins/**`（同源/后端域名）
  - 拒绝 http(s)://third-party.example.com/xxx
- registry 只提供自家插件列表。

---

## 6. 内网/外网切换（运维开关）

推荐做法（不做应用内按钮）：
- 外网阶段：允许访问外部依赖（WxPusher/Getui/第三方）
- 内网阶段：通过防火墙策略/DNS/路由切换禁止出网
  - 外部依赖插件不可用可接受
  - 插件安装白名单仍然生效（只允许加载自家插件）

---

## 7. 测试与验收

- 单元测试（后端）：权限校验、转码任务状态机、消息发送 meta 正确性
- 集成测试（手工即可）：上传 MP4 → 转码 → 群内卡片 → 多端播放（至少 Chrome + Safari）
- 回归点：不影响普通文件上传 `/upload`；不影响现有消息发送/渲染。

