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
var Group_1;
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", { value: true });
exports.Group = exports.GroupRole = exports.GroupPanel = void 0;
const typegoose_1 = require("@typegoose/typegoose");
const defaultClasses_1 = require("@typegoose/typegoose/lib/defaultClasses");
const lodash_1 = __importDefault(require("lodash"));
const mongoose_1 = require("mongoose");
const tailchat_server_sdk_1 = require("tailchat-server-sdk");
const user_1 = require("../user/user");
class GroupMember {
    constructor() {
        Object.defineProperty(this, "roles", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        }); // 角色权限组id
        Object.defineProperty(this, "userId", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        /**
         * 禁言到xxx 为止
         */
        Object.defineProperty(this, "muteUntil", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
    }
}
__decorate([
    (0, typegoose_1.prop)({
        type: () => String,
    }),
    __metadata("design:type", Array)
], GroupMember.prototype, "roles", void 0);
__decorate([
    (0, typegoose_1.prop)({
        ref: () => user_1.User,
    }),
    __metadata("design:type", typeof (_a = typeof typegoose_1.Ref !== "undefined" && typegoose_1.Ref) === "function" ? _a : Object)
], GroupMember.prototype, "userId", void 0);
__decorate([
    (0, typegoose_1.prop)(),
    __metadata("design:type", Date)
], GroupMember.prototype, "muteUntil", void 0);
let GroupPanel = class GroupPanel {
    constructor() {
        Object.defineProperty(this, "id", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        }); // 在群组中唯一, 可以用任意方式进行生成。这里使用ObjectId, 但不是ObjectId类型
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        }); // 用于显示的名称
        Object.defineProperty(this, "parentId", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        }); // 父节点id
        /**
         * 面板类型:
         *  0 文本频道
         *  1 面板分组
         *  2 插件
         *
         * Reference: https://discord.com/developers/docs/resources/channel#channel-object-channel-types
         */
        Object.defineProperty(this, "type", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "provider", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        }); // 面板提供者，为插件的标识，仅面板类型为插件时有效
        Object.defineProperty(this, "pluginPanelName", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        }); // 插件面板名, 如 com.msgbyte.webview/grouppanel
        /**
         * 面板的其他数据
         */
        Object.defineProperty(this, "meta", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        /**
         * 身份组或者用户的权限
         * 如果没有设定则应用群组权限
         *
         * key 为身份组id或者用户id
         * value 为权限字符串列表
         */
        Object.defineProperty(this, "permissionMap", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        /**
         * 所有人的权限列表
         * 如果没有设定则应用群组权限
         */
        Object.defineProperty(this, "fallbackPermissions", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
    }
};
exports.GroupPanel = GroupPanel;
__decorate([
    (0, typegoose_1.prop)(),
    __metadata("design:type", String)
], GroupPanel.prototype, "id", void 0);
__decorate([
    (0, typegoose_1.prop)(),
    __metadata("design:type", String)
], GroupPanel.prototype, "name", void 0);
__decorate([
    (0, typegoose_1.prop)(),
    __metadata("design:type", String)
], GroupPanel.prototype, "parentId", void 0);
__decorate([
    (0, typegoose_1.prop)({
        type: () => Number,
    }),
    __metadata("design:type", typeof (_b = typeof tailchat_server_sdk_1.GroupPanelType !== "undefined" && tailchat_server_sdk_1.GroupPanelType) === "function" ? _b : Object)
], GroupPanel.prototype, "type", void 0);
__decorate([
    (0, typegoose_1.prop)(),
    __metadata("design:type", String)
], GroupPanel.prototype, "provider", void 0);
__decorate([
    (0, typegoose_1.prop)(),
    __metadata("design:type", String)
], GroupPanel.prototype, "pluginPanelName", void 0);
__decorate([
    (0, typegoose_1.prop)(),
    __metadata("design:type", Object)
], GroupPanel.prototype, "meta", void 0);
__decorate([
    (0, typegoose_1.prop)(),
    __metadata("design:type", Object)
], GroupPanel.prototype, "permissionMap", void 0);
__decorate([
    (0, typegoose_1.prop)({
        type: () => String,
        default: () => [],
    }),
    __metadata("design:type", Array)
], GroupPanel.prototype, "fallbackPermissions", void 0);
exports.GroupPanel = GroupPanel = __decorate([
    (0, typegoose_1.modelOptions)({
        options: {
            allowMixed: typegoose_1.Severity.ALLOW,
        },
    })
], GroupPanel);
/**
 * 群组权限组
 */
class GroupRole {
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
        }); // 权限组名
        Object.defineProperty(this, "permissions", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        }); // 拥有的权限, 是一段字符串
    }
}
exports.GroupRole = GroupRole;
__decorate([
    (0, typegoose_1.prop)(),
    __metadata("design:type", String)
], GroupRole.prototype, "name", void 0);
__decorate([
    (0, typegoose_1.prop)({
        type: () => String,
    }),
    __metadata("design:type", Array)
], GroupRole.prototype, "permissions", void 0);
/**
 * 群组
 */
