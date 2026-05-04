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
