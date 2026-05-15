import React, { useMemo } from 'react';
import {
  BasicInboxItem,
  chatActions,
  formatShortTime,
  InboxItem,
  isValidStr,
  model,
  t,
  useAppDispatch,
  useAsyncRequest,
  useInboxList,
} from 'tailchat-shared';
import clsx from 'clsx';
import _orderBy from 'lodash/orderBy';
import { GroupName } from '@/components/GroupName';
import { ConverseName } from '@/components/ConverseName';
import { getMessageRender, pluginInboxItemMap } from '@/plugin/common';
import { useLocation } from 'react-router';
import { Link } from 'react-router-dom';
import { PillTabPane, PillTabs } from '@/components/PillTabs';
import { SectionHeader } from '@/components/SectionHeader';
import { openReconfirmModalP } from '@/components/Modal';
import { CommonSidebarWrapper } from '@/components/CommonSidebarWrapper';
import { Virtuoso } from 'react-virtuoso';

const buildLink = (itemId: string) => `/main/inbox/${itemId}`;

/**
 * 通知侧边栏组件
 */
export const InboxSidebar: React.FC = React.memo(() => {
  const inbox = useInboxList();
  const list = useMemo(() => _orderBy(inbox, 'createdAt', 'desc'), [inbox]);
  const dispatch = useAppDispatch();

  const renderInbox = (item: InboxItem) => {
    if (item.type === 'message') {
      const payload: Partial<model.inbox.InboxItem['payload']> =
        item.message ?? item.payload ?? {};
      let title: React.ReactNode = '';
      if (isValidStr(payload.groupId)) {
        title = <GroupName groupId={payload.groupId} />;
      } else if (isValidStr(payload.converseId)) {
        title = <ConverseName converseId={payload.converseId} />;
      }

      return (
        <InboxSidebarItem
          key={item._id}
          title={title}
          desc={getMessageRender(payload.messageSnippet ?? '')}
          source={'財訊'}
          time={item.createdAt ? formatShortTime(item.createdAt) : ''}
          readed={item.readed}
          to={buildLink(item._id)}
        />
      );
    }

    if (item.type === 'markdown') {
      const payload: Partial<model.inbox.InboxItem['payload']> =
        item.payload ?? {};
      const title = payload.title || t('新消息');

      return (
        <InboxSidebarItem
          key={item._id}
          title={title}
          desc={t('点击查看详情')}
          source={payload.source ?? '財訊'}
          time={item.createdAt ? formatShortTime(item.createdAt) : ''}
          readed={item.readed}
          to={buildLink(item._id)}
        />
      );
    }

    // For plugins
    const _item = item as BasicInboxItem;
    if (pluginInboxItemMap[_item.type]) {
      const info = pluginInboxItemMap[_item.type];
      const preview = info.getPreview(_item);

      return (
        <InboxSidebarItem
          key={_item._id}
          title={preview.title}
          desc={preview.desc}
          source={info.source ?? 'Unknown'}
          time={_item.createdAt ? formatShortTime(_item.createdAt) : ''}
          readed={_item.readed}
          to={buildLink(_item._id)}
        />
      );
    }

    return null;
  };

  const fullList = list;
  const unreadList = list.filter((item) => item.readed === false);

  const [, handleAllAck] = useAsyncRequest(async () => {
    unreadList.forEach((item) => {
      dispatch(chatActions.setInboxItemAck(item._id));
    });

    await model.inbox.setInboxAck(unreadList.map((item) => item._id));
  }, [unreadList]);

  const [, handleClear] = useAsyncRequest(async () => {
    const res = await openReconfirmModalP({
      title: t('确认清空通知么?'),
    });
    if (res) {
      await model.inbox.clearInbox();
    }
  }, [unreadList]);

  return (
    <CommonSidebarWrapper data-tc-role="sidebar-inbox">
      <SectionHeader
        menu={{
          items: [
            {
              key: 'readAll',
              label: t('所有已读'),
              onClick: handleAllAck,
            },
            {
              key: 'clear',
              label: t('清空通知'),
              danger: true,
              onClick: handleClear,
            },
          ],
        }}
      >
        {t('通知')}
      </SectionHeader>

      <div className="overflow-hidden flex-1">
        <PillTabs
          className="h-full"
          items={[
            {
              key: '1',
              label: `${t('全部')}`,
              children: (
                <Virtuoso
                  className="h-full"
                  data={fullList}
                  itemContent={(index, item) => renderInbox(item)}
                />
              ),
            },
            {
              key: '2',
              label: `${t('未读')} (${unreadList.length})`,
              children: (
                <Virtuoso
                  className="h-full"
                  data={unreadList}
                  itemContent={(index, item) => renderInbox(item)}
                />
              ),
            },
          ]}
        />
      </div>
    </CommonSidebarWrapper>
  );
});
InboxSidebar.displayName = 'InboxSidebar';

const InboxSidebarItem: React.FC<{
  title: React.ReactNode;
  desc: React.ReactNode;
  source: string;
  time: string;
  readed: boolean;
  to: string;
}> = React.memo((props) => {
  const location = useLocation();
  const isActive = location.pathname.startsWith(props.to);

  return (
    <Link to={props.to}>
      <div
        className={clsx(
          'mx-0 my-0 px-4 py-3 overflow-hidden cursor-pointer border-b border-black/5 dark:border-white/10 hover:bg-white/80 dark:hover:bg-white dark:hover:bg-opacity-5 transition-colors duration-150',
          {
            'bg-white border-l-[3px] border-l-tc-success dark:bg-tc-bg-sunken': isActive,
            'bg-tc-bg-sunken': !props.readed,
          },
          props.readed ? '' : ''
        )}
      >
        <div className="flex items-center gap-2">
          {!props.readed && (
            <span className="w-2 h-2 rounded-full bg-tc-primary flex-shrink-0" />
          )}
          <div className="truncate flex-1 text-[15px] font-medium text-gray-800 dark:text-white">
            {props.title || <span>&nbsp;</span>}
          </div>
          <div className="text-[11px] text-tc-text-tertiary flex-shrink-0">{props.time}</div>
        </div>
        <div className="line-clamp-2 break-words text-tc-text-secondary dark:text-opacity-80 dark:text-white text-[13px] mt-1.5 pl-3 border-l border-gray-200 dark:border-gray-600 overflow-hidden">
          {props.desc}
        </div>
        <div className="truncate text-[11px] mt-2 text-tc-text-tertiary dark:text-opacity-50 dark:text-white">
          {t('来自')}: {props.source}
        </div>
      </div>
    </Link>
  );
});
InboxSidebarItem.displayName = 'InboxSidebarItem';
