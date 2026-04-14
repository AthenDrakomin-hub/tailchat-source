'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.allPermission = exports.PERMISSION = void 0;
exports.PERMISSION = {
  /**
   * 非插件的权限点都叫core
   */
  core: {
    owner: '__group_owner__',
    message: 'core.message',
    invite: 'core.invite',
    unlimitedInvite: 'core.unlimitedInvite',
    editInvite: 'core.editInvite',
    groupDetail: 'core.groupDetail',
    groupBaseInfo: 'core.groupBaseInfo',
    groupConfig: 'core.groupConfig',
    manageUser: 'core.manageUser',
    managePanel: 'core.managePanel',
    manageInvite: 'core.manageInvite',
    manageRoles: 'core.manageRoles',
    deleteMessage: 'core.deleteMessage',
  },
};
exports.allPermission = [...Object.values(exports.PERMISSION.core)];
