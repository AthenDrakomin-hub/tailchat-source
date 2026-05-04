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
import { Button, Tag } from 'antd';
import { useNavigate } from 'react-router';
import { UserProfileContainer } from '@/components/UserProfileContainer';
import { getPersonalChatPath } from '@/utils/personal-route';
import { getUserRelationshipState } from '@/components/popover/UserPopover/relationship';
import { openModal } from '@/components/Modal';
import { SetFriendNickname } from '@/components/modals/SetFriendNickname';
import { UserIdentityTags } from '@/components/popover/UserPopover/UserIdentityTags';

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

  return (
    <div className="p-4 space-y-4">
      <UserProfileContainer userInfo={userInfo}>
        <div className="text-xl font-semibold text-[#111827] dark:text-white">
          {friendInfo?.nickname || userInfo.nickname}
          <span className="ml-1 text-sm font-normal text-gray-400">
            #{userInfo.discriminator}
          </span>
        </div>

        <div className="mt-2 flex flex-wrap gap-2">
          {relationshipState === 'friend' && (
            <Tag color="green">{t('已是联系人')}</Tag>
          )}
          {(relationshipState === 'requested' || requested) && (
            <Tag color="processing">{t('已发送申请')}</Tag>
          )}
          {friendInfo?.nickname && <Tag>{t('已设置备注')}</Tag>}
          <UserIdentityTags userInfo={userInfo} />
        </div>
      </UserProfileContainer>

      <div className="rounded-[24px] border border-black/5 dark:border-white/10 bg-white dark:bg-[#232323] px-4 py-4 shadow-[0_8px_20px_rgba(15,23,42,0.04)]">
        <div className="text-sm font-semibold text-[#111827] dark:text-white mb-3">
          {t('常用操作')}
        </div>
        <div className="grid grid-cols-2 gap-3">
          {relationshipState !== 'self' && (
            <Button size="large" onClick={handleCreateConverse}>
              {t('发消息')}
            </Button>
          )}
          {relationshipState === 'friend' && (
            <Button
              size="large"
              onClick={() => navigate(`/main/feed/user/${userInfo._id}`)}
            >
              {t('查看动态')}
            </Button>
          )}
          {relationshipState === 'friend' && (
            <Button size="large" onClick={handleSetFriendNickname}>
              {t('设置备注')}
            </Button>
          )}
          {relationshipState === 'friend' && (
            <Button danger size="large" onClick={handleRemoveFriend}>
              {t('删除联系人')}
            </Button>
          )}
          {relationshipState === 'stranger' && !requested && !userInfo.temporary && (
            <Button type="primary" size="large" onClick={handleAddFriend}>
              {t('申请联系人')}
            </Button>
          )}
        </div>
      </div>

      <div className="rounded-[24px] border border-black/5 dark:border-white/10 bg-white dark:bg-[#232323] px-4 py-4 shadow-[0_8px_20px_rgba(15,23,42,0.04)]">
        <div className="text-sm font-semibold text-[#111827] dark:text-white mb-3">
          {t('资料信息')}
        </div>
        <div className="space-y-3 text-sm">
          <div className="flex items-start justify-between gap-3">
            <span className="text-gray-400">{t('昵称')}</span>
            <span className="text-right text-[#111827] dark:text-white">
              {userInfo.nickname}
            </span>
          </div>
          <div className="flex items-start justify-between gap-3">
            <span className="text-gray-400">{t('标识')}</span>
            <span className="text-right text-[#111827] dark:text-white">
              #{userInfo.discriminator}
            </span>
          </div>
          {friendInfo?.nickname && (
            <div className="flex items-start justify-between gap-3">
              <span className="text-gray-400">{t('备注')}</span>
              <span className="text-right text-[#111827] dark:text-white">
                {friendInfo.nickname}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});
ProfilePanel.displayName = 'ProfilePanel';
