import React from 'react';
import { Empty } from 'antd';
import { t } from 'tailchat-shared';

interface NoDataProps {
  message?: string;
}

/**
 * 没有数据或没找到数据
 */
export const NoData: React.FC<NoDataProps> = React.memo((props) => {
  return (
    <div className="rounded-[24px] border border-black/5 bg-white px-5 py-8 shadow-[0_8px_20px_rgba(15,23,42,0.04)]">
      <Empty description={props.message ?? t('没有数据')} />
    </div>
  );
});
NoData.displayName = 'NoData';
