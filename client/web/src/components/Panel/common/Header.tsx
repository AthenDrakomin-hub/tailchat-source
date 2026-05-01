import { SectionHeader } from '@/components/SectionHeader';
import { Space } from 'antd';
import React, { PropsWithChildren } from 'react';

interface PanelCommonHeaderProps extends PropsWithChildren {
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  actions?: React.ReactNode[];
}

/**
 * 右侧面板的头部
 */
export const PanelCommonHeader: React.FC<PanelCommonHeaderProps> = React.memo(
  (props) => {
    return (
      <SectionHeader>
        <div className="flex min-w-0 flex-wrap text-xl justify-between gap-2">
          <div className="flex min-w-0 items-center">
            <div className="text-gray-500 mr-1 flex-shrink-0">{props.prefix}</div>
            <div className="text-base truncate">{props.children}</div>
            <div className="ml-2 flex-shrink-0">{props.suffix}</div>
          </div>

          <Space className="flex-shrink-0">{props.actions}</Space>
        </div>
      </SectionHeader>
    );
  }
);
PanelCommonHeader.displayName = 'PanelCommonHeader';
