import type { AgentScriptTemplate } from 'tailchat-types';

export function buildAgentScriptTemplate(
  input: Pick<AgentScriptTemplate, 'scriptId' | 'name' | 'domain' | 'stages'> &
    Partial<AgentScriptTemplate>
): AgentScriptTemplate {
  return {
    scriptId: input.scriptId,
    name: input.name,
    domain: input.domain,
    stages: input.stages,
    entryTrigger: input.entryTrigger,
    conversionGoal: input.conversionGoal,
    forumSinkMode: input.forumSinkMode ?? 'topic-thread',
  };
}
