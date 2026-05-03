import type { AgentRoleBinding } from 'tailchat-types';

export function buildAgentRoleBinding(
  input: Pick<AgentRoleBinding, 'groupId' | 'roleId' | 'agentId'> &
    Partial<AgentRoleBinding>
): AgentRoleBinding {
  return {
    groupId: input.groupId,
    roleId: input.roleId,
    agentId: input.agentId,
    panelIds: input.panelIds ?? [],
    triggerMode: input.triggerMode ?? 'mention-or-script',
    active: input.active ?? true,
  };
}
