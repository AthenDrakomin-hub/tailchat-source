import React, { useCallback } from 'react';
import { Button, closeModal, openModal } from '@capital/component';
import { PlayerModal } from './PlayerModal';

export const LiveCard: React.FC<{
  payload: any;
  pseudolive: {
    title?: string;
    hlsUrl: string;
    status?: string;
  };
}> = React.memo((props) => {
  const handleOpen = useCallback(() => {
    const key = openModal(
      <PlayerModal
        title={props.pseudolive.title || '直播'}
        hlsUrl={props.pseudolive.hlsUrl}
        onClose={() => closeModal(key)}
      />,
      { closable: true, maskClosable: true }
    );
  }, [props.pseudolive.hlsUrl, props.pseudolive.title]);

  return (
    <div
      style={{
        marginTop: 8,
        border: '1px solid rgba(0,0,0,0.06)',
        borderRadius: 8,
        padding: 12,
        background: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
      }}
    >
      <div style={{ minWidth: 0 }}>
        <div
          style={{
            fontWeight: 600,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          正在直播：{props.pseudolive.title || '直播'}
        </div>
        <div style={{ opacity: 0.6, fontSize: 12 }}>
          {props.pseudolive.status === 'ready' ? '直播中' : '准备中'}
        </div>
      </div>

      <Button type="primary" onClick={handleOpen}>
        观看
      </Button>
    </div>
  );
});
LiveCard.displayName = 'LiveCard';
