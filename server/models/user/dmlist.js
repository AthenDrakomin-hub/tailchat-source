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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserDMList = void 0;
const typegoose_1 = require("@typegoose/typegoose");
const defaultClasses_1 = require("@typegoose/typegoose/lib/defaultClasses");
const converse_1 = require("../chat/converse");
const user_1 = require("./user");
const mongoose_findorcreate_1 = __importDefault(require("mongoose-findorcreate"));
const typegoose_2 = require("@typegoose/typegoose");
/**
 * 用户私信列表管理
 */
let UserDMList = class UserDMList extends defaultClasses_1.FindOrCreate {
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
        Object.defineProperty(this, "userId", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "converseIds", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
    }
};
exports.UserDMList = UserDMList;
__decorate([
    (0, typegoose_1.prop)({
        ref: () => user_1.User,
        index: true,
    }),
    __metadata("design:type", typeof (_a = typeof typegoose_1.Ref !== "undefined" && typegoose_1.Ref) === "function" ? _a : Object)
], UserDMList.prototype, "userId", void 0);
__decorate([
    (0, typegoose_1.prop)({
        ref: () => converse_1.Converse,
    }),
    __metadata("design:type", Array)
], UserDMList.prototype, "converseIds", void 0);
exports.UserDMList = UserDMList = __decorate([
    (0, typegoose_2.plugin)(mongoose_findorcreate_1.default),
    (0, typegoose_1.modelOptions)({
        schemaOptions: {
            collection: 'userdmlist',
        },
    })
], UserDMList);
const model = (0, typegoose_1.getModelForClass)(UserDMList);
exports.default = model;
