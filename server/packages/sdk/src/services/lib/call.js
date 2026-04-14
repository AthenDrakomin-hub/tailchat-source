'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.call = void 0;
const index_1 = require('../../index');
function call(ctx) {
  return {
    /**
     * 加入socketio房间
     */
    async joinSocketIORoom(roomIds, userId) {
      await ctx.call('gateway.joinRoom', {
        roomIds,
        userId,
      });
    },
    /**
     * 离开socketio房间
     */
    async leaveSocketIORoom(roomIds, userId) {
      await ctx.call('gateway.leaveRoom', {
        roomIds,
        userId,
      });
    },
    /**
     * 检查用户是否在线
     */
    async isUserOnline(userIds) {
      return await ctx.call('gateway.checkUserOnline', { userIds });
    },
    /**
     * 发送系统消息
     * 如果为群组消息则需要增加groupId
     */
    async sendSystemMessage(message, converseId, groupId) {
      await ctx.call(
        'chat.message.sendMessage',
        {
          converseId,
          groupId,
          content: message,
        },
        {
          meta: {
            ...ctx.meta,
            userId: index_1.SYSTEM_USERID,
          },
        }
      );
    },
    /**
     * 获取群组大厅会话的id
     */
    async getGroupLobbyConverseId(groupId) {
      const lobbyConverseId = await ctx.call('group.getGroupLobbyConverseId', {
        groupId,
      });
      return lobbyConverseId;
    },
    /**
     * 添加群组系统信息
     */
    async addGroupSystemMessage(groupId, message) {
      const lobbyConverseId = await call(ctx).getGroupLobbyConverseId(groupId);
      if (!lobbyConverseId) {
        // 如果没有文本频道则跳过
        return;
      }
      await ctx.call(
        'chat.message.sendMessage',
        {
          converseId: lobbyConverseId,
          groupId: groupId,
          content: message,
        },
        {
          meta: {
            ...ctx.meta,
            userId: index_1.SYSTEM_USERID,
          },
        }
      );
    },
    /**
     * 获取用户信息
     */
    async getUserInfo(userId) {
      return await ctx.call('user.getUserInfo', {
        userId: String(userId),
      });
    },
    /**
     * 获取会话信息
     */
    async getConverseInfo(converseId) {
      return await ctx.call('chat.converse.findConverseInfo', {
        converseId,
      });
    },
    /**
     * 获取群组信息
     */
    async getGroupInfo(groupId) {
      return await ctx.call('group.getGroupInfo', {
        groupId,
      });
    },
    /**
     * 检查群组成员权限
     */
    async checkUserPermissions(groupId, userId, permissions) {
      const userAllPermissions = await ctx.call('group.getUserAllPermissions', {
        groupId,
        userId,
      });
      const hasOwnerPermission = userAllPermissions.includes(
        index_1.PERMISSION.core.owner
      );
      return permissions.map((p) =>
        hasOwnerPermission
          ? true // 如果有管理员权限。直接返回true
          : (userAllPermissions ?? []).includes(p)
      );
    },
    /**
     * 添加到收件箱
     * @param type 如果是插件则命名规范为包名加信息名，如: plugin:com.msgbyte.topic
     * @param payload 内容体，相关的逻辑由前端处理
     * @param userId 如果是添加到当前用户则userId可以不填
     */
    async appendInbox(type, payload, userId) {
      return await ctx.call('chat.inbox.append', {
        userId,
        type,
        payload,
      });
    },
  };
}
exports.call = call;
