import { TcBroker, SYSTEM_USERID } from 'tailchat-server-sdk';
import brokerConfig from '../../../moleculer.config';

function resolveTransporter() {
  const tcpPeers = String(process.env.ADMIN_BROKER_TCP_PEERS ?? '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
  const tcpPort = Number(process.env.ADMIN_BROKER_TCP_PORT ?? 0);
  const transporter = process.env.TRANSPORTER ?? (brokerConfig as any).transporter;

  if (tcpPeers.length === 0 && tcpPort <= 0 && transporter !== 'TCP') {
    return transporter;
  }

  return {
    type: 'TCP',
    options: {
      port: tcpPort > 0 ? tcpPort : undefined,
      urls: tcpPeers.length > 0 ? tcpPeers : undefined,
      udpDiscovery: false,
      useHostname: false,
    },
  };
}

const transporter = resolveTransporter();
export const broker = new TcBroker({
  ...brokerConfig,
  nodeID: process.env.ADMIN_BROKER_NODE_ID || brokerConfig.nodeID,
  cacher: null,
  metrics: false,
  logger: false,
  transporter,
});

broker.start().then(() => {
  console.log('Connnected to Tailchat network, TRANSPORTER: ', transporter);
});

export function callBrokerAction<T>(
  actionName: string,
  params: any,
  opts?: Record<string, any>
): Promise<T> {
  return broker.call(actionName, params, {
    ...opts,
    meta: {
      ...opts?.meta,
      userId: SYSTEM_USERID,
    },
  });
}
