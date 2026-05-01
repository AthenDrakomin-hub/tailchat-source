import { Badge, BadgeProps, Space, Typography } from 'antd';
import clsx from 'clsx';
import React from 'react';
import { useLocation } from 'react-router';
import { Link } from 'react-router-dom';

/**
 * 群组面板项
 * 用于侧边栏
 */
export const GroupPanelItem: React.FC<{
  name: string;
  icon: React.ReactNode;
  to: string;
  dimmed?: boolean; // 颜色暗淡
  badge?: boolean;
  badgeProps?: BadgeProps;
  extraBadge?: React.ReactNode[];
}> = React.memo((props) => {
  const { icon, name, to, dimmed = false, badge } = props;
  const location = useLocation();
  const isActive = location.pathname.startsWith(to);

  return (
    <Link className="block" to={to}>
      <div
        className={clsx(
          'w-full hover:bg-black hover:bg-opacity-10 dark:hover:bg-white dark:hover:bg-opacity-10 cursor-pointer text-gray-900 dark:text-white rounded-xl px-2 h-9 flex items-center text-base group border border-transparent hover:border-black hover:border-opacity-5 dark:hover:border-white dark:hover:border-opacity-10 transition-all duration-200',
          {
            'bg-green-500 bg-opacity-10 border-green-500 border-opacity-20 dark:bg-green-500 dark:bg-opacity-10': isActive,
          },
          dimmed && 'text-opacity-40 dark:text-opacity-40'
        )}
      >
        <div className={clsx('flex items-center justify-center px-1 mr-2')}>
          {icon}
        </div>

        <Typography.Text
          className={clsx(
            'flex-1 text-gray-900 dark:text-white',
            dimmed && 'text-opacity-40 dark:text-opacity-40'
          )}
          ellipsis={true}
        >
          {name}
        </Typography.Text>

        <Space>
          {badge === true && <Badge status="error" {...props.badgeProps} />}

          {props.extraBadge}
        </Space>
      </div>
    </Link>
  );
});
GroupPanelItem.displayName = 'GroupPanelItem';
