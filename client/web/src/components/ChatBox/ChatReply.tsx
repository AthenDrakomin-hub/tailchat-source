import React from 'react';
import { t, useChatBoxContext, useSharedEventHandler } from 'tailchat-shared';
import _isNil from 'lodash/isNil';
import { getMessageRender } from '@/plugin/common';
import { UserName } from '../UserName';
import { Icon } from 'tailchat-design';

export const ChatReply: React.FC = React.memo(() => {
  const { replyMsg, setReplyMsg, clearReplyMsg } = useChatBoxContext();

  useSharedEventHandler('replyMessage', (payload) => {
    /**
     * 这里故意在本组件设置回复消息体而不是在事件发起方设置是为了确保当本组件不存在时
     * 不会出现回复消息的值呗设置的情况
     */
    setReplyMsg(payload);
  });

  if (_isNil(replyMsg)) {
    return null;
  }

  return (
    <div className="relative min-w-0">
      <div className="absolute bottom-1 left-0 right-0 px-4 mobile:px-3">
        <div className="rounded-[18px] border border-black/5 dark:border-white/10 bg-white/95 dark:bg-[#232323]/95 px-4 py-3 max-h-44 min-w-0 overflow-y-auto overflow-x-hidden shadow-[0_8px_20px_rgba(15,23,42,0.08)] relative backdrop-blur-sm">
          <div className="absolute left-0 top-3 bottom-3 w-1 rounded-r-full bg-[#07c160]" />
          <div className="mb-1 ml-2 text-[12px] font-medium text-[#07c160]">
            {t('回复')} {replyMsg.author && <UserName userId={replyMsg.author} />}
          </div>
          <div className="break-words text-[13px] leading-6 text-gray-600 dark:text-gray-300 pr-6 ml-2">
            {getMessageRender(replyMsg.content)}
          </div>

          <Icon
            className="absolute right-3 top-3 text-base cursor-pointer opacity-50 hover:opacity-80"
            icon="mdi:close"
            onClick={clearReplyMsg}
          />
        </div>
      </div>
    </div>
  );
});
ChatReply.displayName = 'ChatReply';
