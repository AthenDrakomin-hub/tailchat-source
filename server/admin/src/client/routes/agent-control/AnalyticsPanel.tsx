import React from 'react';
import { Table, Typography, useAsync } from 'tushan';
import { callAction } from '../../request';

export const AnalyticsPanel: React.FC = React.memo(() => {
  const { value: list = [], loading } = useAsync(async () => {
    const res = await callAction('agent.analytics.list', {});
    return Array.isArray(res?.data) ? res.data : [];
  }, []);

  return (
    <div>
      <Typography.Paragraph>
        这里记录外部 Agent 在底座中的分析事件与转化标签，不承载任何导演策略逻辑。
      </Typography.Paragraph>
      <Table
        loading={loading}
        pagination={false}
        rowKey={(row: any) => row.id ?? `${row.agentId}-${row.eventType}`}
        columns={[
          { title: 'Agent ID', dataIndex: 'agentId' },
          { title: '事件', dataIndex: 'eventType' },
          { title: '场景', dataIndex: 'sourceSceneId' },
          { title: '群', dataIndex: 'groupId' },
          { title: '角色', dataIndex: 'roleId' },
          { title: '转化标签', dataIndex: 'conversionLabel' },
        ]}
        data={list}
      />
    </div>
  );
});

AnalyticsPanel.displayName = 'AnalyticsPanel';
