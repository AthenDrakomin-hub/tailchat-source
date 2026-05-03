import type { AgentDefinition } from 'tailchat-shared';

export function buildAgentBindingDisplay(
  definitions: AgentDefinition[],
  selectedAgentId: string
) {
  const matched = definitions.find((item) => item.agentId === selectedAgentId);

  if (!matched) {
    return null;
  }

  return {
    label: `${matched.name} (${matched.agentId})`,
    externalAgentId: matched.externalAgentId,
    provider: matched.provider,
    runtimeMode: matched.runtimeMode,
    domain: matched.domain,
    description: matched.description,
  };
}
