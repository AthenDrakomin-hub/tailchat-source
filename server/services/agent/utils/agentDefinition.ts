import type { AgentDefinition } from 'tailchat-types';

export function buildAgentDefinition(
  input: Pick<AgentDefinition, 'agentId' | 'name' | 'externalAgentId'> &
    Partial<AgentDefinition>
): AgentDefinition {
  return {
    agentId: input.agentId,
    name: input.name,
    avatar: input.avatar,
    externalAgentId: input.externalAgentId,
    domain: input.domain ?? 'general',
    runtimeMode: input.runtimeMode ?? 'openclaw-bridge',
    provider: input.provider ?? 'openclaw',
    description: input.description,
    availableScopes: input.availableScopes ?? [],
    tags: input.tags ?? [],
    status: input.status ?? 'draft',
  };
}
