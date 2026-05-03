import React, { useEffect, useMemo, useState } from 'react';
import { Link, Route, Routes, useSearchParams } from 'react-router-dom';
import {
  FeedPost,
  listFeedPosts,
  listOwnFeedPosts,
  listUserFeedPosts,
  showErrorToasts,
  useUserInfo,
} from 'tailchat-shared';
import { PageContent } from '../PageContent';
import { FeedSidebar } from './FeedSidebar';
import { FeedComposer } from './FeedComposer';
import { FeedList } from './FeedList';
import { FeedDetail } from './FeedDetail';
import { UserFeedPage } from './UserFeedPage';

const FeedHome: React.FC = React.memo(() => {
  const [searchParams] = useSearchParams();
  const groupId = searchParams.get('groupId') ?? undefined;
  const view = searchParams.get('view') ?? 'all';
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const userInfo = useUserInfo();

  useEffect(() => {
    document.title = '动态 - 財訊';
  }, []);

  useEffect(() => {
    const fetcher =
      view === 'mine'
        ? userInfo?._id
          ? listUserFeedPosts(userInfo._id)
          : listOwnFeedPosts()
        : listFeedPosts(groupId);

    Promise.resolve(fetcher).then(setPosts).catch(showErrorToasts);
  }, [groupId, userInfo?._id, view]);

  const heading = useMemo(
    () => (groupId ? '群组关联动态' : view === 'mine' ? '我的动态' : '动态'),
    [groupId, view]
  );

  return (
    <PageContent data-tc-role="content-feed" sidebar={<FeedSidebar />}>
      <div className="w-full max-w-4xl mx-auto px-4 py-5 mobile:px-3 space-y-4 overflow-y-auto">
        <div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {heading}
          </div>
          <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            面向社区的公开内容流，用于观点发布、信息同步和群组联动。
          </div>
          <details className="mt-4 rounded-2xl border border-black/10 dark:border-white/10 bg-white/80 dark:bg-white/5 px-4 py-3 shadow-sm">
            <summary className="cursor-pointer text-sm font-semibold text-gray-900 dark:text-white">
              查看动态使用建议
            </summary>
            <div className="mt-3 space-y-2 text-xs leading-6 text-gray-500 dark:text-gray-400">
              <div>1. 先看公共动态，快速了解最近的话题和公开交流内容。</div>
              <div>2. 再发布你的观点，也可以围绕相关群组继续承接讨论。</div>
              <div>3. 打开动态详情查看关联群状态，再决定是否进入群组参与交流。</div>
            </div>
          </details>
          {!groupId && (
            <div className="mt-4 inline-flex rounded-2xl border border-black/10 dark:border-white/10 p-1 bg-black/[0.03] dark:bg-white/[0.03]">
              <Link
                to="/main/feed"
                className={`rounded-xl px-4 py-2 text-sm ${
                  view === 'all'
                    ? 'bg-white dark:bg-black/30 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-500 dark:text-gray-400'
                }`}
              >
                全部动态
              </Link>
              <Link
                to="/main/feed?view=mine"
                className={`rounded-xl px-4 py-2 text-sm ${
                  view === 'mine'
                    ? 'bg-white dark:bg-black/30 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-500 dark:text-gray-400'
                }`}
              >
                我的动态
              </Link>
            </div>
          )}
        </div>

        <FeedComposer
          groupId={groupId}
          onCreated={(post) => setPosts((prev) => [post, ...prev])}
        />

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
FeedHome.displayName = 'FeedHome';

export const FeedPage: React.FC = React.memo(() => {
  return (
    <Routes>
      <Route path="/" element={<FeedHome />} />
      <Route path="/post/:postId" element={<FeedDetail />} />
      <Route path="/user/:userId" element={<UserFeedPage />} />
    </Routes>
  );
});
FeedPage.displayName = 'FeedPage';
