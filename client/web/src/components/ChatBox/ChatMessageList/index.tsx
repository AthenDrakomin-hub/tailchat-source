import React, { useEffect } from 'react';
import { NormalMessageList } from './NormalList';
import { VirtualizedMessageList } from './VirtualizedList';
import { useChatStore } from '@/store/chat';
import { useSocketContext } from '@/context/SocketContext';
import type { MessageListProps } from './types';

export const ChatMessageList: React.FC<MessageListProps> = React.memo((props) => {
  const { converseId, messages, hasMore } = props;
  const fetchHistoryMessages = useChatStore((state) => state.fetchHistoryMessages);
  const socket = useSocketContext();

  useEffect(() => {
    const handleConnect = () => {
      if (converseId) {
        fetchHistoryMessages(converseId);
      }
    };

    socket.on('connect', handleConnect);
    return () => socket.off('connect', handleConnect);
  }, [socket, converseId, fetchHistoryMessages]);

  if (messages.length > 50) {
    return <VirtualizedMessageList {...props} />;
  }

  return <NormalMessageList {...props} />;
});

ChatMessageList.displayName = 'ChatMessageList';
