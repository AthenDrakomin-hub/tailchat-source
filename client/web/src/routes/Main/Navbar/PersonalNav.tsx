import { Icon } from 'tailchat-design';
import React from 'react';
import {
  t,
  useDMConverseList,
  useUnread,
  useAppSelector,
} from 'tailchat-shared';
import { NavbarNavItem } from './NavItem';

function usePersonalUnread(): boolean {
  const converse = useDMConverseList();
  const unreads = useUnread(converse.map((converse) => String(converse._id)));

  return unreads.some((u) => u === true);
}

export const PersonalNav: React.FC = React.memo(() => {
  const unread = usePersonalUnread();
  const hasFriendRequest = useAppSelector(
    (state) =>
      state.user.friendRequests.findIndex(
        (item) => item.to === state.user.info?._id
      ) >= 0
  );

  const badge = unread || hasFriendRequest;

  return (
    <div data-tc-role="navbar-personal">
      <NavbarNavItem
        name={t('消息')}
        to={'/main/personal'}
        showPill={true}
        badge={badge}
      >
        <Icon className="text-3xl text-white" icon="mdi:message-text" />
      </NavbarNavItem>
    </div>
  );
});
PersonalNav.displayName = 'PersonalNav';
