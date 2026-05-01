import React, { useCallback, useState } from 'react';
import { PillTabs } from '@/components/PillTabs';
import { AddFriend } from './AddFriend';
import { t, useAppSelector, useGlobalConfigStore } from 'tailchat-shared';
import { RequestSend } from './RequestSend';
import { RequestReceived } from './RequestReceived';
import { FriendList } from './FriendList';
import { Badge } from 'antd';
import _compact from 'lodash/compact';

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
