import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  FeedPost,
  listUserFeedPosts,
  showErrorToasts,
  useCachedUserInfo,
} from 'tailchat-shared';
import { PageContent } from '../PageContent';
import { FeedSidebar } from './FeedSidebar';
import { FeedList } from './FeedList';

export const UserFeedPage: React.FC = React.memo(() => {
  const { userId = '' } = useParams();
  const user = useCachedUserInfo(userId);
  const [posts, setPosts] = useState<FeedPost[]>([]);

  useEffect(() => {
    document.title = '个人动态 - 財訊';
  }, []);

  useEffect(() => {
    if (!userId) {
      return;
    }

    listUserFeedPosts(userId).then(setPosts).catch(showErrorToasts);
  }, [userId]);

  return (
    <PageContent sidebar={<FeedSidebar />}>
      <div className="w-full max-w-4xl mx-auto px-4 py-5 mobile:px-3 space-y-4 overflow-y-auto">
        <div>
          <div className="text-2xl font-semibold text-gray-900 dark:text-white">
            {user.nickname ?? '成员'}的动态
          </div>
          <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            查看该成员公开发布的动态内容。
          </div>
        </div>

        <FeedList
          posts={posts}
          onRemoved={(postId) =>
            setPosts((prev) => prev.filter((item) => item._id !== postId))
          }
        />
      </div>
    </PageContent>
  );
});
UserFeedPage.displayName = 'UserFeedPage';
