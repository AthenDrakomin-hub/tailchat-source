import {
  defaultBrokerConfig,
  config,
  BrokerOptions,
} from 'tailchat-server-sdk';

const brokerConfig: BrokerOptions = {
  ...defaultBrokerConfig,
};

const mainBrokerNodeId = process.env.MAIN_BROKER_NODE_ID;
const mainBrokerTcpPort = Number(process.env.MAIN_BROKER_TCP_PORT ?? 0);
const mainBrokerTcpPeers = String(process.env.MAIN_BROKER_TCP_PEERS ?? '')
  .split(',')
  .map((item) => item.trim())
  .filter(Boolean);

if (mainBrokerNodeId) {
  brokerConfig.nodeID = mainBrokerNodeId;
}

if (mainBrokerTcpPort > 0 || mainBrokerTcpPeers.length > 0 || (process.env.TRANSPORTER ?? '') === 'TCP') {
  brokerConfig.transporter = {
    type: 'TCP',
    options: {
      port: mainBrokerTcpPort > 0 ? mainBrokerTcpPort : undefined,
      urls: mainBrokerTcpPeers.length > 0 ? mainBrokerTcpPeers : undefined,
      udpDiscovery: false,
      useHostname: false,
    },
  } as any;
}

if (!process.env.REDIS_URL) {
  brokerConfig.cacher = null;
}

if (config.feature.disableLogger === true) {
  brokerConfig.logger = false;
}

if (config.feature.disableInfoLog === true) {
  brokerConfig.logLevel = 'error';
}

if (config.feature.disableTracing === true) {
  brokerConfig.tracing = undefined;
}

export default brokerConfig;
