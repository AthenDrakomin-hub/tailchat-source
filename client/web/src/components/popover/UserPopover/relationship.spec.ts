import { getUserRelationshipState } from './relationship';

describe('user relationship state', () => {
  test('returns self when target is current user', () => {
    expect(
      getUserRelationshipState({
        currentUserId: 'u1',
        targetUserId: 'u1',
        friends: [],
        friendRequests: [],
      })
    ).toBe('self');
  });

  test('returns friend when target exists in friend list', () => {
    expect(
      getUserRelationshipState({
        currentUserId: 'u1',
        targetUserId: 'u2',
        friends: [{ id: 'u2' }],
        friendRequests: [],
      })
    ).toBe('friend');
  });

  test('returns requested when outbound request already exists', () => {
    expect(
      getUserRelationshipState({
        currentUserId: 'u1',
        targetUserId: 'u3',
        friends: [],
        friendRequests: [
          {
            _id: 'r1',
            from: 'u1',
            to: 'u3',
            message: '',
          },
        ],
      })
    ).toBe('requested');
  });

  test('returns stranger by default', () => {
    expect(
      getUserRelationshipState({
        currentUserId: 'u1',
        targetUserId: 'u4',
        friends: [],
        friendRequests: [],
      })
    ).toBe('stranger');
  });
});
