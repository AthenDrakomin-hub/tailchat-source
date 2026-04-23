# 注册组织代码及语音外链分享功能 (Update Org Code and External Voice Spec)

## Why
当前系统注册时使用的“组织代码”是硬编码的（默认 0813 和 朝闻道），用户希望将其默认值修改为 `0501`，并且能够在管理后台进行可视化配置，以便于运营管理。
此外，现有的语音通话插件（LiveKit）仅支持在项目内部使用。用户希望将其能力扩展，支持通过分享链接的方式，让外部人员点击链接后直接加入语音通话，实现能力的外部输出与利用。

## What Changes
- **配置化注册组织代码**：在系统的全局客户端配置（Global Client Config）中增加 `registerOrgCode` 字段，默认值为 `0501`。
- **管理端支持**：在管理后台的“系统设置”页面中增加该字段的配置入口，允许管理员使用逗号分隔多个组织代码。
- **开放外部访问 Token 接口**：在 LiveKit 插件的服务端增加 `generateGuestToken` 接口，并将其加入鉴权白名单，允许未登录用户获取会议临时访问凭证。
- **新增独立外部会议视图**：注册一个新的根路由 `/plugin/com.msgbyte.livekit/meeting/:meetingId`，并在该路由下渲染独立全屏的会议组件 `ExternalMeeting`。
- **访客昵称输入与 Token 申请**：修改 `PreJoinView` 和 `ActiveRoom`，当识别到当前用户未登录（访客）时，要求输入临时昵称，并使用该昵称向 `generateGuestToken` 接口申请 Token。
- **分享链接功能**：在会议的底部控制栏（`ControlBar`）增加“复制分享链接”按钮，点击后生成并复制外部邀请链接。

## Impact
- Affected specs: 用户注册流程、LiveKit 语音插件、管理端系统设置
- Affected code:
  - `client/shared/model/config.ts`
  - `client/shared/utils/consts.ts`
  - `server/admin/src/client/routes/system/index.tsx`
  - `server/admin/src/client/i18n/zh.ts`
  - `server/services/core/config.service.ts`
  - `server/services/core/user/user.service.ts`
  - `server/plugins/com.msgbyte.livekit/services/livekit.service.ts`
  - `server/plugins/com.msgbyte.livekit/web/plugins/com.msgbyte.livekit/src/index.tsx`
  - `server/plugins/com.msgbyte.livekit/web/plugins/com.msgbyte.livekit/src/components/ExternalMeeting.tsx` (新文件)
  - `server/plugins/com.msgbyte.livekit/web/plugins/com.msgbyte.livekit/src/components/lib/PreJoinView.tsx`
  - `server/plugins/com.msgbyte.livekit/web/plugins/com.msgbyte.livekit/src/components/ActiveRoom.tsx`
  - `server/plugins/com.msgbyte.livekit/web/plugins/com.msgbyte.livekit/src/utils/useToken.ts`
  - `server/plugins/com.msgbyte.livekit/web/plugins/com.msgbyte.livekit/src/components/lib/ControlBar.tsx`
  - `server/plugins/com.msgbyte.livekit/web/plugins/com.msgbyte.livekit/src/translate.ts`

## ADDED Requirements
### Requirement: 管理端配置组织代码
系统 SHALL 允许管理员在“系统设置”页面修改允许注册的组织代码，多个代码可用逗号分隔，并实时生效。

#### Scenario: 成功注册
- **WHEN** 用户在注册表单中输入与后台配置相匹配的组织代码（如未配置则默认匹配 `0501`）
- **THEN** 用户可以顺利完成注册流程

### Requirement: 外部语音会议分享链接
系统 SHALL 提供一个允许非注册用户加入语音会议的外部链接，并支持在会议中一键复制。

#### Scenario: 访客加入会议
- **WHEN** 外部访客通过分享链接打开页面，并输入自己的临时昵称点击加入
- **THEN** 访客成功连接到对应的 LiveKit 房间，能够进行语音交流

## MODIFIED Requirements
### Requirement: 移除硬编码代码
将原来代码中直接判断 `params.orgCode !== '0813' && params.orgCode !== '朝闻道'` 的逻辑，修改为从 `globalConfig` 中读取配置进行判断。
