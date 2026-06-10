import { db } from "../db.server";
import { hub, hubModerator } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";
import { ORPCError } from "@orpc/server";
import { ROLE_PERMISSIONS, getDefaultPermissions, type HubRole, type PermissionAction } from "../permissions/config";

export const permissionService = {
  /**
   * Gets the effective role of a user in a hub.
   */
  async getEffectiveRole(userId: string, hubId: string): Promise<HubRole | null> {
    // Check if owner
    const [hubRecord] = await db
      .select({ ownerId: hub.ownerId })
      .from(hub)
      .where(eq(hub.id, hubId))
      .limit(1);

    if (hubRecord && hubRecord.ownerId === userId) {
      return "OWNER";
    }

    // Check if moderator/manager
    const [modRecord] = await db
      .select({ role: hubModerator.role })
      .from(hubModerator)
      .where(and(eq(hubModerator.hubId, hubId), eq(hubModerator.userId, userId)))
      .limit(1);

    if (modRecord) {
      return modRecord.role as HubRole;
    }

    return null;
  },

  /**
   * Determines if a role is permitted to perform a specific action.
   */
  isRolePermitted(role: HubRole | null, action: PermissionAction): boolean {
    if (!role) return false;
    return ROLE_PERMISSIONS[role][action] === true;
  },

  /**
   * Checks if a user can perform an action in a hub.
   */
  async canPerform(userId: string, hubId: string, action: PermissionAction): Promise<boolean> {
    const role = await this.getEffectiveRole(userId, hubId);
    return this.isRolePermitted(role, action);
  },

  /**
   * Asserts that a user can perform an action in a hub. Throws ORPCError if forbidden.
   */
  async assertCanPerform(userId: string, hubId: string, action: PermissionAction): Promise<void> {
    const isPermitted = await this.canPerform(userId, hubId, action);
    if (!isPermitted) {
      throw new ORPCError("FORBIDDEN", { 
        message: `You do not have permission to perform ${action} in this hub.` 
      });
    }
  },

  /**
   * Gets the full map of permissions for a role, used to hydrate UI state.
   */
  getPermissionsRecord(role: HubRole | null): Record<PermissionAction, boolean> {
    if (!role) return getDefaultPermissions();
    return { ...ROLE_PERMISSIONS[role] };
  }
};
