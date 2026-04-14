'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.TcService = void 0;
const moleculer_1 = require('moleculer');
const lodash_1 = require('lodash');
const db_mixin_1 = require('./mixins/db.mixin');
const i18n_1 = require('./lib/i18n');
const const_1 = require('../const');
const lodash_2 = __importDefault(require('lodash'));
const utils_1 = require('../utils');
/**
 * 生成AfterHook唯一键
 */
function generateAfterHookKey(actionName, serviceName = '') {
  if (serviceName) {
    return (0, utils_1.encodeNoConflictServiceNameKey)(
      `${const_1.CONFIG_GATEWAY_AFTER_HOOK}.${serviceName}.${actionName}`
    );
  } else {
    return (0, utils_1.encodeNoConflictServiceNameKey)(
      `${const_1.CONFIG_GATEWAY_AFTER_HOOK}.${actionName}`
    );
  }
}
class TcService extends moleculer_1.Service {
  _mixins = [];
  _actions = {};
  _methods = {};
  _settings = {};
  _events = {};
  /**
   * 全局的配置中心
   */
  globalConfig = {};
  _generateAndParseSchema() {
    this.parseServiceSchema({
      name: this.serviceName,
      mixins: this._mixins,
      settings: this._settings,
      actions: this._actions,
      events: this._events,
      started: this.onStart,
      stopped: this.onStop,
      hooks: this.buildHooks(),
    });
  }
  constructor(broker) {
    super(broker); // Skip 父级的 parseServiceSchema 方法
    this.onInit(); // 初始化服务
    this.initBuiltin(); // 初始化内部服务
    this._generateAndParseSchema();
    this.logger = this.buildLoggerWithPrefix(this.logger);
    this.onInited(); // 初始化完毕
  }
  onInited() {}
  async onStart() {}
  async onStop() {}
  initBuiltin() {
    this.registerEventListener('config.updated', (payload) => {
      this.logger.info('Update global config with:', payload.config);
      if (payload.config) {
        this.globalConfig = {
          ...payload.config,
        };
      }
    });
  }
  /**
   * 构建内部hooks
   */
  buildHooks() {
    return {
      after: lodash_2.default.mapValues(this._actions, (action, name) => {
        return (ctx, res) => {
          try {
            const afterHooks =
              this.globalConfig[generateAfterHookKey(name, this.serviceName)];
            if (Array.isArray(afterHooks) && afterHooks.length > 0) {
              for (const action of afterHooks) {
                // 异步调用, 暂时不修改值
                ctx.call(String(action), ctx.params, {
                  meta: {
                    ...ctx.meta,
                    actionResult: res,
                  },
                });
              }
            }
          } catch (err) {
            this.logger.error('Call action after hooks error:', err);
          }
          return res;
        };
      }),
    };
  }
  /**
   * 获取服务操作列表
   */
  getActionList() {
    return Object.entries(this._actions).map(([name, schema]) => {
      return {
        name,
        params: lodash_2.default.mapValues(schema.params, (type) => {
          if (typeof type === 'string') {
            return { type: type };
          } else {
            return type;
          }
        }),
      };
    });
  }
  registerMixin(mixin) {
    this._mixins.push(mixin);
  }
  /**
   * 注册微服务绑定的数据库
   * 不能调用多次
   */
  registerLocalDb = (0, lodash_1.once)((model) => {
    this.registerMixin((0, db_mixin_1.TcDbService)(model));
  });
  /**
   * 注册数据表可见字段列表
   * @param fields 字段列表
   */
  registerDbField(fields) {
    this.registerSetting('fields', fields);
  }
  /**
   * 注册一个操作
   *
   * 该操作会同时生成http请求和socketio事件的处理
   * @param name 操作名, 需微服务内唯一
   * @param handler 处理方法
   * @returns
   */
  registerAction(name, handler, schema) {
    if (this._actions[name]) {
      console.warn(`重复注册操作: ${name}。操作被跳过...`);
      return;
    }
    this._actions[name] = {
      ...schema,
      handler(ctx) {
        // 调用时生成t函数
        ctx.meta.t = (key, defaultValue) => {
          if (typeof defaultValue === 'object') {
            // 如果是参数对象的话
            return (0, i18n_1.t)(key, {
              ...defaultValue,
              lng: ctx.meta.language,
            });
          }
          return (0, i18n_1.t)(key, defaultValue, {
            lng: ctx.meta.language,
          });
        };
        return handler.call(this, ctx);
      },
    };
  }
  /**
   * 注册一个内部方法
   */
  registerMethod(name, method) {
    if (this._methods[name]) {
      console.warn(`重复注册方法: ${name}。操作被跳过...`);
      return;
    }
    this._methods[name] = method;
  }
  /**
   * 注册一个配置项
   */
  registerSetting(key, value) {
    if (this._settings[key]) {
      console.warn(`重复注册配置: ${key}。之前的设置将被覆盖...`);
    }
    this._settings[key] = value;
  }
  /**
   * 注册一个事件监听器
   */
  registerEventListener(eventName, handler, options = {}) {
    this._events[eventName] = {
      ...options,
      handler: (ctx) => {
        handler(ctx.params, ctx);
      },
    };
  }
  /**
   * 注册跳过token鉴权的路由地址
   * @param urls 鉴权路由 会自动添加 serviceName 前缀
   * @example "/login"
   */
  registerAuthWhitelist(urls) {
    this.waitForServices('gateway').then(() => {
      this.broker.broadcast(
        'gateway.auth.addWhitelists',
        {
          urls: urls.map((url) => `/${this.serviceName}${url}`),
        },
        'gateway'
      );
    });
  }
  /**
   * 注册可用的action请求
   *
   * 传入检查函数, 函数的返回值作为结果
   */
  registerAvailableAction(checkFn) {
    this.registerAction('available', checkFn);
    this.registerAuthWhitelist(['/available']);
  }
  /**
   * 注册面板功能特性，用于在服务端基础设施开放部分能力
   * @param panelFeature 面板功能
   */
  async setPanelFeature(panelName, panelFeatures) {
    await this.setGlobalConfig(
      `panelFeature.${(0, utils_1.encodeNoConflictServiceNameKey)(panelName)}`,
      panelFeatures
    );
  }
  /**
   * 获取拥有某些特性的面板列表
   * @param panelFeature 面板功能
   */
  getPanelNamesWithFeature(panelFeature) {
    const map = this.getGlobalConfig('panelFeature') ?? {};
    const matched = Object.entries(map).filter(([name, features]) => {
      if (Array.isArray(features)) {
        return features.includes(panelFeature);
      }
      return false;
    });
    return matched.map((m) =>
      (0, utils_1.decodeNoConflictServiceNameKey)(m[0])
    );
  }
  /**
   * 等待微服务启动
   * @param serviceNames
   * @param timeout
   * @param interval
   * @param logger
   * @returns
   */
  waitForServices(serviceNames, timeout, interval, logger) {
    if (process.env.NODE_ENV === 'test') {
      // 测试环境中跳过
      return Promise.resolve({
        services: [],
        statuses: [],
      });
    }
    return super.waitForServices(serviceNames, timeout, interval, logger);
  }
  getGlobalConfig(key) {
    return lodash_2.default.get(this.globalConfig, key);
  }
  /**
   * 设置全局配置信息
   */
  async setGlobalConfig(key, value) {
    await this.waitForServices('config');
    await this.broker.call('config.set', {
      key,
      value,
    });
  }
  /**
   * 注册一个触发了action后的回调
   * @param fullActionName 完整的带servicename的action名
   * @param callbackAction 当前服务的action名，不需要带servicename
   */
  async registerAfterActionHook(fullActionName, callbackAction) {
    await this.waitForServices(['gateway', 'config']);
    await this.broker.call('config.addToSet', {
      key: (0, utils_1.encodeNoConflictServiceNameKey)(
        `${const_1.CONFIG_GATEWAY_AFTER_HOOK}.${fullActionName}`
      ),
      value: `${this.serviceName}.${callbackAction}`,
    });
  }
  /**
   * 清理action缓存
   * NOTICE: 这里使用Redis作为缓存管理器，因此不需要通知所有的service
   */
  async cleanActionCache(actionName, keys = []) {
    if (!this.broker.cacher) {
      console.error('Can not clean cache because no cacher existed.');
    }
    if (keys.length === 0) {
      await this.broker.cacher.clean(`${this.serviceName}.${actionName}`);
    } else {
      await this.broker.cacher.clean(
        `${this.serviceName}.${actionName}:${keys.join('|')}**`
      );
    }
  }
  /**
   * 生成一个有命名空间的通知事件名
   */
  generateNotifyEventName(eventName) {
    return `notify:${this.serviceName}.${eventName}`;
  }
  /**
   * 本地调用操作，不经过外部转发
   * @param actionName 不需要serverName前缀
   */
  localCall(actionName, params, opts) {
    return this.actions[actionName](params, opts);
  }
  systemCall(ctx, actionName, params, opts) {
    return ctx.call(actionName, params, {
      ...opts,
      meta: {
        userId: const_1.SYSTEM_USERID,
        ...(opts?.meta ?? {}),
      },
    });
  }
  buildLoggerWithPrefix(_originLogger) {
    const prefix = `[${this.serviceName}]`;
    const originLogger = _originLogger;
    return {
      info: (...args) => {
        originLogger.info(prefix, ...args);
      },
      fatal: (...args) => {
        originLogger.fatal(prefix, ...args);
      },
      error: (...args) => {
        originLogger.error(prefix, ...args);
      },
      warn: (...args) => {
        originLogger.warn(prefix, ...args);
      },
      debug: (...args) => {
        originLogger.debug(prefix, ...args);
      },
      trace: (...args) => {
        originLogger.trace(prefix, ...args);
      },
    };
  }
  /**
   * 单播推送socket事件
   */
  unicastNotify(ctx, userId, eventName, eventData) {
    return ctx.call('gateway.notify', {
      type: 'unicast',
      target: userId,
      eventName: this.generateNotifyEventName(eventName),
      eventData,
    });
  }
  /**
   * 列播推送socket事件
   */
  listcastNotify(ctx, userIds, eventName, eventData) {
    return ctx.call('gateway.notify', {
      type: 'listcast',
      target: userIds,
      eventName: this.generateNotifyEventName(eventName),
      eventData,
    });
  }
  /**
   * 组播推送socket事件
   */
  roomcastNotify(ctx, roomId, eventName, eventData) {
    return ctx.call('gateway.notify', {
      type: 'roomcast',
      target: roomId,
      eventName: this.generateNotifyEventName(eventName),
      eventData,
    });
  }
  /**
   * 群播推送socket事件
   */
  broadcastNotify(ctx, eventName, eventData) {
    return ctx.call('gateway.notify', {
      type: 'broadcast',
      eventName: this.generateNotifyEventName(eventName),
      eventData,
    });
  }
}
exports.TcService = TcService;
