"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tailchat_server_sdk_1 = require("tailchat-server-sdk");
const brokerConfig = {
    ...tailchat_server_sdk_1.defaultBrokerConfig,
};
if (tailchat_server_sdk_1.config.feature.disableLogger === true) {
    brokerConfig.logger = false;
}
if (tailchat_server_sdk_1.config.feature.disableInfoLog === true) {
    brokerConfig.logLevel = 'error';
}
if (tailchat_server_sdk_1.config.feature.disableTracing === true) {
    brokerConfig.tracing = undefined;
}
exports.default = brokerConfig;
