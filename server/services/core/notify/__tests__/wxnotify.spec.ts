import {
  buildWxNotifyLogQuery,
  buildWxNotifyMessage,
  buildWxNotifyTestMessage,
  detectMentionAll,
  maskWxNotifyUid,
  getWxNotifyBinding,
  getWxNotifyDefaultRules,
  maskWxNotifyToken,
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

  test('allows default direct message notify when conversation is not muted', () => {
    expect(
      shouldSendWxNotify(
        undefined,
        {
          type: 'directMessage',
          converseId: 'c1',
        }
      )
    ).toBe(true);
  });

  test('allows voice call notify by default', () => {
    expect(
      shouldSendWxNotify(
        undefined,
        {
          type: 'voiceCall',
          converseId: 'c1',
        }
      )
    ).toBe(true);
  });

  test('does not send mention all notify when group is muted', () => {
    expect(
      shouldSendWxNotify(
        {
          messageNotificationMuteList: ['g1'],
        },
        {
          type: 'mentionAll',
          converseId: 'c1',
          groupId: 'g1',
        }
      )
    ).toBe(false);
  });

  test('builds test notify message for self-check', () => {
    expect(buildWxNotifyTestMessage('财讯助手')).toMatchObject({
      summary: '财讯微信通知测试',
    });
  });

  test('detects group mention all from plain text', () => {
    expect(detectMentionAll('@所有人 今天八点开始')).toBe(true);
    expect(detectMentionAll('please ping @all now')).toBe(true);
    expect(detectMentionAll('@小王 看一下')).toBe(false);
  });

  test('returns fixed default rules for admin overview', () => {
    expect(getWxNotifyDefaultRules()).toEqual([
      '好友私信',
      '语音电话来电',
      '群组 @所有人',
    ]);
  });

  test('masks app token for admin overview', () => {
    expect(maskWxNotifyToken('AT_123456789')).toBe('AT_1234****');
    expect(maskWxNotifyToken('')).toBe('');
  });

  test('masks bound uid for admin display', () => {
    expect(maskWxNotifyUid('UID_1234567890')).toBe('UID_1234...7890');
    expect(maskWxNotifyUid('')).toBe('');
  });

  test('builds admin log query from filter params', () => {
    const query = buildWxNotifyLogQuery({
      type: 'voiceCall',
      status: 'failed',
      targetKeyword: 'user_1',
      days: 7,
    });

    expect(query.type).toBe('voiceCall');
    expect(query.status).toBe('failed');
    expect(query.targetUserId).toEqual({
      $regex: 'user_1',
      $options: 'i',
    });
    expect(query.createdAt).toBeTruthy();
  });
});
