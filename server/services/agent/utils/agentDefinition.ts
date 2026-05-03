import type { AgentDefinition } from 'tailchat-types';

export function buildAgentDefinition(
  input: Pick<AgentDefinition, 'agentId' | 'name' | 'persona'> &
    Partial<AgentDefinition>
): AgentDefinition {
  return {
    agentId: input.agentId,
    name: input.name,
    avatar: input.avatar,
    persona: input.persona,
    domain: input.domain ?? 'general',
    runtimeMode: input.runtimeMode ?? 'openclaw-bridge',
    provider: input.provider,
    promptTemplate: input.promptTemplate,
    tags: input.tags ?? [],
    status: input.status ?? 'draft',
  };
}
