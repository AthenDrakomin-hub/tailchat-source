'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.parseLanguageFromHead = void 0;
const accept_language_1 = __importDefault(require('accept-language'));
accept_language_1.default.languages(['en', 'en-US', 'zh-CN', 'zh', 'zh-TW']);
/**
 * 解析请求头的 Accept-Language
 */
function parseLanguageFromHead(headerLanguage = 'en-US') {
  const language = accept_language_1.default.get(headerLanguage);
  if (language === 'zh' || language === 'zh-TW') {
    return 'zh-CN';
  }
  if (language === 'en' || language === 'en-US') {
    return 'en-US';
  }
  return language;
}
exports.parseLanguageFromHead = parseLanguageFromHead;
