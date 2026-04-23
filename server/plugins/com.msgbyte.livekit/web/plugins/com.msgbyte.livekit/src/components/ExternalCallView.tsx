import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router';
import { Avatar, Icon } from '@capital/component';
import { useToken } from '../utils/useToken';
import { useServerUrl } from '../utils/useServerUrl';
import {
  LiveKitRoom,
  RoomAudioRenderer,
  useParticipants,
  useLocalParticipant,
  useRoomContext
} from '@livekit/components-react';
import { RoomState } from 'livekit-client';

const CallUI: React.FC<{ onLeave: () => void }> = React.memo(({ onLeave }) => {
  const room = useRoomContext();
  const participants = useParticipants();
  const { localParticipant } = useLocalParticipant();
  const [isMuted, setIsMuted] = useState(false);

  const toggleMute = () => {
    if (localParticipant) {
      if (isMuted) {
        localParticipant.setMicrophoneEnabled(true);
        setIsMuted(false);
      } else {
        localParticipant.setMicrophoneEnabled(false);
        setIsMuted(true);
      }
    }
  };

  const remoteParticipants = participants.filter((p) => p.identity !== localParticipant?.identity);
  const mainRemote = remoteParticipants[0];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', alignItems: 'center', justifyContent: 'space-between', padding: '60px 20px', boxSizing: 'border-box' }}>
      <RoomAudioRenderer />
      
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '40px' }}>
        <Avatar size={120} src={mainRemote?.identity ? '' : undefined} name={mainRemote?.name || 'Caller'} style={{ marginBottom: 20, boxShadow: '0 0 0 4px rgba(255,255,255,0.1)' }} />
        <h2 style={{ fontSize: 28, fontWeight: 600, margin: 0, color: '#fff' }}>{mainRemote?.name || 'Encrypted Call'}</h2>
        <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.6)', marginTop: 8 }}>
          {room.state === RoomState.Connected ? 'Connected' : 'Connecting...'}
        </p>
      </div>

      <div style={{ display: 'flex', gap: 40, alignItems: 'center', marginBottom: '40px' }}>
        <button
          onClick={toggleMute}
          style={{
            width: 64, height: 64, borderRadius: '50%', border: 'none',
            backgroundColor: isMuted ? '#fff' : 'rgba(255,255,255,0.2)',
            color: isMuted ? '#000' : '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', transition: 'all 0.2s'
          }}
        >
          <Icon icon={isMuted ? "mdi:microphone-off" : "mdi:microphone"} style={{ fontSize: 32 }} />
        </button>

        <button
          onClick={() => { room.disconnect(); onLeave(); }}
          style={{
            width: 72, height: 72, borderRadius: '50%', border: 'none',
            backgroundColor: '#ff4d4f', color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 8px 24px rgba(255,77,79,0.4)'
          }}
        >
          <Icon icon="mdi:phone-hangup" style={{ fontSize: 36 }} />
        </button>
      </div>
    </div>
  );
});

const IncomingCallUI: React.FC<{ onAnswer: () => void; onDecline: () => void }> = React.memo(({ onAnswer, onDecline }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', alignItems: 'center', justifyContent: 'space-between', padding: '60px 20px', boxSizing: 'border-box' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '40px' }}>
        <div style={{
          width: 120, height: 120, borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20,
          animation: 'pulse 2s infinite'
        }}>
          <Icon icon="mdi:phone-incoming" style={{ fontSize: 48, color: '#fff' }} />
        </div>
        <h2 style={{ fontSize: 28, fontWeight: 600, margin: 0, color: '#fff' }}>Encrypted Voice Call</h2>
        <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.6)', marginTop: 8 }}>Incoming call...</p>
      </div>

      <div style={{ display: 'flex', width: '100%', maxWidth: 300, justifyContent: 'space-between', marginBottom: '40px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
          <button
            onClick={onDecline}
            style={{
              width: 72, height: 72, borderRadius: '50%', border: 'none',
              backgroundColor: '#ff4d4f', color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', boxShadow: '0 8px 24px rgba(255,77,79,0.4)'
            }}
          >
            <Icon icon="mdi:phone-hangup" style={{ fontSize: 36 }} />
          </button>
          <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14 }}>Decline</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
          <button
            onClick={onAnswer}
            style={{
              width: 72, height: 72, borderRadius: '50%', border: 'none',
              backgroundColor: '#52c41a', color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', boxShadow: '0 8px 24px rgba(82,196,26,0.4)'
            }}
          >
            <Icon icon="mdi:phone" style={{ fontSize: 36 }} />
          </button>
          <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14 }}>Answer</span>
        </div>
      </div>
      
      <style>{`
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(255,255,255,0.2); }
          70% { box-shadow: 0 0 0 20px rgba(255,255,255,0); }
          100% { box-shadow: 0 0 0 0 rgba(255,255,255,0); }
        }
      `}</style>
    </div>
  );
});

const ExternalCallView: React.FC = React.memo(() => {
  const { meetingId } = useParams<{ meetingId: string }>();
  const [callState, setCallState] = useState<'incoming' | 'connected' | 'ended'>('incoming');
  const [guestName] = useState(() => `Guest_${Math.floor(Math.random() * 10000)}`);
  
  const token = useToken(meetingId || '', { userInfo: { name: guestName } });
  const liveKitUrl = useServerUrl();

  if (!meetingId) {
    return <div>Invalid meeting link</div>;
  }

  if (callState === 'ended') {
    return (
      <div style={{ width: '100vw', height: '100vh', backgroundColor: '#0b192c', color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 80, height: 80, borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
          <Icon icon="mdi:phone-hangup" style={{ fontSize: 40, color: 'rgba(255,255,255,0.6)' }} />
        </div>
        <h2 style={{ margin: 0, fontWeight: 500 }}>Call Ended</h2>
      </div>
    );
  }

  return (
    <div style={{ width: '100vw', height: '100vh', backgroundColor: '#0b192c', color: '#fff', position: 'absolute', top: 0, left: 0, zIndex: 9999, overflow: 'hidden', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {callState === 'incoming' ? (
        <IncomingCallUI onAnswer={() => setCallState('connected')} onDecline={() => setCallState('ended')} />
      ) : (
        token && liveKitUrl ? (
          <LiveKitRoom
            token={token}
            serverUrl={liveKitUrl}
            audio={true}
            video={false}
            onDisconnected={() => setCallState('ended')}
          >
            <CallUI onLeave={() => setCallState('ended')} />
          </LiveKitRoom>
        ) : (
          <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
            <p style={{ color: 'rgba(255,255,255,0.6)' }}>Connecting...</p>
          </div>
        )
      )}
    </div>
  );
});

export default ExternalCallView;
