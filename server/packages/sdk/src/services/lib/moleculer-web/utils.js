'use strict';
/*
 * moleculer
 * Copyright (c) 2021 MoleculerJS (https://github.com/moleculerjs/moleculer)
 * MIT Licensed
 */
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.isFresh =
  exports.generateETag =
  exports.composeThen =
  exports.compose =
  exports.decodeParam =
  exports.normalizePath =
  exports.addSlashes =
  exports.removeTrailingSlashes =
    void 0;
const lodash_1 = __importDefault(require('lodash'));
const fresh_1 = __importDefault(require('fresh'));
const etag_1 = __importDefault(require('etag'));
const errors_1 = require('./errors');
/**
 * Decode URI encoded param
 * @param {String} param
 */
function decodeParam(param) {
  try {
    return decodeURIComponent(param);
  } catch (_) {
    /* istanbul ignore next */
    throw new errors_1.BadRequestError(errors_1.ERR_UNABLE_DECODE_PARAM, {
      param,
    });
  }
}
exports.decodeParam = decodeParam;
// Remove slashes "/" from the left & right sides and remove double "//" slashes
function removeTrailingSlashes(s) {
  if (s.startsWith('/')) s = s.slice(1);
  if (s.endsWith('/')) s = s.slice(0, -1);
  return s; //.replace(/\/\//g, "/");
}
exports.removeTrailingSlashes = removeTrailingSlashes;
// Add slashes "/" to the left & right sides
function addSlashes(s) {
  return (s.startsWith('/') ? '' : '/') + s + (s.endsWith('/') ? '' : '/');
}
exports.addSlashes = addSlashes;
// Normalize URL path (remove multiple slashes //)
function normalizePath(s) {
  return s.replace(/\/{2,}/g, '/');
}
exports.normalizePath = normalizePath;
/**
 * Compose middlewares
 *
 * @param {...Function} mws
 */
function compose(...mws) {
  const self = this;
  return (req, res, done) => {
    const next = (i, err) => {
      if (i >= mws.length) {
        if (lodash_1.default.isFunction(done)) return done.call(self, err);
        /* istanbul ignore next */
        return;
      }
      if (err) {
        // Call only error middlewares (err, req, res, next)
        if (mws[i].length == 4)
          mws[i].call(self, err, req, res, (err) => next(i + 1, err));
        else next(i + 1, err);
      } else {
        if (mws[i].length < 4)
          mws[i].call(self, req, res, (err) => next(i + 1, err));
        else next(i + 1);
      }
    };
    return next(0);
  };
}
exports.compose = compose;
/**
 * Compose middlewares and return Promise
 * @param {...Function} mws
 * @returns {Promise}
 */
function composeThen(req, res, ...mws) {
  return new Promise((resolve, reject) => {
    compose.call(this, ...mws)(req, res, (err) => {
      if (err) {
        /* istanbul ignore next */
        if (err instanceof errors_1.MoleculerError) return reject(err);
        /* istanbul ignore next */
        if (err instanceof Error)
          return reject(
            new errors_1.MoleculerError(
              err.message,
              err.code || err.status,
              err.type
            )
          ); // TODO err.stack
        /* istanbul ignore next */
        return reject(new errors_1.MoleculerError(err));
      }
      resolve();
    });
  });
}
exports.composeThen = composeThen;
/**
 * Generate ETag from content.
 *
 * @param {any} body
 * @param {Boolean|String|Function?} opt
 *
 * @returns {String}
 */
function generateETag(body, opt) {
  if (lodash_1.default.isFunction(opt)) return opt.call(this, body);
  const buf = !Buffer.isBuffer(body) ? Buffer.from(body) : body;
  return (0, etag_1.default)(
    buf,
    opt === true || opt === 'weak' ? { weak: true } : null
  );
}
exports.generateETag = generateETag;
/**
 * Check the data freshness.
 *
 * @param {*} req
 * @param {*} res
 *
 * @returns {Boolean}
 */
function isFresh(req, res) {
  if (
    (res.statusCode >= 200 && res.statusCode < 300) ||
    304 === res.statusCode
  ) {
    return (0, fresh_1.default)(req.headers, {
      etag: res.getHeader('ETag'),
      'last-modified': res.getHeader('Last-Modified'),
    });
  }
  return false;
}
exports.isFresh = isFresh;
