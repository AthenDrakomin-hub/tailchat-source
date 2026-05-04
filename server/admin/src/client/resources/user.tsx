import React from 'react';
import {
  createTextField,
  ListTable,
  Message,
  Modal,
  useRefreshList,
  useResourceContext,
  useTranslation,
  useUpdate,
} from 'tushan';
import { userFields } from '../fields';
import { request } from '../request';
import { formatAdminError } from '../utils/admin-error';

export const UserList: React.FC = React.memo(() => {
  const { t } = useTranslation();
  const [update] = useUpdate();
  const resource = useResourceContext();
  const refreshUser = useRefreshList(resource);

  return (
    <ListTable
      filter={[
        createTextField('q', {
          label: 'Search',
        }),
      ]}
      fields={userFields}
      action={{
        create: true,
        detail: true,
        edit: true,
        delete: true,
        refresh: true,
        export: true,
        custom: (record) => [
          {
            key: 'wxNotifyStatus',
            label: t('custom.action.wxNotifyStatus'),
            onClick: () => {
              const binding = record?.extra?.wxNotifyBinding;
              const isBound = Boolean(binding?.uid);
              Modal.confirm({
                title: t('custom.action.wxNotifyStatus'),
                content: (
                  <div style={{ lineHeight: 1.9 }}>
                    <div>
                      {t('custom.action.wxNotifyBound')}: {isBound ? '是' : '否'}
                    </div>
                    <div>
                      {t('custom.action.wxNotifyProvider')}: {binding?.provider ?? '-'}
                    </div>
                    <div>
                      {t('custom.action.wxNotifyUid')}: {binding?.uid ?? '-'}
                    </div>
                    <div>
                      {t('custom.action.wxNotifyBoundAt')}:{' '}
                      {binding?.boundAt ?? '-'}
                    </div>
                  </div>
                ),
                hideCancel: true,
                okText: t('tushan.common.confirm'),
              });
            },
          },
          {
            key: 'resetPassword',
            label: t('custom.action.resetPassword'),
            onClick: () => {
              const { close } = Modal.confirm({
                title: t('tushan.common.confirmTitle'),
                content: t('custom.action.resetPasswordTip'),
                onConfirm: async () => {
                  try {
                    await update(resource, {
                      id: record.id,
                      data: {
                        password:
                          '$2a$10$eSebpg0CEvsbDC7j1NxB2epMUkYwKhfT8vGdPQYkfeXYMqM8HjnpW', // 123456789
                      },
                    });
                    Message.success(t('tushan.common.success'));
                    close();
                  } catch (err) {
                    console.error(err);
                    Message.error(formatAdminError(err, '用户管理操作失败'));
                  }
                },
              });
            },
          },
          !record.banned
            ? {
                key: 'banUser',
                label: t('custom.action.banUser'),
                onClick: () => {
                  const { close } = Modal.confirm({
                    title: t('tushan.common.confirmTitle'),
                    content: t('custom.action.banUserDesc'),
                    onConfirm: async () => {
                      try {
                        await request.post('/user/ban', {
                          userId: record.id,
                        });
                        Message.success(t('tushan.common.success'));
                        refreshUser();
                        close();
                      } catch (err) {
                        console.error(err);
                        Message.error(formatAdminError(err, '用户管理操作失败'));
                      }
                    },
                  });
                },
              }
            : {
                key: 'unbanUser',
                label: t('custom.action.unbanUser'),
                onClick: () => {
                  const { close } = Modal.confirm({
                    title: t('tushan.common.confirmTitle'),
                    content: t('custom.action.unbanUserDesc'),
                    onConfirm: async () => {
                      try {
                        await request.post('/user/unban', {
                          userId: record.id,
                        });
                        Message.success(t('tushan.common.success'));
                        refreshUser();
                        close();
                      } catch (err) {
                        console.error(err);
                        Message.error(formatAdminError(err, '用户管理操作失败'));
                      }
                    },
                  });
                },
              },
        ],
      }}
    />
  );
});
UserList.displayName = 'UserList';
