export interface WxNotifyBinding {
  provider: 'wxpusher';
  uid: string;
  enabled: boolean;
  boundAt: string;
}

export function getWxNotifyBinding(extra?: Record<string, any>) {
  const binding = extra?.wxNotifyBinding as WxNotifyBinding | undefined;

  if (!binding?.uid) {
    return {
      isBound: false,
      isEnabled: false,
      uid: '',
      binding: null,
    };
  }

  return {
    isBound: true,
    isEnabled: binding.enabled !== false,
    uid: binding.uid,
    binding,
  };
}

export function buildWxNotifyMessage(input: {
  authorName: string;
  messageSnippet: string;
  sceneName: string;
}) {
  const snippet = input.messageSnippet.replace(/\s+/g, ' ').trim().slice(0, 80);

  return {
    summary: `${input.authorName} 在 ${input.sceneName} 提醒了你`,
    content: `<h3>${input.authorName} 提醒了你</h3><p>${snippet}</p><p>来源：${input.sceneName}</p>`,
  };
}

export function buildWxNotifyTestMessage(appName: string) {
  return {
    summary: '财讯微信通知测试',
    content: `<h3>${appName} 微信通知已接通</h3><p>这是一条测试通知。现在你已经可以在微信中接收财讯提醒。</p>`,
  };
}

export function getWxNotifyDefaultRules() {
  return ['好友私信', '语音电话来电', '群组 @所有人'];
}

export function maskWxNotifyToken(token: string) {
  if (!token) {
    return '';
  }

  return `${token.slice(0, 7)}****`;
}

export function detectMentionAll(text?: string) {
  const normalized = String(text ?? '').toLowerCase();
  return normalized.includes('@所有人') || normalized.includes('@all');
}

export function shouldSendWxNotify(
  settings: Record<string, any> | undefined,
  event: {
    type: 'directMessage' | 'voiceCall' | 'mentionAll';
    converseId: string;
    groupId?: string;
  }
) {
  const muteList = Array.isArray(settings?.messageNotificationMuteList)
    ? settings.messageNotificationMuteList
    : [];

  if (
    muteList.includes(event.converseId) ||
    (event.groupId && muteList.includes(event.groupId))
  ) {
    return false;
  }

  return true;
}
