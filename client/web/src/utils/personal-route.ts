export function getPersonalChatPath(converseId: string) {
  return `/main/personal/chats/${converseId}`;
}

export function getPanelPersonalChatPath(converseId: string) {
  return `/panel/personal/chats/${converseId}`;
}

export function getLegacyPanelPersonalChatPath(converseId: string) {
  return `/panel/personal/converse/${converseId}`;
}
