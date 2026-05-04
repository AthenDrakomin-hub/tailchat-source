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
import { buildConversePreview } from './conversePreview';

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

    const { value: lastSenderName } = useAsync(async () => {
      if (!lastMessage?.author || lastMessage.author === userId) {
        return undefined;
      }

      const user = await getCachedUserInfo(lastMessage.author);
      return user.nickname;
    }, [lastMessage?.author, userId]);

    const [, handleRemove] = useAsyncRequest(async () => {
      dispatch(chatActions.removeConverse({ converseId }));
      await model.user.removeUserDMConverse(converseId);
    }, [converseId]);
    const roleLabel = getConverseRoleLabel(name);
    const previewText = buildConversePreview({
      hasMessage: Boolean(lastMessage),
      content: typeof lastMessage?.content === 'string' ? lastMessage.content : '',
      hasRecall: lastMessage?.hasRecall,
      roleLabel,
      senderName: lastSenderName,
      isMultiMember: converse.members.length > 2,
    });

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
        trailing={lastMessage?.createdAt ? formatShortTime(lastMessage.createdAt) : undefined}
        to={getPersonalChatPath(converseId)}
        badge={hasUnread}
        avatarName={name}
      />
    );
  }
);
