import React from 'react';
import { FeedComment, useCachedUserInfo } from 'tailchat-shared';
import { Avatar } from 'tailchat-design';

interface CommentListProps {
  comments: FeedComment[];
}

const CommentItem: React.FC<{ comment: FeedComment }> = React.memo(({ comment }) => {
  const user = useCachedUserInfo(comment.author);

  return (
    <div className="flex gap-3">
      <Avatar src={user.avatar} name={user.nickname} />
      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium text-gray-900 dark:text-white">
          {user.nickname ?? '成员'}
        </div>
        <div className="mt-1 whitespace-pre-wrap text-sm leading-6 text-gray-700 dark:text-gray-200">
          {comment.content}
        </div>
        <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          {new Date(comment.createdAt).toLocaleString('zh-CN')}
        </div>
      </div>
    </div>
  );
});
CommentItem.displayName = 'CommentItem';

export const CommentList: React.FC<CommentListProps> = React.memo(({ comments }) => {
  if (comments.length === 0) {
    return (
      <div className="text-sm text-gray-500 dark:text-gray-400">
        还没有评论，先留下第一条互动吧。
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {comments.map((comment) => (
        <CommentItem key={comment._id} comment={comment} />
      ))}
    </div>
  );
});
CommentList.displayName = 'CommentList';
