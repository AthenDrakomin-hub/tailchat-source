"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.File = void 0;
const typegoose_1 = require("@typegoose/typegoose");
const defaultClasses_1 = require("@typegoose/typegoose/lib/defaultClasses");
const user_1 = require("./user/user");
/**
 * 聊天会话
 */
let File = class File extends defaultClasses_1.TimeStamps {
    constructor() {
        super(...arguments);
        Object.defineProperty(this, "_id", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "id", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "etag", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "userId", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "bucketName", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "objectName", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "url", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        /**
         * 文件大小, 单位: Byte
         */
        Object.defineProperty(this, "size", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        /**
         * 浏览量
         */
        Object.defineProperty(this, "views", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "metaData", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        /**
         * 这个文件是用于哪里
         * for example: chat, group, user
         */
        Object.defineProperty(this, "usage", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
    }
};
exports.File = File;
__decorate([
    (0, typegoose_1.prop)(),
    __metadata("design:type", String)
], File.prototype, "etag", void 0);
__decorate([
    (0, typegoose_1.prop)({ ref: () => user_1.User }),
    __metadata("design:type", typeof (_a = typeof typegoose_1.Ref !== "undefined" && typegoose_1.Ref) === "function" ? _a : Object)
], File.prototype, "userId", void 0);
__decorate([
    (0, typegoose_1.prop)(),
    __metadata("design:type", String)
], File.prototype, "bucketName", void 0);
__decorate([
    (0, typegoose_1.prop)(),
    __metadata("design:type", String)
], File.prototype, "objectName", void 0);
__decorate([
    (0, typegoose_1.prop)(),
    __metadata("design:type", String)
], File.prototype, "url", void 0);
__decorate([
    (0, typegoose_1.prop)(),
    __metadata("design:type", Number)
], File.prototype, "size", void 0);
__decorate([
    (0, typegoose_1.prop)({
        default: 0,
    }),
    __metadata("design:type", Number)
], File.prototype, "views", void 0);
__decorate([
    (0, typegoose_1.prop)(),
    __metadata("design:type", Object)
], File.prototype, "metaData", void 0);
__decorate([
    (0, typegoose_1.prop)({
        default: 'unknown',
    }),
    __metadata("design:type", String)
], File.prototype, "usage", void 0);
exports.File = File = __decorate([
    (0, typegoose_1.modelOptions)({
        options: {
            allowMixed: typegoose_1.Severity.ALLOW,
        },
    }),
    (0, typegoose_1.index)({ bucketName: 1, objectName: 1 }),
    (0, typegoose_1.index)({ url: 1 })
], File);
const model = (0, typegoose_1.getModelForClass)(File);
exports.default = model;
