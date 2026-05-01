import React from 'react';
import { Empty } from 'antd';
import { t } from 'tailchat-shared';
import clsx from 'clsx';

interface NotFoundProps {
  message?: string;
  className?: string;
}

/**
 * 没有数据或没找到数据
 */
export const NotFound: React.FC<NotFoundProps> = React.memo((props) => {
  return (
    <div
      className={clsx(
        'w-full flex items-center justify-center px-4 py-12',
        props.className
      )}
    >
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description={props.message ?? t('未找到内容')}
      />
    </div>
  );
});
NotFound.displayName = 'NotFound';
