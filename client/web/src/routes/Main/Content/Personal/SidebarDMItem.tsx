import {
  chatActions,
  ChatConverseState,
  formatShortTime,
  getCachedUserInfo,
  model,
  useAppDispatch,
  useAsync,
  useAsyncRequest,
  useDMConverseName,
  useUnread,
  useUserId,
} from 'tailchat-shared';
import React from 'react';
import { SidebarItem } from '../SidebarItem';
import { CombinedAvatar, Icon } from 'tailchat-design';
import _without from 'lodash/without';
import { getPersonalChatPath } from '@/utils/personal-route';

interface SidebarDMItemProps {
  converse: ChatConverseState;
}

function getConverseRoleLabel(name: string): string | null {
  if (/(官方|系统|公告)/.test(name)) {
    return '官方';
  }

  if (/(客服|服务|助手)/.test(name)) {
    return '服务';
  }

  if (/(活动|直播|训练营|专题)/.test(name)) {
    return '活动';
  }

  return null;
}

export const SidebarDMItem: React.FC<SidebarDMItemProps> = React.memo(
  (props) => {
    const converse = props.converse;
    const converseId = converse._id;
    const name = useDMConverseName(converse);
    const userId = useUserId();
    const [hasUnread] = useUnread([converseId]);
    const dispatch = useAppDispatch();
    const lastMessage = converse.messages[converse.messages.length - 1];

    const { value: icon } = useAsync(async () => {
      if (!userId) {
        return;
      }

      const userInfos = await Promise.all(
        _without<string>(converse.members, userId).map((memberUserId) =>
          getCachedUserInfo(memberUserId)
        )
      );

      return (
        <CombinedAvatar
          items={userInfos.map((user) => ({
            name: user.nickname,
            src: user.avatar,
          }))}
        />
      );
    }, [converse.members, userId]);

    const [, handleRemove] = useAsyncRequest(async () => {
      dispatch(chatActions.removeConverse({ converseId }));
      await model.user.removeUserDMConverse(converseId);
    }, [converseId]);
    const roleLabel = getConverseRoleLabel(name);
    const previewText = getConversePreview(lastMessage, roleLabel);

    return (
      <SidebarItem
        key={converseId}
        name={<span className="truncate">{name}</span>}
        action={
          <Icon
            icon="mdi:close"
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              handleRemove();
            }}
          />
        }
        icon={icon}
        subtitle={previewText}
        trailing={converse.updatedAt ? formatShortTime(converse.updatedAt) : undefined}
        to={getPersonalChatPath(converseId)}
        badge={hasUnread}
        avatarName={name}
      />
    );
  }
);
SidebarDMItem.displayName = 'SidebarDMItem';

function getConversePreview(
  message: ChatConverseState['messages'][number] | undefined,
  roleLabel: string | null
) {
  if (!message) {
    return roleLabel ? `[${roleLabel}]` : '暂无消息';
  }

  const text =
    message.plain?.trim() ||
    (typeof message.content === 'string' ? message.content.trim() : '') ||
    (message.hasRecall ? '撤回了一条消息' : '') ||
    '新消息';

  const compactText = text.replace(/\s+/g, ' ').slice(0, 30);

  return roleLabel ? `[${roleLabel}] ${compactText}` : compactText;
}
