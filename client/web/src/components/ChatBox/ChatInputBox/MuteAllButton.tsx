import React, { useMemo } from 'react';
import { BaseChatInputButton } from './BaseChatInputButton';
import {
  PERMISSION,
  t,
  useAsyncRequest,
  useGroupPanelInfo,
  useHasGroupPermission,
  model,
} from 'tailchat-shared';

export const MuteAllButton: React.FC<{ groupId?: string; panelId?: string }> = React.memo((props) => {
  const { groupId, panelId } = props;
  const panelInfo = useGroupPanelInfo(groupId ?? '', panelId ?? '');
  const [hasManagePermission] = useHasGroupPermission(groupId ?? '', [PERMISSION.core.managePanel]);

  const isMuted = useMemo(() => {
    if (!panelInfo) return false;
    const fallbackPermissions = panelInfo.fallbackPermissions ?? [PERMISSION.core.message];
    return !fallbackPermissions.includes(PERMISSION.core.message);
  }, [panelInfo]);

  const [{ loading }, handleToggleMute] = useAsyncRequest(async () => {
    if (!groupId || !panelId || !panelInfo) return;

    const fallbackPermissions = panelInfo.fallbackPermissions ?? [PERMISSION.core.message];
    let newPermissions: string[];

    if (isMuted) {
      newPermissions = [...fallbackPermissions, PERMISSION.core.message];
    } else {
      newPermissions = fallbackPermissions.filter((p) => p !== PERMISSION.core.message);
    }

    await model.group.modifyGroupPanel(groupId, panelId, {
      name: panelInfo.name,
      type: panelInfo.type,
      parentId: panelInfo.parentId,
      fallbackPermissions: newPermissions,
    } as any);
  }, [groupId, panelId, panelInfo, isMuted]);

  if (!groupId || !panelId || !hasManagePermission) {
    return null;
  }

  return (
    <div title={isMuted ? t('解除全群禁言') : t('一键全群禁言')} onClick={handleToggleMute}>
      <BaseChatInputButton
        icon={isMuted ? 'mdi:microphone-off' : 'mdi:microphone'}
        style={{ color: isMuted ? '#ef4444' : undefined, opacity: loading ? 0.5 : 1 }}
      />
    </div>
  );
});
MuteAllButton.displayName = 'MuteAllButton';
