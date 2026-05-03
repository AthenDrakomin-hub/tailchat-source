import React from 'react';
import type { MenuProps } from 'antd';
import _isNil from 'lodash/isNil';
import _compact from 'lodash/compact';
import {
  PERMISSION,
  useGroupInfo,
  useHasGroupPermission,
  useTranslation,
} from 'tailchat-shared';
import { SectionHeader } from '@/components/SectionHeader';
import { useGroupHeaderAction } from './useGroupHeaderAction';

interface GroupHeaderProps {
  groupId: string;
}
export const GroupHeader: React.FC<GroupHeaderProps> = React.memo((props) => {
  const { groupId } = props;
  const groupInfo = useGroupInfo(groupId);
  const { t } = useTranslation();
  const [showGroupDetail, showInvite] = useHasGroupPermission(groupId, [
    PERMISSION.core.groupDetail,
    PERMISSION.core.invite,
  ]);

  const { handleShowGroupDetail, handleInviteUser, handleQuitGroup } =
    useGroupHeaderAction(groupId);

  if (_isNil(groupInfo)) {
    return null;
  }

  const menu: MenuProps = {
    items: _compact([
      showGroupDetail && {
        key: '0',
        label: t('查看详情'),
        onClick: handleShowGroupDetail,
      },
      showInvite && {
        key: '1',
        label: t('邀请用户'),
        onClick: handleInviteUser,
      },
      {
        key: '2',
        label: t('退出群组'),
        danger: true,
        onClick: handleQuitGroup,
      },
    ] as MenuProps['items']),
  };

  return (
    <SectionHeader menu={menu} data-testid="group-header">
      <div className="min-w-0">
        <div className="truncate font-semibold">{groupInfo?.name}</div>
        <div className="text-[11px] font-normal text-gray-500 dark:text-gray-400 truncate">
          {t('群聊')}
        </div>
        {groupInfo?.description && (
          <div className="mt-1 text-[11px] leading-5 font-normal text-gray-500 dark:text-gray-400 line-clamp-2 whitespace-pre-wrap">
            {groupInfo.description}
          </div>
        )}
      </div>
    </SectionHeader>
  );
});
GroupHeader.displayName = 'GroupHeader';
