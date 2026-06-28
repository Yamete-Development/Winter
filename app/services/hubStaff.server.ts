import { db } from "../db.server";
import { hub, hubModerator } from "../../drizzle/schema";
import { and, eq } from "drizzle-orm";
import { permissionService } from "./permission.server";
import type { HubRole } from "../permissions/config";

export const hubStaffService = {
  /**
   * Assigns (or updates) a role for a user in a hub.
   *
   * The invoking user must have MANAGE_MODERATORS. After the DB write,
   * delegates cache invalidation to Iris (which handles L2 Redis cleanup
   * + pub/sub fan-out for L1 SieveCache across all bot shards and the web app).
   */
  async assignRole(
    invokerUserId: string,
    targetUserId: string,
    hubId: string,
    role: "MANAGER" | "MODERATOR"
  ): Promise<{ success: boolean; error?: string }> {
    await permissionService.assertCanPerform(invokerUserId, hubId, "MANAGE_MODERATORS");

    try {
      await db
        .insert(hubModerator)
        .values({ id: crypto.randomUUID(), hubId, userId: targetUserId, role })
        .onConflictDoUpdate({
          target: [hubModerator.hubId, hubModerator.userId],
          set: { role },
        });

      await permissionService.invalidateRole(hubId, targetUserId);
      return { success: true };
    } catch (error: any) {
      if (/foreign key/i.test(error?.message ?? "")) {
        return { success: false, error: "That user hasn't used InterChat yet." };
      }
      console.error("[hubStaffService] assignRole failed:", error);
      return { success: false, error: "Failed to assign role." };
    }
  },

  /**
   * Removes a user's moderator/manager role in a hub.
   *
   * The invoking user must have MANAGE_MODERATORS. After the DB delete,
   * delegates cache invalidation to Iris.
   */
  async removeRole(
    invokerUserId: string,
    targetUserId: string,
    hubId: string
  ): Promise<{ success: boolean; error?: string }> {
    await permissionService.assertCanPerform(invokerUserId, hubId, "MANAGE_MODERATORS");

    try {
      const result = await db
        .delete(hubModerator)
        .where(and(eq(hubModerator.hubId, hubId), eq(hubModerator.userId, targetUserId)));

      if ((result.rowCount ?? 0) === 0) {
        return { success: false, error: "That user is not a moderator in this hub." };
      }

      await permissionService.invalidateRole(hubId, targetUserId);
      return { success: true };
    } catch (error) {
      console.error("[hubStaffService] removeRole failed:", error);
      return { success: false, error: "Failed to remove role." };
    }
  },

  /**
   * Returns all staff members (moderators + managers) for a hub.
   */
  async getStaff(hubId: string): Promise<{ userId: string; role: HubRole }[]> {
    const rows = await db
      .select({ userId: hubModerator.userId, role: hubModerator.role })
      .from(hubModerator)
      .where(eq(hubModerator.hubId, hubId));

    return rows.map((r) => ({ userId: r.userId, role: r.role as HubRole }));
  },
};
