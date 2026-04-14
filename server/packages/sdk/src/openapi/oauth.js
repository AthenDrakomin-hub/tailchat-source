'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.OAuthClient = void 0;
const axios_1 = __importDefault(require('axios'));
/**
 * 用于 Tailchat OAuth 信息集成的实例
 */
class OAuthClient {
  appId;
  appSecret;
  request;
  constructor(apiUrl, appId, appSecret) {
    this.appId = appId;
    this.appSecret = appSecret;
    this.request = axios_1.default.create({
      baseURL: apiUrl,
      transformRequest: [
        function (data) {
          let ret = '';
          for (const it in data) {
            ret +=
              encodeURIComponent(it) + '=' + encodeURIComponent(data[it]) + '&';
          }
          ret = ret.substring(0, ret.lastIndexOf('&'));
          return ret;
        },
      ],
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
      },
    });
  }
  /**
   * 根据获取到的code获取授权码
   * @param code 从重定向获取到的临时code
   * @param redirectUrl 重定向的地址
   */
  async getToken(code, redirectUrl) {
    const { data: tokenInfo } = await this.request.post('/open/token', {
      client_id: this.appId,
      client_secret: this.appSecret,
      redirect_uri: redirectUrl,
      code,
      grant_type: 'authorization_code',
    });
    return tokenInfo;
  }
  async getUserInfo(accessToken) {
    const { data: userInfo } = await this.request.post('/open/me', {
      access_token: accessToken,
    });
    return userInfo;
  }
}
exports.OAuthClient = OAuthClient;
