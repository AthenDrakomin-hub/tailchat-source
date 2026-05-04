import type { ChatConverseState } from 'tailchat-shared';

function getConverseOrderKey(converse: ChatConverseState): string {
  const lastMessage = converse.messages[converse.messages.length - 1];
  return lastMessage?._id ?? '';
}

export function sortPersonalSidebarConverses(list: ChatConverseState[]) {
  return [...list].sort((a, b) =>
    getConverseOrderKey(a) < getConverseOrderKey(b) ? 1 : -1
  );
}
