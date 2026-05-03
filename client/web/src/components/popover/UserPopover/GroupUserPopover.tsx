import { IconBtn } from '@/components/IconBtn';
import { UserName } from '@/components/UserName';
import { fetchImagePrimaryColor } from '@/utils/image-helper';
import { Space, Tag, Tooltip } from 'antd';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { getTextColorHex } from 'tailchat-design';
import {
  addFriendRequest,
  createDMConverse,
  getGroupConfigWithInfo,
  GroupInfo,
  showErrorToasts,
  showToasts,
  t,
  useAppSelector,
  useAsyncRequest,
  UserBaseInfo,
  useUserId,
} from 'tailchat-shared';
import { UserProfileContainer } from '../../UserProfileContainer';
import { usePluginUserExtraInfo } from './usePluginUserExtraInfo';
import { getPersonalChatPath } from '@/utils/personal-route';
import { getUserRelationshipState } from './relationship';

export const GroupUserPopover: React.FC<{
  userInfo: UserBaseInfo;
  groupInfo: GroupInfo;
}> = React.memo((props) => {
  const { userInfo, groupInfo } = props;
  const userId = userInfo._id;
  const userExtra = userInfo.extra ?? {};
  const roleNames = getUserRoleNames(userId, groupInfo);
  const { hideGroupMemberDiscriminator, disableCreateConverseFromGroup } =
    getGroupConfigWithInfo(groupInfo);
  const pluginUserExtraInfoEl = usePluginUserExtraInfo(userExtra);
  const navigate = useNavigate();
  const currentUserId = useUserId();
  const friends = useAppSelector((state) => state.user.friends);
  const friendRequests = useAppSelector((state) => state.user.friendRequests);
  const relationshipState = getUserRelationshipState({
    currentUserId,
    targetUserId: userId,
    friends,
    friendRequests,
  });
  const [requested, setRequested] = useState(false);

  const allowSendMessage =
    !hideGroupMemberDiscriminator &&
    !disableCreateConverseFromGroup &&
    currentUserId !== userId;

  const [, handleCreateConverse] = useAsyncRequest(async () => {
    const converse = await createDMConverse([userId]);
    navigate(getPersonalChatPath(converse._id));
  }, [navigate]);
  const [, handleAddFriend] = useAsyncRequest(async () => {
    try {
      await addFriendRequest(userId);
      setRequested(true);
      showToasts(t('已发送申请'), 'success');
    } catch (err) {
      showErrorToasts(err);
    }
  }, [userId]);

  useEffect(() => {
    if (userInfo.avatar) {
      fetchImagePrimaryColor(userInfo.avatar).then((rgba) => {
        console.log('fetchImagePrimaryColor', rgba);
      });
    }
  }, [userInfo.avatar]);

  return (
    <div className="w-80 -mx-2 -my-2 bg-transparent">
      <UserProfileContainer userInfo={userInfo}>
        <div className="text-xl">
          <span className="font-semibold">
            <UserName userId={userId} />
          </span>
          {!hideGroupMemberDiscriminator && (
            <span className="opacity-60 ml-1">#{userInfo.discriminator}</span>
          )}
        </div>

        <Space size={4} wrap={true} className="py-1">
          {relationshipState === 'friend' && (
            <Tag color="green">{t('已是联系人')}</Tag>
          )}
          {(relationshipState === 'requested' || requested) && (
            <Tag color="processing">{t('已发送申请')}</Tag>
          )}
          {groupInfo.owner === userId && <Tag color="gold">{t('创建者')}</Tag>}

          {userInfo.type === 'openapiBot' && (
            <Tag color="orange">{t('开放平台机器人')}</Tag>
          )}

          {userInfo.type === 'pluginBot' && (
            <Tag color="orange">{t('插件机器人')}</Tag>
          )}

          {userInfo.temporary && <Tag color="processing">{t('游客')}</Tag>}

          {roleNames.map((name) => (
            <Tag key={name} color={getTextColorHex(name)}>
              {name}
            </Tag>
          ))}
        </Space>

        <div className="pt-2">{pluginUserExtraInfoEl}</div>

        <div className="pt-3 flex justify-end gap-2">
          {relationshipState === 'friend' && (
            <Tooltip title={t('查看动态')}>
              <IconBtn
                icon="mdi:post-outline"
                onClick={() => navigate(`/main/feed/user/${userId}`)}
              />
            </Tooltip>
          )}
          {allowSendMessage && relationshipState !== 'self' && (
            <Tooltip title={t('发送消息')}>
              <IconBtn
                icon="mdi:message-processing-outline"
                onClick={handleCreateConverse}
              />
            </Tooltip>
          )}
          {relationshipState === 'stranger' && !requested && !userInfo.temporary && (
            <Tooltip title={t('申请联系人')}>
              <IconBtn icon="mdi:account-plus-outline" onClick={handleAddFriend} />
            </Tooltip>
          )}
        </div>
      </UserProfileContainer>
    </div>
  );
});
GroupUserPopover.displayName = 'GroupUserPopover';

/**
 * 获取用户的角色名列表
 */
function getUserRoleNames(userId: string, groupInfo: GroupInfo) {
  const roles = groupInfo.members.find((m) => m.userId === userId)?.roles ?? [];
  const roleNames = groupInfo.roles
    .filter((r) => roles.includes(r._id))
    .map((r) => r.name);

  return roleNames;
}
