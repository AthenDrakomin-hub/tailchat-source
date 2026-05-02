import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ChatMessage,
  fetchConverseMessage,
  FeedComment,
  FeedPost,
  getGroupBasicInfo,
  getGroupLobbyConverseId,
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

const RecentMessageItem: React.FC<{ message: ChatMessage }> = React.memo(({ message }) => {
  const author = useCachedUserInfo(message.author ?? '');
  const createdAtText = message.createdAt
    ? new Date(message.createdAt).toLocaleString('zh-CN')
    : '刚刚';

  return (
    <div className="rounded-2xl bg-black/[0.03] dark:bg-white/[0.03] px-3 py-2">
      <div className="flex items-center justify-between gap-3 text-[11px] text-gray-500 dark:text-gray-400">
        <span className="truncate">{author.nickname ?? '群成员'}</span>
        <span>{createdAtText}</span>
      </div>
      <div className="mt-1 text-xs leading-6 text-gray-600 dark:text-gray-300">
        {message.content || '[非文本消息]'}
      </div>
    </div>
  );
});
RecentMessageItem.displayName = 'RecentMessageItem';

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
  const { value: recentMessagesValue } = useAsync(async () => {
    if (!post?.groupId) {
      return [] as ChatMessage[];
    }

    const converseId = await getGroupLobbyConverseId(post.groupId);
    return fetchConverseMessage(converseId);
  }, [post?.groupId]);
  const recentMessages: ChatMessage[] = recentMessagesValue ?? [];
  const latestRecentMessage = recentMessages[0];
  const latestRecentMessageTime = latestRecentMessage?.createdAt
    ? new Date(latestRecentMessage.createdAt).toLocaleString('zh-CN')
    : null;
  const isGroupActive = recentMessages.length > 0;

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
                去群里参与讨论
              </Link>
            </div>
            <div className="mt-3 text-sm leading-6 text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
              {relatedGroup.description || '该群当前暂无公开群说明。'}
            </div>
            <div className="mt-3 text-xs leading-6 text-gray-500 dark:text-gray-400">
              {latestRecentMessageTime
                ? `当前群最近仍有互动，最近活跃时间：${latestRecentMessageTime}`
                : '当前群最近暂无可感知活跃记录，更适合先浏览群说明再决定是否进入。'}
            </div>
            <div className="mt-4 border-t border-black/10 dark:border-white/10 pt-4">
              <div className="text-xs font-semibold text-gray-900 dark:text-white">
                群最近消息
              </div>
              <div className="mt-2 space-y-2">
                {recentMessages.slice(0, 2).map((message) => (
                  <RecentMessageItem key={message._id} message={message} />
                ))}
                {recentMessages.length === 0 && (
                  <div className="text-xs leading-6 text-gray-500 dark:text-gray-400">
                    当前群最近暂无可预览消息，适合先浏览群说明后再决定是否进入。
                  </div>
                )}
              </div>
              <div className="mt-3 text-xs leading-6 text-gray-500 dark:text-gray-400">
                {isGroupActive
                  ? '如果你认同这条动态主题，现在适合直接进入群组继续参与讨论。'
                  : '如果你认同这条动态主题，可以先进入群组观察，再决定是否继续参与互动。'}
              </div>
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
