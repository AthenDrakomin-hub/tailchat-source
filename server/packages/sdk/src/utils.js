'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.decodeNoConflictServiceNameKey =
  exports.encodeNoConflictServiceNameKey = void 0;
const noConflictKey = '__';
/**
 * 因为微服务的名称中经常会有 `.` , 而 `.` 在一些场景(如lodash.set) 有特殊含义，因此增加一个工具用于解决这个问题
 */
function encodeNoConflictServiceNameKey(key) {
  return key.replaceAll('.', noConflictKey);
}
exports.encodeNoConflictServiceNameKey = encodeNoConflictServiceNameKey;
function decodeNoConflictServiceNameKey(key) {
  if (typeof key !== 'string') {
    return '';
  }
  return key.replaceAll(noConflictKey, '.');
}
exports.decodeNoConflictServiceNameKey = decodeNoConflictServiceNameKey;
