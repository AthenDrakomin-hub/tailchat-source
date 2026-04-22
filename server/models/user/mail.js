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
var Mail_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.Mail = void 0;
const typegoose_1 = require("@typegoose/typegoose");
const defaultClasses_1 = require("@typegoose/typegoose/lib/defaultClasses");
const nodemailer_1 = __importDefault(require("nodemailer"));
const shared_1 = require("nodemailer/lib/shared");
const tailchat_server_sdk_1 = require("tailchat-server-sdk");
/**
 * 将地址格式化
 */
function stringifyAddress(address) {
    if (Array.isArray(address)) {
        return address.map((a) => stringifyAddress(a)).join(',');
    }
    if (typeof address === 'string') {
        return address;
    }
    else if (address === undefined) {
        return '';
    }
    else if (typeof address === 'object') {
        return `"${address.name}" ${address.address}`;
    }
}
function getSMTPConnectionOptions() {
    if (tailchat_server_sdk_1.config.smtp.connectionUrl) {
        return (0, shared_1.parseConnectionUrl)(tailchat_server_sdk_1.config.smtp.connectionUrl);
    }
    return null;
}
let Mail = Mail_1 = class Mail extends defaultClasses_1.TimeStamps {
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
         * 发件人邮箱
         */
        Object.defineProperty(this, "from", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        /**
         * 收件人邮箱
         */
        Object.defineProperty(this, "to", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        /**
         * 邮件主题
         */
        Object.defineProperty(this, "subject", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        /**
         * 邮件内容
         */
        Object.defineProperty(this, "body", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "host", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "port", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "secure", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "is_success", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "data", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "error", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
    }
    /**
     * 创建邮件发送实例
     */
    static createMailerTransporter() {
        const options = getSMTPConnectionOptions();
        if (options) {
            const transporter = nodemailer_1.default.createTransport(options);
            return transporter;
        }
        return null;
    }
    /**
     * 检查邮件服务是否可用
     */
    static async verifyMailService() {
        try {
            const transporter = Mail_1.createMailerTransporter();
            if (!transporter) {
                return false;
            }
            const verify = await transporter.verify();
            return verify;
        }
        catch (e) {
            console.error(e);
            return false;
        }
    }
    /**
     * 发送邮件
     */
    static async sendMail(mailOptions) {
        try {
            const transporter = Mail_1.createMailerTransporter();
            if (!transporter) {
                throw new Error('Mail Transporter is null');
            }
            const options = {
                from: tailchat_server_sdk_1.config.smtp.senderName,
                ...mailOptions,
            };
            const smtpOptions = getSMTPConnectionOptions();
            try {
                const info = await transporter.sendMail(options);
                await this.create({
                    from: stringifyAddress(options.from),
                    to: stringifyAddress(options.to),
                    subject: options.subject,
                    body: options.html,
                    host: smtpOptions.host,
                    port: smtpOptions.port,
                    secure: smtpOptions.secure,
                    is_success: true,
                    data: info,
                });
                return info;
            }
            catch (err) {
                this.create({
                    from: stringifyAddress(options.from),
                    to: stringifyAddress(options.to),
                    subject: options.subject,
                    body: options.html,
                    host: smtpOptions.host,
                    port: smtpOptions.port,
                    secure: smtpOptions.secure,
                    is_success: false,
                    error: String(err),
                });
                throw err;
            }
        }
        catch (err) {
            console.error(err);
            throw err;
        }
    }
};
exports.Mail = Mail;
__decorate([
    (0, typegoose_1.prop)(),
    __metadata("design:type", String)
], Mail.prototype, "from", void 0);
__decorate([
    (0, typegoose_1.prop)(),
    __metadata("design:type", String)
], Mail.prototype, "to", void 0);
__decorate([
    (0, typegoose_1.prop)(),
    __metadata("design:type", String)
], Mail.prototype, "subject", void 0);
__decorate([
    (0, typegoose_1.prop)(),
    __metadata("design:type", String)
], Mail.prototype, "body", void 0);
__decorate([
    (0, typegoose_1.prop)(),
    __metadata("design:type", String)
], Mail.prototype, "host", void 0);
__decorate([
    (0, typegoose_1.prop)(),
    __metadata("design:type", String)
], Mail.prototype, "port", void 0);
__decorate([
    (0, typegoose_1.prop)(),
    __metadata("design:type", Boolean)
], Mail.prototype, "secure", void 0);
__decorate([
    (0, typegoose_1.prop)(),
    __metadata("design:type", Boolean)
], Mail.prototype, "is_success", void 0);
__decorate([
    (0, typegoose_1.prop)(),
    __metadata("design:type", Object)
], Mail.prototype, "data", void 0);
__decorate([
    (0, typegoose_1.prop)(),
    __metadata("design:type", String)
], Mail.prototype, "error", void 0);
exports.Mail = Mail = Mail_1 = __decorate([
    (0, typegoose_1.modelOptions)({
        options: {
            allowMixed: typegoose_1.Severity.ALLOW,
        },
    })
], Mail);
const model = (0, typegoose_1.getModelForClass)(Mail);
exports.default = model;
