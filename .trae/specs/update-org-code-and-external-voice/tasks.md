# Tasks

- [x] Task 1: 实现可配置的组织注册代码
  - [x] SubTask 1.1: 在 `client/shared/model/config.ts` 的 `GlobalConfig` 接口中添加 `registerOrgCode?: string` 属性，并在 `client/shared/utils/consts.ts` 的 `defaultGlobalConfig` 中添加默认值 `registerOrgCode: '0501'`。
  - [x] SubTask 1.2: 在 `server/services/core/user/user.service.ts` 的 `register` 动作中，通过 `ctx.call('config.client')` 获取全局配置，将传入的 `orgCode` 与 `globalConfig.registerOrgCode` (按逗号分隔)进行匹配校验，替换掉原本硬编码的 '0813'。
  - [x] SubTask 1.3: 在 `server/admin/src/client/i18n/zh.ts` 中添加新的翻译键 `registerOrgCode: '注册组织代码'`。
  - [x] SubTask 1.4: 在 `server/admin/src/client/routes/system/index.tsx` 的 `SystemConfig` 组件中增加一个新的输入框表单项（使用 `useEditValue`）绑定到 `config?.registerOrgCode` 上，以便管理员修改。

- [x] Task 2: 在 LiveKit 插件后端实现访客 Token 生成接口
  - [x] SubTask 2.1: 在 `server/plugins/com.msgbyte.livekit/services/livekit.service.ts` 中，新增一个名为 `generateGuestToken` 的 action，接收 `roomName` 和 `nickname` 参数，生成不依赖系统用户身份的 LiveKit `AccessToken`。
  - [x] SubTask 2.2: 在该服务初始化时，调用 `this.registerAuthWhitelist(['/generateGuestToken']);`，使网关层对访客开放该接口。

- [x] Task 3: 在 LiveKit 插件前端实现外部会议视图和分享
  - [x] SubTask 3.1: 在 `server/plugins/com.msgbyte.livekit/web/plugins/com.msgbyte.livekit/src/translate.ts` 中增加翻译条目 `shareLink` 和 `shareLinkCopied`。
  - [x] SubTask 3.2: 在 `server/plugins/com.msgbyte.livekit/web/plugins/com.msgbyte.livekit/src/components/ExternalMeeting.tsx` 中创建一个全屏覆盖的 React 组件（无页面导航栏），解析 URL 参数 `meetingId`，并渲染 `LivekitView`。
  - [x] SubTask 3.3: 在 `server/plugins/com.msgbyte.livekit/web/plugins/com.msgbyte.livekit/src/index.tsx` 中使用 `regPluginRootRoute` 将 `ExternalMeeting` 注册到根路由 `/${PLUGIN_ID}/meeting/:meetingId`。
  - [x] SubTask 3.4: 在 `src/components/lib/PreJoinView.tsx` 中检测用户 `nickname` 是否为空，若为空（访客）则渲染一个额外的昵称输入框，并把输入的昵称传递给 `onSubmit`。
  - [x] SubTask 3.5: 在 `src/components/ActiveRoom.tsx` 中将 `userChoices.username` 传递给 `useToken(roomName, { userInfo: { name: userChoices.username } })`。
  - [x] SubTask 3.6: 修改 `src/utils/useToken.ts`，判断如果 `getGlobalState()?.user?.info` 为空，则调用 `generateGuestToken` 接口并传入 `options.userInfo?.name`。
  - [x] SubTask 3.7: 在 `src/components/lib/ControlBar.tsx` 中增加一个“分享链接”的按钮，点击后生成形如 `window.location.origin + /plugin/com.msgbyte.livekit/meeting/` + `roomName` 的链接，并拷贝到剪贴板。

# Task Dependencies
- [Task 3] 依赖于 [Task 2] 提供的访客凭证接口。
