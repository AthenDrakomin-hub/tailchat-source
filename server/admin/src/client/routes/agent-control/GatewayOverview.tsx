import React from 'react';
import { Card, Typography } from 'tushan';
import { TagItems } from '../../components/TagItems';

interface Props {
  agentCount: number;
  sceneCount: number;
  analyticsCount: number;
  complianceCount: number;
  providers: string[];
  runtimeModes: string[];
}

const OverviewItem: React.FC<{
  title: string;
  value: number;
  description: string;
}> = React.memo((props) => {
  return (
    <div
      style={{
        flex: '1 1 220px',
        minWidth: 220,
        padding: 16,
        border: '1px solid rgba(15, 23, 42, 0.08)',
        borderRadius: 12,
        background: '#fff',
      }}
    >
      <div style={{ fontSize: 12, color: '#64748b', marginBottom: 8 }}>
        {props.title}
      </div>
      <div style={{ fontSize: 28, fontWeight: 600, marginBottom: 8 }}>
        {props.value}
      </div>
      <div style={{ fontSize: 13, color: '#475569' }}>{props.description}</div>
    </div>
  );
});

OverviewItem.displayName = 'OverviewItem';

export const GatewayOverview: React.FC<Props> = React.memo((props) => {
  return (
    <Card>
      <Typography.Title heading={6}>底座概览</Typography.Title>
      <Typography.Paragraph>
        Tailchat 负责入口、连接、记录和限制；OpenClaw 负责 Agent 总控、剧本单元、导演调度和策略执行。
      </Typography.Paragraph>

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 16 }}>
        <OverviewItem
          title="外部 Agent 接入"
          value={props.agentCount}
          description="登记外部 Agent 的接入来源、ID 与运行模式"
        />
        <OverviewItem
          title="场景接入配置"
          value={props.sceneCount}
          description="定义哪些场景允许哪些动作进入底座"
        />
        <OverviewItem
          title="转化分析事件"
          value={props.analyticsCount}
          description="记录外部 Agent 在底座中发生的关键事件与转化标签"
        />
        <OverviewItem
          title="合规规则"
          value={props.complianceCount}
          description="限制动作边界、作用范围与人工审核要求"
        />
      </div>

      <Typography.Title heading={6}>接入来源</Typography.Title>
      <TagItems items={props.providers.length > 0 ? props.providers : ['openclaw']} />

      <Typography.Title heading={6}>运行模式</Typography.Title>
      <TagItems
        items={
          props.runtimeModes.length > 0
            ? props.runtimeModes
            : ['openclaw-bridge']
        }
      />
    </Card>
  );
});

GatewayOverview.displayName = 'GatewayOverview';
