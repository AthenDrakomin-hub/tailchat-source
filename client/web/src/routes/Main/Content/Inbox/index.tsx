import { Problem } from '@/components/Problem';
import React from 'react';
import { Route, Routes } from 'react-router';
import { t } from 'tailchat-shared';
import { PageContent } from '../PageContent';
import { InboxContent } from './Content';
import { InboxSidebar } from './Sidebar';

export const Inbox: React.FC = React.memo(() => {
  return (
    <PageContent data-tc-role="content-inbox" sidebar={<InboxSidebar />}>
      <Routes>
        <Route path="/:inboxItemId" element={<InboxContent />} />
        <Route path="/" element={<InboxNoSelect />} />
      </Routes>
    </PageContent>
  );
});
Inbox.displayName = 'Inbox';

const InboxNoSelect: React.FC = React.memo(() => {
  return (
    <div className="w-full h-full flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-2xl space-y-4">
        <div className="rounded-3xl border border-black/10 dark:border-white/10 bg-white/80 dark:bg-white/5 px-6 py-6 shadow-sm">
          <div className="text-xl font-bold text-gray-900 dark:text-white">
            提及(@)、系统提醒和通知会在这里出现
          </div>
          <div className="mt-3 text-sm leading-7 text-gray-500 dark:text-gray-400">
            这里会集中展示需要你处理的提醒、提及和系统通知。选择左侧任一项，可以继续查看详情并回到对应会话、群组或动态链路。
          </div>
          <div className="mt-4 grid gap-3 mobile:grid-cols-1" style={{ gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' }}>
            <div className="rounded-2xl bg-black/[0.03] dark:bg-white/[0.03] px-4 py-4">
              <div className="text-sm font-semibold text-gray-900 dark:text-white">系统提醒</div>
              <div className="mt-2 text-xs leading-6 text-gray-500 dark:text-gray-400">
                用来查看平台公告、状态变化和关键系统消息。
              </div>
            </div>
            <div className="rounded-2xl bg-black/[0.03] dark:bg-white/[0.03] px-4 py-4">
              <div className="text-sm font-semibold text-gray-900 dark:text-white">提及与你</div>
              <div className="mt-2 text-xs leading-6 text-gray-500 dark:text-gray-400">
                当别人 @ 你或与你有关的讨论发生时，会优先出现在这里。
              </div>
            </div>
            <div className="rounded-2xl bg-black/[0.03] dark:bg-white/[0.03] px-4 py-4">
              <div className="text-sm font-semibold text-gray-900 dark:text-white">回到现场</div>
              <div className="mt-2 text-xs leading-6 text-gray-500 dark:text-gray-400">
                选中一条提醒后，可以继续回到群组、动态或会话现场处理。
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});
InboxNoSelect.displayName = 'InboxNoSelect';
