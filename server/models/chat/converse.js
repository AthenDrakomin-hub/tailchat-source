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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Converse = void 0;
const typegoose_1 = require("@typegoose/typegoose");
const defaultClasses_1 = require("@typegoose/typegoose/lib/defaultClasses");
const mongoose_1 = require("mongoose");
const const_1 = require("../../lib/const");
const user_1 = require("../user/user");
/**
 * 设计参考: https://discord.com/developers/docs/resources/channel
 */
const converseType = [
    'DM', // 私信
    'Multi', // 多人会话
    'Group', // 群组
];
/**
 * 聊天会话
 */
class Converse extends defaultClasses_1.TimeStamps {
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
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        /**
         * 会话类型
         */
        Object.defineProperty(this, "type", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        /**
         * 会话参与者
         * DM会话与多人会话有值
         */
        Object.defineProperty(this, "members", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
    }
    /**
     * 查找固定成员已存在的会话
     */
    static async findConverseWithMembers(members) {
        const converse = await this.findOne({
            members: {
                $all: [...members],
                $size: members.length,
            },
        });
        return converse;
    }
    /**
     * 获取用户所有加入的会话
     */
    static async findAllJoinedConverseId(userId) {
        const conserves = await this.find({
            members: new mongoose_1.Types.ObjectId(userId),
        }, {
            _id: 1,
        });
        return conserves
            .map((c) => c.id)
            .filter(Boolean)
            .map(String);
    }
}
exports.Converse = Converse;
__decorate([
    (0, typegoose_1.prop)({
        trim: true,
        match: const_1.NAME_REGEXP,
    }),
    __metadata("design:type", String)
], Converse.prototype, "name", void 0);
__decorate([
    (0, typegoose_1.prop)({
        enum: converseType,
        type: () => String,
    }),
    __metadata("design:type", Object)
], Converse.prototype, "type", void 0);
__decorate([
    (0, typegoose_1.prop)({ ref: () => user_1.User }),
    __metadata("design:type", Array)
], Converse.prototype, "members", void 0);
const model = (0, typegoose_1.getModelForClass)(Converse);
exports.default = model;
