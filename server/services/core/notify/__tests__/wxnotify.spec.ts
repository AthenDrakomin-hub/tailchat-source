import {
  buildWxNotifyMessage,
  getWxNotifyBinding,
  shouldSendWxNotify,
} from '../wxnotify.helper';

describe('wxnotify helper', () => {
  test('returns disabled status when binding is missing', () => {
    expect(getWxNotifyBinding(undefined)).toMatchObject({
      isBound: false,
      isEnabled: false,
      uid: '',
    });
  });

  test('returns binding status from user extra', () => {
    expect(
      getWxNotifyBinding({
        wxNotifyBinding: {
          provider: 'wxpusher',
          uid: 'UID_123',
          enabled: true,
          boundAt: '2026-05-04T12:00:00.000Z',
        },
      })
    ).toMatchObject({
      isBound: true,
      isEnabled: true,
      uid: 'UID_123',
    });
  });

  test('builds mention push message with sender and scene', () => {
    expect(
      buildWxNotifyMessage({
        authorName: '主讲老师',
        messageSnippet: '@你 今天晚上八点直播复盘',
        sceneName: '投教训练营',
      })
    ).toMatchObject({
      summary: '主讲老师 在 投教训练营 提醒了你',
    });
  });

  test('sends mention notify only when mention preference is enabled', () => {
    expect(
      shouldSendWxNotify(
        {
          wxNotifyPreference: {
            mention: true,
            directMessage: false,
          },
        },
        {
          type: 'mention',
          converseId: 'c1',
        }
      )
    ).toBe(true);

    expect(
      shouldSendWxNotify(
        {
          wxNotifyPreference: {
            mention: false,
            directMessage: true,
          },
        },
        {
          type: 'mention',
          converseId: 'c1',
        }
      )
    ).toBe(false);
  });

  test('does not send direct message notify when conversation is muted', () => {
    expect(
      shouldSendWxNotify(
        {
          wxNotifyPreference: {
            mention: true,
            directMessage: true,
          },
          messageNotificationMuteList: ['c1'],
        },
        {
          type: 'directMessage',
          converseId: 'c1',
        }
      )
    ).toBe(false);
  });
});
