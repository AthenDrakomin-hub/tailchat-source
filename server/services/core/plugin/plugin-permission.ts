export type SystemRole = 'student' | 'monitor' | 'teacher';

export interface EnabledPluginsConfig {
  [pluginId: string]: SystemRole[] | boolean;
}

export function extractPluginIdFromActionName(actionName: string): string | null {
  if (actionName.startsWith('plugin:')) {
    const parts = actionName.split('.');
    if (parts.length > 1) {
      return parts[0].substring(7);
    }
  }
  return null;
}

export function isRoleAllowedForPlugin(
  pluginId: string,
  userRole: string,
  config: EnabledPluginsConfig | null
): boolean {
  if (!config || config[pluginId] === undefined) {
    return true; // Default allow if not specified
  }
  
  const rules = config[pluginId];
  if (typeof rules === 'boolean') {
    return rules;
  }
  
  if (Array.isArray(rules)) {
    return rules.includes(userRole as SystemRole);
  }
  
  return true;
}

export function isPluginPublished(
  config: EnabledPluginsConfig | null,
  pluginId: string
): boolean {
  if (!config || config[pluginId] === undefined) {
    return true;
  }
  return config[pluginId] !== false;
}
