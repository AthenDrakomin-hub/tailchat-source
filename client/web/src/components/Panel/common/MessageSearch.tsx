import { MessageHighlightContainer } from '@/components/ChatBox/ChatMessageList/MessageHighlightContainer';
import { NormalMessage, buildMessageItemRow } from '@/components/ChatBox/ChatMessageList/Item';
import { Empty, Input } from 'antd';
import React, { useState } from 'react';
import {
  ChatMessage,
  model,
  showToasts,
  t,
  useAsyncRequest,
} from 'tailchat-shared';

export const MessageSearchPanel: React.FC<{
  groupId?: string;
  converseId: string;
}> = React.memo((props) => {
  const { groupId, converseId } = props;
  const [focusedMessageId, setFocusedMessageId] = useState<string | null>(null);
  const [{ loading: nearbyLoading, value: nearbyMessages = [] }, handleLoadNearby] =
    useAsyncRequest(async (messageId: string) => {
      setFocusedMessageId(messageId);
      return (
        (await model.message.fetchNearbyMessage({
          groupId,
          converseId,
          messageId,
        })) ?? []
      );
    });
  const [{ loading, value = [] }, handleSearch] = useAsyncRequest(
    async (searchText: string) => {
      if (searchText.length < 3) {
        showToasts(t('搜索内容太短无法搜索'));
        return;
      }
      const messages = await model.message.searchMessage(
        searchText,
        converseId,
        groupId
      );

      return messages ?? [];
    }
  );

  const searchedMessages = value as ChatMessage[];

  return (
    <div className="p-2">
      <Input.Search
        className="mb-2"
        placeholder={t('请输入关键字')}
        loading={loading}
        onSearch={handleSearch}
      />

      {/* Result List */}
      <div>
        {searchedMessages.length === 0 && (
          <Empty description={t('没有任何搜索结果')} />
        )}

        {searchedMessages.map((message) => (
          <div
            key={message._id}
            className="cursor-pointer"
            onClick={() => handleLoadNearby(message._id)}
          >
            <NormalMessage
              showAvatar={true}
              isMergedPrev={false}
              isMergedNext={false}
              payload={message}
              isGroup={Boolean(groupId)}
              groupId={groupId}
              panelId={converseId}
              hideAction={true}
            />
          </div>
        ))}

        {(nearbyMessages as ChatMessage[]).length > 0 && (
          <div className="mt-4 rounded-2xl border border-black/5 dark:border-white/10 bg-white/80 dark:bg-tc-bg-elevated p-2">
            <div className="px-2 pb-2 text-xs text-gray-400">
              {nearbyLoading ? t('加载上下文中') : t('消息上下文')}
            </div>
            <MessageHighlightContainer messageId={focusedMessageId ?? ''}>
              {(nearbyMessages as ChatMessage[]).map((message, index, arr) =>
                buildMessageItemRow(arr, index, Boolean(groupId), groupId, converseId)
              )}
            </MessageHighlightContainer>
          </div>
        )}
      </div>
    </div>
  );
});
MessageSearchPanel.displayName = 'MessageSearchPanel';
