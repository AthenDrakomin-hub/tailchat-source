import { buildAgentDefinition } from '../utils/agentDefinition';

describe('agentDefinition', () => {
  test('builds external agent config with infrastructure defaults', () => {
    expect(
      buildAgentDefinition({
        agentId: 'agent_teacher_finance',
        name: '投教主讲老师',
        externalAgentId: 'openclaw.teacher.finance',
      })
    ).toMatchObject({
      agentId: 'agent_teacher_finance',
      name: '投教主讲老师',
      externalAgentId: 'openclaw.teacher.finance',
      provider: 'openclaw',
      domain: 'general',
      runtimeMode: 'openclaw-bridge',
      status: 'draft',
    });
  });
});
