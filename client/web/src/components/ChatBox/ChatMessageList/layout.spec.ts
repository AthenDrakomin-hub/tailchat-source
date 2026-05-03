import { getChatMessageLayout } from './layout';

describe('chat message layout', () => {
  test('returns right layout for self message in dm', () => {
    expect(
      getChatMessageLayout({
        isGroup: false,
        isSelf: true,
      })
    ).toEqual({
      rowAlign: 'right',
      bubbleAlign: 'right',
      showNickname: false,
    });
  });

  test('returns left layout for other message in dm', () => {
    expect(
      getChatMessageLayout({
        isGroup: false,
        isSelf: false,
      })
    ).toEqual({
      rowAlign: 'left',
      bubbleAlign: 'left',
      showNickname: false,
    });
  });

  test('keeps self message on right even in group chat', () => {
    expect(
      getChatMessageLayout({
        isGroup: true,
        isSelf: true,
      })
    ).toEqual({
      rowAlign: 'right',
      bubbleAlign: 'right',
      showNickname: false,
    });
  });

  test('shows nickname for other message in group chat', () => {
    expect(
      getChatMessageLayout({
        isGroup: true,
        isSelf: false,
      })
    ).toEqual({
      rowAlign: 'left',
      bubbleAlign: 'left',
      showNickname: true,
    });
  });
});
