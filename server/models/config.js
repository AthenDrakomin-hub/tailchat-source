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
var Config_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.Config = void 0;
const typegoose_1 = require("@typegoose/typegoose");
let Config = Config_1 = class Config {
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
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        /**
         * config data
         */
        Object.defineProperty(this, "data", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
    }
    static async getAllClientPersistConfig() {
        var _a;
        const config = await this.findOne({
            name: Config_1.globalClientConfigName,
        });
        return (_a = config === null || config === void 0 ? void 0 : config.data) !== null && _a !== void 0 ? _a : {};
    }
    /**
     * set global client persist config from mongodb
     *
     * return all config from db
     */
    static async setClientPersistConfig(key, value) {
        const newConfig = await this.findOneAndUpdate({
            name: Config_1.globalClientConfigName,
        }, {
            $set: {
                [`data.${key}`]: value,
            },
        }, {
            upsert: true,
            new: true,
        });
        return newConfig.data;
    }
};
exports.Config = Config;
Object.defineProperty(Config, "globalClientConfigName", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: '__client_config__'
});
__decorate([
    (0, typegoose_1.prop)(),
    __metadata("design:type", String)
], Config.prototype, "name", void 0);
__decorate([
    (0, typegoose_1.prop)(),
    __metadata("design:type", Object)
], Config.prototype, "data", void 0);
exports.Config = Config = Config_1 = __decorate([
    (0, typegoose_1.modelOptions)({
        options: {
            allowMixed: typegoose_1.Severity.ALLOW,
        },
    }),
    (0, typegoose_1.index)({ name: 1 })
], Config);
const model = (0, typegoose_1.getModelForClass)(Config);
exports.default = model;
