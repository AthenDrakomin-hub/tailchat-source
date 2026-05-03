import type { ChatMessage } from 'tailchat-shared';

export interface MessageListProps {
  messages: ChatMessage[];
  title?: React.ReactNode;
  isGroup: boolean;
  groupId?: string;
  panelId?: string;
  isLoadingMore: boolean;
  hasMoreMessage: boolean;
  onLoadMore: () => Promise<void>;
}
