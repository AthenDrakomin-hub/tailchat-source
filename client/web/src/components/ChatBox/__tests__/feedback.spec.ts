import { getSendErrorMessage } from '../chatEnhancement';

describe('chat enhancement helpers', () => {
  test('returns readable send error text', () => {
    expect(
      getSendErrorMessage(new Error('发送过于频繁，请在 9 秒后再试'))
    ).toBe('发送过于频繁，请在 9 秒后再试');
  });

  test('returns fallback text for unknown error', () => {
    expect(getSendErrorMessage(undefined)).toBe('消息发送失败，请稍后重试');
  });
});
