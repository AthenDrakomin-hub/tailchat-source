export function getSendErrorMessage(err: unknown): string {
  if (typeof err === 'string' && err.trim()) {
    return err;
  }

  if (err instanceof Error && err.message.trim()) {
    return err.message;
  }

  return '消息发送失败，请稍后重试';
}

export function getUserTypeBadgeText(type: string | undefined): string | null {
  if (type === 'openapiBot') {
    return '机器人';
  }

  if (type === 'pluginBot') {
    return '插件';
  }

  return null;
}
