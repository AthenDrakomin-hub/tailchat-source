import { Icon } from 'tailchat-design';
import React from 'react';
import { t, useAppSelector } from 'tailchat-shared';
import { NavbarNavItem } from './NavItem';

export const GroupsNav: React.FC = React.memo(() => {
  const groups = useAppSelector((state) => state.group.groups);
  const hasGroups = Object.keys(groups).length > 0;

  return (
    <NavbarNavItem
      className="bg-gray-700"
      name={t('群组')}
      to={'/main/group'}
      showPill={true}
      badge={hasGroups}
      data-testid="groups"
    >
      <Icon className="text-3xl text-white" icon="mdi:account-group" />
    </NavbarNavItem>
  );
});
GroupsNav.displayName = 'GroupsNav';
