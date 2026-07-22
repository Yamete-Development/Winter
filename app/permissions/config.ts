export const PERMISSION_ACTIONS = [
  "MANAGE_HUB_SETTINGS",
  "MODERATE_MESSAGES",
  "MANAGE_CONNECTIONS",
  "MANAGE_MODERATORS",
  "MANAGE_RULES",
  "VIEW_ANALYTICS",
  "VIEW_LOGS",
  "MANAGE_BANS",
  "MANAGE_GLOBAL_BLACKLISTS",
  "HANDLE_LOBBY_REPORTS",
  "DEVELOPER_BYPASS",
  "ADMINISTRATOR",
  "ANNOUNCE",
  "LOCKDOWN_HUB",
] as const;

export type PermissionAction = typeof PERMISSION_ACTIONS[number];
export type HubRole = "OWNER" | "MANAGER" | "MODERATOR";

export type RolePermissionsConfig = Record<HubRole, Record<PermissionAction, boolean>>;

/**
 * Bitmask values for each permission action.
 * Must match the InterchatPermission enum (authz.proto) used by Iris and the bot.
 */
export const PERMISSION_BITMASKS: Record<PermissionAction, number> = {
  MANAGE_HUB_SETTINGS: 1,        // 1 << 0
  MODERATE_MESSAGES: 2,          // 1 << 1  (MODERATE_HUB_MESSAGES in bot)
  MANAGE_CONNECTIONS: 4,         // 1 << 2
  MANAGE_MODERATORS: 8,          // 1 << 3
  MANAGE_RULES: 16,              // 1 << 4
  VIEW_ANALYTICS: 32,            // 1 << 5
  VIEW_LOGS: 64,                 // 1 << 6
  MANAGE_BANS: 128,              // 1 << 7
  MANAGE_GLOBAL_BLACKLISTS: 256, // 1 << 8
  HANDLE_LOBBY_REPORTS: 512,     // 1 << 9
  DEVELOPER_BYPASS: 1024,        // 1 << 10
  ADMINISTRATOR: 2048,           // 1 << 11
  ANNOUNCE: 4096,                // 1 << 12
  LOCKDOWN_HUB: 8192,            // 1 << 13
} as const;

/**
 * All-permissions record (for hub owners).
 */
export const ALL_PERMISSIONS: Record<PermissionAction, boolean> = {
  MANAGE_HUB_SETTINGS: true,
  MODERATE_MESSAGES: true,
  MANAGE_CONNECTIONS: true,
  MANAGE_MODERATORS: true,
  MANAGE_RULES: true,
  VIEW_ANALYTICS: true,
  VIEW_LOGS: true,
  MANAGE_BANS: true,
  MANAGE_GLOBAL_BLACKLISTS: true,
  HANDLE_LOBBY_REPORTS: true,
  DEVELOPER_BYPASS: true,
  ADMINISTRATOR: true,
  ANNOUNCE: true,
  LOCKDOWN_HUB: true,
};

/**
 * Single source of truth for Role-Based Access Control configuration.
 * NOTE: With Iris integration, this static mapping is being phased out in
 * favour of dynamic permission resolution via the authz microservice.
 * Retained for backward compatibility and as a reference for default role configs.
 */
export const ROLE_PERMISSIONS: RolePermissionsConfig = {
  OWNER: {
    MANAGE_HUB_SETTINGS: true,
    MODERATE_MESSAGES: true,
    MANAGE_CONNECTIONS: true,
    MANAGE_MODERATORS: true,
    MANAGE_RULES: true,
    VIEW_ANALYTICS: true,
    VIEW_LOGS: true,
    MANAGE_BANS: true,
    MANAGE_GLOBAL_BLACKLISTS: true,
    HANDLE_LOBBY_REPORTS: true,
    DEVELOPER_BYPASS: true,
    ADMINISTRATOR: true,
    ANNOUNCE: true,
    LOCKDOWN_HUB: true,
  },
  MANAGER: {
    MANAGE_HUB_SETTINGS: true,
    MODERATE_MESSAGES: true,
    MANAGE_CONNECTIONS: true,
    MANAGE_MODERATORS: false,
    MANAGE_RULES: true,
    VIEW_ANALYTICS: true,
    VIEW_LOGS: true,
    MANAGE_BANS: false,
    MANAGE_GLOBAL_BLACKLISTS: false,
    HANDLE_LOBBY_REPORTS: true,
    DEVELOPER_BYPASS: false,
    ADMINISTRATOR: false,
    ANNOUNCE: false,
    LOCKDOWN_HUB: false,
  },
  MODERATOR: {
    MANAGE_HUB_SETTINGS: false,
    MODERATE_MESSAGES: true,
    MANAGE_CONNECTIONS: false,
    MANAGE_MODERATORS: false,
    MANAGE_RULES: false,
    VIEW_ANALYTICS: false,
    VIEW_LOGS: true,
    MANAGE_BANS: false,
    MANAGE_GLOBAL_BLACKLISTS: false,
    HANDLE_LOBBY_REPORTS: false,
    DEVELOPER_BYPASS: false,
    ADMINISTRATOR: false,
    ANNOUNCE: false,
    LOCKDOWN_HUB: false,
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
