import React from 'react';
import { Button, Form, Input, Select, Typography } from 'tushan';

export interface ScriptTemplateFormValues {
  scriptId: string;
  name: string;
  domain: string;
  stagesText: string;
  entryTrigger?: string;
  conversionGoal?: string;
  forumSinkMode: 'topic-thread' | 'knowledge-base' | 'qa-archive';
  forumTargetCategory?: string;
  forumPostTitleTemplate?: string;
  archiveTagsText?: string;
}

interface Props {
  onSubmit: (values: ScriptTemplateFormValues) => Promise<void> | void;
  loading?: boolean;
}

export const ScriptTemplateForm: React.FC<Props> = React.memo((props) => {
  const [form] = Form.useForm<ScriptTemplateFormValues>();

  return (
    <div>
      <Typography.Title heading={6}>新建剧本模板</Typography.Title>
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          forumSinkMode: 'topic-thread',
        }}
        onSubmit={props.onSubmit}
      >
        <Form.Item field="scriptId" label="模板 ID" rules={[{ required: true }]}>
          <Input placeholder="finance_evening_course" />
        </Form.Item>
        <Form.Item field="name" label="模板名称" rules={[{ required: true }]}>
          <Input placeholder="金融投教晚间转化脚本" />
        </Form.Item>
        <Form.Item field="domain" label="所属行业域" rules={[{ required: true }]}>
          <Input placeholder="finance / education / health" />
        </Form.Item>
        <Form.Item field="stagesText" label="阶段列表" rules={[{ required: true }]}>
          <Input.TextArea
            rows={4}
            placeholder={'预热\n讲课\n互动\n转化\n复盘'}
          />
        </Form.Item>
        <Form.Item field="entryTrigger" label="进入触发条件">
          <Input placeholder="例如：新用户入群后 10 分钟" />
        </Form.Item>
        <Form.Item field="conversionGoal" label="转化目标">
          <Input placeholder="例如：成交课程报名" />
        </Form.Item>
        <Form.Item field="forumSinkMode" label="论坛沉淀方式" rules={[{ required: true }]}>
          <Select
            options={[
              { label: '话题帖子', value: 'topic-thread' },
              { label: '知识库条目', value: 'knowledge-base' },
              { label: '问答归档', value: 'qa-archive' },
            ]}
          />
        </Form.Item>
        <Form.Item field="forumTargetCategory" label="论坛目标分类">
          <Input placeholder="例如：投教精选" />
        </Form.Item>
        <Form.Item field="forumPostTitleTemplate" label="沉淀标题模板">
          <Input placeholder="{{date}} 投教晚课纪要" />
        </Form.Item>
        <Form.Item field="archiveTagsText" label="归档标签">
          <Input placeholder="投教, 晚课, 转化" />
        </Form.Item>
        <Button type="primary" htmlType="submit" loading={props.loading}>
          保存剧本模板
        </Button>
      </Form>
    </div>
  );
});

ScriptTemplateForm.displayName = 'ScriptTemplateForm';
