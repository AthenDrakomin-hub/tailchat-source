import { resolveWxNotifyStatus } from '../wxNotifyStatus';

describe('resolveWxNotifyStatus', () => {
  test('returns unavailable state when wx channel is not configured', () => {
    expect(
      resolveWxNotifyStatus({
        available: false,
        provider: 'wxpusher',
        isBound: false,
        isEnabled: false,
        uid: '',
      })
    ).toMatchObject({
      title: '当前未启用微信通知通道',
      actionText: '等待后台配置',
    });
  });

  test('returns bound state when user already authorized', () => {
    expect(
      resolveWxNotifyStatus({
        available: true,
        provider: 'wxpusher',
        isBound: true,
        isEnabled: true,
        uid: 'UID_123',
      })
    ).toMatchObject({
      title: '已绑定微信通知',
      actionText: '重新授权',
    });
  });
});
