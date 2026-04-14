import React, { useEffect, useRef, useState } from 'react';
import {
  useGlobalSocketEvent,
  requestMessage,
  useCurrentUserInfo,
  useGroupInfo,
} from '@capital/common';
import { Button, Input } from '@capital/component';

interface SyncState {
  roomId: string;
  videoUrl: string;
  isPlaying: boolean;
  currentTime: number;
  updatedAt: number;
}

export const SyncPlayerPanel: React.FC<{
  groupId: string;
  panelId: string;
}> = ({ groupId }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [state, setState] = useState<SyncState | null>(null);
  const [inputUrl, setInputUrl] = useState('');

  const currentUser = useCurrentUserInfo();
  const groupInfo = useGroupInfo(groupId);

  // Check if user is owner or admin
  const isControlRole = currentUser._id === groupInfo?.owner; // Simplified check for demonstration

  useEffect(() => {
    // Fetch initial state
    requestMessage('plugin:com.msgbyte.syncplayer.getState', {
      roomId: groupId,
    }).then((res: any) => {
      if (res && res.videoUrl) {
        setState(res);
        syncLocalVideo(res);
      }
    });
  }, [groupId]);

  useGlobalSocketEvent(
    'plugin:com.msgbyte.syncplayer.sync_state',
    (newState: SyncState) => {
      if (newState.roomId === groupId) {
        setState(newState);
        syncLocalVideo(newState);
      }
    }
  );

  useGlobalSocketEvent(
    'plugin:com.msgbyte.syncplayer.sync_close',
    (data: { roomId: string }) => {
      if (data.roomId === groupId) {
        setState(null);
      }
    }
  );

  const syncLocalVideo = (s: SyncState) => {
    const video = videoRef.current;
    if (!video) return;

    // Calculate actual time considering network drift
    const timeDrift = s.isPlaying ? (Date.now() - s.updatedAt) / 1000 : 0;
    const targetTime = s.currentTime + timeDrift;

    if (Math.abs(video.currentTime - targetTime) > 1.5) {
      video.currentTime = targetTime;
    }

    if (s.isPlaying && video.paused) {
      video.play().catch(() => {}); // Handle browser autoplay policies
    } else if (!s.isPlaying && !video.paused) {
      video.pause();
    }
  };

  const handlePlay = () => {
    if (!isControlRole || !videoRef.current) return;
    requestMessage('plugin:com.msgbyte.syncplayer.updateState', {
      roomId: groupId,
      isPlaying: true,
      currentTime: videoRef.current.currentTime,
    });
  };

  const handlePause = () => {
    if (!isControlRole || !videoRef.current) return;
    requestMessage('plugin:com.msgbyte.syncplayer.updateState', {
      roomId: groupId,
      isPlaying: false,
      currentTime: videoRef.current.currentTime,
    });
  };

  const handleSeeked = () => {
    if (!isControlRole || !videoRef.current) return;
    requestMessage('plugin:com.msgbyte.syncplayer.updateState', {
      roomId: groupId,
      isPlaying: !videoRef.current.paused,
      currentTime: videoRef.current.currentTime,
    });
  };

  const handleStartPush = () => {
    if (!inputUrl) return;
    requestMessage('plugin:com.msgbyte.syncplayer.push', {
      roomId: groupId,
      videoUrl: inputUrl,
    });
  };

  const handleClose = () => {
    requestMessage('plugin:com.msgbyte.syncplayer.close', { roomId: groupId });
  };

  if (!state && !isControlRole) {
    return null; // Hidden for normal users if no stream
  }

  return (
    <div className="w-full bg-black p-4 flex flex-col items-center">
      {!state && isControlRole && (
        <div className="flex w-full max-w-2xl gap-2 mb-4">
          <Input
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            placeholder="输入 MP4 视频链接启动演播室..."
            className="flex-1"
          />
          <Button type="primary" onClick={handleStartPush}>
            开启演播室
          </Button>
        </div>
      )}

      {state && (
        <div className="relative w-full max-w-4xl rounded overflow-hidden shadow-lg">
          {isControlRole && (
            <Button
              danger
              className="absolute top-2 right-2 z-10"
              onClick={handleClose}
            >
              结束演播
            </Button>
          )}
          <video
            ref={videoRef}
            src={state.videoUrl}
            controls={isControlRole} // Only admin sees controls
            className="w-full"
            onPlay={handlePlay}
            onPause={handlePause}
            onSeeked={handleSeeked}
            style={{ pointerEvents: isControlRole ? 'auto' : 'none' }} // Prevent normal users from clicking
          />
        </div>
      )}
    </div>
  );
};
