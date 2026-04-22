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
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", { value: true });
exports.Ack = void 0;
const typegoose_1 = require("@typegoose/typegoose");
const user_1 = require("../user/user");
const converse_1 = require("./converse");
const message_1 = require("./message");
/**
 * 消息已读管理
 */
let Ack = class Ack {
    constructor() {
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
        Object.defineProperty(this, "userId", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "converseId", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "lastMessageId", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
    }
};
exports.Ack = Ack;
__decorate([
    (0, typegoose_1.prop)({
        ref: () => user_1.User,
    }),
    __metadata("design:type", typeof (_a = typeof typegoose_1.Ref !== "undefined" && typegoose_1.Ref) === "function" ? _a : Object)
], Ack.prototype, "userId", void 0);
__decorate([
    (0, typegoose_1.prop)({
        ref: () => converse_1.Converse,
    }),
    __metadata("design:type", typeof (_b = typeof typegoose_1.Ref !== "undefined" && typegoose_1.Ref) === "function" ? _b : Object)
], Ack.prototype, "converseId", void 0);
__decorate([
    (0, typegoose_1.prop)({
        ref: () => message_1.Message,
    }),
    __metadata("design:type", typeof (_c = typeof typegoose_1.Ref !== "undefined" && typegoose_1.Ref) === "function" ? _c : Object)
], Ack.prototype, "lastMessageId", void 0);
exports.Ack = Ack = __decorate([
    (0, typegoose_1.index)({ userId: 1, converseId: 1 }, { unique: true }) // 一组userId和converseId应当唯一(用户为先)
], Ack);
const model = (0, typegoose_1.getModelForClass)(Ack);
exports.default = model;
