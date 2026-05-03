import React from 'react';
import { Button, Form, Input, Select, Typography } from 'tushan';

export interface AgentDefinitionFormValues {
  agentId: string;
  name: string;
  externalAgentId: string;
  domain: string;
  provider: string;
  description?: string;
  runtimeMode: 'openapi-http' | 'openapi-ws' | 'openclaw-bridge';
}

interface Props {
  onSubmit: (values: AgentDefinitionFormValues) => Promise<void> | void;
  loading?: boolean;
}

export const AgentDefinitionForm: React.FC<Props> = React.memo((props) => {
  const [form] = Form.useForm<AgentDefinitionFormValues>();

  return (
    <div>
      <Typography.Title heading={6}>新建外部 Agent 接入</Typography.Title>
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          domain: 'general',
          provider: 'openclaw',
          runtimeMode: 'openclaw-bridge',
        }}
        onSubmit={props.onSubmit}
      >
        <Form.Item field="agentId" label="Agent ID" rules={[{ required: true }]}>
          <Input placeholder="agent_teacher_finance" />
        </Form.Item>
        <Form.Item field="name" label="Agent 名称" rules={[{ required: true }]}>
          <Input placeholder="投教主讲老师" />
        </Form.Item>
        <Form.Item
          field="externalAgentId"
          label="外部 Agent ID"
          rules={[{ required: true }]}
        >
          <Input placeholder="openclaw.teacher.finance" />
        </Form.Item>
        <Form.Item field="provider" label="接入来源" rules={[{ required: true }]}>
          <Input placeholder="openclaw" />
        </Form.Item>
        <Form.Item field="description" label="接入说明">
          <Input.TextArea
            placeholder="说明这个外部 Agent 负责的业务角色和接入用途"
            rows={4}
          />
        </Form.Item>
        <Form.Item field="domain" label="所属行业域" rules={[{ required: true }]}>
          <Input placeholder="general / finance / education" />
        </Form.Item>
        <Form.Item field="runtimeMode" label="运行模式" rules={[{ required: true }]}>
          <Select
            options={[
              { label: 'OpenClaw Bridge', value: 'openclaw-bridge' },
              { label: 'OpenAPI HTTP', value: 'openapi-http' },
              { label: 'OpenAPI WS', value: 'openapi-ws' },
            ]}
          />
        </Form.Item>
        <Button type="primary" htmlType="submit" loading={props.loading}>
          保存接入配置
        </Button>
      </Form>
    </div>
  );
});

AgentDefinitionForm.displayName = 'AgentDefinitionForm';
