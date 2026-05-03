import React from 'react';
import { t } from 'tailchat-shared';

export const ChatMessageHeader: React.FC<{
  title: React.ReactNode;
}> = React.memo((props) => {
  return (
    <div className="px-5 pb-4 pt-7 text-center">
      <div className="inline-flex items-center rounded-full bg-[#e5e7eb] px-3 py-1 text-[11px] text-[#6b7280]">
        会话开始
      </div>
      <div className="font-semibold mt-3 text-[15px] text-[#111827]">{props.title}</div>
      <div className="text-[13px] mt-1 text-[#9ca3af]">
        {t('这里是所有消息的开始，请畅所欲言。')}
      </div>
    </div>
  );
});
ChatMessageHeader.displayName = 'ChatMessageHeader';
