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
var Message_1;
var _a, _b, _c, _d;
Object.defineProperty(exports, "__esModule", { value: true });
exports.Message = void 0;
const typegoose_1 = require("@typegoose/typegoose");
const group_1 = require("../group/group");
const defaultClasses_1 = require("@typegoose/typegoose/lib/defaultClasses");
const converse_1 = require("./converse");
const user_1 = require("../user/user");
class MessageReaction {
    constructor() {
        /**
         * 消息反应名
         * 可以直接为emoji表情
         */
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "author", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
    }
}
__decorate([
    (0, typegoose_1.prop)(),
    __metadata("design:type", String)
], MessageReaction.prototype, "name", void 0);
__decorate([
    (0, typegoose_1.prop)({ ref: () => user_1.User }),
    __metadata("design:type", typeof (_a = typeof typegoose_1.Ref !== "undefined" && typegoose_1.Ref) === "function" ? _a : Object)
], MessageReaction.prototype, "author", void 0);
let Message = Message_1 = class Message extends defaultClasses_1.TimeStamps {
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
        Object.defineProperty(this, "content", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "author", {
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
         * 会话ID 必填
         * 私信的本质就是创建一个双人的会话
         */
        Object.defineProperty(this, "converseId", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "reactions", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        /**
         * 是否已撤回
         */
        Object.defineProperty(this, "hasRecall", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        /**
         * 消息的其他数据
         */
        Object.defineProperty(this, "meta", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
    }
    /**
     * 获取会话消息
     */
    static async fetchConverseMessage(converseId, startId, limit = 50) {
        const conditions = {
            converseId,
        };
        if (startId !== null) {
            conditions['_id'] = {
                $lt: startId,
            };
        }
        const res = await this.find({ ...conditions })
            .sort({ _id: -1 })
            .limit(limit)
            .exec();
        return res;
    }
};
exports.Message = Message;
__decorate([
    (0, typegoose_1.prop)(),
    __metadata("design:type", String)
], Message.prototype, "content", void 0);
__decorate([
    (0, typegoose_1.prop)({ ref: () => user_1.User }),
    __metadata("design:type", typeof (_b = typeof typegoose_1.Ref !== "undefined" && typegoose_1.Ref) === "function" ? _b : Object)
], Message.prototype, "author", void 0);
__decorate([
    (0, typegoose_1.prop)({ ref: () => group_1.Group }),
    __metadata("design:type", typeof (_c = typeof typegoose_1.Ref !== "undefined" && typegoose_1.Ref) === "function" ? _c : Object)
], Message.prototype, "groupId", void 0);
__decorate([
    (0, typegoose_1.prop)({ ref: () => converse_1.Converse, index: true }),
    __metadata("design:type", typeof (_d = typeof typegoose_1.Ref !== "undefined" && typegoose_1.Ref) === "function" ? _d : Object)
], Message.prototype, "converseId", void 0);
__decorate([
    (0, typegoose_1.prop)({ type: () => MessageReaction }),
    __metadata("design:type", Array)
], Message.prototype, "reactions", void 0);
__decorate([
    (0, typegoose_1.prop)({
        default: false,
    }),
    __metadata("design:type", Boolean)
], Message.prototype, "hasRecall", void 0);
__decorate([
    (0, typegoose_1.prop)(),
    __metadata("design:type", Object)
], Message.prototype, "meta", void 0);
exports.Message = Message = Message_1 = __decorate([
    (0, typegoose_1.modelOptions)({
        options: {
            allowMixed: typegoose_1.Severity.ALLOW,
        },
    }),
    (0, typegoose_1.index)({ createdAt: -1 }),
    (0, typegoose_1.index)({ converseId: 1, _id: -1 }) // for fetchConverseMessage
], Message);
const model = (0, typegoose_1.getModelForClass)(Message);
exports.default = model;
