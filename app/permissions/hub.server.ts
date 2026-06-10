import { db } from "../db.server";
import { hub } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

export const permissionService = {
  /**
   * Evaluates if a user has permission to edit a specific hub.
   */
  async canEditHub(userId: string, hubId: string): Promise<boolean> {
    const hubRecord = await db.query.hub.findFirst({
      where: eq(hub.id, hubId),
      columns: { ownerId: true },
    });

    if (!hubRecord) {
      return false;
    }

    // Currently only owner can edit. Expand later for moderators/managers
    return hubRecord.ownerId === userId;
  },

  /**
   * Evaluates if a user has permission to view a specific hub's control plane.
   */
  async canViewHub(userId: string, hubId: string): Promise<boolean> {
    const hubRecord = await db.query.hub.findFirst({
      where: eq(hub.id, hubId),
      columns: { ownerId: true },
    });

    if (!hubRecord) {
      return false;
    }

    return hubRecord.ownerId === userId;
  }
};
