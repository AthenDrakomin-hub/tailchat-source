import { Icon } from 'tailchat-design';
import React from 'react';
import { t, useInboxList } from 'tailchat-shared';
import { NavbarNavItem } from './NavItem';

/**
 * 通知中心
 */
export const InboxNav: React.FC = React.memo(() => {
  const inbox = useInboxList();
  const unreadList = inbox.filter((i) => !i.readed);

  return (
    <NavbarNavItem
      className="bg-gray-700"
      name={t('通知')}
      to={'/main/inbox'}
      showPill={true}
      badge={unreadList.length > 0}
      badgeProps={{
        count: unreadList.length,
      }}
      data-testid="inbox"
    >
      <Icon className="text-3xl text-white" icon="mdi:bell-ring" />
    </NavbarNavItem>
  );
});
InboxNav.displayName = 'InboxNav';
