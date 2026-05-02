import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FeedPost, listFeedPosts, showErrorToasts } from 'tailchat-shared';
import { PageContent } from '../PageContent';
import { FeedSidebar } from './FeedSidebar';
import { FeedComposer } from './FeedComposer';
import { FeedList } from './FeedList';

export const FeedPage: React.FC = React.memo(() => {
  const [searchParams] = useSearchParams();
  const groupId = searchParams.get('groupId') ?? undefined;
  const [posts, setPosts] = useState<FeedPost[]>([]);

  useEffect(() => {
    document.title = '动态 - 財訊';
  }, []);

  useEffect(() => {
    listFeedPosts(groupId).then(setPosts).catch(showErrorToasts);
  }, [groupId]);

  const heading = useMemo(
    () => (groupId ? '群组关联动态' : '动态'),
    [groupId]
  );

  return (
    <PageContent data-tc-role="content-feed" sidebar={<FeedSidebar />}>
      <div className="w-full max-w-4xl mx-auto px-4 py-5 mobile:px-3 space-y-4 overflow-y-auto">
        <div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {heading}
          </div>
          <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            面向财富论坛的公开内容流，用于观点发布、活动预热和群组联动。
          </div>
        </div>

        <FeedComposer
          groupId={groupId}
          onCreated={(post) => setPosts((prev) => [post, ...prev])}
        />

        <FeedList posts={posts} />
      </div>
    </PageContent>
  );
});
FeedPage.displayName = 'FeedPage';
