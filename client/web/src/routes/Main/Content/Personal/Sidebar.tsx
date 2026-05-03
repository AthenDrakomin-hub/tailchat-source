import React, { PropsWithChildren } from 'react';
import { Icon } from 'tailchat-design';
import { SidebarItem } from '../SidebarItem';
import {
  t,
  useDMConverseList,
  useUserInfo,
  useGlobalConfigStore,
  useAppSelector,
} from 'tailchat-shared';
import { SidebarDMItem } from './SidebarDMItem';
import { openModal } from '@/components/Modal';
import { CreateDMConverse } from '@/components/modals/CreateDMConverse';
import { SectionHeader } from '@/components/SectionHeader';
import { CommonSidebarWrapper } from '@/components/CommonSidebarWrapper';
import { pluginCustomPanel } from '@/plugin/common';
import { CustomSidebarItem } from '../CustomSidebarItem';

const SidebarSection: React.FC<
  PropsWithChildren<{
    action: React.ReactNode;
  }>
> = React.memo((props) => {
  return (
    <div className="h-10 text-gray-900 dark:text-white flex pt-4 px-2">
      <span className="flex-1 overflow-hidden overflow-ellipsis text-[11px] font-medium tracking-wide uppercase text-gray-500 dark:text-gray-400">
        {props.children}
      </span>
      <div className="text-base opacity-70 hover:opacity-100 cursor-pointer">
        {props.action}
      </div>
    </div>
  );
});
SidebarSection.displayName = 'SidebarSection';

/**
 * 个人面板侧边栏组件
 */
export const PersonalSidebar: React.FC = React.memo(() => {
  const converseList = useDMConverseList();
  const userInfo = useUserInfo();
  const disablePluginStore = useGlobalConfigStore(
    (state) => state.disablePluginStore
  );
  const hasFriendRequest = useAppSelector(
    (state) =>
      state.user.friendRequests.findIndex(
        (item) => item.to === state.user.info?._id
      ) >= 0
  );

  const systemRole = (userInfo as any)?.systemRole ?? 'student';

  return (
    <CommonSidebarWrapper data-tc-role="sidebar-personal">
      <SectionHeader>{t('微信式会话')}</SectionHeader>

      <div className="p-0 overflow-y-auto overflow-x-hidden">
        <SidebarSection
          action={
            <Icon
              icon="mdi:plus"
              onClick={() => openModal(<CreateDMConverse />)}
            />
          }
        >
          {t('最近聊天')}
        </SidebarSection>

        {converseList.length > 0 ? (
          converseList.map((converse) => {
            return <SidebarDMItem key={converse._id} converse={converse} />;
          })
        ) : (
          <div className="mx-4 mb-3 rounded-2xl bg-[#f0f0f0] dark:bg-white/[0.03] px-3 py-3 text-xs leading-6 text-gray-500 dark:text-gray-400">
            当前还没有最近聊天。你可以先从下方联系人开始，或点击右上角 `+` 新建私信会话。
          </div>
        )}

        <SidebarSection
          action={<Icon icon="mdi:account-multiple-outline" />}
        >
          {t('联系人')}
        </SidebarSection>

        <SidebarItem
          name={t('联系人')}
          icon={<Icon icon="mdi:account-multiple" />}
          to="/main/personal/contacts"
          badge={hasFriendRequest}
        />

        {/* 仅对导师(teacher)或班长(monitor)等非普通学员角色显示插件中心 */}
        {!disablePluginStore && systemRole !== 'student' && (
          <SidebarItem
            name={t('插件中心')}
            icon={<Icon icon="mdi:puzzle" />}
            to="/main/personal/plugins"
          />
        )}

        {/* 插件自定义面板 */}
        {pluginCustomPanel
          .filter((p) => p.position === 'personal')
          .map((p) => (
            <CustomSidebarItem key={p.name} panelInfo={p} />
          ))}
      </div>
    </CommonSidebarWrapper>
  );
});
PersonalSidebar.displayName = 'PersonalSidebar';
