interface FriendInfoLike {
  id: string;
}

interface FriendRequestLike {
  from: string;
  to: string;
}

interface UserRelationshipStateInput {
  currentUserId?: string;
  targetUserId: string;
  friends: FriendInfoLike[];
  friendRequests: FriendRequestLike[];
}

export type UserRelationshipState =
  | 'self'
  | 'friend'
  | 'requested'
  | 'stranger';

export function getUserRelationshipState(
  input: UserRelationshipStateInput
): UserRelationshipState {
  if (input.currentUserId && input.currentUserId === input.targetUserId) {
    return 'self';
  }

  if (input.friends.some((item) => item.id === input.targetUserId)) {
    return 'friend';
  }

  if (
    input.currentUserId &&
    input.friendRequests.some(
      (item) =>
        item.from === input.currentUserId && item.to === input.targetUserId
    )
  ) {
    return 'requested';
  }

  return 'stranger';
}
