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

export type AgentSceneTarget =
  | 'personal-dm'
  | 'friendship'
  | 'group'
  | 'feed'
  | 'forum';

export type AgentSceneAction =
  | 'publish-post'
  | 'add-friend'
  | 'reply-dm'
  | 'join-group'
  | 'engage-group';

export interface AgentSceneConfig {
  sceneId: string;
  name: string;
  domain: string;
  target: AgentSceneTarget;
  enabledActions: AgentSceneAction[];
  roleIds: string[];
  groupIds: string[];
  enabled: boolean;
}

export interface AgentAnalyticsEvent {
  agentId: string;
  eventType: string;
  sourceSceneId?: string;
  groupId?: string;
  roleId?: string;
  conversionLabel?: string;
  metadata?: Record<string, unknown>;
}

export interface AgentComplianceRule {
  action: string;
  blocked: boolean;
  reason?: string;
  scopeSceneId?: string;
  scopeGroupId?: string;
  scopeRoleId?: string;
}
