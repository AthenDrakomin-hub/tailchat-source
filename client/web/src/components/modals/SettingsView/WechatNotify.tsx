import React, { useEffect, useState } from 'react';
import {
  Button,
  Typography,
  Space,
  Alert,
  Divider,
  Switch,
} from 'antd';
import {
  checkWxNotifyBindSession,
  createWxNotifyBindSession,
  getWxNotifyStatus,
  sendWxNotifyTestMessage,
  showErrorToasts,
  showSuccessToasts,
  t,
  unbindWxNotify,
  useAsyncFn,
  useAsyncRequest,
  useSingleUserSetting,
  type WxNotifyBindSession,
} from 'tailchat-shared';
import { normalizeWxNotifyPreference } from './wxNotifyPreference';
import { resolveWxNotifyStatus } from './wxNotifyStatus';

export const SettingsWechatNotify: React.FC = React.memo(() => {
  const [session, setSession] = useState<WxNotifyBindSession | null>(null);
  const [statusState, refreshStatus] = useAsyncRequest(async () => getWxNotifyStatus());
  const { value: status, loading } = statusState;

  const [{ loading: bindLoading }, handleCreateSession] = useAsyncFn(async () => {
    const next = await createWxNotifyBindSession();
    setSession(next);
  }, []);

  const [{ loading: unbindLoading }, handleUnbind] = useAsyncFn(async () => {
    await unbindWxNotify();
    setSession(null);
    await refreshStatus();
    showSuccessToasts(t('已解除微信通知绑定'));
  }, [refreshStatus]);
  const [{ loading: testLoading }, handleSendTestMessage] = useAsyncFn(async () => {
    await sendWxNotifyTestMessage();
    showSuccessToasts(t('测试通知已发送，请到微信查看'));
  }, []);
  const {
    value: preferenceValue,
    setValue: setPreference,
    loading: preferenceLoading,
  } = useSingleUserSetting('wxNotifyPreference', {
    mention: true,
    directMessage: false,
  });

  useEffect(() => {
    if (!session?.code) {
      return;
    }

    const timer = window.setInterval(async () => {
      try {
        const next = await checkWxNotifyBindSession(session.code);
        if (next?.isBound) {
          setSession(null);
          await refreshStatus();
          showSuccessToasts(t('微信通知授权成功'));
        }
      } catch (err) {
        showErrorToasts(err);
      }
    }, 8000);

    return () => window.clearInterval(timer);
  }, [session?.code, refreshStatus]);

  if (!status && loading) {
    return <Typography.Text>{t('加载中...')}</Typography.Text>;
  }

  const statusInfo = resolveWxNotifyStatus(
    status ?? {
      available: false,
      provider: 'wxpusher',
      isBound: false,
      isEnabled: false,
      uid: '',
    }
  );
  const preference = normalizeWxNotifyPreference(preferenceValue);

  return (
    <Space direction="vertical" style={{ width: '100%' }} size="middle">
      <Typography.Title level={4}>{t('微信通知')}</Typography.Title>
      <Alert
        type={status?.isBound ? 'success' : 'info'}
        message={t(statusInfo.title)}
        description={t(statusInfo.description)}
        showIcon
      />

      {status?.isBound && status.uid && (
        <Typography.Paragraph type="secondary" style={{ marginBottom: 0 }}>
          {t('当前绑定 UID：{{uid}}', {
            uid: `${status.uid.slice(0, 8)}...`,
          })}
        </Typography.Paragraph>
      )}

      <Space>
        <Button
          type="primary"
          loading={bindLoading}
          disabled={!status?.available}
          onClick={() => handleCreateSession().catch(showErrorToasts)}
        >
          {t(statusInfo.actionText)}
        </Button>

        {status?.isBound && (
          <Button
            loading={testLoading}
            onClick={() => handleSendTestMessage().catch(showErrorToasts)}
          >
            {t('发送测试通知')}
          </Button>
        )}

        {status?.isBound && (
          <Button
            danger
            loading={unbindLoading}
            onClick={() => handleUnbind().catch(showErrorToasts)}
          >
            {t('解除绑定')}
          </Button>
        )}
      </Space>

      <Divider />

      <Space direction="vertical" style={{ width: '100%' }} size="middle">
        <Typography.Text strong>{t('通知偏好')}</Typography.Text>
        <Space
          align="center"
          style={{ width: '100%', justifyContent: 'space-between' }}
        >
          <div>
            <Typography.Text>{t('@你 的消息')}</Typography.Text>
            <Typography.Paragraph type="secondary" style={{ marginBottom: 0 }}>
              {t('当群里有人明确提到你时，通过微信提醒你。')}
            </Typography.Paragraph>
          </div>
          <Switch
            checked={preference.mention}
            loading={preferenceLoading}
            onChange={(checked) =>
              setPreference({
                ...preference,
                mention: checked,
              }).catch(showErrorToasts)
            }
          />
        </Space>

        <Space
          align="center"
          style={{ width: '100%', justifyContent: 'space-between' }}
        >
          <div>
            <Typography.Text>{t('私聊消息')}</Typography.Text>
            <Typography.Paragraph type="secondary" style={{ marginBottom: 0 }}>
              {t('当收到新的私聊消息时，通过微信提醒你。')}
            </Typography.Paragraph>
          </div>
          <Switch
            checked={preference.directMessage}
            loading={preferenceLoading}
            onChange={(checked) =>
              setPreference({
                ...preference,
                directMessage: checked,
              }).catch(showErrorToasts)
            }
          />
        </Space>
      </Space>

      {session?.qrcodeUrl && (
        <>
          <Divider />
          <Typography.Paragraph>
            {t('请使用微信扫码完成授权。授权成功后，本页会自动更新状态。')}
          </Typography.Paragraph>
          <img
            src={session.qrcodeUrl}
            alt={t('微信通知授权二维码')}
            style={{ width: 240, height: 240, borderRadius: 12 }}
          />
        </>
      )}
    </Space>
  );
});

SettingsWechatNotify.displayName = 'SettingsWechatNotify';
