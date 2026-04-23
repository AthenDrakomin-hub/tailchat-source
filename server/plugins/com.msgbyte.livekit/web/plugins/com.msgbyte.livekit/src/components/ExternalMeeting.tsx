import React from 'react';
import { useParams } from 'react-router';
import { LivekitView } from './LivekitView';

const ExternalMeeting: React.FC = React.memo(() => {
  const { meetingId } = useParams<{ meetingId: string }>();

  if (!meetingId) {
    return <div>Invalid meeting link</div>;
  }

  return (
    <div style={{ width: '100vw', height: '100vh', backgroundColor: '#0b192c', color: '#fff', position: 'absolute', top: 0, left: 0, zIndex: 9999 }}>
      <LivekitView
        roomName={meetingId}
        url={`/plugin/com.msgbyte.livekit/meeting/${meetingId}`}
      />
    </div>
  );
});

export default ExternalMeeting;
