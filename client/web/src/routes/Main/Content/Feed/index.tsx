import React, { useEffect, useMemo, useState } from 'react';
import { Link, Route, Routes, useSearchParams } from 'react-router-dom';
import {
  FeedPost,
  listFeedPosts,
  listOwnFeedPosts,
  showErrorToasts,
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

  useEffect(() => {
    document.title = '动态 - 財訊';
  }, []);

  useEffect(() => {
    const fetcher =
      view === 'mine' ? listOwnFeedPosts() : listFeedPosts(groupId);

    Promise.resolve(fetcher).then(setPosts).catch(showErrorToasts);
  }, [groupId, view]);

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
            面向财富论坛的公开内容流，用于观点发布、活动预热和群组联动。
          </div>
          <div className="mt-4 grid gap-3 mobile:grid-cols-1" style={{ gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' }}>
            <div className="rounded-3xl border border-black/10 dark:border-white/10 bg-white/80 dark:bg-white/5 px-4 py-4 shadow-sm">
              <div className="text-xs text-gray-500 dark:text-gray-400">第 1 步</div>
              <div className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">
                先看公共动态
              </div>
              <div className="mt-2 text-xs leading-6 text-gray-500 dark:text-gray-400">
                从全部动态快速判断今天有哪些话题、活动和可承接的群讨论。
              </div>
            </div>
            <div className="rounded-3xl border border-black/10 dark:border-white/10 bg-white/80 dark:bg-white/5 px-4 py-4 shadow-sm">
              <div className="text-xs text-gray-500 dark:text-gray-400">第 2 步</div>
              <div className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">
                发布你的观点
              </div>
              <div className="mt-2 text-xs leading-6 text-gray-500 dark:text-gray-400">
                可以直接发帖，也可以围绕活动主题或关联群继续承接讨论。
              </div>
            </div>
            <div className="rounded-3xl border border-black/10 dark:border-white/10 bg-white/80 dark:bg-white/5 px-4 py-4 shadow-sm">
              <div className="text-xs text-gray-500 dark:text-gray-400">第 3 步</div>
              <div className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">
                进入群继续互动
              </div>
              <div className="mt-2 text-xs leading-6 text-gray-500 dark:text-gray-400">
                打开任意动态详情，查看关联群状态，再决定是否进入群组参与实时交流。
              </div>
            </div>
          </div>
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
