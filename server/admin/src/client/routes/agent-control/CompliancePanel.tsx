import React from 'react';
import { Table, Typography, useAsync } from 'tushan';
import { callAction } from '../../request';

export const CompliancePanel: React.FC = React.memo(() => {
  const { value: list = [], loading } = useAsync(async () => {
    const res = await callAction('agent.compliance.list', {});
    return Array.isArray(res?.data) ? res.data : [];
  }, []);

  return (
    <div>
      <Typography.Paragraph>
        这里定义底座层的动作边界控制，用来限制可执行动作和作用范围，不承载导演策略逻辑。
      </Typography.Paragraph>
      <Table
        loading={loading}
        pagination={false}
        rowKey={(row: any) => row.id ?? `${row.action}-${row.scopeSceneId ?? 'global'}`}
        columns={[
          { title: '动作', dataIndex: 'action' },
          { title: '拦截', dataIndex: 'blocked' },
          { title: '原因', dataIndex: 'reason' },
          { title: '场景', dataIndex: 'scopeSceneId' },
          { title: '群', dataIndex: 'scopeGroupId' },
          { title: '角色', dataIndex: 'scopeRoleId' },
        ]}
        data={list}
      />
    </div>
  );
});

CompliancePanel.displayName = 'CompliancePanel';
