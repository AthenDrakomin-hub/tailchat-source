import { getMessageTextDecorators } from '@/plugin/common';
import React from 'react';
import {
  ChatBoxContextProvider,
  ConverseMessageProvider,
  useConverseMessageContext,
  getDailyQuote,
} from 'tailchat-shared';
import { ErrorView } from '../ErrorView';
import { ChatBoxPlaceholder } from './ChatBoxPlaceholder';
import { ChatInputBox } from './ChatInputBox';
import { ChatMessageList } from './ChatMessageList';
import { ChatReply } from './ChatReply';
import { preprocessMessage } from './preprocessMessage';

type ChatBoxProps =
  | {
      converseId: string;
      converseTitle?: React.ReactNode;
      isGroup: false;
      groupId?: string;
    }
  | {
      converseId: string;
      converseTitle?: React.ReactNode;
      isGroup: true;
      groupId: string;
    };
const ChatBoxInner: React.FC<ChatBoxProps> = React.memo((props) => {
  const { converseId, converseTitle } = props;
  const {
    messages,
    loading,
    error,
    isLoadingMore,
    hasMoreMessage,
    fetchMoreMessage,
    sendMessage,
  } = useConverseMessageContext();
  const emptyQuote = getDailyQuote('chatEmpty');

  if (loading) {
    return <ChatBoxPlaceholder />;
  }

  if (error) {
    return <ErrorView error={error} />;
  }

  return (
    <div className="w-full h-full min-w-0 overflow-hidden flex flex-col select-text relative text-sm">
      <div className="px-5 h-11 flex items-center border-b border-black/5 dark:border-white/10 bg-[#f7f7f7] dark:bg-[#1f1f1f]">
        <div className="text-[11px] font-medium text-[#9ca3af]">
          {props.isGroup
            ? '群聊消息会按连续发送进行分组显示'
            : '聊天消息支持 Enter 发送'}
        </div>
      </div>
      {messages.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center px-6 bg-[#f5f5f5]">
          <div className="max-w-xl w-full rounded-[24px] border border-black/5 bg-white px-6 py-6 shadow-[0_10px_30px_rgba(15,23,42,0.04)]">
            <div className="text-base font-semibold text-gray-800 dark:text-gray-200">
              从这里开始交流
            </div>
            <div className="mt-2 text-sm text-gray-500 dark:text-gray-400 max-w-[42rem] mx-auto">
              “{emptyQuote.text}”
            </div>
            <div className="mt-4 text-sm leading-7 text-gray-500 dark:text-gray-400">
              直接在下方输入框开始聊天即可。第一条消息建议尽量清楚、简短、直接说明意图。
            </div>
          </div>
        </div>
      ) : (
        <ChatMessageList
          key={converseId}
          title={converseTitle}
          isGroup={props.isGroup}
          groupId={props.groupId}
          panelId={props.converseId}
          messages={messages}
          isLoadingMore={isLoadingMore}
          hasMoreMessage={hasMoreMessage}
          onLoadMore={fetchMoreMessage}
        />
      )}

      <ChatReply />

      <ChatInputBox
        groupId={props.isGroup ? props.groupId : undefined}
        panelId={props.converseId}
        onSendMsg={async (msg, meta) => {
          const content = preprocessMessage(msg);
          await sendMessage({
            converseId: props.converseId,
            groupId: props.groupId,
            content,
            plain: getMessageTextDecorators().serialize(content),
            meta,
          });
        }}
      />
    </div>
  );
});
ChatBoxInner.displayName = 'ChatBoxInner';

export const ChatBox: React.FC<ChatBoxProps> = React.memo((props) => {
  return (
    <ChatBoxContextProvider>
      <ConverseMessageProvider
        converseId={props.converseId}
        isGroup={props.isGroup}
      >
        <ChatBoxInner {...props} />
      </ConverseMessageProvider>
    </ChatBoxContextProvider>
  );
});
ChatBox.displayName = 'ChatBox';
