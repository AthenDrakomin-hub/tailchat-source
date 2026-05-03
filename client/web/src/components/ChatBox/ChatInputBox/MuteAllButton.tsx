import React, { useMemo } from 'react';
import {
  PERMISSION,
  t,
  useAsyncRequest,
  useGroupPanelInfo,
  useHasGroupPermission,
  model,
} from 'tailchat-shared';
import clsx from 'clsx';
import { Icon } from 'tailchat-design';

export const MuteAllButton: React.FC<{ groupId?: string; panelId?: string }> =
  React.memo((props) => {
    const { groupId, panelId } = props;
    const panelInfo = useGroupPanelInfo(groupId ?? '', panelId ?? '');
    const [hasManagePermission] = useHasGroupPermission(groupId ?? '', [
      PERMISSION.core.managePanel,
    ]);

    const isMuted = useMemo(() => {
      if (!panelInfo) return false;
      const speakPolicy = panelInfo.meta?.speakPolicy;
      if (speakPolicy?.enabled) {
        return speakPolicy.defaultRule?.allowText === false;
      }

      const fallbackPermissions = panelInfo.fallbackPermissions ?? [PERMISSION.core.message];
      return !fallbackPermissions.includes(PERMISSION.core.message);
    }, [panelInfo]);

    const [{ loading }, handleToggleMute] = useAsyncRequest(async () => {
      if (!groupId || !panelId || !panelInfo) return;

      const speakPolicy = panelInfo.meta?.speakPolicy;
      const fallbackPermissions = panelInfo.fallbackPermissions ?? [
        PERMISSION.core.message,
      ];
      const normalizedFallbackPermissions = fallbackPermissions.includes(
        PERMISSION.core.message
      )
        ? fallbackPermissions
        : [...fallbackPermissions, PERMISSION.core.message];
      const nextSpeakPolicy = {
        enabled: true,
        defaultRule: {
          allowText: isMuted,
          allowRichContent: isMuted,
          rateLimitWindowSec: speakPolicy?.defaultRule?.rateLimitWindowSec ?? 10,
          rateLimitCount: speakPolicy?.defaultRule?.rateLimitCount ?? 6,
        },
        roleRules: speakPolicy?.roleRules ?? {},
        botRule: speakPolicy?.botRule ?? {
          allowText: true,
          allowRichContent: true,
          rateLimitWindowSec: 30,
          rateLimitCount: 2,
        },
        floodControl: speakPolicy?.floodControl ?? {
          enabled: true,
          duplicateWindowSec: 30,
          duplicateLimit: 2,
        },
        readability: speakPolicy?.readability ?? {
          roleStyleMode: 'combined',
          roleStyleMap: {},
        },
      };

      await model.group.modifyGroupPanel(groupId, panelId, {
        name: panelInfo.name,
        type: panelInfo.type,
        parentId: panelInfo.parentId,
        provider: panelInfo.provider,
        pluginPanelName: panelInfo.pluginPanelName,
        permissionMap: panelInfo.permissionMap,
        fallbackPermissions: normalizedFallbackPermissions,
        meta: {
          ...(panelInfo.meta ?? {}),
          speakPolicy: nextSpeakPolicy,
        },
      } as any);
    }, [groupId, panelId, panelInfo, isMuted]);

    if (!groupId || !panelId || !hasManagePermission) {
      return null;
    }

    return (
      <div
        title={isMuted ? t('解除默认成员发言限制') : t('默认成员禁言')}
        onClick={handleToggleMute}
        className={clsx(
          'w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#f3f4f6] dark:hover:bg-white/10 transition-colors',
          isMuted && 'bg-red-50 dark:bg-red-500/10'
        )}
      >
        <Icon
          className={clsx(
            'text-[22px] cursor-pointer text-gray-500 dark:text-gray-300 hover:text-[#07c160]',
            isMuted && 'text-red-500',
            loading && 'opacity-50'
          )}
          icon={isMuted ? 'mdi:microphone-off' : 'mdi:microphone'}
        />
      </div>
    );
  });
MuteAllButton.displayName = 'MuteAllButton';
