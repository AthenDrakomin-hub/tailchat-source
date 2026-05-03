import {
  chatActions,
  ChatConverseState,
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

    return (
      <SidebarItem
        key={converseId}
        name={
          <div className="min-w-0 flex items-center gap-2">
            <span className="truncate">{name}</span>
            {roleLabel && (
              <span className="rounded-full bg-[#e5e7eb] dark:bg-white/10 px-2 py-0.5 text-[10px] leading-4 text-gray-500 dark:text-gray-300">
                {roleLabel}
              </span>
            )}
          </div>
        }
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
        to={getPersonalChatPath(converseId)}
        badge={hasUnread}
        avatarName={name}
      />
    );
  }
);
SidebarDMItem.displayName = 'SidebarDMItem';
