export function formatAdminError(
  err: unknown,
  fallback = '操作失败，请稍后重试'
): string {
  if (typeof err === 'string' && err.trim()) {
    return err;
  }

  if (err instanceof Error && err.message.trim()) {
    return err.message;
  }

  const maybeAxiosError = err as any;
  const responseMessage =
    maybeAxiosError?.response?.data?.error ||
    maybeAxiosError?.response?.data?.message ||
    maybeAxiosError?.response?.data?.msg;

  if (typeof responseMessage === 'string' && responseMessage.trim()) {
    return responseMessage;
  }

  const nestedMessage = maybeAxiosError?.message;
  if (typeof nestedMessage === 'string' && nestedMessage.trim()) {
    return nestedMessage;
  }

  return fallback;
}
