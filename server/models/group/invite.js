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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GroupInvite = void 0;
const typegoose_1 = require("@typegoose/typegoose");
const defaultClasses_1 = require("@typegoose/typegoose/lib/defaultClasses");
const moment_1 = __importDefault(require("moment"));
const nanoid_1 = require("nanoid");
const user_1 = require("../user/user");
const group_1 = require("./group");
function generateCode() {
    return (0, nanoid_1.nanoid)(8);
}
class GroupInvite extends defaultClasses_1.TimeStamps {
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
        Object.defineProperty(this, "code", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "creator", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "groupId", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        /**
         * 过期时间，如果不存在则永不过期
         */
        Object.defineProperty(this, "expiredAt", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        /**
         * 被使用次数
         */
        Object.defineProperty(this, "usage", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        /**
         * 使用上限，如果为空则不限制
         */
        Object.defineProperty(this, "usageLimit", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
    }
    /**
     * 创建群组邀请
     * @param groupId 群组id
     * @param type 普通(7天) 永久
     */
    static async createGroupInvite(groupId, creator, inviteType) {
        let expiredAt = (0, moment_1.default)().add(7, 'day').toDate(); // 默认7天
        if (inviteType === 'permanent') {
            expiredAt = undefined;
        }
        let code = null;
        for (let i = 0; i <= 5; i++) {
            const generatedCode = generateCode();
            const exists = await this.exists({ code: generatedCode });
            if (!exists) {
                code = generatedCode;
                break;
            }
        }
        if (!code) {
            throw new Error('Cannot find unused invite code, please try again.');
        }
        const invite = await this.create({
            groupId,
            code,
            creator,
            expiredAt,
        });
        return invite;
    }
}
exports.GroupInvite = GroupInvite;
__decorate([
    (0, typegoose_1.prop)({
        index: true,
        unique: true,
        default: () => generateCode(),
    }),
    __metadata("design:type", String)
], GroupInvite.prototype, "code", void 0);
__decorate([
    (0, typegoose_1.prop)({
        ref: () => user_1.User,
    }),
    __metadata("design:type", typeof (_a = typeof typegoose_1.Ref !== "undefined" && typegoose_1.Ref) === "function" ? _a : Object)
], GroupInvite.prototype, "creator", void 0);
__decorate([
    (0, typegoose_1.prop)({
        ref: () => group_1.Group,
    }),
    __metadata("design:type", typeof (_b = typeof typegoose_1.Ref !== "undefined" && typegoose_1.Ref) === "function" ? _b : Object)
], GroupInvite.prototype, "groupId", void 0);
__decorate([
    (0, typegoose_1.prop)(),
    __metadata("design:type", Date)
], GroupInvite.prototype, "expiredAt", void 0);
__decorate([
    (0, typegoose_1.prop)({
        default: 0,
    }),
    __metadata("design:type", Number)
], GroupInvite.prototype, "usage", void 0);
__decorate([
    (0, typegoose_1.prop)(),
    __metadata("design:type", Number)
], GroupInvite.prototype, "usageLimit", void 0);
const model = (0, typegoose_1.getModelForClass)(GroupInvite);
exports.default = model;
