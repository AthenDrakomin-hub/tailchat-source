import { getWxNotifyDefaultRules } from '../wxNotifyDefaultRules';

describe('getWxNotifyDefaultRules', () => {
  test('returns the three fixed notify rules', () => {
    expect(getWxNotifyDefaultRules()).toEqual([
      '好友私信',
      '语音电话来电',
      '群组 @所有人',
    ]);
  });
});
