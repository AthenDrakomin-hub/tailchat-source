import { getUserIdentityTags } from '../identityTags';

describe('identityTags', () => {
  test('does not expose technical bot identity tags by default', () => {
    expect(
      getUserIdentityTags({
        type: 'openapiBot',
        temporary: false,
      } as any)
    ).toEqual([]);

    expect(
      getUserIdentityTags({
        type: 'pluginBot',
        temporary: false,
      } as any)
    ).toEqual([]);
  });

  test('keeps temporary visitor tag', () => {
    expect(
      getUserIdentityTags({
        type: 'user',
        temporary: true,
      } as any)
    ).toEqual(['游客']);
  });
});
