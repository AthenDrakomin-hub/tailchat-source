import React, { useState } from 'react';
import { commentFeedPost, FeedComment, showErrorToasts } from 'tailchat-shared';

interface CommentComposerProps {
  postId: string;
  onCreated: (comment: FeedComment) => void;
}

export const CommentComposer: React.FC<CommentComposerProps> = React.memo(
  ({ postId, onCreated }) => {
    const [content, setContent] = useState('');
    const [submitting, setSubmitting] = useState(false);

    return (
      <div className="rounded-2xl border border-black/10 dark:border-white/10 px-4 py-3">
        <textarea
          className="min-h-[84px] w-full resize-none bg-transparent text-sm outline-none"
          placeholder="补充你的观点、问题或互动评论"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <div className="mt-3 flex justify-end">
          <button
            type="button"
            className="rounded-2xl bg-[#0b4a8b] px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
            disabled={submitting || content.trim() === ''}
            onClick={async () => {
              try {
                setSubmitting(true);
                const comment = await commentFeedPost({
                  postId,
                  content: content.trim(),
                });
                onCreated(comment);
                setContent('');
              } catch (err) {
                showErrorToasts(err);
              } finally {
                setSubmitting(false);
              }
            }}
          >
            发布评论
          </button>
        </div>
      </div>
    );
  }
);
CommentComposer.displayName = 'CommentComposer';
