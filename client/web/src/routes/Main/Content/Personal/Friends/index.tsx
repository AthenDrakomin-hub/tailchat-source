import React, { useCallback, useState } from 'react';
import { PillTabs } from '@/components/PillTabs';
import { AddFriend } from './AddFriend';
import { t, useAppSelector, useGlobalConfigStore } from 'tailchat-shared';
import { RequestSend } from './RequestSend';
import { RequestReceived } from './RequestReceived';
import { FriendList } from './FriendList';
import { Badge } from 'antd';
import _compact from 'lodash/compact';
import { Link } from 'react-router-dom';

/**
 * 主要内容组件
 */
export const FriendPanel: React.FC = React.memo(() => {
  const friendRequests = useAppSelector((state) => state.user.friendRequests);
  const userId = useAppSelector((state) => state.user.info?._id);
  const [activeKey, setActiveKey] = useState('1');
  const disableAddFriend = useGlobalConfigStore(
    (state) => state.disableAddFriend
  );

  const send = friendRequests.filter((item) => item.from === userId);
  const received = friendRequests.filter((item) => item.to === userId);

  const handleSwitchToAddFriend = useCallback(() => {
    setActiveKey('4');
  }, []);

  return (
    <div className="w-full h-full min-w-0">
      <div className="px-4 pt-4 bg-tc-bg-elevated">
        <details className="rounded-[24px] border border-black/5 dark:border-white/10 bg-white px-5 py-4 shadow-[0_8px_20px_rgba(15,23,42,0.04)]">
          <summary className="cursor-pointer text-sm font-semibold text-gray-900 dark:text-white">
            查看联系人使用建议
          </summary>
          <div className="mt-3 space-y-2 text-sm leading-7 text-gray-500 dark:text-gray-400">
            <div>联系人是私信与长期协作的起点，建议先整理联系人关系，再进入最近聊天持续沟通。</div>
            <div>建议按“动态、群组、私信”顺序体验主链路，便于更快熟悉内容、讨论和一对一沟通场景。</div>
          </div>
          <div className="mt-4 flex flex-wrap gap-3 text-xs">
            <Link to="/main/feed" className="rounded-full bg-[#f2f2f2] dark:bg-white/[0.08] px-3 py-1.5 no-underline text-gray-600 dark:text-gray-300">
              先看动态
            </Link>
            <Link to="/main/group" className="rounded-full bg-[#f2f2f2] dark:bg-white/[0.08] px-3 py-1.5 no-underline text-gray-600 dark:text-gray-300">
              再进群组
            </Link>
            <a href="/entry/trust" target="_blank" rel="noreferrer" className="rounded-full bg-[#f2f2f2] dark:bg-white/[0.08] px-3 py-1.5 text-gray-600 dark:text-gray-300">
              查看安全与合规
            </a>
            <a href="/downloads" target="_blank" rel="noreferrer" className="rounded-full bg-[#f2f2f2] dark:bg-white/[0.08] px-3 py-1.5 text-gray-600 dark:text-gray-300">
              查看客户端下载说明
            </a>
          </div>
        </details>
      </div>
      <PillTabs
        className="h-full"
        activeKey={activeKey}
        onChange={setActiveKey}
        items={_compact([
          {
            key: '1',
            label: t('全部联系人'),
            children: (
              <FriendList onSwitchToAddFriend={handleSwitchToAddFriend} />
            ),
          },
          !disableAddFriend && {
            key: '2',
            label: (
              <Badge
                className="text-black dark:text-white"
                size="small"
                count={send.length}
              >
                {t('已发送申请')}
              </Badge>
            ),
            children: <RequestSend requests={send} />,
          },
          !disableAddFriend && {
            key: '3',
            label: (
              <Badge
                className="text-black dark:text-white"
                size="small"
                count={received.length}
              >
                {t('待处理申请')}
              </Badge>
            ),
            children: <RequestReceived requests={received} />,
          },
          !disableAddFriend && {
            key: '4',
            label: <span className="text-green-400">{t('添加联系人')}</span>,
            children: <AddFriend />,
          },
        ])}
      />
    </div>
  );
});
FriendPanel.displayName = 'FriendPanel';
