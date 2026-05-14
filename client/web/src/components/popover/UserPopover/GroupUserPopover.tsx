import { UserName } from '@/components/UserName';
import { fetchImagePrimaryColor } from '@/utils/image-helper';
import { Button, Space, Tag } from 'antd';
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
import { SetFriendNickname } from '@/components/modals/SetFriendNickname';
import { openModal } from '@/components/Modal';
import { UserIdentityTags } from './UserIdentityTags';

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
  const friendInfo = useAppSelector((state) =>
    state.user.friends.find((item) => item.id === userId)
  );
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
  const handleSetFriendNickname = () => {
    openModal(<SetFriendNickname userId={userId} />);
  };

  useEffect(() => {
    if (userInfo.avatar) {
      fetchImagePrimaryColor(userInfo.avatar).then((rgba) => {
      });
    }
  }, [userInfo.avatar]);

  return (
    <div className="w-80 -mx-2 -my-2 bg-transparent">
      <UserProfileContainer userInfo={userInfo}>
        <div className="text-xl text-[#111827] dark:text-white">
          <span className="font-semibold">
            {friendInfo?.nickname || <UserName userId={userId} />}
          </span>
          {!hideGroupMemberDiscriminator && (
            <span className="opacity-60 ml-1 text-sm">#{userInfo.discriminator}</span>
          )}
        </div>

        <Space size={4} wrap={true} className="py-1">
          {relationshipState === 'friend' && (
            <Tag color="green">{t('已是联系人')}</Tag>
          )}
          {(relationshipState === 'requested' || requested) && (
            <Tag color="processing">{t('已发送申请')}</Tag>
          )}
          {friendInfo?.nickname && <Tag>{t('已设置备注')}</Tag>}
          {groupInfo.owner === userId && <Tag color="gold">{t('创建者')}</Tag>}

          <UserIdentityTags userInfo={userInfo} />

          {roleNames.map((name) => (
            <Tag key={name} color={getTextColorHex(name)}>
              {name}
            </Tag>
          ))}
        </Space>

        <div className="pt-2">{pluginUserExtraInfoEl}</div>

        <div className="pt-3 grid grid-cols-2 gap-2">
          {allowSendMessage && relationshipState !== 'self' && (
            <Button onClick={handleCreateConverse}>{t('发消息')}</Button>
          )}
          {relationshipState === 'friend' && (
            <Button onClick={() => navigate(`/main/feed/user/${userId}`)}>
              {t('查看动态')}
            </Button>
          )}
          {relationshipState === 'friend' && (
            <Button onClick={handleSetFriendNickname}>{t('设置备注')}</Button>
          )}
          {relationshipState === 'stranger' && !requested && !userInfo.temporary && (
            <Button type="primary" className="col-span-2" onClick={handleAddFriend}>
              {t('申请联系人')}
            </Button>
          )}
        </div>

        <div className="mt-4 rounded-2xl bg-[#f7f7f7] dark:bg-white/5 px-3 py-3 text-sm">
          <div className="flex items-start justify-between gap-3">
            <span className="text-gray-400">{t('昵称')}</span>
            <span className="text-right text-[#111827] dark:text-white">
              {userInfo.nickname}
            </span>
          </div>
          {friendInfo?.nickname && (
            <div className="mt-2 flex items-start justify-between gap-3">
              <span className="text-gray-400">{t('备注')}</span>
              <span className="text-right text-[#111827] dark:text-white">
                {friendInfo.nickname}
              </span>
            </div>
          )}
          {roleNames.length > 0 && (
            <div className="mt-2 flex items-start justify-between gap-3">
              <span className="text-gray-400">{t('群内角色')}</span>
              <span className="text-right text-[#111827] dark:text-white">
                {roleNames.join(' / ')}
              </span>
            </div>
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