let Group = Group_1 = class Group extends defaultClasses_1.TimeStamps {
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
        Object.defineProperty(this, "avatar", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "owner", {
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
        Object.defineProperty(this, "members", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "panels", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "roles", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        /**
         * 所有人的权限列表
         * 为群组中的最低权限
         */
        Object.defineProperty(this, "fallbackPermissions", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        /**
         * 群组的配置信息
         */
        Object.defineProperty(this, "config", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
    }
    /**
     * 创建群组
     */
    static async createGroup(options) {
        const { name, avatarBase64, panels = [], owner } = options;
        if (typeof avatarBase64 === 'string') {
            // TODO: 处理头像上传逻辑
        }
        // 预处理panels信息, 变换ID为objectid
        const panelSectionMap = {};
        panels.forEach((panel) => {
            const originPanelId = panel.id;
            panel.id = String(new mongoose_1.Types.ObjectId());
            if (panel.type === tailchat_server_sdk_1.GroupPanelType.GROUP) {
                panelSectionMap[originPanelId] = panel.id;
            }
            if (typeof panel.parentId === 'string') {
                if (typeof panelSectionMap[panel.parentId] !== 'string') {
                    throw new Error('创建失败, 面板参数不合法');
                }
                panel.parentId = panelSectionMap[panel.parentId];
            }
        });
        // NOTE: Expression produces a union type that is too complex to represent.
        const res = await this.create({
            name,
            panels,
            owner,
            members: [
                {
                    roles: [],
                    userId: owner,
                },
            ],
        });
        return res;
    }
    /**
     * 获取用户加入的群组列表
     * @param userId 用户ID
     */
    static async getUserGroups(userId) {
        return this.find({
            'members.userId': userId,
        });
    }
    /**
     * 修改群组角色名
     */
    static async updateGroupRoleName(groupId, roleId, roleName) {
        const group = await this.findById(groupId);
        if (!group) {
            throw new Error('Not Found Group');
        }
        const modifyRole = group.roles.find((role) => String(role._id) === roleId);
        if (!modifyRole) {
            throw new Error('Not Found Role');
        }
        modifyRole.name = roleName;
        await group.save();
        return group;
    }
    /**
     * 修改群组角色权限
     */
    static async updateGroupRolePermission(groupId, roleId, permissions) {
        const group = await this.findById(groupId);
        if (!group) {
            throw new Error('Not Found Group');
        }
        const modifyRole = group.roles.find((role) => String(role._id) === roleId);
        if (!modifyRole) {
            throw new Error('Not Found Role');
        }
        modifyRole.permissions = [...permissions];
        await group.save();
        return group;
    }
    /**
     * 获取用户所有权限
     */
    static async getGroupUserPermission(groupId, userId) {
        const group = await this.findById(groupId);
        if (!group) {
            throw new Error('Not Found Group');
        }
        if (userId === tailchat_server_sdk_1.SYSTEM_USERID) {
            return tailchat_server_sdk_1.allPermission;
        }
        const member = group.members.find((member) => String(member.userId) === userId);
        if (!member) {
            throw new Error('Not Found Member');
        }
        const allRoles = member.roles;
        const allRolesPermission = allRoles.map((roleName) => {
            var _a;
            const p = group.roles.find((r) => String(r._id) === roleName);
            return (_a = p === null || p === void 0 ? void 0 : p.permissions) !== null && _a !== void 0 ? _a : [];
        });
        if (String(group.owner) === userId) {
            /**
             * 群组管理者有所有权限
             * 这里是为了避免插件权限无法预先感知到的问题
             */
            return lodash_1.default.uniq([
                ...tailchat_server_sdk_1.allPermission,
                ...lodash_1.default.flatten(allRolesPermission),
                ...group.fallbackPermissions,
            ]);
        }
        else {
            return lodash_1.default.uniq([
                ...lodash_1.default.flatten(allRolesPermission),
                ...group.fallbackPermissions,
            ]);
        }
    }
    /**
     * 检查群组字段操作权限，如果没有权限会直接抛出异常
     */
    static async checkGroupFieldPermission(ctx, groupId, fieldName) {
        const userId = ctx.meta.userId;
        const t = ctx.meta.t;
        if (fieldName === 'roles') {
            // 检查操作用户是否有管理角色的权限
            const [hasRolePermission] = await (0, tailchat_server_sdk_1.call)(ctx).checkUserPermissions(groupId, userId, [tailchat_server_sdk_1.PERMISSION.core.manageRoles]);
            if (!hasRolePermission) {
                throw new tailchat_server_sdk_1.NoPermissionError(t('没有操作角色权限'));
            }
        }
        else {
            // 检查操作用户是否有管理用户权限
            const [hasUserPermission] = await (0, tailchat_server_sdk_1.call)(ctx).checkUserPermissions(groupId, userId, [tailchat_server_sdk_1.PERMISSION.core.manageUser]);
            if (!hasUserPermission) {
                throw new tailchat_server_sdk_1.NoPermissionError(t('没有操作用户权限'));
            }
        }
    }
    /**
     * 修改群组成员的字段信息
     *
     * 带权限验证
     */
    static async updateGroupMemberField(ctx, groupId, memberId, fieldName, fieldValue) {
        const group = await this.findById(groupId);
        const t = ctx.meta.t;
        await this.checkGroupFieldPermission(ctx, groupId, fieldName);
        const member = group.members.find((m) => String(m.userId) === memberId);
        if (!member) {
            throw new Error(t('没有找到该成员'));
        }
        if (typeof fieldValue === 'function') {
            fieldValue(member);
        }
        else {
            member[fieldName] = fieldValue;
        }
        await group.save();
        return group;
    }
};
exports.Group = Group;
__decorate([
    (0, typegoose_1.prop)({
        trim: true,
        maxlength: [100, 'group name is too long'],
    }),
    __metadata("design:type", String)
], Group.prototype, "name", void 0);
__decorate([
    (0, typegoose_1.prop)(),
    __metadata("design:type", String)
], Group.prototype, "avatar", void 0);
__decorate([
    (0, typegoose_1.prop)({
        ref: () => user_1.User,
    }),
    __metadata("design:type", typeof (_c = typeof typegoose_1.Ref !== "undefined" && typegoose_1.Ref) === "function" ? _c : Object)
], Group.prototype, "owner", void 0);
__decorate([
    (0, typegoose_1.prop)({
        maxlength: 120,
    }),
    __metadata("design:type", String)
], Group.prototype, "description", void 0);
__decorate([
    (0, typegoose_1.prop)({ type: () => GroupMember, _id: false }),
    __metadata("design:type", Array)
], Group.prototype, "members", void 0);
__decorate([
    (0, typegoose_1.prop)({ type: () => GroupPanel, _id: false }),
    __metadata("design:type", Array)
], Group.prototype, "panels", void 0);
__decorate([
    (0, typegoose_1.prop)({
        type: () => GroupRole,
        default: [],
    }),
    __metadata("design:type", Array)
], Group.prototype, "roles", void 0);
__decorate([
    (0, typegoose_1.prop)({
        type: () => String,
        default: () => [],
    }),
    __metadata("design:type", Array)
], Group.prototype, "fallbackPermissions", void 0);
__decorate([
    (0, typegoose_1.prop)({ default: () => ({}) }),
    __metadata("design:type", Object)
], Group.prototype, "config", void 0);
exports.Group = Group = Group_1 = __decorate([
    (0, typegoose_1.modelOptions)({
        options: {
            allowMixed: typegoose_1.Severity.ALLOW,
        },
    })
], Group);
const model = (0, typegoose_1.getModelForClass)(Group);
exports.default = model;
