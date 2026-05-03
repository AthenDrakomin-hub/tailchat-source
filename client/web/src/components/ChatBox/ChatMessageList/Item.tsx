import React, { useMemo, useState } from 'react';
import {
  ChatMessage,
  formatShortTime,
  shouldShowMessageTime,
  SYSTEM_USERID,
  t,
  useUserInfo,
  useCachedUserInfo,
  MessageHelper,
  showMessageTime,
  useUserInfoList,
  UserBaseInfo,
  useUserSettings,
  useGroupInfo,
} from 'tailchat-shared';
import { useRenderPluginMessageInterpreter } from './useRenderPluginMessageInterpreter';
import { getMessageRender, pluginMessageExtraParsers } from '@/plugin/common';
import { Divider, Dropdown, Popover } from 'antd';
import { UserName } from '@/components/UserName';
import clsx from 'clsx';
import { useChatMessageItemAction } from './useChatMessageItemAction';
import { useChatMessageReactionAction } from './useChatMessageReaction';
import { TcPopover } from '@/components/TcPopover';
import { useMessageReactions } from './useMessageReactions';
import { stopPropagation } from '@/utils/dom-helper';
import { AutoFolder, Avatar, Icon } from 'tailchat-design';
import { MessageAckContainer } from './MessageAckContainer';
import { UserPopover } from '@/components/popover/UserPopover';
import _isEmpty from 'lodash/isEmpty';
import type { LocalChatMessage } from 'tailchat-shared/model/message';
import { getChatMessageLayout } from './layout';
import { getGroupPanelRoleStyle } from './roleStyle';
import { getUserTypeBadgeText } from '../chatEnhancement';
import './Item.less';

/**
 * 消息引用
 */
const MessageQuote: React.FC<{ payload: ChatMessage }> = React.memo(
  ({ payload }) => {
    const quote = useMemo(
      () => new MessageHelper(payload).hasReply(),
      [payload]
    );

    if (quote === false) {
      return null;
    }

    return (
      <div className="chat-message-item_quote border-l-4 border-black border-opacity-20 pl-2 opacity-80">
        {t('回复')} <UserName userId={String(quote.author)} />:{' '}
        <span>{getMessageRender(quote.content)}</span>
      </div>
    );
  }
);
MessageQuote.displayName = 'MessageQuote';

const MessageActionIcon: React.FC<{ icon: string }> = (props) => (
  <div className="px-1 w-7 h-7 flex justify-center items-center opacity-60 hover:opacity-100">
    <Icon icon={props.icon} />
  </div>
);

/**
 * 普通消息
 */
