import { request } from '../api/request';
import type {
  AgentDefinition,
  AgentRoleBinding,
  AgentTriggerMode,
} from 'tailchat-types';

export type { AgentDefinition, AgentRoleBinding, AgentTriggerMode };

export async function listAgentDefinitions(): Promise<AgentDefinition[]> {
  const { data } = await request.post('/api/agent/definition/list', {});
  return Array.isArray(data) ? data : [];
}

export async function getAgentRoleBinding(
  groupId: string,
  roleId: string
): Promise<AgentRoleBinding | null> {
  const { data } = await request.post('/api/agent/binding/get', {
    groupId,
    roleId,
  });
  return data ?? null;
}

export async function upsertAgentRoleBinding(
  payload: AgentRoleBinding
): Promise<AgentRoleBinding> {
  const { data } = await request.post('/api/agent/binding/upsert', payload);
  return data;
}
