import React from 'react';
import { request } from '../../request';
import _uniq from 'lodash/uniq';
import { TagItems } from '../../components/TagItems';
import { FeatureStatusCard } from '../../components/FeatureStatusCard';
import {
  Card,
  Spin,
  Table,
  Typography,
  useAsync,
  useTranslation,
} from 'tushan';

/**
 * Tailchat 网络状态
 */
export const Network: React.FC = React.memo(() => {
  const { value: data, loading } = useAsync(async () => {
    try {
      const { data } = await request('/network/all');

      return {
        ...data,
        networkUnavailable: data.available === false,
        networkError: data.error ?? '',
        actionHint:
          data.actionHint ??
          '请确认管理端已连通 broker，并且当前节点可以访问注册表信息。',
      };
    } catch (err: any) {
      return {
        nodes: [],
        services: [],
        actions: [],
        events: [],
        networkUnavailable: true,
        networkError: err?.message ? String(err.message) : 'network unavailable',
        actionHint: '请确认 /network/all 可访问，并检查 broker 注册表状态。',
      };
    }
  });
  const { t } = useTranslation();

  if (loading) {
    return <Spin />;
  }

  if (data?.networkUnavailable) {
    return (
      <FeatureStatusCard
        title="微服务网络"
        summary="当前无法读取网络注册表信息，因此页面进入降级态。"
        actionHint={data.actionHint}
        detail={data.networkError}
      />
    );
  }

  return (
    <Card>
      <Typography.Title heading={6}>
        {t('custom.network.nodeList')}
      </Typography.Title>

      <Table
        columns={[
          {
            dataIndex: 'id',
            title: 'ID',
            render: (id, item: any) => (
              <div>
                {id}
                {item.local && <span> (*)</span>}
              </div>
            ),
          },
          {
            dataIndex: 'hostname',
            title: 'Host',
          },
          {
            dataIndex: 'cpu',
            title: 'CPU',
            render: (usage) => usage + '%',
          },
          {
            dataIndex: 'ipList',
            title: 'IP',
            render: (ips) => <TagItems items={ips ?? []} />,
          },
          {
            dataIndex: 'client.version',
            title: 'Client Version',
          },
        ]}
        data={data.nodes ?? []}
      />

      <Typography.Title heading={6}>
        {t('custom.network.serviceList')}
      </Typography.Title>

      <div>
        <TagItems items={_uniq<string>(data.services ?? [])} />
      </div>

      <Typography.Title heading={6}>
        {t('custom.network.actionList')}
      </Typography.Title>
      <div>
        <TagItems items={_uniq<string>(data.actions ?? [])} />
      </div>

      <Typography.Title heading={6}>
        {t('custom.network.eventList')}
      </Typography.Title>

      <div>
        <TagItems items={_uniq<string>(data.events ?? [])} />
      </div>
    </Card>
  );
});
Network.displayName = 'Network';
