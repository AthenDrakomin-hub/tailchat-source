import { GroupPluginPanel } from '@/components/Panel/group/PluginPanel';
import { TextPanel } from '@/components/Panel/group/TextPanel';
import { Problem } from '@/components/Problem';
import { GroupPanelContext } from '@/context/GroupPanelContext';
import { useUserSessionPreference } from '@/hooks/useUserPreference';
import { Alert, Button } from 'antd';
import React, { useEffect, useMemo } from 'react';
import {
  GroupInfoContextProvider,
  GroupPanelType,
  PERMISSION,
  t,
  useGroupInfo,
  useGroupPanelInfo,
  useHasGroupPanelPermission,
} from 'tailchat-shared';
import { useGroupPanelParams } from './utils';
import { Icon } from 'tailchat-design';

/**
 * 记录下最后访问的面板id
 */
function useRecordGroupPanel(groupId: string, panelId: string) {
  const [lastVisitPanel, setLastVisitPanel] = useUserSessionPreference(
    'groupLastVisitPanel'
  );

  useEffect(() => {
    setLastVisitPanel({
      ...lastVisitPanel,
      [groupId]: panelId,
    });
  }, [groupId, panelId]);
}

interface GroupPanelRenderProps {
  groupId: string;
  panelId: string;
}
export const GroupPanelRender: React.FC<GroupPanelRenderProps> = React.memo(
  (props) => {
    const { groupId, panelId } = props;
    const groupInfo = useGroupInfo(groupId);
    const panelInfo = useGroupPanelInfo(groupId, panelId);
    const groupPanelContextValue = useMemo(
      () => ({
        groupId,
        panelId,
      }),
      [groupId, panelId]
    );
    useRecordGroupPanel(groupId, panelId);
    const [viewPanelPermission] = useHasGroupPanelPermission(groupId, panelId, [
      PERMISSION.core.viewPanel,
    ]);

    if (groupInfo === null) {
      return (
        <Alert
          className="w-full text-center"
          type="error"
          message={t('群组不存在')}
        />
      );
    }

    if (panelInfo === null) {
      return <Problem text={t('面板不存在')} />;
    }

    if (!viewPanelPermission) {
      return (
        <Problem
          text={
            <div className="flex flex-col items-center">
              <Icon icon="mdi:shield-lock-outline" className="text-6xl text-gray-400 mb-4" />
              <div className="text-xl font-semibold mb-2">{t('无权访问该面板')}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                {t('此面板已被设置为私密，或者您当前的身份组不满足访问条件。')}
              </div>
              <Button type="primary" onClick={() => window.history.back()}>
                {t('返回上一页')}
              </Button>
            </div>
          }
        />
      );
    }

    if (panelInfo.type === GroupPanelType.TEXT) {
      return (
        <GroupInfoContextProvider groupInfo={groupInfo}>
          <GroupPanelContext.Provider value={groupPanelContextValue}>
            <TextPanel groupId={groupId} panelId={panelInfo.id} />
          </GroupPanelContext.Provider>
        </GroupInfoContextProvider>
      );
    }
    if (panelInfo.type === GroupPanelType.PLUGIN) {
      return (
        <GroupPanelContext.Provider value={groupPanelContextValue}>
          <GroupPluginPanel groupId={groupId} panelId={panelInfo.id} />
        </GroupPanelContext.Provider>
      );
    }

    return (
      <Alert
        className="w-full text-center"
        type="error"
        message={t('未知的面板类型')}
      />
    );
  }
);
GroupPanelRender.displayName = 'GroupPanelRender';

export const GroupPanelRoute: React.FC = React.memo(() => {
  const { groupId, panelId } = useGroupPanelParams();

  return <GroupPanelRender groupId={groupId} panelId={panelId} />;
});
GroupPanelRoute.displayName = 'GroupPanelRoute';
