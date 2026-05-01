import { useParticipants } from '@livekit/components-react';
import * as React from 'react';
import styled from 'styled-components';
import { Icon, UserListItem } from '@capital/component';
import { useEvent } from '@capital/common';
import type { Participant } from 'livekit-client';
import { Translate } from '../../translate';

const MemberList = styled.div`
  display: flex;
  flex-direction: column;
  align-items: stretch;
  width: min(24rem, 100%);
  background: rgba(15, 23, 42, 0.88);
  border-left: 1px solid rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(12px);

  .tc-call-side-header {
    padding: 1rem 1rem 0.75rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  }

  .tc-call-side-title {
    color: rgba(255, 255, 255, 0.96);
    font-size: 1rem;
    font-weight: 600;
  }

  .tc-call-side-tip {
    margin-top: 0.25rem;
    color: rgba(255, 255, 255, 0.64);
    font-size: 0.75rem;
    line-height: 1.5;
  }

  .tc-call-member-body {
    padding: 0.75rem;
  }
`;

const IsSpeakingTip = styled.div`
  font-size: 12px;
  opacity: 0.6;
`;

export const Member: React.FC = React.memo(() => {
  const participants = useParticipants();

  const getAction = useEvent((participant: Participant) => {
    return [
      participant.isSpeaking && (
        <IsSpeakingTip>({Translate.isSpeaking})</IsSpeakingTip>
      ),
      <div key="mic-state">
        {participant.isMicrophoneEnabled ? (
          <Icon icon="mdi:microphone" />
        ) : (
          <Icon icon="mdi:microphone-off" />
        )}
      </div>,
    ];
  });

  return (
    <MemberList>
      <div className="tc-call-side-header">
        <div className="tc-call-side-title">{Translate.callMembersTitle}</div>
        <div className="tc-call-side-tip">{Translate.callMembersTip}</div>
      </div>

      <div className="tc-call-member-body">
        {participants.map((member) => (
          <UserListItem
            key={member.sid}
            userId={member.identity}
            actions={getAction(member)}
          />
        ))}
      </div>
    </MemberList>
  );
});
Member.displayName = 'Member';
