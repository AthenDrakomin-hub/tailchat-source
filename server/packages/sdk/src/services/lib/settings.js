'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.checkEnvTrusty =
  exports.buildUploadUrl =
  exports.builtinAuthWhitelist =
  exports.config =
    void 0;
const dotenv_1 = __importDefault(require('dotenv'));
require('lodash');
dotenv_1.default.config();
/**
 * 配置信息
 */
const port = process.env.PORT ? Number(process.env.PORT) : 11000;
const apiUrl = process.env.API_URL || `http://127.0.0.1:${port}`;
const staticHost = process.env.STATIC_HOST || '{BACKEND}';
const staticUrl = process.env.STATIC_URL || `${staticHost}/static/`;
const requestTimeout = process.env.REQUEST_TIMEOUT
  ? Number(process.env.REQUEST_TIMEOUT)
  : 10 * 1000; // default 0 (unit: milliseconds)
exports.config = {
  port,
  secret: process.env.SECRET || 'tailchat',
  env: process.env.NODE_ENV || 'development',
  /**
   * 是否打开socket admin ui
   */
  enableSocketAdmin: !!process.env.ADMIN,
  redisUrl: process.env.REDIS_URL,
  mongoUrl: process.env.MONGO_URL,
  storage: {
    type: 'minio',
    minioUrl: process.env.MINIO_URL,
    ssl: checkEnvTrusty(process.env.MINIO_SSL) ?? false,
    user: process.env.MINIO_USER,
    pass: process.env.MINIO_PASS,
    bucketName: process.env.MINIO_BUCKET_NAME || 'tailchat',
    pathStyle: process.env.MINIO_PATH_STYLE === 'VirtualHosted' ? false : true,
    /**
     * 文件上传限制
     * 单位byte
     * 默认 1m
     */
    limit: process.env.FILE_LIMIT
      ? Number(process.env.FILE_LIMIT)
      : 1 * 1024 * 1024,
  },
  apiUrl,
  staticUrl,
  enableOpenapi: true,
  emailVerification: checkEnvTrusty(process.env.EMAIL_VERIFY) || false,
  smtp: {
    senderName: process.env.SMTP_SENDER,
    connectionUrl: process.env.SMTP_URI || '',
  },
  enablePrometheus: checkEnvTrusty(process.env.PROMETHEUS),
  runner: {
    requestTimeout,
  },
  /**
   * 使用Tianji对网站进行监控
   */
  tianji: {
    scriptUrl: process.env.TIANJI_SCRIPT_URL,
    websiteId: process.env.TIANJI_WEBSITE_ID,
  },
  feature: {
    disableMsgpack: checkEnvTrusty(process.env.DISABLE_MESSAGEPACK),
    disableFileCheck: checkEnvTrusty(process.env.DISABLE_FILE_CHECK),
    disableLogger: checkEnvTrusty(process.env.DISABLE_LOGGER),
    disableInfoLog: checkEnvTrusty(process.env.DISABLE_INFO_LOG),
    disableTracing: checkEnvTrusty(process.env.DISABLE_TRACING),
    disableUserRegister: checkEnvTrusty(process.env.DISABLE_USER_REGISTER),
    disableGuestLogin: checkEnvTrusty(process.env.DISABLE_GUEST_LOGIN),
    disableCreateGroup: checkEnvTrusty(process.env.DISABLE_CREATE_GROUP),
    disablePluginStore: checkEnvTrusty(process.env.DISABLE_PLUGIN_STORE),
    disableAddFriend: checkEnvTrusty(process.env.DISABLE_ADD_FRIEND),
    disableTelemetry: checkEnvTrusty(process.env.DISABLE_TELEMETRY), // 是否禁用遥测
  },
};
exports.builtinAuthWhitelist = [
  '/gateway/health',
  '/debug/hello',
  '/user/login',
  '/user/register',
  '/user/createTemporaryUser',
  '/user/resolveToken',
  '/user/getUserInfo',
  '/user/getUserInfoList',
  '/user/checkTokenValid',
  '/group/getGroupBasicInfo',
  '/group/invite/findInviteByCode',
];
/**
 * 构建上传地址
 */
function buildUploadUrl(objectName) {
  return exports.config.staticUrl + objectName;
}
exports.buildUploadUrl = buildUploadUrl;
/**
 * 判断环境变量是否为true
 */
function checkEnvTrusty(env) {
  return env === '1' || env === 'true';
}
exports.checkEnvTrusty = checkEnvTrusty;
