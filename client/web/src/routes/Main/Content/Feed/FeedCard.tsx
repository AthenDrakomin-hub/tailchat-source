import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FeedPost, likeFeedPost, showErrorToasts } from 'tailchat-shared';

interface FeedCardProps {
  post: FeedPost;
}

export const FeedCard: React.FC<FeedCardProps> = React.memo(({ post }) => {
  const [likesCount, setLikesCount] = useState(post.likesCount);

  return (
    <div className="rounded-3xl border border-black/10 dark:border-white/10 bg-white/80 dark:bg-white/5 px-5 py-4 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-sm font-semibold text-gray-900 dark:text-white">
            财讯论坛动态
          </div>
          <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            {new Date(post.createdAt).toLocaleString('zh-CN')}
          </div>
        </div>
        {post.groupId && (
          <Link
            to={`/main/group/${post.groupId}`}
            className="text-xs text-[#0b4a8b] dark:text-[#8db8ff] underline underline-offset-4"
          >
            查看关联群组
          </Link>
        )}
      </div>

      <div className="mt-3 whitespace-pre-wrap text-sm leading-7 text-gray-700 dark:text-gray-200">
        {post.content}
      </div>

      <div className="mt-4 flex items-center gap-5 text-xs text-gray-500 dark:text-gray-400">
        <button
          type="button"
          className="hover:text-gray-900 dark:hover:text-white"
          onClick={() => {
            likeFeedPost(post._id)
              .then((res) => setLikesCount(res.likesCount))
              .catch(showErrorToasts);
          }}
        >
          点赞 {likesCount}
        </button>
        <span>评论 {post.commentsCount}</span>
      </div>
    </div>
  );
});
FeedCard.displayName = 'FeedCard';
