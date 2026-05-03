import type { AgentSceneConfig } from 'tailchat-types';

export function buildAgentSceneConfig(
  input: Pick<AgentSceneConfig, 'sceneId' | 'name' | 'domain' | 'target'> &
    Partial<AgentSceneConfig>
): AgentSceneConfig {
  return {
    sceneId: input.sceneId,
    name: input.name,
    domain: input.domain,
    target: input.target,
    enabledActions: input.enabledActions ?? [],
    roleIds: input.roleIds ?? [],
    groupIds: input.groupIds ?? [],
    enabled: input.enabled ?? true,
  };
}
