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
    <div className="w-full h-full flex items-center justify-center px-4">
      <Problem text={t('提及(@)、系统提醒和通知会在这里出现')} />
    </div>
  );
});
InboxNoSelect.displayName = 'InboxNoSelect';
