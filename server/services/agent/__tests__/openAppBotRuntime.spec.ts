import { resolveOpenAppBotRuntime } from '../utils/openAppBotRuntime';

describe('openAppBotRuntime', () => {
  test('uses http callback as default runtime mode', () => {
    expect(
      resolveOpenAppBotRuntime({
        callbackUrl: 'https://example.com/callback',
      })
    ).toMatchObject({
      runtimeMode: 'openapi-http',
      callbackUrl: 'https://example.com/callback',
    });
  });

  test('uses openclaw bridge when explicitly configured', () => {
    expect(
      resolveOpenAppBotRuntime({
        callbackUrl: 'https://example.com/callback',
        runtimeMode: 'openclaw-bridge',
        bridgeEndpoint: 'https://bridge.example.com/dispatch',
        bridgeToken: 'bridge-token',
      })
    ).toMatchObject({
      runtimeMode: 'openclaw-bridge',
      bridgeEndpoint: 'https://bridge.example.com/dispatch',
      bridgeToken: 'bridge-token',
    });
  });
});
