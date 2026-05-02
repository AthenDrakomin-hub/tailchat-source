import React from 'react';
import { GroupPanelType, isValidStr, useGroupInfo } from 'tailchat-shared';
import { useParams } from 'react-router';
import { GroupHeader } from './GroupHeader';
import { GroupSection } from '@/components/GroupSection';
import { CommonSidebarWrapper } from '@/components/CommonSidebarWrapper';
import { SidebarItem } from './SidebarItem';
import { GroupPanelItem } from '@/components/GroupPanelItem';
import { Icon } from 'tailchat-design';

/**
 * 群组面板侧边栏组件
 */
export const Sidebar: React.FC = React.memo(() => {
  const { groupId = '' } = useParams<{ groupId: string }>();
  const groupInfo = useGroupInfo(groupId);
  const groupPanels = groupInfo?.panels ?? [];

  return (
    <CommonSidebarWrapper data-tc-role="sidebar-group">
      <GroupHeader groupId={groupId} />

      <div className="p-2 space-y-1 overflow-y-auto overflow-x-hidden min-w-0">
        <GroupPanelItem
          name="关联动态"
          icon={<Icon icon="mdi:post-outline" />}
          to={`/main/feed?groupId=${groupId}`}
        />

        {groupPanels
          .filter((panel) => !isValidStr(panel.parentId))
          .map((panel) =>
            panel.type === GroupPanelType.GROUP ? (
              <GroupSection key={panel.id} header={panel.name}>
                {groupPanels
                  .filter((sub) => sub.parentId === panel.id)
                  .map((sub) => (
                    <SidebarItem key={sub.id} groupId={groupId} panel={sub} />
                  ))}
              </GroupSection>
            ) : (
              <SidebarItem key={panel.id} groupId={groupId} panel={panel} />
            )
          )}
      </div>
    </CommonSidebarWrapper>
  );
});
Sidebar.displayName = 'Sidebar';
