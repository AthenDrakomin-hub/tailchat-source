import type { WxNotifyStatus } from 'tailchat-shared';

export function resolveWxNotifyStatus(status: WxNotifyStatus) {
  if (!status.available) {
    return {
      title: '当前未启用微信通知通道',
      description: '请联系管理员在后台插件中心启用 WxPusher 或配置微信通知通道。',
      actionText: '等待后台配置',
    };
  }

  if (status.isBound && status.isEnabled) {
    return {
      title: '已绑定微信通知',
      description: '当有人 @你 时，微信将收到提醒。你可以重新授权或解除绑定。',
      actionText: '重新授权',
    };
  }

  return {
    title: '未绑定微信通知',
    description: '绑定后，当收到 @你 的消息时，你的微信会收到提醒。',
    actionText: '去授权',
  };
}
