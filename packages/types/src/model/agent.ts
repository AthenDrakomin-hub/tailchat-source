export type AgentRuntimeMode =
  | 'openapi-http'
  | 'openapi-ws'
  | 'openclaw-bridge';

export type AgentStatus = 'draft' | 'active' | 'paused';

export interface AgentDefinition {
  agentId: string;
  name: string;
  avatar?: string;
  persona: string;
  domain: string;
  runtimeMode: AgentRuntimeMode;
  provider?: string;
  promptTemplate?: string;
  tags?: string[];
  status: AgentStatus;
}
