import { AvatarUploader } from '@/components/ImageUploader';
import {
  DefaultFullModalInputEditorRender,
  FullModalField,
} from '@/components/FullModal/Field';
import { openModal } from '@/components/Modal';
import { closeModal, pluginUserExtraInfo } from '@/plugin/common';
import { setUserJWT } from '@/utils/jwt-helper';
import { Button, Tag } from 'antd';
import React, { useCallback } from 'react';
import { Avatar } from 'tailchat-design';
import {
  model,
  modifyUserField,
  showSuccessToasts,
  showToasts,
  t,
  UploadFileResult,
  useAlphaMode,
  useAppDispatch,
  useAsyncRequest,
  userActions,
  useUserInfo,
} from 'tailchat-shared';
import { ModifyPassword } from '../ModifyPassword';

export const SettingsAccount: React.FC = React.memo(() => {
  const userInfo = useUserInfo();
  const dispatch = useAppDispatch();
  const { isAlphaMode } = useAlphaMode();
  const userExtra = userInfo?.extra ?? {};

  const [, handleUserAvatarChange] = useAsyncRequest(
    async (fileInfo: UploadFileResult) => {
      await modifyUserField('avatar', fileInfo.url);
      dispatch(
        userActions.setUserInfoField({
          fieldName: 'avatar',
          fieldValue: fileInfo.url,
        })
      );
      showToasts(t('修改头像成功'), 'success');
    },
    []
  );

  const [, handleUpdateNickName] = useAsyncRequest(
    async (newNickname: string) => {
      await modifyUserField('nickname', newNickname);
      dispatch(
        userActions.setUserInfoField({
          fieldName: 'nickname',
          fieldValue: newNickname,
        })
      );
      showToasts(t('修改昵称成功'), 'success');
    },
    []
  );

  const [, handleUpdateExtraInfo] = useAsyncRequest(
    async (fieldName: string, fieldValue: unknown) => {
      await model.user.modifyUserExtra(fieldName, fieldValue);
      dispatch(
        userActions.setUserInfoExtra({
          fieldName,
          fieldValue,
        })
      );
      showSuccessToasts(t('修改成功'));
    },
    []
  );

  const handleUpdatePassword = useCallback(() => {
    const key = openModal(<ModifyPassword onSuccess={() => closeModal(key)} />);
  }, []);

  // 登出
  const handleLogout = useCallback(async () => {
    await setUserJWT(null);

    window.location.replace('/'); // 重载页面以清空所有状态
  }, []);

  if (!userInfo) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="rounded-[24px] border border-black/5 dark:border-white/10 bg-white p-6 shadow-[0_8px_20px_rgba(15,23,42,0.04)]">
        <div className="text-lg font-semibold text-gray-900 dark:text-white mb-5">
          個人資料
        </div>
        <div className="flex flex-wrap">
          <div className="w-1/3 mobile:w-full">
            <AvatarUploader
              circle={true}
              usage="user"
              onUploadSuccess={handleUserAvatarChange}
            >
              <Avatar size={128} src={userInfo.avatar} name={userInfo.nickname} />
            </AvatarUploader>
          </div>
          <div className="w-2/3 mobile:w-full">
            {isAlphaMode && (
              <FullModalField title={t('用户ID')} content={userInfo._id} />
            )}
            <FullModalField
              title={t('用户昵称')}
              value={userInfo.nickname}
              editable={true}
              renderEditor={DefaultFullModalInputEditorRender}
              onSave={handleUpdateNickName}
            />

            <FullModalField
              title={t('账号')}
              content={
                <div>
                  <span className="mr-1">{userInfo.email}</span>
                  {userInfo.temporary && (
                    <Tag color="warning" className="select-none">
                      {t('临时账号')}
                    </Tag>
                  )}
                </div>
              }
            />

            {pluginUserExtraInfo.map((item, i) => {
              if (item.component && item.component.editor) {
                const Component = item.component.editor;
                return (
                  <Component
                    key={item.name + i}
                    value={userExtra[item.name]}
                    onSave={(val) => handleUpdateExtraInfo(item.name, val)}
                  />
                );
              }

              return (
                <FullModalField
                  key={item.name + i}
                  title={item.label}
                  value={userExtra[item.name] ? String(userExtra[item.name]) : ''}
                  editable={true}
                  renderEditor={DefaultFullModalInputEditorRender}
                  onSave={(val) => handleUpdateExtraInfo(item.name, val)}
                />
              );
            })}
          </div>
        </div>
      </div>

      <div className="rounded-[24px] border border-black/5 dark:border-white/10 bg-white p-6 shadow-[0_8px_20px_rgba(15,23,42,0.04)]">
        <div className="text-lg font-semibold text-gray-900 dark:text-white mb-5">
          賬號與安全
        </div>
        <Button type="primary" onClick={handleUpdatePassword}>
          {t('修改密码')}
        </Button>
      </div>

      <div className="rounded-[24px] border border-red-200 dark:border-red-900/40 bg-red-50/80 dark:bg-red-500/10 p-6">
        <div className="text-lg font-semibold text-red-600 dark:text-red-300 mb-5">
          賬號操作
        </div>
        <Button type="primary" danger={true} onClick={handleLogout}>
          {t('退出登录')}
        </Button>
      </div>
    </div>
  );
});
SettingsAccount.displayName = 'SettingsAccount';
