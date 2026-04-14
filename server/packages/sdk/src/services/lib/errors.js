'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
exports.NotFoundError =
  exports.ServiceUnavailableError =
  exports.BannedError =
  exports.NoPermissionError =
  exports.EntityError =
  exports.DataNotFoundError =
    void 0;
const es6_error_1 = __importDefault(require('es6-error'));
class TcError extends es6_error_1.default {
  code;
  type;
  data;
  retryable;
  constructor(message, code, type, data) {
    super(message ?? 'Service Unavailable');
    this.code = code ?? this.code ?? 500;
    this.type = type ?? this.type;
    this.data = data ?? this.data;
    this.retryable = this.retryable ?? false;
  }
}
class DataNotFoundError extends TcError {
  constructor(message, code, type, data) {
    super(message ?? 'Not found Data', code ?? 404, type, data);
  }
}
exports.DataNotFoundError = DataNotFoundError;
class EntityError extends TcError {
  constructor(message, code, type, data) {
    super(message ?? 'Form error', code ?? 442, type, data);
  }
}
exports.EntityError = EntityError;
class NoPermissionError extends TcError {
  constructor(message, code, type, data) {
    super(message ?? 'No operate permission', code ?? 403, type, data);
  }
}
exports.NoPermissionError = NoPermissionError;
class BannedError extends TcError {
  constructor(message, code, type, data) {
    super(
      message ?? 'You has been banned',
      code ?? 403,
      type ?? 'banned',
      data
    );
  }
}
exports.BannedError = BannedError;
class ServiceUnavailableError extends TcError {
  constructor(data) {
    super('Service unavailable', 503, 'SERVICE_NOT_AVAILABLE', data);
  }
}
exports.ServiceUnavailableError = ServiceUnavailableError;
class NotFoundError extends TcError {
  constructor(data) {
    super('Not found', 404, 'NOT_FOUND', data);
  }
}
exports.NotFoundError = NotFoundError;
