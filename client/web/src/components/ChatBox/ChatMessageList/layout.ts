export interface ChatMessageLayoutInput {
  isGroup: boolean;
  isSelf: boolean;
}

export interface ChatMessageLayoutResult {
  rowAlign: 'left' | 'right';
  bubbleAlign: 'left' | 'right';
  showNickname: boolean;
}

export function getChatMessageLayout(
  input: ChatMessageLayoutInput
): ChatMessageLayoutResult {
  if (input.isSelf) {
    return {
      rowAlign: 'right',
      bubbleAlign: 'right',
      showNickname: false,
    };
  }

  return {
    rowAlign: 'left',
    bubbleAlign: 'left',
    showNickname: input.isGroup,
  };
}
