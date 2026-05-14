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
      <SectionHeader>{t('群聊')}</SectionHeader>

      <div className="p-0 overflow-y-auto overflow-x-hidden min-w-0">
        {canCreateGroup && (
          <button
            type="button"
            className="mx-4 my-3 w-[calc(100%-2rem)] h-11 rounded-2xl px-3 text-left text-[15px] flex items-center gap-3 bg-tc-primary text-white shadow-none hover:bg-tc-primary-hover"
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
      <div className="w-full h-full flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-2xl space-y-4">
          <div className="rounded-[28px] border border-black/5 dark:border-white/10 bg-white px-6 py-6 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
            <div className="text-xl font-semibold text-gray-900 dark:text-white">
              选择一个群组开始查看消息和面板
            </div>
            <div className="mt-3 text-sm leading-7 text-gray-500 dark:text-gray-400">
              群组是財訊客户端里承接主题交流和长期讨论的主场。你可以先从左侧选择一个现有群组进入，也可以创建新的交流空间。
            </div>
            <div className="mt-4 grid gap-3 mobile:grid-cols-1" style={{ gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' }}>
              <div className="rounded-2xl bg-tc-bg-elevated dark:bg-white/[0.03] px-4 py-4">
                <div className="text-sm font-semibold text-gray-900 dark:text-white">看群说明</div>
                <div className="mt-2 text-xs leading-6 text-gray-500 dark:text-gray-400">
                  先理解群当前主题、定位和公告内容。
                </div>
              </div>
              <div className="rounded-2xl bg-tc-bg-elevated dark:bg-white/[0.03] px-4 py-4">
                <div className="text-sm font-semibold text-gray-900 dark:text-white">看最近交流</div>
                <div className="mt-2 text-xs leading-6 text-gray-500 dark:text-gray-400">
                  快速判断这个群最近是否仍在活跃讨论。
                </div>
              </div>
              <div className="rounded-2xl bg-tc-bg-elevated dark:bg-white/[0.03] px-4 py-4">
                <div className="text-sm font-semibold text-gray-900 dark:text-white">继续参与</div>
                <div className="mt-2 text-xs leading-6 text-gray-500 dark:text-gray-400">
                  再决定是发消息、继续讨论，还是围绕动态继续承接。
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageContent>
  );
});
GroupsOverview.displayName = 'GroupsOverview';