export const NormalMessage: React.FC<ChatMessageItemProps> = React.memo(
  (props) => {
    const {
      showAvatar,
      isMergedPrev,
      isMergedNext,
      payload,
      hideAction = false,
      isGroup,
      groupId,
      panelId,
    } = props;
    const userInfo = useCachedUserInfo(payload.author ?? '');
    const currentUser = useUserInfo();
    const groupInfo = useGroupInfo(groupId ?? '');
    const isSelf = payload.author === currentUser?._id;
    const layout = getChatMessageLayout({ isGroup, isSelf });
    const roleStyle =
      !isSelf && isGroup
        ? getGroupPanelRoleStyle(groupInfo, panelId, payload.author)
        : undefined;
    const userTypeBadge = getUserTypeBadgeText((userInfo as any)?.type);
    const [isActionBtnActive, setIsActionBtnActive] = useState(false);
    const { settings } = useUserSettings();

    const reactions = useMessageReactions(payload);

    const emojiAction = useChatMessageReactionAction(payload);
    const moreActions = useChatMessageItemAction(payload, {
      onClick: () => {
        setIsActionBtnActive(false);
      },
    });

    // 禁止对消息进行操作，因为此时消息尚未发送到远程
    const disableOperate =
      hideAction === true ||
      payload.isLocal === true ||
      payload.sendFailed === true;

    return (
      <div
        className={clsx(
          'chat-message-item flex min-w-0 px-3 py-1.5 mobile:px-0 group relative select-text text-sm',
          {
            'bg-black bg-opacity-5 dark:bg-white/5': isActionBtnActive,
            'hover:bg-black hover:bg-opacity-[0.02] dark:hover:bg-white/5': !isActionBtnActive,
            'justify-end': layout.rowAlign === 'right',
            'justify-start': layout.rowAlign === 'left',
            'pt-0.5': isMergedPrev,
          }
        )}
        data-message-id={payload._id}
      >
        {/* 头像 */}
        <div
          className={clsx(
            'w-14 mobile:w-12 flex-shrink-0 flex items-start justify-center pt-0.5',
            {
              'order-2': layout.rowAlign === 'right',
              'order-1': layout.rowAlign === 'left',
            }
          )}
        >
          {showAvatar ? (
            <Popover
              content={
                !_isEmpty(userInfo) && (
                  <UserPopover userInfo={userInfo as UserBaseInfo} />
                )
              }
              placement="top"
              trigger="click"
            >
              <Avatar
                className="cursor-pointer"
                size={36}
                src={userInfo.avatar}
                name={userInfo.nickname}
                style={
                  roleStyle?.avatarRingColor
                    ? {
                        boxShadow: `0 0 0 2px ${roleStyle.avatarRingColor}`,
                      }
                    : undefined
                }
              />
            </Popover>
          ) : (
            <div
              className={clsx('hidden group-hover:block opacity-40 text-[11px]', {
                'text-right w-full pr-1': layout.rowAlign === 'right',
                'text-left w-full pl-1': layout.rowAlign === 'left',
              })}
            >
              {formatShortTime(payload.createdAt)}
            </div>
          )}
        </div>

        {/* 主体 */}
        <Dropdown
          menu={moreActions}
          placement="bottomLeft"
          trigger={['contextMenu']}
          disabled={settings['disableMessageContextMenu']}
          onOpenChange={setIsActionBtnActive}
        >
          <div
            className={clsx('flex min-w-0 flex-col flex-1 overflow-hidden group', {
              'items-end order-1': layout.rowAlign === 'right',
              'items-start order-2': layout.rowAlign === 'left',
            })}
            onContextMenu={stopPropagation}
          >
            {showAvatar && layout.showNickname && (
              <div className="flex min-w-0 items-center mb-0.5 px-1">
                <div
                  className="text-[12px] text-gray-500 dark:text-gray-400 truncate"
                  style={
                    roleStyle?.nicknameColor
                      ? { color: roleStyle.nicknameColor }
                      : undefined
                  }
                >
                  {userInfo.nickname || <span>&nbsp;</span>}
                </div>
                {userTypeBadge && (
                  <div className="ml-1 px-1.5 py-0.5 rounded-full bg-[#eef6ff] dark:bg-[#1e3a5f] text-[#2563eb] dark:text-[#93c5fd] text-[10px] leading-none flex-shrink-0">
                    {userTypeBadge}
                  </div>
                )}
                <div className="hidden group-hover:block opacity-40 ml-1 text-sm flex-shrink-0">
                  {formatShortTime(payload.createdAt)}
                </div>
              </div>
            )}

            {/* 消息内容 */}
            <AutoFolder
              maxHeight={340}
              backgroundColor="var(--tc-content-background-color)"
              showFullText={
                <div className="inline-block rounded-full bg-white dark:bg-[#2b2b2b] opacity-80 py-2 px-3 hover:opacity-100 border border-black/5 dark:border-white/10">
                  {t('点击展开更多')}
                </div>
              }
            >
              <div
                className={clsx(
                  'chat-message-item_body min-w-0 leading-6 break-words overflow-x-hidden px-3.5 py-2.5 max-w-[72%] mobile:max-w-[82%]',
                  isSelf
                    ? 'bg-[#95ec69] text-[#111827]'
                    : 'bg-white text-[#111827] border border-black/5 dark:bg-[#2b2b2b] dark:text-[#f3f4f6] dark:border-white/10',
                  layout.rowAlign === 'right'
                    ? clsx('rounded-[18px]', {
                        'rounded-tr-[6px]': showAvatar,
                        'rounded-tr-[10px]': !showAvatar,
                        'rounded-br-[10px]': isMergedNext,
                      })
                    : clsx('rounded-[18px]', {
                        'rounded-tl-[6px]': showAvatar,
                        'rounded-tl-[10px]': !showAvatar,
                        'rounded-bl-[10px]': isMergedNext,
                      })
                )}
                style={{
                  alignSelf:
                    layout.bubbleAlign === 'right' ? 'flex-end' : 'flex-start',
                  ...(roleStyle?.sideAccentColor && !isSelf
                    ? {
                        boxShadow: `inset 3px 0 0 ${roleStyle.sideAccentColor}, 0 1px 2px rgba(0, 0, 0, 0.04)`,
                      }
                    : {}),
                }}
              >
                <MessageQuote payload={payload} />

                <span>{getMessageRender(payload.content)}</span>

                {payload.sendFailed === true && (
                  <Icon
                    className="inline-block ml-1"
                    icon="emojione:cross-mark-button"
                  />
                )}

                {/* 解释器按钮 */}
                {useRenderPluginMessageInterpreter(payload.content)}
              </div>
            </AutoFolder>

            {/* 额外渲染 */}
            <div>
              {pluginMessageExtraParsers.map((parser) => (
                <React.Fragment key={parser.name}>
                  {parser.render(payload)}
                </React.Fragment>
              ))}
            </div>

            {/* 消息反应 */}
            {reactions}
          </div>
        </Dropdown>

        {/* 操作 */}
        {!disableOperate && (
          <div
            className={clsx(
              'bg-white/95 dark:bg-[#1f1f1f]/95 rounded-full absolute right-2 cursor-pointer -top-3 shadow-[0_6px_18px_rgba(15,23,42,0.12)] flex border border-black/5 dark:border-white/10 backdrop-blur-sm',
              {
                'opacity-0 group-hover:opacity-100 bg-opacity-80 hover:bg-opacity-100':
                  !isActionBtnActive,
                'opacity-100 bg-opacity-100': isActionBtnActive,
                'right-2': layout.rowAlign === 'left',
                'left-14 mobile:left-11 right-auto': layout.rowAlign === 'right',
                '-top-2': isMergedPrev,
              }
            )}
          >
            <TcPopover
              overlayClassName="chat-message-item_action-popover"
              content={emojiAction}
              placement="bottomLeft"
              trigger={['click']}
              onOpenChange={setIsActionBtnActive}
            >
              <div>
                <MessageActionIcon icon="mdi:emoticon-happy-outline" />
              </div>
            </TcPopover>

            <Dropdown
              menu={moreActions}
              placement="bottomRight"
              trigger={['click']}
              onOpenChange={setIsActionBtnActive}
            >
              <div>
                <MessageActionIcon icon="mdi:dots-horizontal" />
              </div>
            </Dropdown>
          </div>
        )}
      </div>
    );
  }
);
NormalMessage.displayName = 'NormalMessage';

