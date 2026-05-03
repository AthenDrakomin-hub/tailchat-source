import type { OpenAppBot } from '../../../models/openapi/app';

export function resolveOpenAppBotRuntime(bot?: OpenAppBot | null) {
  return {
    runtimeMode: bot?.runtimeMode ?? 'openapi-http',
    callbackUrl: bot?.callbackUrl ?? '',
    bridgeEndpoint: bot?.bridgeEndpoint ?? '',
    bridgeToken: bot?.bridgeToken ?? '',
  };
}
