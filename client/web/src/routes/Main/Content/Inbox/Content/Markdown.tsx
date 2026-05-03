import { Markdown } from '@/components/Markdown';
import { CommonPanelWrapper } from '@/components/Panel/common/Wrapper';
import { Problem } from '@/components/Problem';
import React from 'react';
import { MarkdownInboxItem, t } from 'tailchat-shared';

interface Props {
  info: MarkdownInboxItem;
}
export const InboxMarkdownContent: React.FC<Props> = React.memo((props) => {
  const info = props.info;

  const payload = info.payload;
  if (!payload) {
    return <Problem />;
  }

  return (
    <CommonPanelWrapper header={payload.title ?? t('新消息')}>
      <div className="h-full min-w-0 overflow-y-auto overflow-x-hidden px-4 py-4 bg-[#f5f5f5]">
        <div className="max-w-3xl rounded-[24px] border border-black/5 bg-white px-5 py-5 shadow-[0_8px_20px_rgba(15,23,42,0.04)]">
          <Markdown raw={payload.content ?? ''} />
        </div>
      </div>
    </CommonPanelWrapper>
  );
});
InboxMarkdownContent.displayName = 'InboxMarkdownContent';
