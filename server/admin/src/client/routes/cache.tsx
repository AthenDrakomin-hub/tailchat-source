import React from 'react';
import {
  Button,
  Card,
  Message,
  Popconfirm,
  Space,
  Typography,
  useAsyncRequest,
  useTranslation,
} from 'tushan';
import { request } from '../request';
import { formatAdminError } from '../utils/admin-error';

/**
 * 缓存管理
 */
export const CacheManager: React.FC = React.memo(() => {
  const { t } = useTranslation();
  const [{ loading }, cleanCache] = useAsyncRequest(async (target?: string) => {
    try {
      const { data } = await request.post('/cache/clean', {
        target,
      });

      if (!data.success) {
        const errorMessage = data.message ?? data.msg ?? 'Unknown cache error';
        Message.error(t('tushan.common.failed') + ':' + errorMessage);
        throw new Error(errorMessage);
      }

      Message.success(t('tushan.common.success'));
    } catch (err) {
      Message.error(formatAdminError(err, '缓存清理失败'));
      throw err;
    }
  });

  return (
    <Card>
      <Typography.Title heading={4}>缓存管理</Typography.Title>
      <Typography.Paragraph type="secondary">
        用于刷新客户端配置缓存或执行全量缓存清理。建议优先清理配置缓存，避免不必要的全量冲刷。
      </Typography.Paragraph>
      <Space direction="vertical">
        <Popconfirm
          title={t('custom.cache.cleanTitle')}
          content={t('custom.cache.cleanDesc')}
          onOk={() => cleanCache('config.client')}
        >
          <Button type="primary" loading={loading}>
            {t('custom.cache.cleanConfigBtn')}
          </Button>
        </Popconfirm>

        <Popconfirm
          title={t('custom.cache.cleanTitle')}
          content={t('custom.cache.cleanDesc')}
          onOk={() => cleanCache()}
        >
          <Button type="primary" status="danger" loading={loading}>
            {t('custom.cache.cleanAllBtn')}
          </Button>
        </Popconfirm>
      </Space>
    </Card>
  );
});
CacheManager.displayName = 'CacheManager';
