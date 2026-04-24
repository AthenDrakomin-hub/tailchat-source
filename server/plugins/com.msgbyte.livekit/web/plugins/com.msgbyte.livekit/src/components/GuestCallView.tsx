import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router';
import { request, showToasts } from '@capital/common';
import { LoadingSpinner, Avatar, Icon } from '@capital/component';
import {
  LiveKitRoom,
  RoomAudioRenderer,
  useRoomContext,
  useParticipants,
} from '@livekit/components-react';
import { useToken } from '../utils/useToken';
import { useServerUrl } from '../utils/useServerUrl';

interface LinkInfo {
  roomId: string;
  inviterName: string;
  inviterAvatar: string;
}

const IncomingCallUI: React.FC<{ info: LinkInfo; onAccept: () => void }> = ({
  info,
  onAccept,
}) => (
  <div className="w-full h-full flex flex-col items-center justify-center bg-gray-900 text-white fixed inset-0">
    <div className="mb-12 flex flex-col items-center">
      <div className="relative">
        <Avatar
          src={info.inviterAvatar}
          name={info.inviterName}
          size={100}
          className="relative z-10"
        />
        <div className="absolute inset-0 bg-white/20 rounded-full animate-ping z-0 scale-150" />
      </div>
      <h2 className="mt-8 text-2xl font-bold">{info.inviterName}</h2>
      <p className="mt-2 text-gray-400">邀请您进行专属语音通话</p>
    </div>

    <div className="flex gap-16 mt-12">
      <button
        className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center shadow-lg hover:bg-red-600 transition-colors"
        onClick={() => window.close()}
      >
        <Icon icon="mdi:phone-hangup" className="text-3xl" />
      </button>
      <button
        className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center shadow-lg animate-bounce hover:bg-green-600 transition-colors"
        onClick={onAccept}
      >
        <Icon icon="mdi:phone" className="text-3xl" />
      </button>
    </div>
  </div>
);

const ActiveCallUI: React.FC<{ info: LinkInfo }> = ({ info }) => {
  const room = useRoomContext();
  const participants = useParticipants();

  // 双向挂断检测：如果房间里只剩自己（邀请人离线了），自动挂断
  useEffect(() => {
    if (room.state === 'connected' && participants.length <= 1) {
      showToasts('对方已结束通话');
      room.disconnect();
    }
  }, [participants.length, room.state]);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-gray-900 text-white fixed inset-0">
      <div className="mb-12 flex flex-col items-center">
        <Avatar src={info.inviterAvatar} name={info.inviterName} size={100} />
        <h2 className="mt-6 text-xl">{info.inviterName}</h2>
        <p className="mt-2 text-green-400 font-mono">00:00 通话中...</p>
      </div>
      <div className="mt-12">
        <button
          className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center shadow-lg hover:bg-red-600 transition-colors"
          onClick={() => room.disconnect()}
        >
          <Icon icon="mdi:phone-hangup" className="text-3xl" />
        </button>
      </div>
      <RoomAudioRenderer />
    </div>
  );
};

export const GuestCallView: React.FC = () => {
  const { code } = useParams<{ code: string }>();
  const [info, setInfo] = useState<LinkInfo | null>(null);
  const [error, setError] = useState<string>('');
  const [callState, setCallState] = useState<'incoming' | 'connected' | 'ended'>(
    'incoming'
  );
  const serverUrl = useServerUrl();

  // 随机生成固定访客昵称（免输入）
  const [guestName] = useState(
    () => `Guest_${Math.floor(Math.random() * 10000)}`
  );
  const token = useToken(info?.roomId || '', { userInfo: { name: guestName } });

  useEffect(() => {
    request
      .post('plugin:com.msgbyte.livekit/getAndBurnShortLink', { code })
      .then(({ data }) => {
        setInfo(data);
      })
      .catch((err) => {
        setError(err.message || '链接已失效或已被使用');
      });
  }, [code]);

  if (error || callState === 'ended') {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-gray-900 text-white fixed inset-0">
        <Icon icon="mdi:phone-off" className="text-6xl text-gray-500 mb-4" />
        <p className="text-xl">{error || '通话已结束'}</p>
      </div>
    );
  }

  if (!info) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-900">
        <LoadingSpinner />
      </div>
    );
  }

  if (callState === 'incoming') {
    return (
      <IncomingCallUI info={info} onAccept={() => setCallState('connected')} />
    );
  }

  if (!token || !serverUrl) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-900">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <LiveKitRoom
      token={token}
      serverUrl={serverUrl}
      connect={true}
      audio={true}
      video={false}
      onDisconnected={() => setCallState('ended')}
    >
      <ActiveCallUI info={info} />
    </LiveKitRoom>
  );
};
