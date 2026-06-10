export const PERMISSION_ACTIONS = [
  "MANAGE_HUB_SETTINGS",
  "MANAGE_CONNECTIONS",
  "MANAGE_MODERATORS",
  "MANAGE_RULES",
  "MODERATE_MESSAGES",
  "VIEW_ANALYTICS",
  "VIEW_LOGS",
] as const;

export type PermissionAction = typeof PERMISSION_ACTIONS[number];
export type HubRole = "OWNER" | "MANAGER" | "MODERATOR";

export type RolePermissionsConfig = Record<HubRole, Record<PermissionAction, boolean>>;

/**
 * Single source of truth for Role-Based Access Control configuration.
 * This can be updated at any time without changing underlying codebase logic.
 */
export const ROLE_PERMISSIONS: RolePermissionsConfig = {
  OWNER: {
    MANAGE_HUB_SETTINGS: true,
    MANAGE_CONNECTIONS: true,
    MANAGE_MODERATORS: true,
    MANAGE_RULES: true,
    MODERATE_MESSAGES: true,
    VIEW_ANALYTICS: true,
    VIEW_LOGS: true,
  },
  MANAGER: {
    MANAGE_HUB_SETTINGS: true,
    MANAGE_CONNECTIONS: true,
    MANAGE_MODERATORS: false, // Managers typically cannot add other managers/moderators
    MANAGE_RULES: true,
    MODERATE_MESSAGES: true,
    VIEW_ANALYTICS: true,
    VIEW_LOGS: true,
  },
  MODERATOR: {
    MANAGE_HUB_SETTINGS: false,
    MANAGE_CONNECTIONS: false,
    MANAGE_MODERATORS: false,
    MANAGE_RULES: false,
    MODERATE_MESSAGES: true,
    VIEW_ANALYTICS: false,
    VIEW_LOGS: true,
  },
};

/**
 * Returns a default set of false permissions if a user has no role.
 */
export const getDefaultPermissions = (): Record<PermissionAction, boolean> => {
  return PERMISSION_ACTIONS.reduce((acc, action) => {
    acc[action] = false;
    return acc;
  }, {} as Record<PermissionAction, boolean>);
};
