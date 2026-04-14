'use strict';
var __createBinding =
  (this && this.__createBinding) ||
  (Object.create
    ? function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        var desc = Object.getOwnPropertyDescriptor(m, k);
        if (
          !desc ||
          ('get' in desc ? !m.__esModule : desc.writable || desc.configurable)
        ) {
          desc = {
            enumerable: true,
            get: function () {
              return m[k];
            },
          };
        }
        Object.defineProperty(o, k2, desc);
      }
    : function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        o[k2] = m[k];
      });
var __setModuleDefault =
  (this && this.__setModuleDefault) ||
  (Object.create
    ? function (o, v) {
        Object.defineProperty(o, 'default', { enumerable: true, value: v });
      }
    : function (o, v) {
        o['default'] = v;
      });
var __importStar =
  (this && this.__importStar) ||
  function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null)
      for (var k in mod)
        if (k !== 'default' && Object.prototype.hasOwnProperty.call(mod, k))
          __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
  };
var __exportStar =
  (this && this.__exportStar) ||
  function (m, exports) {
    for (var p in m)
      if (p !== 'default' && !Object.prototype.hasOwnProperty.call(exports, p))
        __createBinding(exports, m, p);
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.Errors =
  exports.Utils =
  exports.db =
  exports.userType =
  exports.GroupPanelType =
  exports.checkEnvTrusty =
  exports.builtinAuthWhitelist =
  exports.buildUploadUrl =
  exports.config =
  exports.call =
  exports.allPermission =
  exports.PERMISSION =
  exports.ApiGatewayErrors =
  exports.ApiGatewayMixin =
  exports.t =
  exports.parseLanguageFromHead =
  exports.TcMinioService =
  exports.TcBroker =
  exports.TcService =
  exports.defaultBrokerConfig =
    void 0;
var moleculer_config_1 = require('./runner/moleculer.config');
Object.defineProperty(exports, 'defaultBrokerConfig', {
  enumerable: true,
  get: function () {
    return moleculer_config_1.defaultBrokerConfig;
  },
});
var base_1 = require('./services/base');
Object.defineProperty(exports, 'TcService', {
  enumerable: true,
  get: function () {
    return base_1.TcService;
  },
});
var broker_1 = require('./services/broker');
Object.defineProperty(exports, 'TcBroker', {
  enumerable: true,
  get: function () {
    return broker_1.TcBroker;
  },
});
var minio_mixin_1 = require('./services/mixins/minio.mixin');
Object.defineProperty(exports, 'TcMinioService', {
  enumerable: true,
  get: function () {
    return minio_mixin_1.TcMinioService;
  },
});
var parser_1 = require('./services/lib/i18n/parser');
Object.defineProperty(exports, 'parseLanguageFromHead', {
  enumerable: true,
  get: function () {
    return parser_1.parseLanguageFromHead;
  },
});
var i18n_1 = require('./services/lib/i18n');
Object.defineProperty(exports, 't', {
  enumerable: true,
  get: function () {
    return i18n_1.t;
  },
});
var moleculer_web_1 = require('./services/lib/moleculer-web');
Object.defineProperty(exports, 'ApiGatewayMixin', {
  enumerable: true,
  get: function () {
    return moleculer_web_1.ApiGatewayMixin;
  },
});
exports.ApiGatewayErrors = __importStar(
  require('./services/lib/moleculer-web/errors')
);
__exportStar(require('./services/lib/errors'), exports);
var role_1 = require('./services/lib/role');
Object.defineProperty(exports, 'PERMISSION', {
  enumerable: true,
  get: function () {
    return role_1.PERMISSION;
  },
});
Object.defineProperty(exports, 'allPermission', {
  enumerable: true,
  get: function () {
    return role_1.allPermission;
  },
});
var call_1 = require('./services/lib/call');
Object.defineProperty(exports, 'call', {
  enumerable: true,
  get: function () {
    return call_1.call;
  },
});
var settings_1 = require('./services/lib/settings');
Object.defineProperty(exports, 'config', {
  enumerable: true,
  get: function () {
    return settings_1.config;
  },
});
Object.defineProperty(exports, 'buildUploadUrl', {
  enumerable: true,
  get: function () {
    return settings_1.buildUploadUrl;
  },
});
Object.defineProperty(exports, 'builtinAuthWhitelist', {
  enumerable: true,
  get: function () {
    return settings_1.builtinAuthWhitelist;
  },
});
Object.defineProperty(exports, 'checkEnvTrusty', {
  enumerable: true,
  get: function () {
    return settings_1.checkEnvTrusty;
  },
});
var group_1 = require('./structs/group');
Object.defineProperty(exports, 'GroupPanelType', {
  enumerable: true,
  get: function () {
    return group_1.GroupPanelType;
  },
});
var user_1 = require('./structs/user');
Object.defineProperty(exports, 'userType', {
  enumerable: true,
  get: function () {
    return user_1.userType;
  },
});
// db
exports.db = __importStar(require('./db'));
// openapi
__exportStar(require('./openapi'), exports);
__exportStar(require('./const'), exports);
// other
var moleculer_1 = require('moleculer');
Object.defineProperty(exports, 'Utils', {
  enumerable: true,
  get: function () {
    return moleculer_1.Utils;
  },
});
Object.defineProperty(exports, 'Errors', {
  enumerable: true,
  get: function () {
    return moleculer_1.Errors;
  },
});
/**
 * 统一处理未捕获的错误, 防止直接把应用打崩
 * NOTICE: 未经测试
 */
process.on('unhandledRejection', (reason, promise) => {
  console.error('unhandledRejection', reason);
});
process.on('uncaughtException', (error, origin) => {
  console.error('uncaughtException', error);
});
