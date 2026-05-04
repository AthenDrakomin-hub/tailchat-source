import { buildAgentComplianceRule } from '../utils/agentCompliance';

describe('agentCompliance', () => {
  test('builds compliance rule for blocked action', () => {
    expect(
      buildAgentComplianceRule({
        action: 'add-friend',
        blocked: true,
        reason: 'manual review required',
      })
    ).toMatchObject({
      action: 'add-friend',
      blocked: true,
      reason: 'manual review required',
    });
  });
});
