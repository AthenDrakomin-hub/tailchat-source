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
exports.Alias = void 0;
const path_to_regexp_1 = require('path-to-regexp');
const busboy_1 = __importDefault(require('@fastify/busboy'));
const kleur_1 = __importDefault(require('kleur'));
const lodash_1 = __importDefault(require('lodash'));
const errors_1 = require('./errors');
const moleculer_1 = require('moleculer');
const { MoleculerClientError } = moleculer_1.Errors;
const utils_1 = require('./utils');
class Alias {
  service;
  route;
  type = 'call';
  method = '*';
  path = null;
  handler = null;
  action = null;
  fullPath;
  keys;
  re;
  busboyConfig;
  /**
   * Constructor of Alias
   *
   * @param {Service} service
   * @param {Object} route
   * @param {Object} opts
   * @param {any} action
   */
  constructor(service, route, opts, action) {
    this.service = service;
    this.route = route;
    if (lodash_1.default.isString(opts)) {
      // Parse alias string
      if (opts.indexOf(' ') !== -1) {
        const p = opts.split(/\s+/);
        this.method = p[0];
        this.path = p[1];
      } else {
        this.path = opts;
      }
    } else if (lodash_1.default.isObject(opts)) {
      Object.assign(this, lodash_1.default.cloneDeep(opts));
    }
    if (lodash_1.default.isString(action)) {
      // Parse type from action name
      if (action.indexOf(':') > 0) {
        const p = action.split(':');
        this.type = p[0];
        this.action = p[1];
      } else {
        this.action = action;
      }
    } else if (lodash_1.default.isFunction(action)) {
      this.handler = action;
      this.action = null;
    } else if (Array.isArray(action)) {
      const mws = lodash_1.default.compact(
        action.map((mw) => {
          if (lodash_1.default.isString(mw)) this.action = mw;
          else if (lodash_1.default.isFunction(mw)) return mw;
        })
      );
      this.handler = utils_1.compose.call(service, ...mws);
    } else if (action != null) {
      Object.assign(this, lodash_1.default.cloneDeep(action));
    }
    this.type = this.type || 'call';
    this.path = (0, utils_1.removeTrailingSlashes)(this.path);
    this.fullPath =
      this.fullPath || (0, utils_1.addSlashes)(this.route.path) + this.path;
    if (this.fullPath !== '/' && this.fullPath.endsWith('/')) {
      this.fullPath = this.fullPath.slice(0, -1);
    }
    this.keys = [];
    this.re = (0, path_to_regexp_1.pathToRegexp)(
      this.fullPath,
      this.keys,
      route.opts.pathToRegexpOptions || {}
    ); // Options: https://github.com/pillarjs/path-to-regexp#usage
    if (this.type == 'multipart') {
      // Handle file upload in multipart form
      this.handler = this.multipartHandler.bind(this);
    }
  }
  /**
   *
   * @param {*} url
   */
  match(url) {
    const m = this.re.exec(url);
    if (!m) return false;
    const params = {};
    let key, param;
    for (let i = 0; i < this.keys.length; i++) {
      key = this.keys[i];
      param = m[i + 1];
      if (!param) continue;
      params[key.name] = (0, utils_1.decodeParam)(param);
      if (key.repeat) params[key.name] = params[key.name].split(key.delimiter);
    }
    return params;
  }
  /**
   *
   * @param {*} method
   */
  isMethod(method) {
    return this.method === '*' || this.method === method;
  }
  /**
   *
   */
  printPath() {
    /* istanbul ignore next */
    return `${this.method} ${this.fullPath}`;
  }
  /**
   *
   */
  toString() {
    return (
      kleur_1.default.magenta(lodash_1.default.padStart(this.method, 6)) +
      ' ' +
      kleur_1.default.cyan(this.fullPath) +
      kleur_1.default.grey(' => ') +
      (this.handler != null && this.type !== 'multipart'
        ? '<Function>'
        : this.action)
    );
  }
  /**
   *
   * @param {*} req
   * @param {*} res
   */
  multipartHandler(req, res) {
    const ctx = req.$ctx;
    ctx.meta.$multipart = {};
    const promises = [];
    let numOfFiles = 0;
    let hasField = false;
    const busboyOptions = lodash_1.default.defaultsDeep(
      { headers: req.headers },
      this.busboyConfig,
      this.route.opts.busboyConfig
    );
    const busboy = new busboy_1.default(busboyOptions);
    busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
      file.on('limit', () => {
        // This file reached the file size limit.
        if (lodash_1.default.isFunction(busboyOptions.onFileSizeLimit)) {
          busboyOptions.onFileSizeLimit.call(this.service, file, busboy);
        }
        file.destroy(
          new errors_1.PayloadTooLarge({
            fieldname,
            filename,
            encoding,
            mimetype,
          })
        );
      });
      numOfFiles++;
      promises.push(
        ctx
          .call(
            this.action,
            file,
            lodash_1.default.defaultsDeep({}, this.route.opts.callOptions, {
              meta: {
                fieldname: fieldname,
                filename: filename,
                encoding: encoding,
                mimetype: mimetype,
                $params: req.$params,
              },
            })
          )
          .catch((err) => {
            file.resume(); // Drain file stream to continue processing form
            busboy.emit('error', err);
            return err;
          })
      );
    });
    busboy.on('field', (field, value) => {
      hasField = true;
      ctx.meta.$multipart[field] = value;
    });
    busboy.on('finish', async () => {
      /* istanbul ignore next */
      if (!busboyOptions.empty && numOfFiles == 0)
        return this.service.sendError(
          req,
          res,
          new MoleculerClientError('File missing in the request')
        );
      // Call the action if no files but multipart fields
      if (numOfFiles == 0 && hasField) {
        promises.push(
          ctx.call(
            this.action,
            {},
            lodash_1.default.defaultsDeep({}, this.route.opts.callOptions, {
              meta: {
                $params: req.$params,
              },
            })
          )
        );
      }
      try {
        let data = await this.service.Promise.all(promises);
        const fileLimit =
          busboyOptions.limits && busboyOptions.limits.files != null
            ? busboyOptions.limits.files
            : null;
        if (numOfFiles == 1 && fileLimit == 1) {
          // Remove the array wrapping
          data = data[0];
        }
        if (this.route.onAfterCall)
          data = await this.route.onAfterCall.call(
            this,
            ctx,
            this.route,
            req,
            res,
            data
          );
        this.service.sendResponse(req, res, data, {});
      } catch (err) {
        /* istanbul ignore next */
        this.service.sendError(req, res, err);
      }
    });
    /* istanbul ignore next */
    busboy.on('error', (err) => {
      req.unpipe(req.busboy);
      req.resume();
      this.service.sendError(req, res, err);
    });
    // Add limit event handlers
    if (lodash_1.default.isFunction(busboyOptions.onPartsLimit)) {
      busboy.on('partsLimit', () =>
        busboyOptions.onPartsLimit.call(
          this.service,
          busboy,
          this,
          this.service
        )
      );
    }
    if (lodash_1.default.isFunction(busboyOptions.onFilesLimit)) {
      busboy.on('filesLimit', () =>
        busboyOptions.onFilesLimit.call(
          this.service,
          busboy,
          this,
          this.service
        )
      );
    }
    if (lodash_1.default.isFunction(busboyOptions.onFieldsLimit)) {
      busboy.on('fieldsLimit', () =>
        busboyOptions.onFieldsLimit.call(
          this.service,
          busboy,
          this,
          this.service
        )
      );
    }
    req.pipe(busboy);
  }
}
exports.Alias = Alias;
