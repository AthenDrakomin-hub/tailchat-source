import React from 'react';
import { Button, Card, Typography, useTranslation } from 'tushan';
import { FeatureStatusCard } from '../components/FeatureStatusCard';

/**
 * SocketIO 管理
 */
export const SocketIOAdmin: React.FC = React.memo(() => {
  const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
  const host = window.location.host;
  const socketUrl = `${protocol}://${host}`;
  const { t } = useTranslation();

  if (!host) {
    return (
      <FeatureStatusCard
        title="Socket.IO 诊断"
        summary="当前无法生成诊断地址，因此页面进入降级态。"
        actionHint="请确认管理端运行在正常浏览器环境中。"
        detail="window.location.host is empty"
      />
    );
  }

  return (
    <Card>
      <Typography.Title heading={4}>Socket.IO 诊断</Typography.Title>
      <Typography.Paragraph type="secondary">
        这是一个外部诊断入口，用于辅助排查 Socket.IO 长连接，不是内嵌式管理后台。
      </Typography.Paragraph>
      <Typography.Paragraph type="secondary">
        如果你的目标是确认连接地址是否正确，先核对下面展示的 WebSocket 地址，再打开外部调试台。
      </Typography.Paragraph>
      <div>
        <Typography.Paragraph>
          {t('custom.socketio.tip1')}{' '}
          <strong>
            {socketUrl}
          </strong>
        </Typography.Paragraph>
        <Typography.Paragraph>{t('custom.socketio.tip2')}</Typography.Paragraph>
        <Typography.Paragraph>{t('custom.socketio.tip3')}</Typography.Paragraph>
      </div>

      <Button
        type="primary"
        onClick={() => {
          window.open('https://admin.socket.io/');
        }}
      >
        打开外部调试台
      </Button>
    </Card>
  );
});
SocketIOAdmin.displayName = 'SocketIOAdmin';
