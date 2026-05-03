export type AgentRuntimeMode =
  | 'openapi-http'
  | 'openapi-ws'
  | 'openclaw-bridge';

export type AgentStatus = 'draft' | 'active' | 'paused';

export interface AgentDefinition {
  agentId: string;
  name: string;
  avatar?: string;
  externalAgentId: string;
  domain: string;
  runtimeMode: AgentRuntimeMode;
  provider: string;
  description?: string;
  availableScopes?: string[];
  tags?: string[];
  status: AgentStatus;
}

export type AgentTriggerMode =
  | 'mention-only'
  | 'mention-or-script'
  | 'script-only';

export interface AgentRoleBinding {
  groupId: string;
  roleId: string;
  panelIds: string[];
  agentId: string;
  triggerMode: AgentTriggerMode;
  active: boolean;
}

export type AgentForumSinkMode =
  | 'topic-thread'
  | 'knowledge-base'
  | 'qa-archive';

export interface AgentScriptTemplate {
  scriptId: string;
  name: string;
  domain: string;
  stages: string[];
  entryTrigger?: string;
  conversionGoal?: string;
  forumSinkMode: AgentForumSinkMode;
  forumTargetCategory?: string;
  forumPostTitleTemplate?: string;
  archiveTags: string[];
}
