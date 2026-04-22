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
exports.Friend = void 0;
const typegoose_1 = require("@typegoose/typegoose");
const defaultClasses_1 = require("@typegoose/typegoose/lib/defaultClasses");
const user_1 = require("./user");
const mongoose_findorcreate_1 = __importDefault(require("mongoose-findorcreate"));
/**
 * 好友请求
 * 单向好友结构
 */
let Friend = class Friend extends defaultClasses_1.FindOrCreate {
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
        Object.defineProperty(this, "from", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "to", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        /**
         * 好友昵称, 覆盖用户自己的昵称
         */
        Object.defineProperty(this, "nickname", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "createdAt", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
    }
    static async buildFriendRelation(user1, user2) {
        await Promise.all([
            this.findOrCreate({
                from: user1,
                to: user2,
            }),
            this.findOrCreate({
                from: user2,
                to: user1,
            }),
        ]);
    }
};
exports.Friend = Friend;
__decorate([
    (0, typegoose_1.prop)({
        ref: () => user_1.User,
        index: true,
    }),
    __metadata("design:type", typeof (_a = typeof typegoose_1.Ref !== "undefined" && typegoose_1.Ref) === "function" ? _a : Object)
], Friend.prototype, "from", void 0);
__decorate([
    (0, typegoose_1.prop)({
        ref: () => user_1.User,
    }),
    __metadata("design:type", typeof (_b = typeof typegoose_1.Ref !== "undefined" && typegoose_1.Ref) === "function" ? _b : Object)
], Friend.prototype, "to", void 0);
__decorate([
    (0, typegoose_1.prop)(),
    __metadata("design:type", String)
], Friend.prototype, "nickname", void 0);
__decorate([
    (0, typegoose_1.prop)(),
    __metadata("design:type", Date)
], Friend.prototype, "createdAt", void 0);
exports.Friend = Friend = __decorate([
    (0, typegoose_1.plugin)(mongoose_findorcreate_1.default)
], Friend);
const model = (0, typegoose_1.getModelForClass)(Friend);
exports.default = model;
