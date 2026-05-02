import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  FeedComment,
  FeedPost,
  getGroupBasicInfo,
  getFeedPostDetail,
  listFeedComments,
  showErrorToasts,
  useAsync,
  useCachedUserInfo,
} from 'tailchat-shared';
import { Avatar } from 'tailchat-design';
import { PageContent } from '../PageContent';
import { FeedSidebar } from './FeedSidebar';
import { CommentComposer } from './CommentComposer';
import { CommentList } from './CommentList';

export const FeedDetail: React.FC = React.memo(() => {
  const { postId = '' } = useParams();
  const [post, setPost] = useState<FeedPost | null>(null);
  const [comments, setComments] = useState<FeedComment[]>([]);
  const [likesCount, setLikesCount] = useState(0);
  const author = useCachedUserInfo(post?.author ?? '');
  const { value: relatedGroup } = useAsync(async () => {
    if (!post?.groupId) {
      return null;
    }

    return (await getGroupBasicInfo(post.groupId)) as
      | ({
          description?: string;
        } & Awaited<ReturnType<typeof getGroupBasicInfo>>)
      | null;
  }, [post?.groupId]);

  useEffect(() => {
    document.title = '动态详情 - 財訊';
  }, []);

  useEffect(() => {
    if (!postId) {
      return;
    }

    Promise.all([getFeedPostDetail(postId), listFeedComments(postId)])
      .then(([detail, commentList]) => {
        setPost(detail);
        setComments(commentList);
        setLikesCount(detail.likesCount);
      })
      .catch(showErrorToasts);
  }, [postId]);

  if (!post) {
    return (
      <PageContent sidebar={<FeedSidebar />}>
        <div className="w-full max-w-4xl mx-auto px-4 py-5 mobile:px-3 text-sm text-gray-500 dark:text-gray-400">
          正在加载动态详情...
        </div>
      </PageContent>
    );
  }

  return (
    <PageContent sidebar={<FeedSidebar />}>
      <div className="w-full max-w-4xl mx-auto px-4 py-5 mobile:px-3 space-y-5 overflow-y-auto">
        <div className="rounded-3xl border border-black/10 dark:border-white/10 bg-white/80 dark:bg-white/5 px-5 py-5 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <Avatar src={author.avatar} name={author.nickname} />
              <div>
                <Link
                  to={`/main/feed/user/${post.author}`}
                  className="text-sm font-semibold text-gray-900 dark:text-white hover:underline"
                >
                  {author.nickname ?? '财讯成员'}
                </Link>
                <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  {new Date(post.createdAt).toLocaleString('zh-CN')}
                </div>
              </div>
            </div>
            {post.groupId && (
              <Link
                to={`/main/group/${post.groupId}`}
                className="text-xs text-[#0b4a8b] dark:text-[#8db8ff] underline underline-offset-4"
              >
                返回关联群组
              </Link>
            )}
          </div>

          <div className="mt-4 whitespace-pre-wrap text-sm leading-7 text-gray-700 dark:text-gray-200">
            {post.content}
          </div>

          <div className="mt-4 flex items-center gap-5 text-xs text-gray-500 dark:text-gray-400">
            <span>点赞 {likesCount}</span>
            <span>评论 {comments.length}</span>
          </div>
        </div>

        {post.groupId && relatedGroup && (
          <div className="rounded-3xl border border-black/10 dark:border-white/10 bg-white/80 dark:bg-white/5 px-5 py-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="text-base font-semibold text-gray-900 dark:text-white truncate">
                  {relatedGroup.name}
                </div>
                <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  {relatedGroup.memberCount} 位成员
                </div>
              </div>
              <Link
                to={`/main/group/${post.groupId}`}
                className="rounded-2xl bg-[#0b4a8b] px-4 py-2 text-sm font-medium text-white"
              >
                进入群组
              </Link>
            </div>
            <div className="mt-3 text-sm leading-6 text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
              {relatedGroup.description || '该群当前暂无公开群说明。'}
            </div>
          </div>
        )}

        <div className="rounded-3xl border border-black/10 dark:border-white/10 bg-white/80 dark:bg-white/5 px-5 py-5 shadow-sm space-y-4">
          <div className="text-base font-semibold text-gray-900 dark:text-white">
            评论区
          </div>
          <CommentComposer
            postId={post._id}
            onCreated={(comment) =>
              setComments((prev) => {
                const next = [...prev, comment];
                setPost((current) =>
                  current
                    ? {
                        ...current,
                        commentsCount: next.length,
                      }
                    : current
                );

                return next;
              })
            }
          />
          <CommentList comments={comments} />
        </div>
      </div>
    </PageContent>
  );
});
FeedDetail.displayName = 'FeedDetail';
