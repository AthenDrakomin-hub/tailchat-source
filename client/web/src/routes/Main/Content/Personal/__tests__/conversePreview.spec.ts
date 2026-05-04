import { buildConversePreview } from '../conversePreview';

describe('buildConversePreview', () => {
  test('returns empty state copy when conversation has no messages', () => {
    expect(
      buildConversePreview({
        hasMessage: false,
      })
    ).toBe('暂无消息');
  });

  test('adds role label before preview text', () => {
    expect(
      buildConversePreview({
        hasMessage: true,
        content: '今晚八点直播开始',
        hasRecall: false,
        roleLabel: '活动',
      })
    ).toBe('[活动] 今晚八点直播开始');
  });

  test('adds sender prefix for multi member conversations', () => {
    expect(
      buildConversePreview({
        hasMessage: true,
        content: '老师好，我先发今天的复盘',
        hasRecall: false,
        senderName: '小助理',
        isMultiMember: true,
      })
    ).toBe('小助理：老师好，我先发今天的复盘');
  });

  test('falls back to recall text and compacts whitespace', () => {
    expect(
      buildConversePreview({
        hasMessage: true,
        content: '   ',
        hasRecall: true,
        senderName: '主讲老师',
        isMultiMember: true,
      })
    ).toBe('主讲老师：撤回了一条消息');
  });
});
