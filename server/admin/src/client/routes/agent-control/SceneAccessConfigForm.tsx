import React from 'react';
import { Button, Form, Input, Select, Switch, Typography } from 'tushan';

export interface SceneAccessConfigFormValues {
  sceneId: string;
  name: string;
  domain: string;
  target: 'personal-dm' | 'friendship' | 'group' | 'feed' | 'forum';
  enabledActions: string[];
  roleIdsText?: string;
  groupIdsText?: string;
  enabled: boolean;
}

interface Props {
  onSubmit: (values: SceneAccessConfigFormValues) => Promise<void> | void;
  loading?: boolean;
}

export const SceneAccessConfigForm: React.FC<Props> = React.memo((props) => {
  const [form] = Form.useForm<SceneAccessConfigFormValues>();

  return (
    <div>
      <Typography.Title heading={6}>新建场景接入配置</Typography.Title>
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          target: 'group',
          enabled: true,
          enabledActions: [],
        }}
        onSubmit={props.onSubmit}
      >
        <Form.Item field="sceneId" label="场景 ID" rules={[{ required: true }]}>
          <Input placeholder="group_growth" />
        </Form.Item>
        <Form.Item field="name" label="场景名称" rules={[{ required: true }]}>
          <Input placeholder="群活跃场景" />
        </Form.Item>
        <Form.Item field="domain" label="所属行业域" rules={[{ required: true }]}>
          <Input placeholder="finance / education / health" />
        </Form.Item>
        <Form.Item field="target" label="场景目标" rules={[{ required: true }]}>
          <Select
            options={[
              { label: '私聊', value: 'personal-dm' },
              { label: '好友关系', value: 'friendship' },
              { label: '群聊', value: 'group' },
              { label: '动态', value: 'feed' },
              { label: '论坛', value: 'forum' },
            ]}
          />
        </Form.Item>
        <Form.Item field="enabledActions" label="允许动作">
          <Select
            mode="multiple"
            options={[
              { label: '发动态', value: 'publish-post' },
              { label: '加好友', value: 'add-friend' },
              { label: '回复私聊', value: 'reply-dm' },
              { label: '加入群聊', value: 'join-group' },
              { label: '活跃群聊', value: 'engage-group' },
            ]}
          />
        </Form.Item>
        <Form.Item field="roleIdsText" label="角色范围">
          <Input placeholder="r_teacher, r_assistant" />
        </Form.Item>
        <Form.Item field="groupIdsText" label="群范围">
          <Input placeholder="g_demo, g_finance" />
        </Form.Item>
        <Form.Item field="enabled" label="启用状态" triggerPropName="checked">
          <Switch />
        </Form.Item>
        <Button type="primary" htmlType="submit" loading={props.loading}>
          保存场景配置
        </Button>
      </Form>
    </div>
  );
});

SceneAccessConfigForm.displayName = 'SceneAccessConfigForm';
