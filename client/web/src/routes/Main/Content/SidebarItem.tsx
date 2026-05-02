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
          'w-full min-w-0 overflow-hidden border border-transparent hover:border-black hover:border-opacity-5 dark:hover:border-white dark:hover:border-opacity-10 hover:bg-black hover:bg-opacity-10 dark:hover:bg-white dark:hover:bg-opacity-10 cursor-pointer text-gray-700 dark:text-white rounded-2xl px-3 h-11 flex items-center text-base group mb-0.5 transition-all duration-200',
          {
            'bg-green-500 bg-opacity-10 border-green-500 border-opacity-20 text-green-700 dark:text-green-300 dark:bg-green-500 dark:bg-opacity-10': isActive,
          }
        )}
      >
        <div className="flex h-8 items-center justify-center text-2xl w-8 mr-3 flex-shrink-0">
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
