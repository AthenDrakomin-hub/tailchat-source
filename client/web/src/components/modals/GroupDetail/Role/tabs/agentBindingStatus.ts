import { buildAgentBindingDisplay } from './agentBindingDisplay';

type AgentBindingSummary = ReturnType<typeof buildAgentBindingDisplay>;

export function buildAgentBindingStatus(summary: AgentBindingSummary) {
  if (!summary) {
    return {
      status: 'unbound' as const,
      title: '未绑定外部 Agent',
      description: '当前角色只使用财讯底座中的角色样式与权限配置，尚未接入 OpenClaw 外部 Agent。',
    };
  }

  return {
    status: 'bound' as const,
    title: '已绑定外部 Agent',
    description: '当前角色已接入外部 Agent，可按提及或场景触发进入 OpenClaw runtime。',
  };
}
