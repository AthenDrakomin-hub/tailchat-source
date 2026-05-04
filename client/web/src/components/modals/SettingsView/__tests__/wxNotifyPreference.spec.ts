import { normalizeWxNotifyPreference } from '../wxNotifyPreference';

describe('normalizeWxNotifyPreference', () => {
  test('uses safe defaults when preference is missing', () => {
    expect(normalizeWxNotifyPreference(undefined)).toEqual({
      mention: true,
      directMessage: false,
    });
  });

  test('keeps explicit preference values', () => {
    expect(
      normalizeWxNotifyPreference({
        mention: false,
        directMessage: true,
      })
    ).toEqual({
      mention: false,
      directMessage: true,
    });
  });
});
