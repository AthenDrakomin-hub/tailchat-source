import type { PluginManifest } from 'tailchat-shared';
import _compact from 'lodash/compact';

const isOffical = [
  'nightly.paw.msgbyte.com', //
  //'localhost:11011'
].includes(location.host);

/**
 * 内置插件列表
 *
 * 该列表用于“可用插件”展示。是否可见/可用由服务端 enabledPlugins + 用户角色控制。
 */
export const builtinPlugins: PluginManifest[] = _compact([
  {
    label: 'Web Panel Plugin',
    'label.zh-CN': '网页面板插件',
    name: 'com.msgbyte.webview',
    url: '/plugins/com.msgbyte.webview/index.js',
    version: '0.0.0',
    author: 'msgbyte',
    description: 'Provides groups with the ability to create web panels',
    'description.zh-CN': '为群组提供创建网页面板的功能',
    documentUrl: '/plugins/com.msgbyte.webview/README.md',
    requireRestart: false,
  },
  {
    label: 'BBCode Mmessage Interpreter',
    'label.zh-CN': 'BBCode 消息解释器',
    name: 'com.msgbyte.bbcode',
    url: '/plugins/com.msgbyte.bbcode/index.js',
    version: '0.0.0',
    author: 'msgbyte',
    description:
      'A plugin for supporting bbcode syntax to interpret rich text messages',
    'description.zh-CN': '一个用于支持bbcode语法解释富文本消息的插件',
    requireRestart: true,
  },
  {
    label: 'Message notification plugin',
    'label.zh-CN': '消息通知插件',
    name: 'com.msgbyte.notify',
    url: '/plugins/com.msgbyte.notify/index.js',
    version: '0.0.0',
    author: 'msgbyte',
    description: 'Ability to add notifications to apps',
    'description.zh-CN': '为应用增加通知的能力',
    requireRestart: true,
  },
  {
    label: 'Intro plugin',
    'label.zh-CN': '初始引导插件',
    name: 'com.msgbyte.intro',
    url: '/plugins/com.msgbyte.intro/index.js',
    version: '0.0.0',
    author: 'msgbyte',
    description:
      'Turn on the ability to introduce the app for the first time for the app',
    'description.zh-CN': '为应用首次打开介绍应用的能力',
    requireRestart: true,
  },
  {
    label: 'Markdown Panel',
    'label.zh-CN': 'Markdown 面板',
    name: 'com.msgbyte.mdpanel',
    url: '/plugins/com.msgbyte.mdpanel/index.js',
    version: '0.0.0',
    author: 'moonrailgun',
    description: 'Add markdown panel support',
    'description.zh-CN': '增加 Markdown 面板支持',
    requireRestart: true,
  },
  {
    label: 'Offline Icons',
    'label.zh-CN': '离线图标',
    name: 'com.msgbyte.offline-icons',
    url: '/plugins/com.msgbyte.offline-icons/index.js',
    version: '0.0.0',
    author: 'moonrailgun',
    description: 'Add prefetched icons which need run in intranet environment',
    'description.zh-CN': '增加预获取的图标，适用于内网环境',
    requireRestart: true,
  },
  {
    label: 'AI 财富助手',
    name: 'com.msgbyte.wealth',
    url: '/plugins/com.msgbyte.wealth/index.js',
    icon: '/plugins/com.msgbyte.wealth/assets/icon.png',
    version: '1.0.0',
    author: 'WealthLounge',
    description: '提供轻量级免费的智能选股与诊股功能',
    requireRestart: true,
  },
  {
    label: '伪直播',
    name: 'com.msgbyte.pseudolive',
    url: '{BACKEND}/plugins/com.msgbyte.pseudolive/index.js',
    version: '1.0.0',
    author: 'WealthLounge',
    description: '上传 MP4 转成 HLS 并在群里发送直播卡片',
    requireRestart: true,
  },
  {
    label: 'Livekit',
    name: 'com.msgbyte.livekit',
    url: '{BACKEND}/plugins/com.msgbyte.livekit/index.js',
    icon: '{BACKEND}/plugins/com.msgbyte.livekit/assets/icon.png',
    version: '0.0.0',
    author: 'moonrailgun',
    description: 'Add livekit to provide meeting and live streaming feature',
    'description.zh-CN': '增加 livekit 以提供会议与直播功能',
    requireRestart: true,
  },
  {
    label: 'Audio and video service (WIP)',
    'label.zh-CN': '音视频服务(WIP)',
    name: 'com.msgbyte.meeting',
    url: '{BACKEND}/plugins/com.msgbyte.meeting/index.js',
    version: '0.0.0',
    author: 'moonrailgun',
    description: 'Provide audio and video communication services for Tailchat',
    'description.zh-CN': '为Tailchat提供音视频通讯的服务',
    requireRestart: true,
  },
  // isOffical
  isOffical && {
    label: 'Posthog',
    name: 'com.msgbyte.posthog',
    url: '/plugins/com.msgbyte.posthog/index.js',
    icon: '/plugins/com.msgbyte.posthog/assets/icon.png',
    version: '0.0.0',
    author: 'moonrailgun',
    description: 'Posthog Statistics',
    'description.zh-CN': 'Posthog 数据统计',
    requireRestart: true,
  },
  isOffical && {
    label: 'Sentry',
    name: 'com.msgbyte.sentry',
    url: '/plugins/com.msgbyte.sentry/index.js',
    icon: '/plugins/com.msgbyte.sentry/assets/icon.png',
    version: '0.0.0',
    author: 'moonrailgun',
    description: 'Sentry error handling',
    'description.zh-CN': 'Sentry 错误处理',
    requireRestart: true,
  },
  isOffical && {
    label: 'User Location',
    'label.zh-CN': '用户地理位置',
    name: 'com.msgbyte.user.location',
    url: '/plugins/com.msgbyte.user.location/index.js',
    version: '0.0.0',
    author: 'moonrailgun',
    description: 'Add geographic location records for user information',
    'description.zh-CN': '为用户信息增加地理位置记录',
    requireRestart: true,
  },
  isOffical && {
    label: 'AI Assistant',
    name: 'com.msgbyte.ai-assistant',
    url: '/plugins/com.msgbyte.ai-assistant/index.js',
    icon: '/plugins/com.msgbyte.ai-assistant/assets/icon.png',
    version: '0.0.0',
    author: 'moonrailgun',
    description: 'Add chatgpt into Tailchat',
    requireRestart: true,
  },
  // 因为大段内容可能会有性能问题暂时移除，用户可以按需安装
  // isOffical && {
  //   label: 'Url metadata display',
  //   'label.zh-CN': 'Url元数据展示',
  //   name: 'com.msgbyte.linkmeta',
  //   url: '{BACKEND}/plugins/com.msgbyte.linkmeta/index.js',
  //   version: '0.0.0',
  //   author: 'msgbyte',
  //   description:
  //     'Parse and get the overview of url information in the chat information, such as title/overview/thumbnail, support media path, directly display media player (specially support bilibili, automatically load the iframe player of bilibili)',
  //   'description.zh-CN':
  //     '解析并获取在聊天信息中的url信息概述，如标题/概述/缩略图, 支持媒体路径，直接显示媒体播放器(特殊支持bilibili，自动加载b站iframe播放器)',
  //   requireRestart: false,
  // },
]);

/**
 * 地基插件：保证客户端基础能力可用
 * - 永远启用
 * - 不参与运营发布/权限控制
 * - 会被强制安装
 */
export const requiredBuiltinPluginIds = [
  'com.msgbyte.webview',
  'com.msgbyte.bbcode',
  'com.msgbyte.notify',
  'com.msgbyte.intro',
  'com.msgbyte.mdpanel',
  'com.msgbyte.offline-icons',
  'com.msgbyte.wealth',
  'com.msgbyte.livekit',
  'com.msgbyte.agora',
];

export const requiredBuiltinPlugins: PluginManifest[] = builtinPlugins.filter(
  (p) => requiredBuiltinPluginIds.includes(p.name)
);
