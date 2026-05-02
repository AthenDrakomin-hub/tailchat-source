import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FeedPost,
  likeFeedPost,
  removeFeedPost,
  showErrorToasts,
  useCachedUserInfo,
} from 'tailchat-shared';
import { Avatar } from 'tailchat-design';

interface FeedCardProps {
  post: FeedPost;
  onRemoved?: (postId: string) => void;
}

export const FeedCard: React.FC<FeedCardProps> = React.memo(({ post, onRemoved }) => {
  const [likesCount, setLikesCount] = useState(post.likesCount);
  const author = useCachedUserInfo(post.author);

  return (
    <div className="rounded-3xl border border-black/10 dark:border-white/10 bg-white/80 dark:bg-white/5 px-5 py-4 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 min-w-0">
          <Avatar src={author.avatar} name={author.nickname} />
          <div className="min-w-0">
            <Link
              to={`/main/feed/user/${post.author}`}
              className="text-sm font-semibold text-gray-900 dark:text-white hover:underline"
            >
              {author.nickname ?? '财讯成员'}
            </Link>
            <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              财富论坛动态
            </div>
            <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {new Date(post.createdAt).toLocaleString('zh-CN')}
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          {post.groupId && (
            <Link
              to={`/main/group/${post.groupId}`}
              className="text-xs text-[#0b4a8b] dark:text-[#8db8ff] underline underline-offset-4"
            >
              查看关联群组
            </Link>
          )}
          {onRemoved && (
            <button
              type="button"
              className="text-xs text-gray-500 hover:text-red-500"
              onClick={() => {
                removeFeedPost(post._id)
                  .then(() => onRemoved(post._id))
                  .catch(showErrorToasts);
              }}
            >
              删除
            </button>
          )}
        </div>
      </div>

      <Link
        to={`/main/feed/post/${post._id}`}
        className="mt-3 block whitespace-pre-wrap text-sm leading-7 text-gray-700 dark:text-gray-200"
      >
        {post.content}
      </Link>

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
