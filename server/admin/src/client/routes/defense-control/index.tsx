import React, { useEffect, useState } from 'react';
import {
  Card,
  Typography,
  Form,
  Select,
  Switch,
  Input,
  InputNumber,
  Button,
  Message,
  Divider,
  Table,
} from 'tushan';
import { callAction } from '../../request';
import { formatAdminError } from '../../utils/admin-error';
import { FeatureStatusCard } from '../../components/FeatureStatusCard';

export const DefenseControlPanel: React.FC = React.memo(() => {
  const [form] = Form.useForm();
  const [featureAvailable, setFeatureAvailable] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [config, setConfig] = useState<any>(null);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [logsLoading, setLogsLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const loadPanelData = async () => {
    setLoading(true);
    setLogsLoading(true);

    try {
      const [configResult, auditLogsResult] = await Promise.all([
        callAction('plugin:com.ridou.defense-control.getConfig', {}),
        callAction('plugin:com.ridou.defense-control.getAuditLogs', {}),
      ]);

      setConfig(configResult || {});
      setAuditLogs(Array.isArray(auditLogsResult) ? auditLogsResult : []);
      setFeatureAvailable(true);
      setLoadError('');
    } catch (err) {
      setFeatureAvailable(false);
      setLoadError(formatAdminError(err, '防御控制插件当前不可用'));
      setConfig(null);
      setAuditLogs([]);
    } finally {
      setLoading(false);
      setLogsLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      await loadPanelData();
    })();
  }, []);

  useEffect(() => {
    if (config) {
      form.setFieldsValue({
        mode: config.mode || 'L0',
        disableRegister: config.disableRegister || false,
        disableUpload: config.disableUpload || false,
        cloudflare: config.cloudflare || {},
        rateLimit: config.rateLimit || { enable: false, requestsPerMinute: 100 },
        selfEdges: config.selfEdges ? JSON.stringify(config.selfEdges, null, 2) : '[]',
      });
    }
  }, [config, form]);

  const handleFormSubmit = (values: any) => {
    let parsedSelfEdges = [];
    try {
      if (values.selfEdges && typeof values.selfEdges === 'string') {
        parsedSelfEdges = JSON.parse(values.selfEdges);
      } else if (Array.isArray(values.selfEdges)) {
        parsedSelfEdges = values.selfEdges;
      }
    } catch (e) {
      Message.error('边缘节点列表 JSON 格式错误');
      return;
    }
    setUpdating(true);
    callAction('plugin:com.ridou.defense-control.updateConfig', {
      ...values,
      selfEdges: parsedSelfEdges,
    })
      .then(async () => {
        Message.success('配置已更新');
        await loadPanelData();
      })
      .catch((err) => {
        Message.error(formatAdminError(err, '防御控制系统操作失败'));
      })
      .finally(() => {
        setUpdating(false);
      });
  };

  if (!featureAvailable) {
    return (
      <FeatureStatusCard
        title="防御控制系统"
        summary="当前防御控制插件未安装、未启用或未接入到管理端，因此此页面进入降级态。"
        actionHint="请确认 com.ridou.defense-control 插件已经加载，并检查 broker action 是否可访问。"
        detail={loadError || 'feature unavailable'}
      />
    );
  }

  return (
    <Card>
      <Typography.Title heading={4}>防御控制系统</Typography.Title>
      <Typography.Paragraph>管理 Tailchat 混合档位防御体系与应用自保策略。</Typography.Paragraph>
      <Divider />

      <Form form={form} onSubmit={handleFormSubmit} layout="vertical" disabled={loading}>
        <Form.Item label="当前防御档位" field="mode">
          <Select
            options={[
              { label: 'L0 - 应用自保与观测', value: 'L0' },
              { label: 'L1 - 低成本增强', value: 'L1' },
              { label: 'L2 - 源站隐藏 (Cloudflare)', value: 'L2' },
              { label: 'L3 - 混合增强 (Cloudflare + 边缘节点)', value: 'L3' },
            ]}
          />
        </Form.Item>

        <Typography.Title heading={6}>应用自保配置 (L0)</Typography.Title>
        <Form.Item label="禁用新用户注册" field="disableRegister">
          <Switch />
        </Form.Item>
        <Form.Item label="禁用文件上传" field="disableUpload">
          <Switch />
        </Form.Item>

        <Typography.Title heading={6}>基础限流配置 (L1)</Typography.Title>
        <Form.Item label="开启 Nginx 限流" field="rateLimit.enable">
          <Switch />
        </Form.Item>
        <Form.Item label="每分钟请求数" field="rateLimit.requestsPerMinute">
          <InputNumber />
        </Form.Item>

        <Typography.Title heading={6}>Cloudflare 配置 (L2/L3)</Typography.Title>
        <Form.Item label="API Key" field="cloudflare.apiKey">
          <Input type="password" />
        </Form.Item>
        <Form.Item label="Email" field="cloudflare.email">
          <Input />
        </Form.Item>
        <Form.Item label="Zone ID" field="cloudflare.zoneId">
          <Input />
        </Form.Item>

        <Typography.Title heading={6}>自建边缘节点配置 (L3)</Typography.Title>
        <Typography.Paragraph>填写 JSON 格式的节点列表。包含 ip, name, mtlsCert, mtlsKey 字段。</Typography.Paragraph>
        <Form.Item label="边缘节点列表" field="selfEdges">
          <Input.TextArea rows={6} placeholder="[{ &quot;ip&quot;: &quot;1.2.3.4&quot;, &quot;name&quot;: &quot;node1&quot;, &quot;mtlsCert&quot;: &quot;...&quot;, &quot;mtlsKey&quot;: &quot;...&quot; }]" />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={updating}>
            保存配置并应用
          </Button>
        </Form.Item>
      </Form>

      <Divider />
      <Typography.Title heading={4}>近期切档审计日志</Typography.Title>
      <Table 
        loading={logsLoading}
        columns={[
          { title: '时间', dataIndex: 'createdAt', render: (val) => new Date(val).toLocaleString() },
          { title: '目标档位', dataIndex: 'mode' },
          { title: '操作', dataIndex: 'action' },
          { title: '状态', dataIndex: 'status', render: (val) => <Typography.Text type={val === 'SUCCESS' ? 'success' : 'danger'}>{val}</Typography.Text> },
          { title: '备注', dataIndex: 'message' },
        ]}
        data={auditLogs}
        rowKey="_id"
      />
    </Card>
  );
});

DefenseControlPanel.displayName = 'DefenseControlPanel';
