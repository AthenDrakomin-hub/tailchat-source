import { CommonSidebarWrapper } from '@/components/CommonSidebarWrapper';
import { SectionHeader } from '@/components/SectionHeader';
import React from 'react';
import { t } from 'tailchat-shared';
import { useSearchParams } from 'react-router-dom';

export const FeedSidebar: React.FC = React.memo(() => {
  const [searchParams] = useSearchParams();
  const groupId = searchParams.get('groupId');

  return (
    <CommonSidebarWrapper data-tc-role="sidebar-feed">
      <SectionHeader>{t('动态')}</SectionHeader>

      <div className="p-3 space-y-3 overflow-y-auto overflow-x-hidden">
        <div className="rounded-2xl border border-black/10 dark:border-white/10 bg-black/[0.03] dark:bg-white/[0.03] px-4 py-3">
          <div className="text-sm font-semibold text-gray-900 dark:text-white">
            社区动态
          </div>
          <div className="mt-2 text-xs leading-6 text-gray-600 dark:text-gray-300">
            发布观点、近况、摘要和公开交流内容，让聊天、群组与内容场形成联动。
          </div>
        </div>

        <div className="rounded-2xl border border-black/10 dark:border-white/10 bg-black/[0.03] dark:bg-white/[0.03] px-4 py-3">
          <div className="text-sm font-semibold text-gray-900 dark:text-white">
            当前视图
          </div>
          <div className="mt-2 text-xs leading-6 text-gray-600 dark:text-gray-300">
            {groupId ? '当前正在查看与指定群组关联的动态。' : '当前正在查看全站公开动态流。'}
          </div>
        </div>

        <div className="rounded-2xl border border-black/10 dark:border-white/10 bg-black/[0.03] dark:bg-white/[0.03] px-4 py-3">
          <div className="text-sm font-semibold text-gray-900 dark:text-white">
            主场联动
          </div>
          <div className="mt-2 text-xs leading-6 text-gray-600 dark:text-gray-300">
            可以先在动态里发布内容，再回到群组承接讨论；也可以从群组回看关联动态，形成完整交流链路。
          </div>
        </div>
      </div>
    </CommonSidebarWrapper>
  );
});
FeedSidebar.displayName = 'FeedSidebar';
