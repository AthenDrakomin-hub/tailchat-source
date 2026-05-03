import type { GroupPanelType } from 'tailchat-shared';

export interface GroupPanelValues {
  name: string;
  type: string | GroupPanelType.TEXT | GroupPanelType.GROUP;
  permissionMap?: Record<string, string[]>;
  fallbackPermissions?: string[];
  [key: string]: unknown;
}
