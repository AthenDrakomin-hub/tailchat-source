import { Icon } from 'tailchat-design';
import React from 'react';
import { useGroupInfo, t } from 'tailchat-shared';
import { ModalWrapper } from '../../Modal';
import { CreateInviteCode } from './CreateInviteCode';

/**
 * 群组邀请
 */

interface CreateGroupInviteProps {
  groupId: string;
  onInviteCreated?: () => void;
  onInviteUpdated?: () => void;
}
export const CreateGroupInvite: React.FC<CreateGroupInviteProps> = React.memo(
  (props) => {
    const groupId = props.groupId;
    const groupInfo = useGroupInfo(groupId);
    // const [searchName, setSearchName] = useState('');

    // const handleSearch = useCallback(() => {
    //   console.log('searchName', searchName);
    // }, []);

    if (!groupInfo) {
      return <div>{t('异常')}</div>;
    }

    return (
      <ModalWrapper title={t('邀请加入群聊')}>
        <div className="rounded-[24px] border border-black/5 dark:border-white/10 bg-white dark:bg-tc-bg-elevated px-5 py-5 text-center shadow-[0_8px_20px_rgba(15,23,42,0.04)]">
          <Icon
            className="text-6xl block m-auto opacity-30 mb-4 mt-2 text-tc-primary"
            icon="mdi:email-edit-outline"
          />

          <div className="text-tc-text-primary dark:text-white font-semibold text-lg mb-1">
            {groupInfo.name}
          </div>
          <div className="text-gray-500 dark:text-gray-400 text-sm mb-5">
            {t('创建链接并发送给外部联系人')}
          </div>

          <CreateInviteCode
            groupId={groupId}
            onInviteCreated={props.onInviteCreated}
            onInviteUpdated={props.onInviteUpdated}
          />
        </div>
      </ModalWrapper>
    );
  }
);
CreateGroupInvite.displayName = 'GroupInvite';
