import React, { useEffect, useState } from 'react';
import { Card, Message, Space, Table, Typography, useAsyncRequest } from 'tushan';
import { callAction } from '../../request';
import { formatAdminError } from '../../utils/admin-error';
import {
  AgentDefinitionForm,
  AgentDefinitionFormValues,
} from './AgentDefinitionForm';

export const AgentControlPanel: React.FC = React.memo(() => {
  const [list, setList] = useState<any[]>([]);
  const [scriptList, setScriptList] = useState<any[]>([]);

  const [{ loading }, fetchList] = useAsyncRequest(async () => {
    const [agentData, scriptData] = await Promise.all([
      callAction('agent.definition.list', {}),
      callAction('agent.script.list', {}),
    ]);
    setList(Array.isArray(agentData?.data) ? agentData.data : []);
    setScriptList(Array.isArray(scriptData?.data) ? scriptData.data : []);
    return { agentData, scriptData };
  });

  const [{ loading: creating }, createAgent] = useAsyncRequest(
    async (values: AgentDefinitionFormValues) => {
      await callAction('agent.definition.create', values);
    }
  );

  useEffect(() => {
    fetchList().catch(() => {});
  }, []);

  return (
    <Space direction="vertical" style={{ width: '100%' }} size="large">
      <Card>
        <Typography.Title heading={4}>Agent 总控台</Typography.Title>
        <Typography.Paragraph>
          在这里统一管理角色型 Agent 的基础定义。后续会继续补角色绑定、剧本模板和运行时调度。
        </Typography.Paragraph>
      </Card>

      <Card>
        <AgentDefinitionForm
          loading={creating}
          onSubmit={async (values) => {
            try {
              await createAgent(values);
              Message.success('Agent 已创建');
              await fetchList();
            } catch (err) {
              Message.error(formatAdminError(err, '创建 Agent 失败'));
            }
          }}
        />
      </Card>

      <Card>
        <Typography.Title heading={6}>当前 Agent 列表</Typography.Title>
        <Table
          loading={loading}
          pagination={false}
          rowKey={(row: any) => row.agentId}
          columns={[
            { title: 'Agent ID', dataIndex: 'agentId' },
            { title: '名称', dataIndex: 'name' },
            { title: '行业域', dataIndex: 'domain' },
            { title: '运行模式', dataIndex: 'runtimeMode' },
            { title: '状态', dataIndex: 'status' },
          ]}
          data={list}
        />
      </Card>

      <Card>
        <Typography.Title heading={6}>剧本模板骨架</Typography.Title>
        <Table
          pagination={false}
          rowKey={(row: any) => row.scriptId}
          columns={[
            { title: '模板 ID', dataIndex: 'scriptId' },
            { title: '名称', dataIndex: 'name' },
            { title: '行业域', dataIndex: 'domain' },
            { title: '阶段', dataIndex: 'stages' },
            { title: '论坛沉淀', dataIndex: 'forumSinkMode' },
          ]}
          data={scriptList}
        />
      </Card>
    </Space>
  );
});

AgentControlPanel.displayName = 'AgentControlPanel';
