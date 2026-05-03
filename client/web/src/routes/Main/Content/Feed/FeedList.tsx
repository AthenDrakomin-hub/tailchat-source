import React from 'react';
import { FeedPost, t } from 'tailchat-shared';
import { Problem } from '@/components/Problem';
import { FeedCard } from './FeedCard';

interface FeedListProps {
  posts: FeedPost[];
  onRemoved?: (postId: string) => void;
}

export const FeedList: React.FC<FeedListProps> = React.memo(({ posts, onRemoved }) => {
  if (posts.length === 0) {
    return <Problem text={t('还没有动态，发布第一条内容吧')} />;
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <FeedCard key={post._id} post={post} onRemoved={onRemoved} />
      ))}
    </div>
  );
});
FeedList.displayName = 'FeedList';
