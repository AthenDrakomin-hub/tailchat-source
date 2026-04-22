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
exports.PluginManifest = void 0;
const typegoose_1 = require("@typegoose/typegoose");
const defaultClasses_1 = require("@typegoose/typegoose/lib/defaultClasses");
const user_1 = require("../user/user");
class PluginManifest extends defaultClasses_1.TimeStamps {
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
        Object.defineProperty(this, "label", {
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
         * 插件入口地址
         */
        Object.defineProperty(this, "url", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "icon", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "version", {
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
        Object.defineProperty(this, "description", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "requireRestart", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "uploader", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
    }
}
exports.PluginManifest = PluginManifest;
__decorate([
    (0, typegoose_1.prop)(),
    __metadata("design:type", String)
], PluginManifest.prototype, "label", void 0);
__decorate([
    (0, typegoose_1.prop)({
        unique: true,
    }),
    __metadata("design:type", String)
], PluginManifest.prototype, "name", void 0);
__decorate([
    (0, typegoose_1.prop)(),
    __metadata("design:type", String)
], PluginManifest.prototype, "url", void 0);
__decorate([
    (0, typegoose_1.prop)(),
    __metadata("design:type", String)
], PluginManifest.prototype, "icon", void 0);
__decorate([
    (0, typegoose_1.prop)(),
    __metadata("design:type", String)
], PluginManifest.prototype, "version", void 0);
__decorate([
    (0, typegoose_1.prop)(),
    __metadata("design:type", String)
], PluginManifest.prototype, "author", void 0);
__decorate([
    (0, typegoose_1.prop)(),
    __metadata("design:type", String)
], PluginManifest.prototype, "description", void 0);
__decorate([
    (0, typegoose_1.prop)(),
    __metadata("design:type", String)
], PluginManifest.prototype, "requireRestart", void 0);
__decorate([
    (0, typegoose_1.prop)({ ref: () => user_1.User }),
    __metadata("design:type", typeof (_a = typeof typegoose_1.Ref !== "undefined" && typegoose_1.Ref) === "function" ? _a : Object)
], PluginManifest.prototype, "uploader", void 0);
const model = (0, typegoose_1.getModelForClass)(PluginManifest);
exports.default = model;
