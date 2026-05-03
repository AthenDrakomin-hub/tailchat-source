import type { UserBaseInfo } from 'tailchat-shared';

export function getUserIdentityTags(userInfo: UserBaseInfo): string[] {
  const tags: string[] = [];

  if (userInfo.temporary) {
    tags.push('游客');
  }

  return tags;
}
