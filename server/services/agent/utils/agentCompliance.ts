import type { AgentComplianceRule } from 'tailchat-types';

export function buildAgentComplianceRule(
  input: Pick<AgentComplianceRule, 'action' | 'blocked'> &
    Partial<AgentComplianceRule>
): AgentComplianceRule {
  return {
    action: input.action,
    blocked: input.blocked,
    reason: input.reason,
    scopeSceneId: input.scopeSceneId,
    scopeGroupId: input.scopeGroupId,
    scopeRoleId: input.scopeRoleId,
  };
}
