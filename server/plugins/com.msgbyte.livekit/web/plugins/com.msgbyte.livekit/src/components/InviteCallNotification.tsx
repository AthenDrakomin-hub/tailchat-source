import React from 'react';
import styled from 'styled-components';
import { Translate } from '../translate';
import { Button, UserNamePure } from '@capital/component';

const Root = styled.div`
  padding: 1rem 1rem 0.875rem;
  border-radius: 1rem;
  background: rgba(15, 23, 42, 0.88);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.18);
  color: rgba(255, 255, 255, 0.94);

  .summary {
    line-height: 1.7;
  }

  .tip {
    margin-top: 0.375rem;
    font-size: 0.8125rem;
    color: rgba(255, 255, 255, 0.64);
  }

  .actions {
    display: flex;
    gap: 8px;
    justify-content: flex-end;
    margin-top: 16px;
  }
`;

interface InviteCallNotificationProps {
  senderUserId: string;
  roomName: string;
  onJoin?: () => void;
}
const InviteCallNotification: React.FC<InviteCallNotificationProps> =
  React.memo((props) => {
    return (
      <Root>
        <audio src="/audio/telephone.mp3" loop={true} autoPlay={true} />
        <div className="summary">
          <b>
            <UserNamePure userId={props.senderUserId} />
          </b>{' '}
          {Translate.inviteJoinCall}
        </div>
        <div className="tip">点击接听后可直接在当前应用内进入语音通话。</div>
        <div className="actions">
          <Button type="primary" onClick={props.onJoin} icon="mdi:phone-in-talk">
            接听
          </Button>
        </div>
      </Root>
    );
  });
InviteCallNotification.displayName = 'InviteCallNotification';

export default InviteCallNotification;
