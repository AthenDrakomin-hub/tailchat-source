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
      <div className="px-4 pt-4">
        <div className="rounded-3xl border border-black/10 dark:border-white/10 bg-white/80 dark:bg-white/5 px-5 py-5 shadow-sm">
          <div className="text-lg font-bold text-gray-900 dark:text-white">
            联系人是私信与长期协作的起点
          </div>
          <div className="mt-3 text-sm leading-7 text-gray-500 dark:text-gray-400">
            先整理你的联系人关系，再发起私信、查看已发送申请，或处理待确认邀请。联系人页更适合作为一对一交流和后续会话沉淀的起点。
          </div>
          <div className="mt-4 grid gap-3 mobile:grid-cols-1" style={{ gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' }}>
            <div className="rounded-2xl bg-black/[0.03] dark:bg-white/[0.03] px-4 py-4">
              <div className="text-sm font-semibold text-gray-900 dark:text-white">先看全部联系人</div>
              <div className="mt-2 text-xs leading-6 text-gray-500 dark:text-gray-400">
                快速确认你已经能直接开始私信的对象。
              </div>
            </div>
            <div className="rounded-2xl bg-black/[0.03] dark:bg-white/[0.03] px-4 py-4">
              <div className="text-sm font-semibold text-gray-900 dark:text-white">处理申请</div>
              <div className="mt-2 text-xs leading-6 text-gray-500 dark:text-gray-400">
                把待处理申请和已发送申请都集中在这里完成。
              </div>
            </div>
            <div className="rounded-2xl bg-black/[0.03] dark:bg-white/[0.03] px-4 py-4">
              <div className="text-sm font-semibold text-gray-900 dark:text-white">再进入聊天</div>
              <div className="mt-2 text-xs leading-6 text-gray-500 dark:text-gray-400">
                联系人确认后，就可以在左侧最近聊天里持续沉淀一对一交流。
              </div>
            </div>
          </div>
        </div>
        <div className="mt-4 rounded-3xl border border-black/10 dark:border-white/10 bg-white/80 dark:bg-white/5 px-5 py-5 shadow-sm">
          <div className="text-lg font-bold text-gray-900 dark:text-white">
            试运营起步建议
          </div>
          <div className="mt-3 text-sm leading-7 text-gray-500 dark:text-gray-400">
            如果你正在参与 Web 端试运营，建议先按“动态、群组、私信”顺序体验主链路，这样更容易判断内容场、讨论场和一对一沟通场是否都顺畅。
          </div>
          <div className="mt-4 grid gap-3 mobile:grid-cols-1" style={{ gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' }}>
            <Link to="/main/feed" className="rounded-2xl bg-black/[0.03] dark:bg-white/[0.03] px-4 py-4 no-underline hover:opacity-90">
              <div className="text-sm font-semibold text-gray-900 dark:text-white">先看动态</div>
              <div className="mt-2 text-xs leading-6 text-gray-500 dark:text-gray-400">
                验证内容流、详情页、评论和互动反馈是否顺畅。
              </div>
            </Link>
            <Link to="/main/group" className="rounded-2xl bg-black/[0.03] dark:bg-white/[0.03] px-4 py-4 no-underline hover:opacity-90">
              <div className="text-sm font-semibold text-gray-900 dark:text-white">再进群组</div>
              <div className="mt-2 text-xs leading-6 text-gray-500 dark:text-gray-400">
                验证群入口、群讨论和群信息承接是否清楚稳定。
              </div>
            </Link>
            <div className="rounded-2xl bg-black/[0.03] dark:bg-white/[0.03] px-4 py-4">
              <div className="text-sm font-semibold text-gray-900 dark:text-white">最后发私信</div>
              <div className="mt-2 text-xs leading-6 text-gray-500 dark:text-gray-400">
                从联系人确认关系后，在左侧最近聊天里发起一对一沟通，验证长期跟进链路。
              </div>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-3 text-xs">
            <a href="/entry/trust" target="_blank" rel="noreferrer" className="rounded-full bg-black/[0.04] dark:bg-white/[0.08] px-3 py-1.5 text-gray-600 dark:text-gray-300">
              查看安全与合规
            </a>
            <a href="https://tailchat.msgbyte.com/downloads" target="_blank" rel="noreferrer" className="rounded-full bg-black/[0.04] dark:bg-white/[0.08] px-3 py-1.5 text-gray-600 dark:text-gray-300">
              查看客户端下载说明
            </a>
          </div>
        </div>
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
