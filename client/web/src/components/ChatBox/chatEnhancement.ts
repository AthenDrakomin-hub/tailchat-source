export function getSendErrorMessage(err: unknown): string {
  if (typeof err === 'string' && err.trim()) {
    return err;
  }

  if (err instanceof Error && err.message.trim()) {
    return err.message;
  }

  return '消息发送失败，请稍后重试';
}
