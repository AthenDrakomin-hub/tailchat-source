import React from 'react';
import { useLocation } from 'react-router';
import { Link } from 'react-router-dom';
import { Typography, Badge } from 'antd';
import clsx from 'clsx';
import { Avatar } from 'tailchat-design';

interface SidebarItemProps {
  name: React.ReactNode;
  subtitle?: React.ReactNode;
  trailing?: React.ReactNode;
  to: string;
  badge?: boolean | number;
  icon?: string | React.ReactElement;
  action?: React.ReactNode;
  avatarName?: string;
}
export const SidebarItem: React.FC<SidebarItemProps> = React.memo((props) => {
  const { icon, name, subtitle, trailing, to, badge, avatarName } = props;
  const location = useLocation();
  const isActive = location.pathname.startsWith(to);

  return (
    <Link to={to}>
      <div
        className={clsx(
          'w-full min-w-0 overflow-hidden border-b border-black/5 dark:border-white/10 hover:bg-white/80 dark:hover:bg-white dark:hover:bg-opacity-10 cursor-pointer text-gray-700 dark:text-white rounded-none px-3 h-14 mobile:h-16 flex items-center text-[15px] group transition-colors duration-150',
          {
            'bg-white text-[#111827] border-l-[3px] border-l-[#07c160] dark:bg-[#2b2b2b]': isActive,
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
          <div className="min-w-0">
            <div className="min-w-0 flex items-center gap-2">
              <div className="flex-1 truncate">{name}</div>
              {trailing && (
                <div className="flex-shrink-0 text-[11px] text-[#9ca3af]">
                  {trailing}
                </div>
              )}
            </div>
            {subtitle && (
              <div className="truncate text-[11px] text-[#9ca3af] mt-0.5">
                {subtitle}
              </div>
            )}
          </div>
        </Typography.Text>

        {badge === true ? (
          <Badge color="#07c160" />
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
