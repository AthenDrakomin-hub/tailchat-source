import { Popover } from 'antd';
import clsx from 'clsx';
import React, { useState } from 'react';
import { Icon } from 'tailchat-design';
import './BaseChatInputButton.less';

interface BaseChatInputButtonProps {
  overlayClassName?: string;
  icon: string;
  popoverContent: (ctx: { hidePopover: () => void }) => React.ReactElement;
}
export const BaseChatInputButton: React.FC<BaseChatInputButtonProps> =
  React.memo((props) => {
    const [visible, setVisible] = useState(false);

    return (
      <Popover
        open={visible}
        onOpenChange={setVisible}
        content={() =>
          props.popoverContent({
            hidePopover: () => {
              setVisible(false);
            },
          })
        }
        overlayClassName={clsx(
          'chat-message-input_action-popover',
          props.overlayClassName
        )}
        showArrow={false}
        placement="topRight"
        trigger={['click']}
      >
        <div
          className={clsx(
            'w-8 h-8 rounded-full flex items-center justify-center text-gray-500 dark:text-gray-300 hover:text-tc-primary hover:bg-tc-bg-elevated dark:hover:bg-white/10 transition-colors cursor-pointer',
            {
              'text-tc-primary bg-tc-bg-elevated dark:bg-white/10': visible,
            }
          )}
        >
          <Icon className="text-[22px]" icon={props.icon} />
        </div>
      </Popover>
    );
  });
BaseChatInputButton.displayName = 'BaseChatInputButton';
