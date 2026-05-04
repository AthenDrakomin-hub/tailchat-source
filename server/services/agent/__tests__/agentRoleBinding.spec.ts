import { buildAgentRoleBinding } from '../utils/agentRoleBinding';

describe('agentRoleBinding', () => {
  test('builds role binding with product defaults', () => {
    expect(
      buildAgentRoleBinding({
        groupId: 'g1',
        roleId: 'r1',
        agentId: 'agent_teacher',
      })
    ).toMatchObject({
      groupId: 'g1',
      roleId: 'r1',
      agentId: 'agent_teacher',
      panelIds: [],
      triggerMode: 'mention-or-script',
      active: true,
    });
  });
});
