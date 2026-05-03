import { getGroupPanelRoleStyle } from '../roleStyle';
import { GroupPanelType } from 'tailchat-shared';

describe('group panel role style', () => {
  test('returns matched role style in combined mode', () => {
    expect(
      getGroupPanelRoleStyle(
        {
          _id: 'g1',
          name: '群',
          owner: 'u0',
          description: '',
          members: [{ userId: 'u1', roles: ['r2'] }],
          panels: [
            {
              id: 'p1',
              name: '大厅',
              type: GroupPanelType.TEXT,
              meta: {
                speakPolicy: {
                  readability: {
                    roleStyleMode: 'combined',
                    roleStyleMap: {
                      r2: {
                        nicknameColor: '#ff4d4f',
                        avatarRingColor: '#52c41a',
                        sideAccentColor: '#1677ff',
                      },
                    },
                  },
                },
              },
            },
          ],
          roles: [{ _id: 'r2', name: '运营', permissions: [] }],
          fallbackPermissions: [],
          config: {},
        } as any,
        'p1',
        'u1'
      )
    ).toEqual({
      nicknameColor: '#ff4d4f',
      avatarRingColor: '#52c41a',
      sideAccentColor: '#1677ff',
    });
  });
});
