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
exports.Discover = void 0;
const tailchat_server_sdk_1 = require("tailchat-server-sdk");
const { getModelForClass, prop, modelOptions, TimeStamps } = tailchat_server_sdk_1.db;
let Discover = class Discover extends TimeStamps {
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
        Object.defineProperty(this, "groupId", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "active", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "order", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
    }
};
exports.Discover = Discover;
__decorate([
    prop({ ref: 'Group' }),
    __metadata("design:type", typeof (_a = typeof tailchat_server_sdk_1.db !== "undefined" && tailchat_server_sdk_1.db.Ref) === "function" ? _a : Object)
], Discover.prototype, "groupId", void 0);
__decorate([
    prop({ default: true }),
    __metadata("design:type", Boolean)
], Discover.prototype, "active", void 0);
__decorate([
    prop({ default: 0 }),
    __metadata("design:type", Number)
], Discover.prototype, "order", void 0);
exports.Discover = Discover = __decorate([
    modelOptions({
        options: {
            customName: 'p_discover',
        },
    })
], Discover);
const model = getModelForClass(Discover);
exports.default = model;
