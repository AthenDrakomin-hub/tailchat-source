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
var User_1;
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const typegoose_1 = require("@typegoose/typegoose");
const defaultClasses_1 = require("@typegoose/typegoose/lib/defaultClasses");
const tailchat_server_sdk_1 = require("tailchat-server-sdk");
let User = User_1 = class User extends defaultClasses_1.TimeStamps {
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
        /**
         * 用户名 不可被修改
         * 与email必有一个
         */
        Object.defineProperty(this, "username", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        /**
         * 邮箱 不可被修改
         * 必填
         */
        Object.defineProperty(this, "email", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "password", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        /**
         * 可以被修改的显示名
         */
        Object.defineProperty(this, "nickname", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        /**
         * 识别器, 跟username构成全局唯一的用户名
         * 用于搜索
         * <username>#<discriminator>
         */
        Object.defineProperty(this, "discriminator", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        /**
         * 是否为临时用户
         * @default false
         */
        Object.defineProperty(this, "temporary", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        /**
         * 头像
         */
        Object.defineProperty(this, "avatar", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        /**
         * 用户类型
         */
        Object.defineProperty(this, "type", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        /**
         * 邮箱是否可用
         */
        Object.defineProperty(this, "emailVerified", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        /**
         * 是否被封禁
         */
        Object.defineProperty(this, "banned", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        /**
         * 用户的额外信息
         */
        Object.defineProperty(this, "extra", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        /**
         * 用户设置
         */
        Object.defineProperty(this, "settings", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
    }
    /**
     * 生成身份识别器
     * 0001 - 9999
     */
    static generateDiscriminator(nickname) {
        let restTimes = 10; // 最多找10次
        const checkDiscriminator = async () => {
            const discriminator = String(Math.floor(Math.random() * 9999) + 1).padStart(4, '0');
            const doc = await this.findOne({
                nickname,
                discriminator,
            }).exec();
            restTimes--;
            if (doc !== null) {
                // 已存在, 换一个
                if (restTimes <= 0) {
                    throw new Error('Cannot find space discriminator');
                }
                return checkDiscriminator();
            }
            return discriminator;
        };
        return checkDiscriminator();
    }
    /**
     * 获取用户基本信息
     */
    static async getUserBaseInfo(userId) {
        const user = await this.findById(String(userId));
        return {
            nickname: user.nickname,
            discriminator: user.discriminator,
            avatar: user.avatar,
        };
    }
};
exports.User = User;
__decorate([
    (0, typegoose_1.prop)(),
    __metadata("design:type", String)
], User.prototype, "username", void 0);
__decorate([
    (0, typegoose_1.prop)({
        index: true,
        unique: true,
    }),
    __metadata("design:type", String)
], User.prototype, "email", void 0);
__decorate([
    (0, typegoose_1.prop)(),
    __metadata("design:type", String)
], User.prototype, "password", void 0);
__decorate([
    (0, typegoose_1.prop)({
        trim: true,
        maxlength: 20,
    }),
    __metadata("design:type", String)
], User.prototype, "nickname", void 0);
__decorate([
    (0, typegoose_1.prop)(),
    __metadata("design:type", String)
], User.prototype, "discriminator", void 0);
__decorate([
    (0, typegoose_1.prop)({
        default: false,
    }),
    __metadata("design:type", Boolean)
], User.prototype, "temporary", void 0);
__decorate([
    (0, typegoose_1.prop)(),
    __metadata("design:type", String)
], User.prototype, "avatar", void 0);
__decorate([
    (0, typegoose_1.prop)({
        enum: tailchat_server_sdk_1.userType,
        type: () => String,
        default: 'normalUser',
    }),
    __metadata("design:type", typeof (_a = typeof tailchat_server_sdk_1.UserType !== "undefined" && tailchat_server_sdk_1.UserType) === "function" ? _a : Object)
], User.prototype, "type", void 0);
__decorate([
    (0, typegoose_1.prop)({
        default: false,
    }),
    __metadata("design:type", Boolean)
], User.prototype, "emailVerified", void 0);
__decorate([
    (0, typegoose_1.prop)({
        default: false,
    }),
    __metadata("design:type", Boolean)
], User.prototype, "banned", void 0);
__decorate([
    (0, typegoose_1.prop)(),
    __metadata("design:type", Object)
], User.prototype, "extra", void 0);
__decorate([
    (0, typegoose_1.prop)({
        default: {},
    }),
    __metadata("design:type", Object)
], User.prototype, "settings", void 0);
exports.User = User = User_1 = __decorate([
    (0, typegoose_1.modelOptions)({
        options: {
            allowMixed: typegoose_1.Severity.ALLOW,
        },
    }),
    (0, typegoose_1.index)({ avatar: 1 })
], User);
const model = (0, typegoose_1.getModelForClass)(User);
exports.default = model;
