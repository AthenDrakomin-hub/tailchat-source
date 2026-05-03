import { buildAgentDefinition } from '../utils/agentDefinition';

describe('agentDefinition', () => {
  test('builds agent definition with product defaults', () => {
    expect(
      buildAgentDefinition({
        agentId: 'agent_teacher',
        name: '投教主讲老师',
        persona: '负责建立信任、讲解课程并推进转化',
      })
    ).toMatchObject({
      agentId: 'agent_teacher',
      name: '投教主讲老师',
      persona: '负责建立信任、讲解课程并推进转化',
      domain: 'general',
      runtimeMode: 'openclaw-bridge',
      status: 'draft',
    });
  });
});
