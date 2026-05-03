import type { AgentAnalyticsEvent } from 'tailchat-types';

export function buildAgentAnalyticsEvent(
  input: Pick<AgentAnalyticsEvent, 'agentId' | 'eventType'> &
    Partial<AgentAnalyticsEvent>
): AgentAnalyticsEvent {
  return {
    agentId: input.agentId,
    eventType: input.eventType,
    sourceSceneId: input.sourceSceneId,
    groupId: input.groupId,
    roleId: input.roleId,
    conversionLabel: input.conversionLabel,
    metadata: input.metadata ?? {},
  };
}
