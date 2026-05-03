import {
  assertSpeakRuleAllowed,
  getMostStrictSpeakRule,
  getRoleStyleForRoleIds,
  isRichMessagePayload,
} from '../utils/groupSpeakPolicy';

describe('groupSpeakPolicy', () => {
  test('returns strictest rule from matched role rules', () => {
    expect(
      getMostStrictSpeakRule(
        [
          {
            allowText: true,
            allowRichContent: true,
            rateLimitWindowSec: 10,
            rateLimitCount: 5,
          },
          {
            allowText: true,
            allowRichContent: false,
            rateLimitWindowSec: 30,
            rateLimitCount: 2,
          },
        ],
        {
          allowText: true,
          allowRichContent: true,
          rateLimitWindowSec: 15,
          rateLimitCount: 4,
        }
      )
    ).toEqual({
      allowText: true,
      allowRichContent: false,
      rateLimitWindowSec: 30,
      rateLimitCount: 2,
    });
  });

  test('treats decorator payload as rich content', () => {
    expect(
      isRichMessagePayload('![img](https://example.com/a.png)', {
        decorators: [{ type: 'image', url: 'https://example.com/a.png' }],
      })
    ).toBe(true);
  });

  test('throws when text is not allowed', () => {
    expect(() =>
      assertSpeakRuleAllowed(
        { allowText: false },
        'hello',
        undefined,
        {
          noText: '不允许发送文字消息',
          noRich: '不允许发送富媒体消息',
        }
      )
    ).toThrow('不允许发送文字消息');
  });

  test('picks first matched role style by role id order', () => {
    expect(
      getRoleStyleForRoleIds(
        ['role-2', 'role-1'],
        {
          roleStyleMap: {
            'role-1': { nicknameColor: '#111111' },
            'role-2': { nicknameColor: '#222222' },
          },
        }
      )
    ).toEqual({ nicknameColor: '#222222' });
  });
});
