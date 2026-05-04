import { buildBuiltinQuickActions } from '../useQuickSwitcherAllAction';

describe('buildBuiltinQuickActions', () => {
  test('does not expose plugin center builtin action', () => {
    const actions = buildBuiltinQuickActions();

    expect(actions.find((item: any) => item.key === 'plugins')).toBeUndefined();
  });
});
