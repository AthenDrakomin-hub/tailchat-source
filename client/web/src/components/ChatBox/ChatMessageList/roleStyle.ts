import type { GroupInfo, GroupPanelRoleStyle } from 'tailchat-shared';

export function getGroupPanelRoleStyle(
  groupInfo: GroupInfo | null | undefined,
  panelId: string | undefined,
  userId: string | undefined
): GroupPanelRoleStyle | undefined {
  if (!groupInfo || !panelId || !userId) {
    return undefined;
  }

  const panel = groupInfo.panels.find((item) => item.id === panelId);
  const readability = panel?.meta?.speakPolicy?.readability;
  const roleStyleMap = readability?.roleStyleMap;
  if (!roleStyleMap || readability?.roleStyleMode === 'none') {
    return undefined;
  }

  const member = groupInfo.members.find((item) => item.userId === userId);
  const roleIds = member?.roles ?? [];
  for (const roleId of roleIds) {
    const style = roleStyleMap[roleId];
    if (style) {
      return filterRoleStyleByMode(style, readability?.roleStyleMode);
    }
  }

  return undefined;
}

export function filterRoleStyleByMode(
  style: GroupPanelRoleStyle,
  mode:
    | 'none'
    | 'nickname'
    | 'avatar-ring'
    | 'side-accent'
    | 'combined'
    | undefined
): GroupPanelRoleStyle | undefined {
  if (!style || mode === 'none') {
    return undefined;
  }

  if (mode === 'combined' || !mode) {
    return style;
  }

  if (mode === 'nickname') {
    return { nicknameColor: style.nicknameColor };
  }

  if (mode === 'avatar-ring') {
    return { avatarRingColor: style.avatarRingColor };
  }

  if (mode === 'side-accent') {
    return { sideAccentColor: style.sideAccentColor };
  }

  return undefined;
}
