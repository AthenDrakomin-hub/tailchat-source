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

const formatDuration = (seconds: number) => {
  const mm = String(Math.floor(seconds / 60)).padStart(2, '0');
  const ss = String(seconds % 60).padStart(2, '0');
  return `${mm}:${ss}`;
};

const CallUI: React.FC<{ onLeave: () => void }> = React.memo(({ onLeave }) => {
  const room = useRoomContext();
  const participants = useParticipants();
  const { localParticipant } = useLocalParticipant();
  const [isMuted, setIsMuted] = useState(false);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    if (room.state !== RoomState.Connected) {
      return;
    }

    const timer = window.setInterval(() => {
      setDuration((prev) => prev + 1);
    }, 1000);

    return () => window.clearInterval(timer);
  }, [room.state]);

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
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', alignItems: 'center', justifyContent: 'space-between', padding: '56px 24px 42px', boxSizing: 'border-box' }}>
      <RoomAudioRenderer />
      
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '36px' }}>
        <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.72)', marginBottom: 26 }}>语音通话</div>
        <Avatar size={132} src={mainRemote?.identity ? '' : undefined} name={mainRemote?.name || '语音通话'} style={{ marginBottom: 24, boxShadow: '0 0 0 6px rgba(255,255,255,0.08)' }} />
        <h2 style={{ fontSize: 32, fontWeight: 600, margin: 0, color: '#fff' }}>{mainRemote?.name || '语音通话'}</h2>
        <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.62)', marginTop: 10 }}>
          {room.state === RoomState.Connected ? `${formatDuration(duration)} 通话中` : '正在连接对方…'}
        </p>
      </div>

      <div style={{ display: 'flex', gap: 54, alignItems: 'center', marginBottom: '24px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
          <button
            onClick={toggleMute}
            style={{
              width: 72, height: 72, borderRadius: '50%', border: 'none',
              backgroundColor: isMuted ? '#ffffff' : 'rgba(255,255,255,0.18)',
              color: isMuted ? '#111827' : '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', transition: 'all 0.2s'
            }}
          >
            <Icon icon={isMuted ? "mdi:microphone-off" : "mdi:microphone"} style={{ fontSize: 34 }} />
          </button>
          <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14 }}>
            {isMuted ? '已静音' : '麦克风'}
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
          <button
            onClick={() => { room.disconnect(); onLeave(); }}
            style={{
              width: 78, height: 78, borderRadius: '50%', border: 'none',
              backgroundColor: '#ff4d4f', color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 8px 24px rgba(255,77,79,0.4)'
            }}
          >
            <Icon icon="mdi:phone-hangup" style={{ fontSize: 38 }} />
          </button>
          <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14 }}>挂断</span>
        </div>
      </div>
    </div>
  );
});

const IncomingCallUI: React.FC<{ onAnswer: () => void; onDecline: () => void }> = React.memo(({ onAnswer, onDecline }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', alignItems: 'center', justifyContent: 'space-between', padding: '56px 24px 42px', boxSizing: 'border-box' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '36px' }}>
        <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.72)', marginBottom: 26 }}>语音通话</div>
        <div style={{
          width: 132, height: 132, borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24,
          animation: 'pulse 2s infinite'
        }}>
          <Icon icon="mdi:phone-incoming" style={{ fontSize: 48, color: '#fff' }} />
        </div>
        <h2 style={{ fontSize: 32, fontWeight: 600, margin: 0, color: '#fff' }}>语音通话</h2>
        <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.62)', marginTop: 10 }}>有新的通话邀请</p>
      </div>

      <div style={{ display: 'flex', width: '100%', maxWidth: 320, justifyContent: 'space-between', marginBottom: '24px' }}>
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
          <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14 }}>拒绝</span>
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
          <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14 }}>接听</span>
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
  const [guestName] = useState(() => `访客${Math.floor(Math.random() * 10000)}`);
  
  const token = useToken(meetingId || '', { userInfo: { name: guestName } });
  const liveKitUrl = useServerUrl();

  if (!meetingId) {
    return <div>无效的通话链接</div>;
  }

  if (callState === 'ended') {
    return (
      <div style={{ width: '100vw', height: '100vh', backgroundColor: '#0b192c', color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 80, height: 80, borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
          <Icon icon="mdi:phone-hangup" style={{ fontSize: 40, color: 'rgba(255,255,255,0.6)' }} />
        </div>
        <h2 style={{ margin: 0, fontWeight: 500 }}>通话已结束</h2>
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
            <p style={{ color: 'rgba(255,255,255,0.6)' }}>正在连接...</p>
          </div>
        )
      )}
    </div>
  );
});

export default ExternalCallView;
