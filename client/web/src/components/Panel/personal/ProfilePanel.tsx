import React, { useState } from 'react';
import {
  addFriendRequest,
  createDMConverse,
  removeFriend,
  showAlert,
  showErrorToasts,
  showToasts,
  t,
  useAppDispatch,
  useAppSelector,
  useAsyncRequest,
  UserBaseInfo,
  userActions,
  useUserId,
} from 'tailchat-shared';
import { Button, Tag, Divider, Avatar } from 'antd';
import { useNavigate } from 'react-router';
import { UserProfileContainer } from '@/components/UserProfileContainer';
import { getPersonalChatPath } from '@/utils/personal-route';
import { getUserRelationshipState } from '@/components/popover/UserPopover/relationship';
import { openModal } from '@/components/Modal';
import { SetFriendNickname } from '@/components/modals/SetFriendNickname';
import { UserIdentityTags } from '@/components/popover/UserPopover/UserIdentityTags';
import { Icon } from 'tailchat-design';

export const ProfilePanel: React.FC<{
  userInfo: UserBaseInfo;
}> = React.memo(({ userInfo }) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const currentUserId = useUserId();
  const friends = useAppSelector((state) => state.user.friends);
  const friendRequests = useAppSelector((state) => state.user.friendRequests);
  const friendInfo = useAppSelector((state) =>
    state.user.friends.find((item) => item.id === userInfo._id)
  );
  const relationshipState = getUserRelationshipState({
    currentUserId,
    targetUserId: userInfo._id,
    friends,
    friendRequests,
  });
  const [requested, setRequested] = useState(false);

  const [, handleCreateConverse] = useAsyncRequest(async () => {
    const converse = await createDMConverse([userInfo._id]);
    navigate(getPersonalChatPath(converse._id));
  }, [navigate, userInfo._id]);

  const [, handleAddFriend] = useAsyncRequest(async () => {
    try {
      await addFriendRequest(userInfo._id);
      setRequested(true);
      showToasts(t('已发送申请'), 'success');
    } catch (err) {
      showErrorToasts(err);
    }
  }, [userInfo._id]);

  const handleSetFriendNickname = () => {
    openModal(<SetFriendNickname userId={userInfo._id} />);
  };

  const handleRemoveFriend = () => {
    showAlert({
      message: t(
        '是否要从自己的联系人列表中移除对方？注意：这不会影响对方自己的联系人列表。'
      ),
      onConfirm: async () => {
        try {
          await removeFriend(userInfo._id);
          dispatch(userActions.removeFriend(userInfo._id));
          showToasts(t('联系人移除成功'), 'success');
        } catch (err) {
          showErrorToasts(err);
        }
      },
    });
  };

  // 财讯号/ID
  const caixinId = `${userInfo.nickname}#${userInfo.discriminator}`;

  return (
    <div className="h-full overflow-y-auto">
      {/* 顶部个人信息卡片 - 微信风格 */}
      <div className="bg-gradient-to-b from-tc-primary/10 to-transparent px-4 pt-6 pb-4">
        <div className="flex items-start gap-4">
          {/* 头像 */}
          <div className="relative">
            <Avatar
              src={userInfo.avatar}
              size={80}
              className="border-2 border-white shadow-lg"
            >
              {userInfo.nickname.charAt(0).toUpperCase()}
            </Avatar>
            {relationshipState === 'self' && (
              <div className="absolute -bottom-1 -right-1 bg-tc-primary text-white text-xs px-2 py-0.5 rounded-full">
                我
              </div>
            )}
          </div>
          
          {/* 基本信息 */}
          <div className="flex-1 min-w-0 pt-1">
            <div className="flex items-center gap-2">
              <span className="text-xl font-semibold text-gray-900 dark:text-white truncate">
                {friendInfo?.nickname || userInfo.nickname}
              </span>
              {relationshipState === 'friend' && (
                <Tag color="green" className="text-xs">已添加</Tag>
              )}
            </div>
            
            {/* 财讯号 */}
            <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              财讯号: <span className="font-mono">{caixinId}</span>
            </div>
          </div>
        </div>

        {/* 个性签名区域 */}
        {userInfo.nickname && (
          <div className="mt-4 bg-white/60 dark:bg-tc-bg-elevated/60 rounded-xl px-4 py-3">
            <div className="text-xs text-gray-400 mb-1">个性签名</div>
            <div className="text-sm text-gray-700 dark:text-gray-200">
              {userInfo.nickname.includes('::') 
                ? userInfo.nickname.split('::')[0] 
                : '这个人很懒，什么都没写'}
            </div>
          </div>
        )}
      </div>

      <Divider className="my-0" />

      {/* 操作按钮区域 */}
      <div className="px-4 py-4 space-y-3">
        {relationshipState !== 'self' && (
          <Button
            type="primary"
            size="large"
            block
            className="h-12 text-base font-medium rounded-xl"
            onClick={handleCreateConverse}
          >
            <Icon icon="mdi:message-text" className="mr-2" />
            {t('发消息')}
          </Button>
        )}

        {relationshipState === 'friend' && (
          <>
            <Button
              size="large"
              block
              className="h-12 text-base font-medium rounded-xl"
              onClick={() => navigate(`/main/feed/user/${userInfo._id}`)}
            >
              <Icon icon="mdi:post" className="mr-2" />
              {t('查看动态')}
            </Button>
            <Button
              size="large"
              block
              className="h-12 text-base font-medium rounded-xl"
              onClick={handleSetFriendNickname}
            >
              <Icon icon="mdi:account-edit" className="mr-2" />
              {t('设置备注')}
            </Button>
            <Button
              danger
              size="large"
              block
              className="h-12 text-base font-medium rounded-xl"
              onClick={handleRemoveFriend}
            >
              <Icon icon="mdi:account-remove" className="mr-2" />
              {t('删除联系人')}
            </Button>
          </>
        )}

        {relationshipState === 'stranger' && !requested && !userInfo.temporary && (
          <Button
            type="primary"
            size="large"
            block
            className="h-12 text-base font-medium rounded-xl bg-tc-primary border-tc-primary hover:bg-tc-primary-hover"
            onClick={handleAddFriend}
          >
            <Icon icon="mdi:account-plus" className="mr-2" />
            {t('添加联系人')}
          </Button>
        )}

        {(relationshipState === 'requested' || requested) && (
          <Button
            size="large"
            block
            disabled
            className="h-12 text-base font-medium rounded-xl"
          >
            <Icon icon="mdi:clock-outline" className="mr-2" />
            {t('已发送申请')}
          </Button>
        )}
      </div>

      <Divider className="my-0" />

      {/* 详细信息区域 */}
      <div className="bg-white dark:bg-tc-bg-elevated">
        {/* 标签 */}
        {(relationshipState === 'friend' || friendInfo?.nickname) && (
          <div className="px-4 py-3">
            <div className="flex flex-wrap gap-2">
              {relationshipState === 'friend' && (
                <Tag color="green" className="text-sm px-3 py-1">
                  <Icon icon="mdi:check-circle" className="mr-1" />
                  {t('已是联系人')}
                </Tag>
              )}
              {friendInfo?.nickname && (
                <Tag color="blue" className="text-sm px-3 py-1">
                  <Icon icon="mdi:tag" className="mr-1" />
                  {t('已设置备注')}
                </Tag>
              )}
              <UserIdentityTags userInfo={userInfo} />
            </div>
          </div>
        )}

        {/* 资料信息列表 */}
        <div className="divide-y divide-gray-100 dark:divide-gray-700/50">
          <div className="px-4 py-3 flex items-center justify-between">
            <span className="text-gray-500 dark:text-gray-400">{t('昵称')}</span>
            <span className="text-gray-900 dark:text-white">{userInfo.nickname}</span>
          </div>
          <div className="px-4 py-3 flex items-center justify-between">
            <span className="text-gray-500 dark:text-gray-400">{t('财讯号')}</span>
            <span className="text-gray-900 dark:text-white font-mono">{caixinId}</span>
          </div>
          {friendInfo?.nickname && (
            <div className="px-4 py-3 flex items-center justify-between">
              <span className="text-gray-500 dark:text-gray-400">{t('备注')}</span>
              <span className="text-gray-900 dark:text-white">{friendInfo.nickname}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});
ProfilePanel.displayName = 'ProfilePanel';
