import { isAllowedPluginUrl } from './allowedPluginUrl';

describe('isAllowedPluginUrl', () => {
  test('allows relative /plugins url', () => {
    expect(isAllowedPluginUrl('/plugins/com.msgbyte.demo/index.js')).toBe(true);
  });

  test('allows {BACKEND}/plugins url', () => {
    expect(
      isAllowedPluginUrl('{BACKEND}/plugins/com.msgbyte.demo/index.js')
    ).toBe(true);
  });

  test('rejects third-party https url', () => {
    expect(isAllowedPluginUrl('https://evil.example.com/p.js')).toBe(false);
  });
});

