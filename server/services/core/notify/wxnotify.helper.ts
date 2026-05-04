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

export function maskWxNotifyUid(uid: string) {
  if (!uid) {
    return '';
  }

  if (uid.length <= 8) {
    return uid;
  }

  return `${uid.slice(0, 8)}...${uid.slice(-4)}`;
}

export function buildWxNotifyLogQuery(input: {
  type?: string;
  status?: string;
  targetKeyword?: string;
  days?: number;
}) {
  const query: Record<string, any> = {};

  if (input.type && input.type !== 'all') {
    query.type = input.type;
  }

  if (input.status && input.status !== 'all') {
    query.status = input.status;
  }

  if (input.targetKeyword) {
    query.targetUserId = {
      $regex: input.targetKeyword,
      $options: 'i',
    };
  }

  if (typeof input.days === 'number' && input.days > 0) {
    query.createdAt = {
      $gte: new Date(Date.now() - input.days * 24 * 60 * 60 * 1000),
    };
  }

  return query;
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
