import { TcContext, TcService } from 'tailchat-server-sdk';
import got from 'got';

class AgentBridgeOpenClawService extends TcService {
  get serviceName(): string {
    return 'agent.bridge-openclaw';
  }

  onInit(): void {
    this.registerAction('dispatch', this.dispatch, {
      params: {
        appId: 'string',
        eventType: 'string',
        payload: 'any',
        bridgeEndpoint: 'string',
        bridgeToken: { type: 'string', optional: true },
      },
    });
  }

  async dispatch(
    ctx: TcContext<{
      appId: string;
      eventType: string;
      payload: unknown;
      bridgeEndpoint: string;
      bridgeToken?: string;
    }>
  ) {
    const { appId, eventType, payload, bridgeEndpoint, bridgeToken } = ctx.params;

    await got.post(bridgeEndpoint, {
        json: {
          appId,
          eventType,
          payload,
        },
        headers: {
          ...(bridgeToken ? { Authorization: `Bearer ${bridgeToken}` } : {}),
          'X-TC-Agent-Runtime': 'openclaw-bridge',
        },
      })
      .text();

    return { ok: true };
  }
}

export default AgentBridgeOpenClawService;
