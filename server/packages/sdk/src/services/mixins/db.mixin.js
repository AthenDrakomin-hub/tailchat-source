'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.TcDbService = void 0;
const moleculer_1 = require('moleculer');
const moleculer_db_1 = __importDefault(require('moleculer-db'));
const moleculer_db_adapter_mongoose_1 = require('../lib/moleculer-db-adapter-mongoose');
const settings_1 = require('../lib/settings');
/**
 * Tc 数据库mixin
 * @param model 数据模型
 */
function TcDbService(model) {
  const actions = {
    /**
     * 自动操作全关
     */
    find: false,
    count: false,
    list: false,
    create: false,
    insert: false,
    get: false,
    update: false,
    remove: false,
  };
  const methods = {
    /**
     * 实体变更时触发事件
     */
    async entityChanged(type, json, ctx) {
      await this.clearCache();
      const eventName = `${this.name}.entity.${type}`;
      this.broker.emit(eventName, { meta: ctx.meta, entity: json });
    },
  };
  if (!settings_1.config.mongoUrl) {
    throw new moleculer_1.Errors.MoleculerClientError('需要环境变量 MONGO_URL');
  }
  return {
    mixins: [moleculer_db_1.default],
    adapter: new moleculer_db_adapter_mongoose_1.MongooseDbAdapter(
      settings_1.config.mongoUrl,
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }
    ),
    model,
    actions,
    methods,
  };
}
exports.TcDbService = TcDbService;
