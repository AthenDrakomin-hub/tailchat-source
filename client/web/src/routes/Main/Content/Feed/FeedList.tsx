import React from 'react';
import { FeedPost, t } from 'tailchat-shared';
import { Problem } from '@/components/Problem';
import { FeedCard } from './FeedCard';

interface FeedListProps {
  posts: FeedPost[];
}

export const FeedList: React.FC<FeedListProps> = React.memo(({ posts }) => {
  if (posts.length === 0) {
    return <Problem text={t('还没有动态，发布第一条市场观察或活动预告吧')} />;
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <FeedCard key={post._id} post={post} />
      ))}
    </div>
  );
});
FeedList.displayName = 'FeedList';
