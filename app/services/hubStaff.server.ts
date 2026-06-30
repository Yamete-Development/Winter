import { db } from "../db.server";
import { authRole, authUserAssignment } from "../../drizzle/schema";
import { and, eq, inArray } from "drizzle-orm";
import { permissionService } from "./permission.server";

export const hubStaffService = {
  /**
   * Assigns (or updates) a role for a user in a hub.
   *
   * The invoking user must have MANAGE_MODERATORS. After the DB write,
   * delegates cache invalidation to Iris.
   */
  async assignRole(
    invokerUserId: string,
    targetUserId: string,
    hubId: string,
    roleName: string
  ): Promise<{ success: boolean; error?: string }> {
    await permissionService.assertCanPerform(invokerUserId, hubId, "MANAGE_MODERATORS");

    try {
      // Look up matching authRole row
      const [matchingRole] = await db
        .select()
        .from(authRole)
        .where(and(eq(authRole.hubId, hubId), eq(authRole.name, roleName)))
        .limit(1);

      if (!matchingRole) {
        return { success: false, error: "Role not found in this hub." };
      }

      const [existingAssignment] = await db
        .select({ id: authUserAssignment.id })
        .from(authUserAssignment)
        .innerJoin(authRole, eq(authRole.id, authUserAssignment.roleId))
        .where(
          and(
            eq(authUserAssignment.userId, targetUserId),
            eq(authRole.hubId, hubId)
          )
        )
        .limit(1);

      const assignmentId = existingAssignment?.id ?? crypto.randomUUID();

      await db
        .insert(authUserAssignment)
        .values({
          id: assignmentId,
          roleId: matchingRole.id,
          userId: targetUserId,
        })
        .onConflictDoUpdate({
          target: authUserAssignment.id,
          set: {
            roleId: matchingRole.id,
          },
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
   * Removes every authUserAssignment row for targetUserId that belongs to a role with authRole.hubId === hubId.
   */
  async removeRole(
    invokerUserId: string,
    targetUserId: string,
    hubId: string
  ): Promise<{ success: boolean; error?: string }> {
    await permissionService.assertCanPerform(invokerUserId, hubId, "MANAGE_MODERATORS");

    try {
      const result = await db
        .delete(authUserAssignment)
        .where(
          and(
            eq(authUserAssignment.userId, targetUserId),
            inArray(
              authUserAssignment.roleId,
              db
                .select({ id: authRole.id })
                .from(authRole)
                .where(eq(authRole.hubId, hubId))
            )
          )
        );

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
   * Returns all staff members with explicit role mappings inside this hub,
   * including position to allow UI sorting.
   */
  async getStaff(hubId: string): Promise<{ userId: string; role: string; position: number }[]> {
    const rows = await db
      .select({
        userId: authUserAssignment.userId,
        role: authRole.name,
        position: authRole.position,
      })
      .from(authUserAssignment)
      .innerJoin(authRole, eq(authRole.id, authUserAssignment.roleId))
      .where(eq(authRole.hubId, hubId));

    return rows;
  },
};
