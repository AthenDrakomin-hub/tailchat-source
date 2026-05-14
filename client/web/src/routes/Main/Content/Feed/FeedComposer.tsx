import React, { useState } from 'react';
import { createFeedPost, FeedPost, showErrorToasts } from 'tailchat-shared';

interface FeedComposerProps {
  groupId?: string;
  onCreated: (post: FeedPost) => void;
}

export const FeedComposer: React.FC<FeedComposerProps> = React.memo(
  ({ groupId, onCreated }) => {
    const [content, setContent] = useState('');
    const [submitting, setSubmitting] = useState(false);

    return (
      <div className="rounded-[24px] border border-black/5 dark:border-white/10 bg-white px-5 py-4 shadow-[0_8px_20px_rgba(15,23,42,0.04)]">
        <div className="text-sm font-semibold text-gray-900 dark:text-white">
          发布动态
        </div>
        <textarea
          className="mt-3 min-h-[112px] w-full resize-none rounded-2xl border border-black/5 dark:border-white/10 bg-[#fafafa] px-4 py-3 text-sm outline-none"
          placeholder="分享今天的想法、观察或公开动态"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />

        <div className="mt-3 flex items-center justify-between">
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {groupId ? '这条动态将关联当前群组' : '这条动态将发布到公开动态流'}
          </div>
          <button
            type="button"
            className="rounded-2xl bg-tc-primary px-4 py-2 text-sm font-medium text-white disabled:opacity-50 hover:bg-tc-primary-hover"
            disabled={submitting || content.trim() === ''}
            onClick={async () => {
              try {
                setSubmitting(true);
                const post = await createFeedPost({
                  content: content.trim(),
                  groupId,
                });
                onCreated(post);
                setContent('');
              } catch (err) {
                showErrorToasts(err);
              } finally {
                setSubmitting(false);
              }
            }}
          >
            发布动态
          </button>
        </div>
      </div>
    );
  }
);
FeedComposer.displayName = 'FeedComposer';
