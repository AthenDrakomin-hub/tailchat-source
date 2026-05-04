import { TcContext, TcService } from 'tailchat-server-sdk';
import got from 'got';
import type { OpenApp } from '../../models/openapi/app';
import { resolveOpenAppBotRuntime } from './utils/openAppBotRuntime';

class AgentRuntimeService extends TcService {
  get serviceName(): string {
    return 'agent.runtime';
  }

  onInit(): void {
    this.registerAction('dispatchOpenAppBotEvent', this.dispatchOpenAppBotEvent, {
      params: {
        appId: 'string',
        eventType: 'string',
        payload: 'any',
      },
    });
  }

  async dispatchOpenAppBotEvent(
    ctx: TcContext<{
      appId: string;
      eventType: string;
      payload: unknown;
    }>
  ) {
    const { appId, eventType, payload } = ctx.params;
    const appInfo: OpenApp | null = await ctx.call('openapi.app.get', { appId });

    const runtime = resolveOpenAppBotRuntime(appInfo?.bot);

    if (runtime.runtimeMode === 'openclaw-bridge') {
      return await ctx.call('agent.bridge-openclaw.dispatch', {
        appId,
        eventType,
        payload,
        bridgeEndpoint: runtime.bridgeEndpoint,
        bridgeToken: runtime.bridgeToken,
      });
    }

    await got.post(runtime.callbackUrl, {
        json: payload,
        headers: {
          'X-TC-Payload-Type': eventType,
        },
      })
      .text();

    return { ok: true };
  }
}

export default AgentRuntimeService;
