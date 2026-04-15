import React, { useEffect, useMemo, useRef } from 'react';
import Hls from 'hls.js';
import { ModalWrapper } from '@capital/component';

export const PlayerModal: React.FC<{
  title: string;
  hlsUrl: string;
  onClose?: () => void;
}> = React.memo((props) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const hlsUrl = useMemo(() => props.hlsUrl, [props.hlsUrl]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) {
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = hlsUrl;
      return;
    }

    if (Hls.isSupported()) {
      const hls = new Hls();
      hls.loadSource(hlsUrl);
      hls.attachMedia(video);

      return () => {
        hls.destroy();
      };
    }
  }, [hlsUrl]);

  return (
    <ModalWrapper title={props.title}>
      <div style={{ width: 800, maxWidth: '90vw' }}>
        <video
          ref={videoRef}
          controls
          autoPlay
          style={{ width: '100%', borderRadius: 8, background: '#000' }}
        />
      </div>
    </ModalWrapper>
  );
});
PlayerModal.displayName = 'PlayerModal';

