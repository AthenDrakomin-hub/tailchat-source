import React, { PropsWithChildren } from 'react';
import { getDailyQuote } from 'tailchat-shared';

interface CommonSidebarProps extends PropsWithChildren {
  ['data-tc-role']?: string;
}
export const CommonSidebarWrapper: React.FC<CommonSidebarProps> = React.memo(
  (props) => {
    const quote = getDailyQuote('sidebar');

    return (
      <div
        className="h-full min-w-0 flex flex-col overflow-hidden bg-[#f7f7f7]"
        data-tc-role={props['data-tc-role']}
      >
        {props.children}

        <div className="flex-shrink-0 px-4 py-2.5 border-t border-black/5 dark:border-white/10 bg-[#f3f3f3] dark:bg-white dark:bg-opacity-[0.03]">
          <div className="text-[11px] text-gray-500 dark:text-gray-400 leading-5">
            <span className="mr-2 opacity-70">今日一句</span>
            <span className="opacity-90">“{quote.text}”</span>
          </div>
        </div>
      </div>
    );
  }
);
CommonSidebarWrapper.displayName = 'CommonSidebarWrapper';
