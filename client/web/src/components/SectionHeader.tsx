import React, { PropsWithChildren, useState } from 'react';
import { Dropdown, MenuProps } from 'antd';
import { Icon } from 'tailchat-design';
import clsx from 'clsx';

interface SectionHeaderProps extends PropsWithChildren {
  menu?: MenuProps;
  'data-testid'?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = React.memo(
  (props) => {
    const [visible, setVisible] = useState(false);

    return (
      <div className="h-12 relative flex items-center py-0 text-[15px] font-semibold flex-shrink-0 border-b border-black/5 dark:border-white/10 bg-tc-bg-elevated dark:bg-white dark:bg-opacity-[0.03]">
        {props.menu ? (
          <Dropdown
            className="overflow-hidden"
            onOpenChange={setVisible}
            menu={props.menu}
            placement="bottomRight"
            trigger={['click']}
          >
            <div
              className="cursor-pointer flex flex-1"
              data-testid={props['data-testid']}
            >
              <header className="flex-1 truncate px-4 text-tc-text-primary dark:text-white">
                {props.children}
              </header>
              <Icon
                className={clsx('text-xl text-tc-text-secondary transition-transform transform', {
                  'rotate-180': visible,
                })}
                icon="mdi:chevron-down"
              >
                &#xe60f;
              </Icon>
            </div>
          </Dropdown>
        ) : (
          <header
            className="flex-1 truncate px-4 select-text text-tc-text-primary dark:text-white"
            data-testid={props['data-testid']}
          >
            {props.children}
          </header>
        )}
      </div>
    );
  }
);
SectionHeader.displayName = 'SectionHeader';