/**
 * 系统消息
 */
const SystemMessage: React.FC<ChatMessageItemProps> = React.memo(
  ({ payload }) => {
    return (
      <div className="text-center py-1">
        <div className="bg-[#e5e7eb] dark:bg-[#2b2b2b] text-[#6b7280] dark:text-[#d1d5db] rounded-full inline-block py-1 px-3 my-1 mx-2 text-[12px]">
          {payload.content}
        </div>
      </div>
    );
  }
);
SystemMessage.displayName = 'SystemMessage';

/**
 * 带userId => nickname异步解析的SystemMessage 组件
 */
const SystemMessageWithNickname: React.FC<
  ChatMessageItemProps & {
    userIds: string[];
    overwritePayload: (nicknameList: string[]) => ChatMessage;
  }
> = React.memo((props) => {
  const userInfos = useUserInfoList(props.userIds);
  const nicknameList = userInfos.map((user) => user.nickname);

  return (
    <SystemMessage {...props} payload={props.overwritePayload(nicknameList)} />
  );
});
SystemMessageWithNickname.displayName = 'SystemMessageWithNickname';

interface ChatMessageItemProps {
  showAvatar: boolean;
  isMergedPrev: boolean;
  isMergedNext: boolean;
  payload: LocalChatMessage;
  isGroup: boolean;
  groupId?: string;
  panelId?: string;
  hideAction?: boolean;
}
const ChatMessageItem: React.FC<ChatMessageItemProps> = React.memo((props) => {
  const payload = props.payload;
  if (payload.author === SYSTEM_USERID) {
    // 系统消息
    return <SystemMessage {...props} />;
  } else if (payload.hasRecall === true) {
    // 撤回消息
    return (
      <SystemMessageWithNickname
        {...props}
        userIds={[payload.author ?? SYSTEM_USERID]}
        overwritePayload={(nicknameList) => ({
          ...payload,
          content: t('{{nickname}} 撤回了一条消息', {
            nickname: nicknameList[0] || '',
          }),
        })}
      />
    );
  }

  // 普通消息
  return <NormalMessage {...props} />;
});
ChatMessageItem.displayName = 'ChatMessageItem';

