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
var OpenApp_1;
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenApp = void 0;
exports.filterAvailableAppCapability = filterAvailableAppCapability;
const typegoose_1 = require("@typegoose/typegoose");
const defaultClasses_1 = require("@typegoose/typegoose/lib/defaultClasses");
const user_1 = require("../user/user");
const openAppCapability = [
    'bot', // 机器人
    'webpage', // 网页
    'oauth', // 第三方登录
];
/**
 * 确保输出类型为应用能力
 */
function filterAvailableAppCapability(input) {
    return input.filter((item) => openAppCapability.includes(item));
}
/**
 * 开放平台应用
 */
let OpenApp = OpenApp_1 = class OpenApp extends defaultClasses_1.TimeStamps {
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
        Object.defineProperty(this, "owner", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "appId", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "appSecret", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "appName", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "appDesc", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "appIcon", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        }); // url
        Object.defineProperty(this, "capability", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "oauth", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "bot", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
    }
    /**
     * 根据appId获取openapp的实例
     * 用于获得获得完整数据(包括secret)
     * 并顺便判断是否拥有该开放平台用户的修改权限
     */
    static async findAppByIdAndOwner(appId, ownerId) {
        const res = await this.findOne({
            appId,
            owner: ownerId,
        }).exec();
        return res;
    }
};
exports.OpenApp = OpenApp;
__decorate([
    (0, typegoose_1.prop)({
        ref: () => user_1.User,
    }),
    __metadata("design:type", typeof (_a = typeof typegoose_1.Ref !== "undefined" && typegoose_1.Ref) === "function" ? _a : Object)
], OpenApp.prototype, "owner", void 0);
__decorate([
    (0, typegoose_1.prop)(),
    __metadata("design:type", String)
], OpenApp.prototype, "appId", void 0);
__decorate([
    (0, typegoose_1.prop)(),
    __metadata("design:type", String)
], OpenApp.prototype, "appSecret", void 0);
__decorate([
    (0, typegoose_1.prop)(),
    __metadata("design:type", String)
], OpenApp.prototype, "appName", void 0);
__decorate([
    (0, typegoose_1.prop)(),
    __metadata("design:type", String)
], OpenApp.prototype, "appDesc", void 0);
__decorate([
    (0, typegoose_1.prop)(),
    __metadata("design:type", String)
], OpenApp.prototype, "appIcon", void 0);
__decorate([
    (0, typegoose_1.prop)({
        enum: openAppCapability,
        type: () => String,
    }),
    __metadata("design:type", Array)
], OpenApp.prototype, "capability", void 0);
__decorate([
    (0, typegoose_1.prop)(),
    __metadata("design:type", Object)
], OpenApp.prototype, "oauth", void 0);
__decorate([
    (0, typegoose_1.prop)(),
    __metadata("design:type", Object)
], OpenApp.prototype, "bot", void 0);
exports.OpenApp = OpenApp = OpenApp_1 = __decorate([
    (0, typegoose_1.index)({ appId: 1 }, { unique: true })
], OpenApp);
const model = (0, typegoose_1.getModelForClass)(OpenApp);
exports.default = model;
