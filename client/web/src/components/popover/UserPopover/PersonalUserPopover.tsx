import { UserName } from '@/components/UserName';
import { fetchImagePrimaryColor } from '@/utils/image-helper';
import { IconBtn } from '@/components/IconBtn';
import { Space, Tag, Tooltip } from 'antd';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import {
  addFriendRequest,
  createDMConverse,
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
import { getUserRelationshipState } from './relationship';
import { getPersonalChatPath } from '@/utils/personal-route';

export const PersonalUserPopover: React.FC<{
  userInfo: UserBaseInfo;
}> = React.memo((props) => {
  const { userInfo } = props;
  const userExtra = userInfo.extra ?? {};
  const pluginUserExtraInfoEl = usePluginUserExtraInfo(userExtra);
  const navigate = useNavigate();
  const currentUserId = useUserId();
  const friends = useAppSelector((state) => state.user.friends);
  const friendRequests = useAppSelector((state) => state.user.friendRequests);
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
            <UserName userId={userInfo._id} />
          </span>
          <span className="opacity-60 ml-1">#{userInfo.discriminator}</span>
        </div>

        <Space size={4} wrap={true} className="py-1">
          {relationshipState === 'friend' && (
            <Tag color="green">{t('已是联系人')}</Tag>
          )}
          {(relationshipState === 'requested' || requested) && (
            <Tag color="processing">{t('已发送申请')}</Tag>
          )}
          {userInfo.type === 'openapiBot' && (
            <Tag color="orange">{t('开放平台机器人')}</Tag>
          )}

          {userInfo.type === 'pluginBot' && (
            <Tag color="orange">{t('插件机器人')}</Tag>
          )}

          {userInfo.temporary && <Tag color="processing">{t('游客')}</Tag>}
        </Space>

        <div className="pt-2">{pluginUserExtraInfoEl}</div>

        <div className="pt-3 flex justify-end gap-2">
          {relationshipState === 'friend' && (
            <>
              <Tooltip title={t('查看动态')}>
                <IconBtn
                  icon="mdi:post-outline"
                  onClick={() => navigate(`/main/feed/user/${userInfo._id}`)}
                />
              </Tooltip>
              <Tooltip title={t('发送消息')}>
                <IconBtn
                  icon="mdi:message-processing-outline"
                  onClick={handleCreateConverse}
                />
              </Tooltip>
            </>
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
PersonalUserPopover.displayName = 'PersonalUserPopover';
