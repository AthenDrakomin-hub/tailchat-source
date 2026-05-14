import React from 'react';
import { t } from 'tailchat-shared';

export const ChatMessageHeader: React.FC<{
  title: React.ReactNode;
}> = React.memo((props) => {
  return (
    <div className="px-5 pb-4 pt-7 text-center">
      <div className="inline-flex items-center rounded-full bg-tc-bg-elevated px-3 py-1 text-tc-text-secondary">
        会话开始
      </div>
      <div className="font-semibold mt-3 text-tc-text-h3 text-tc-text-primary">{props.title}</div>
      <div className="text-tc-text-sm mt-1 text-tc-text-tertiary">
        {t('这里是所有消息的开始，请畅所欲言。')}
      </div>
    </div>
  );
});
ChatMessageHeader.displayName = 'ChatMessageHeader';