/**
 * 构造聊天项
 */
export function buildMessageItemRow(
  messages: LocalChatMessage[],
  index: number,
  isGroup: boolean,
  groupId?: string,
  panelId?: string
) {
  const message = messages[index];

  if (!message) {
    return <div />;
  }

  let showDate = true;
  let showAvatar = true;
  let isMergedPrev = false;
  let isMergedNext = false;
  const messageCreatedAt = new Date(message.createdAt ?? '');
  if (index > 0) {
    // 当不是第一条数据时

    // 进行时间合并
    const prevMessage = messages[index - 1];
    if (
      !shouldShowMessageTime(
        new Date(prevMessage.createdAt ?? ''),
        messageCreatedAt
      )
    ) {
      showDate = false;
    }

    // 进行头像合并(在同一时间块下 且发送者为同一人)
    if (showDate === false) {
      showAvatar =
        prevMessage.author !== message.author || prevMessage.hasRecall === true;
      isMergedPrev = !showAvatar;
    }
  }

  const nextMessage = messages[index + 1];
  if (nextMessage) {
    const nextCreatedAt = new Date(nextMessage.createdAt ?? '');
    if (
      !shouldShowMessageTime(messageCreatedAt, nextCreatedAt) &&
      nextMessage.author === message.author &&
      nextMessage.hasRecall !== true
    ) {
      isMergedNext = true;
    }
  }

  return (
    <div key={message._id}>
      {showDate && (
        <Divider className="text-xs opacity-100 px-6 font-normal select-text border-black/5 dark:border-white/10 my-3">
          <span className="inline-flex rounded-full bg-[#f3f4f6] dark:bg-[#2b2b2b] text-[#6b7280] dark:text-[#d1d5db] px-3 py-1 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
            {showMessageTime(messageCreatedAt)}
          </span>
        </Divider>
      )}

      {message.isLocal === true ? (
        <div className="opacity-50">
          <ChatMessageItem
            showAvatar={showAvatar}
            isMergedPrev={isMergedPrev}
            isMergedNext={isMergedNext}
            payload={message}
            isGroup={isGroup}
            groupId={groupId}
            panelId={panelId}
          />
        </div>
      ) : (
        <MessageAckContainer
          converseId={message.converseId}
          messageId={message._id}
        >
          <ChatMessageItem
            showAvatar={showAvatar}
            isMergedPrev={isMergedPrev}
            isMergedNext={isMergedNext}
            payload={message}
            isGroup={isGroup}
            groupId={groupId}
            panelId={panelId}
          />
        </MessageAckContainer>
      )}
    </div>
  );
}
