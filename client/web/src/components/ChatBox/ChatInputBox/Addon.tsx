import {
  getMessageTextDecorators,
  pluginChatInputActions,
} from '@/plugin/common';
import { Icon } from 'tailchat-design';
import { Dropdown, MenuProps } from 'antd';
import React, { useState } from 'react';
import { t } from 'tailchat-shared';
import { useChatInputActionContext } from './context';
import { uploadMessageFile, uploadMessageImage } from './utils';
import clsx from 'clsx';
import type { MenuItemType } from 'antd/lib/menu/hooks/useItems';
import { openFile } from '@/utils/file-helper';

export const ChatInputAddon: React.FC = React.memo(() => {
  const [open, setOpen] = useState(false);
  const actionContext = useChatInputActionContext();
  if (actionContext === null) {
    return null;
  }

  const handleSendImage = (file: File) => {
    // 发送图片
    const image = file;
    if (image) {
      // 发送图片
      uploadMessageImage(image).then(({ url, width, height }) => {
        actionContext.sendMsg(
          getMessageTextDecorators().image(url, { width, height })
        );
      });
    }
  };

  const handleSendFile = (file: File) => {
    // 发送文件
    if (file) {
      // 发送图片
      uploadMessageFile(file).then(({ name, url }) => {
        actionContext.sendMsg(
          getMessageTextDecorators().card(name, { type: 'file', url })
        );
      });
    }
  };

  const menu: MenuProps = {
    items: [
      {
        key: 'send-image',
        label: t('发送图片'),
        onClick: async () => {
          setOpen(false);
          const file = await openFile({ accept: 'image/*' });
          if (file) {
            handleSendImage(file);
          }
        },
      },
      {
        key: 'send-file',
        label: t('发送文件'),
        onClick: async () => {
          setOpen(false);
          const file = await openFile();
          if (file) {
            handleSendFile(file);
          }
        },
      },
      ...pluginChatInputActions.map(
        (item, i) =>
          ({
            key: item.label + i,
            label: item.label,
            onClick: () => {
              item.onClick(actionContext);
              setOpen(false);
            },
          } as MenuItemType)
      ),
    ],
  };

  return (
    <Dropdown
      menu={menu}
      open={open}
      onOpenChange={setOpen}
      placement="topRight"
      trigger={['click']}
    >
      <div>
        <div
          className={clsx(
            'w-8 h-8 rounded-full flex items-center justify-center text-gray-500 dark:text-gray-300 hover:text-[#07c160] hover:bg-[#f3f4f6] dark:hover:bg-white/10 transition-colors cursor-pointer',
            {
              'text-[#07c160] bg-[#f3f4f6] dark:bg-white/10': open,
            }
          )}
        >
          <Icon
            className={clsx('text-[22px] transition transform', {
              'rotate-45': open,
            })}
            icon="mdi:plus"
          />
        </div>
      </div>
    </Dropdown>
  );
});
ChatInputAddon.displayName = 'ChatInputAddon';
