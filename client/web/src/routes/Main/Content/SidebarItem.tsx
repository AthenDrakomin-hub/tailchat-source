import React from 'react';
import { useLocation } from 'react-router';
import { Link } from 'react-router-dom';
import { Typography, Badge } from 'antd';
import clsx from 'clsx';
import { Avatar } from 'tailchat-design';

interface SidebarItemProps {
  name: React.ReactNode;
  to: string;
  badge?: boolean | number;
  icon?: string | React.ReactElement;
  action?: React.ReactNode;
  avatarName?: string;
}
export const SidebarItem: React.FC<SidebarItemProps> = React.memo((props) => {
  const { icon, name, to, badge, avatarName } = props;
  const location = useLocation();
  const isActive = location.pathname.startsWith(to);

  return (
    <Link to={to}>
      <div
        className={clsx(
          'w-full min-w-0 overflow-hidden border-b border-black/5 dark:border-white/10 hover:bg-white/80 dark:hover:bg-white dark:hover:bg-opacity-10 cursor-pointer text-gray-700 dark:text-white rounded-none px-3 h-14 flex items-center text-[15px] group transition-colors duration-150',
          {
            'bg-white text-[#111827] border-l-[3px] border-l-[#07c160]': isActive,
          }
        )}
      >
        <div className="flex h-10 items-center justify-center text-2xl w-10 mr-3 flex-shrink-0">
          {React.isValidElement(icon) ? (
            icon
          ) : (
            <Avatar
              src={icon}
              name={typeof name === 'string' ? name : avatarName ?? ''}
            />
          )}
        </div>

        <Typography.Text
          className="flex-1 min-w-0 text-gray-900 dark:text-white"
          ellipsis={true}
        >
          {name}
        </Typography.Text>

        {badge === true ? (
          <Badge status="error" />
        ) : (
          <Badge count={Number(badge) || 0} />
        )}

        {props.action && (
          <div className="text-base p-1 cursor-pointer hidden opacity-70 group-hover:block hover:opacity-100 flex-shrink-0">
            {props.action}
          </div>
        )}
      </div>
    </Link>
  );
});
SidebarItem.displayName = 'SidebarItem';
