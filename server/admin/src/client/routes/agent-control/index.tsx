import React, { useEffect, useState } from 'react';
import { Card, Message, Space, Table, Typography, useAsyncRequest } from 'tushan';
import { callAction } from '../../request';
import { formatAdminError } from '../../utils/admin-error';
import {
  AgentDefinitionForm,
  AgentDefinitionFormValues,
} from './AgentDefinitionForm';
import { GatewayOverview } from './GatewayOverview';
import {
  SceneAccessConfigForm,
  SceneAccessConfigFormValues,
} from './SceneAccessConfigForm';
import { AnalyticsPanel } from './AnalyticsPanel';
import { CompliancePanel } from './CompliancePanel';

export const OpenClawGatewayPanel: React.FC = React.memo(() => {
  const [list, setList] = useState<any[]>([]);
  const [sceneList, setSceneList] = useState<any[]>([]);
  const [analyticsList, setAnalyticsList] = useState<any[]>([]);
  const [complianceList, setComplianceList] = useState<any[]>([]);

  const [{ loading }, fetchList] = useAsyncRequest(async () => {
    const [agentData, sceneData, analyticsData, complianceData] = await Promise.all([
      callAction('agent.definition.list', {}),
      callAction('agent.scene.list', {}),
      callAction('agent.analytics.list', {}),
      callAction('agent.compliance.list', {}),
    ]);
    setList(Array.isArray(agentData?.data) ? agentData.data : []);
    setSceneList(Array.isArray(sceneData?.data) ? sceneData.data : []);
    setAnalyticsList(Array.isArray(analyticsData?.data) ? analyticsData.data : []);
    setComplianceList(Array.isArray(complianceData?.data) ? complianceData.data : []);
    return { agentData, sceneData, analyticsData, complianceData };
  });

  const [{ loading: creating }, createAgent] = useAsyncRequest(
    async (values: AgentDefinitionFormValues) => {
      await callAction('agent.definition.create', values);
    }
  );
  const [{ loading: creatingScene }, createScene] = useAsyncRequest(
    async (values: SceneAccessConfigFormValues) => {
      const normalizeList = (text?: string) =>
        String(text ?? '')
          .split(/[\n,，]/)
          .map((item) => item.trim())
          .filter(Boolean);

      await callAction('agent.scene.create', {
        sceneId: values.sceneId,
        name: values.name,
        domain: values.domain,
        target: values.target,
        enabledActions: values.enabledActions ?? [],
        roleIds: normalizeList(values.roleIdsText),
        groupIds: normalizeList(values.groupIdsText),
        enabled: values.enabled,
      });
    }
  );

  useEffect(() => {
    fetchList().catch(() => {});
  }, []);

  return (
    <Space direction="vertical" style={{ width: '100%' }} size="large">
      <Card>
        <Typography.Title heading={4}>OpenClaw 接入底座</Typography.Title>
        <Typography.Paragraph>
          在这里统一管理外部 Agent 接入、角色绑定、场景接入和运行时调度。本项目只负责场景、关系、入口和连接配置，不负责剧本编排与 Agent 推理本体。
        </Typography.Paragraph>
      </Card>

      <GatewayOverview
        agentCount={list.length}
        sceneCount={sceneList.length}
        analyticsCount={analyticsList.length}
        complianceCount={complianceList.length}
        providers={[...new Set(list.map((item) => item.provider).filter(Boolean))]}
        runtimeModes={[
          ...new Set(list.map((item) => item.runtimeMode).filter(Boolean)),
        ]}
      />

      <Card>
        <AgentDefinitionForm
          loading={creating}
          onSubmit={async (values) => {
            try {
              await createAgent(values);
              Message.success('外部 Agent 接入已创建');
              await fetchList();
            } catch (err) {
              Message.error(formatAdminError(err, '创建外部 Agent 接入失败'));
            }
          }}
        />
      </Card>

      <Card>
        <Typography.Title heading={6}>外部 Agent 接入列表</Typography.Title>
        <Table
          loading={loading}
          pagination={false}
          rowKey={(row: any) => row.agentId}
          columns={[
            { title: 'Agent ID', dataIndex: 'agentId' },
            { title: '名称', dataIndex: 'name' },
            { title: '外部 Agent ID', dataIndex: 'externalAgentId' },
            { title: '来源', dataIndex: 'provider' },
            { title: '行业域', dataIndex: 'domain' },
            { title: '运行模式', dataIndex: 'runtimeMode' },
            { title: '状态', dataIndex: 'status' },
          ]}
          data={list}
        />
      </Card>

      <Card>
        <Typography.Title heading={6}>场景接入配置</Typography.Title>
        <SceneAccessConfigForm
          loading={creatingScene}
          onSubmit={async (values) => {
            try {
              await createScene(values);
              Message.success('场景接入配置已创建');
              await fetchList();
            } catch (err) {
              Message.error(formatAdminError(err, '创建场景接入配置失败'));
            }
          }}
        />
      </Card>

      <Card>
        <Typography.Title heading={6}>场景接入配置列表</Typography.Title>
        <Table
          pagination={false}
          rowKey={(row: any) => row.sceneId}
          columns={[
            { title: '场景 ID', dataIndex: 'sceneId' },
            { title: '名称', dataIndex: 'name' },
            { title: '行业域', dataIndex: 'domain' },
            { title: '场景目标', dataIndex: 'target' },
            { title: '允许动作', dataIndex: 'enabledActions' },
            { title: '启用', dataIndex: 'enabled' },
          ]}
          data={sceneList}
        />
      </Card>

      <Card>
        <Typography.Title heading={6}>数据分析与转化追踪</Typography.Title>
        <AnalyticsPanel />
      </Card>

      <Card>
        <Typography.Title heading={6}>风控与合规边界控制</Typography.Title>
        <CompliancePanel />
      </Card>
    </Space>
  );
});

OpenClawGatewayPanel.displayName = 'OpenClawGatewayPanel';
