'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.TcBroker = void 0;
const moleculer_1 = __importDefault(require('moleculer'));
/**
 * 用于不暴露moleculer让外部手动启动一个broker
 *
 * 如tailchat-cli
 */
class TcBroker extends moleculer_1.default.ServiceBroker {}
exports.TcBroker = TcBroker;
