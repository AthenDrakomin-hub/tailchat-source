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
        <div className="w-8 h-8 rounded-full flex items-center justify-center text-gray-500 dark:text-gray-300 hover:text-[#07c160] hover:bg-[#f3f4f6] dark:hover:bg-white/10 transition-colors cursor-pointer">
          <Icon className="text-[22px]" icon={props.icon} />
        </div>
      </Popover>
    );
  });
BaseChatInputButton.displayName = 'BaseChatInputButton';
