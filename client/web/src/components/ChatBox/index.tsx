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
      <div className="px-4 pt-3">
        <div className="rounded-2xl border border-black/10 dark:border-white/10 bg-black/[0.02] dark:bg-white/[0.04] px-4 py-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] leading-5 text-gray-500 dark:text-gray-400">
          <span>私密会话适合处理一对一跟进、观点确认和资料交换</span>
          <span>消息会持续沉淀到最近聊天，方便长期跟进</span>
          <span>支持图片拖拽、粘贴和 `Enter` 快速发送</span>
        </div>
      </div>
      {messages.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
          <div className="max-w-2xl w-full rounded-3xl border border-black/10 dark:border-white/10 bg-white/80 dark:bg-white/5 px-6 py-6 shadow-sm">
            <div className="text-base font-semibold text-gray-700 dark:text-gray-200">
              从这里开始交流
            </div>
            <div className="mt-2 text-sm text-gray-500 dark:text-gray-400 max-w-[42rem] mx-auto">
              “{emptyQuote.text}”
            </div>
            <div className="mt-4 grid gap-3 mobile:grid-cols-1" style={{ gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' }}>
              <div className="rounded-2xl bg-black/[0.03] dark:bg-white/[0.03] px-4 py-4 text-left">
                <div className="text-sm font-semibold text-gray-900 dark:text-white">
                  先发一条消息
                </div>
                <div className="mt-2 text-xs leading-6 text-gray-500 dark:text-gray-400">
                  直接在下方输入框开始聊天，最适合破冰和确认对方是否在线。
                </div>
              </div>
              <div className="rounded-2xl bg-black/[0.03] dark:bg-white/[0.03] px-4 py-4 text-left">
                <div className="text-sm font-semibold text-gray-900 dark:text-white">
                  明确主题
                </div>
                <div className="mt-2 text-xs leading-6 text-gray-500 dark:text-gray-400">
                  第一条消息最好直接说明你的问题、观点或需要对方配合的事项。
                </div>
              </div>
              <div className="rounded-2xl bg-black/[0.03] dark:bg-white/[0.03] px-4 py-4 text-left">
                <div className="text-sm font-semibold text-gray-900 dark:text-white">
                  持续沉淀
                </div>
                <div className="mt-2 text-xs leading-6 text-gray-500 dark:text-gray-400">
                  后续这条会话会出现在最近聊天里，方便你持续跟进一对一沟通。
                </div>
              </div>
            </div>
            <div className="mt-4 text-xs leading-6 text-gray-500 dark:text-gray-400">
              当这条会话开始持续互动后，它会稳定出现在左侧最近聊天，方便你把一对一沟通沉淀成长期跟进关系。
            </div>
            <div className="mt-3 text-[11px] leading-5 text-gray-400 dark:text-gray-500">
              小提示：如果这是第一次联系，对方更容易响应清楚、简短且直接说明意图的消息。
            </div>
          </div>
        </div>
      ) : (
        <ChatMessageList
          key={converseId}
          title={converseTitle}
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
