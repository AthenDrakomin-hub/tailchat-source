import { CommonSidebarWrapper } from '@/components/CommonSidebarWrapper';
import { openModal } from '@/components/Modal';
import { Problem } from '@/components/Problem';
import { SectionHeader } from '@/components/SectionHeader';
import { PageContent } from '../PageContent';
import { SidebarItem } from '../SidebarItem';
import { ModalCreateGroup } from '@/components/modals/CreateGroup';
import React from 'react';
import { Icon } from 'tailchat-design';
import {
  t,
  useEvent,
  useGlobalConfigStore,
  useUserInfo,
} from 'tailchat-shared';
import { useGroupUnreadState } from '@/hooks/useGroupUnreadState';
import { useGroupList } from '../../shared/useGroupList';

const GroupsSidebarItem: React.FC<{
  groupId: string;
  name: string;
  avatar?: string;
}> = React.memo((props) => {
  const unreadState = useGroupUnreadState(props.groupId);

  return (
    <SidebarItem
      name={props.name}
      icon={props.avatar}
      to={`/main/group/${props.groupId}`}
      badge={['muted', 'unread'].includes(unreadState)}
    />
  );
});
GroupsSidebarItem.displayName = 'GroupsSidebarItem';

const GroupsSidebar: React.FC = React.memo(() => {
  const { groupList } = useGroupList();
  const userInfo = useUserInfo();
  const { disableCreateGroup } = useGlobalConfigStore((state) => ({
    disableCreateGroup: state.disableCreateGroup,
  }));

  const systemRole = (userInfo as any)?.systemRole ?? 'student';
  const canCreateGroup =
    disableCreateGroup !== true && userInfo != null && systemRole !== 'student';

  const handleCreateGroup = useEvent(() => {
    openModal(<ModalCreateGroup />);
  });

  return (
    <CommonSidebarWrapper data-tc-role="sidebar-groups">
      <SectionHeader>{t('群组')}</SectionHeader>

      <div className="p-2 space-y-1 overflow-y-auto overflow-x-hidden min-w-0">
        {canCreateGroup && (
          <button
            type="button"
            className="w-full h-11 rounded px-2 text-left text-base flex items-center gap-3 bg-green-500 text-white hover:opacity-90"
            onClick={handleCreateGroup}
          >
            <Icon icon="mdi:plus" className="text-2xl flex-shrink-0" />
            <span className="truncate">{t('创建群组')}</span>
          </button>
        )}

        {groupList.map((group) => (
          <GroupsSidebarItem
            key={group._id}
            groupId={group._id}
            name={group.name}
            avatar={group.avatar}
          />
        ))}
      </div>
    </CommonSidebarWrapper>
  );
});
GroupsSidebar.displayName = 'GroupsSidebar';

export const GroupsOverview: React.FC = React.memo(() => {
  return (
    <PageContent data-tc-role="content-groups" sidebar={<GroupsSidebar />}>
      <div className="mt-11 w-full">
        <Problem text={t('选择一个群组开始查看消息和面板')} />
      </div>
    </PageContent>
  );
});
GroupsOverview.displayName = 'GroupsOverview';
