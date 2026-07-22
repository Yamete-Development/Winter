import { db } from "../db.server";
import { hub, message, authRole, authUserAssignment } from "../../drizzle/schema";
import { eq, or, and, inArray } from "drizzle-orm";
import type { CreateHubInput } from "../schemas/hub";
import type { HubResource } from "../resources/hub";
import { permissionService } from "./permission.server";
import { irisClient } from "./iris.server";
import {
  PERMISSION_ACTIONS,
  PERMISSION_BITMASKS,
  getDefaultPermissions,
  type PermissionAction,
} from "../permissions/config";

const DEFAULT_HUB_ICON_URL = "https://interchat.tech/images/interchat.png";

function bitsToRecord(bits: number): Record<PermissionAction, boolean> {
  const record = getDefaultPermissions();
  for (const action of PERMISSION_ACTIONS) {
    const mask = PERMISSION_BITMASKS[action];
    record[action] = (bits & mask) === mask;
  }
  return record;
}

export const hubService = {
  /**
   * Retrieves all hubs where the user is owner or has an assignment via Iris.
   * Eliminates old hubModerator references and batch-fetches roles to avoid N+1 queries.
   */
  async getUserHubs(userId: string): Promise<HubResource[]> {
    const authorizedHubIds = await irisClient.getAuthorizedHubs(userId);

    const conditions = [eq(hub.ownerId, userId)];
    if (authorizedHubIds.length > 0) {
      conditions.push(inArray(hub.id, authorizedHubIds));
    }

    const rows = await db
      .select({
        hub: hub,
        roleId: authRole.id,
        roleName: authRole.name,
        permissions: authRole.permissions,
        position: authRole.position,
        assignmentId: authUserAssignment.id,
      })
      .from(hub)
      .leftJoin(
        authRole,
        eq(authRole.hubId, hub.id)
      )
      .leftJoin(
        authUserAssignment,
        and(
          eq(authUserAssignment.roleId, authRole.id),
          eq(authUserAssignment.userId, userId)
        )
      )
      .where(or(...conditions));

    const hubGroups = new Map<string, {
      hubRecord: typeof hub.$inferSelect,
      assignments: Array<{
        roleName: string;
        permissions: number;
        position: number;
      }>
    }>();

    for (const row of rows) {
      const hubId = row.hub.id;
      if (!hubGroups.has(hubId)) {
        hubGroups.set(hubId, {
          hubRecord: row.hub,
          assignments: [],
        });
      }
      
      if (row.assignmentId && row.roleName !== null && row.permissions !== null) {
        hubGroups.get(hubId)!.assignments.push({
          roleName: row.roleName,
          permissions: row.permissions,
          position: row.position ?? 0,
        });
      }
    }

    const resources: HubResource[] = Array.from(hubGroups.values()).map(({ hubRecord, assignments }) => {
      const isOwner = hubRecord.ownerId === userId;
      let effectiveRole: string;
      let permissions: Record<PermissionAction, boolean>;

      if (isOwner) {
        effectiveRole = "OWNER";
        permissions = permissionService.getOwnerPermissions();
      } else if (assignments.length === 0) {
        effectiveRole = "NONE";
        permissions = getDefaultPermissions();
      } else {
        let bits = 0;
        for (const ass of assignments) {
          bits |= ass.permissions;
        }
        permissions = bitsToRecord(bits);

        const sorted = [...assignments].sort((a, b) => b.position - a.position);
        effectiveRole = sorted[0].roleName;
      }

      return {
        metadata: {
          id: hubRecord.id,
          name: hubRecord.name,
          createdAt: hubRecord.createdAt,
          updatedAt: hubRecord.updatedAt,
          effectiveRole,
          permissions,
        },
        spec: {
          description: hubRecord.description,
          shortDescription: hubRecord.shortDescription,
          visibility: hubRecord.visibility,
          language: hubRecord.language,
          region: hubRecord.region,
          welcomeMessage: hubRecord.welcomeMessage,
          iconUrl: hubRecord.iconUrl,
          bannerUrl: hubRecord.bannerUrl,
          locked: hubRecord.locked,
          nsfw: hubRecord.nsfw,
          rules: hubRecord.rules,
          appealCooldownHours: hubRecord.appealCooldownHours,
          settings: hubRecord.settings,
        },
        status: {
          activityLevel: hubRecord.activityLevel,
          verified: hubRecord.verified,
          partnered: hubRecord.partnered,
          featured: hubRecord.featured,
          weeklyMessageCount: hubRecord.weeklyMessageCount,
          averageRating: hubRecord.averageRating,
          connectionCount: hubRecord.connectionCount,
          upvoteCount: hubRecord.upvoteCount,
          reviewCount: hubRecord.reviewCount,
        }
      };
    });

    return resources;
  },

  /**
   * Creates a new hub for a user.
   */
  async createHub(userId: string, input: CreateHubInput): Promise<{ success: boolean; hubId?: string; error?: string }> {
    const id = crypto.randomUUID();

    try {
      await db.insert(hub).values({
        id,
        name: input.name,
        description: input.description || input.shortDescription,
        language: input.language,
        region: input.region,
        ownerId: userId,
        iconUrl: input.iconUrl?.trim() || DEFAULT_HUB_ICON_URL,
        bannerUrl: input.bannerUrl?.trim() || null,
        shortDescription: input.shortDescription,
        visibility: input.visibility,
        welcomeMessage: input.welcomeMessage || null,
        activityLevel: "LOW",
        locked: false,
        nsfw: false,
        verified: false,
        partnered: false,
        featured: false,
        settings: 0,
        appealCooldownHours: 168,
        weeklyMessageCount: 0,
        rules: [],
      });
      return { success: true, hubId: id };
    } catch (error) {
      const pgErr: any = (error as any)?.cause ?? error;
      const msg: string = pgErr?.message ?? (error instanceof Error ? error.message : "Failed to create hub.");

      if (/duplicate key|Hub_name_key/i.test(msg)) {
        return { success: false, error: "A hub with that name already exists." };
      }

      return { success: false, error: msg };
    }
  },

  /**
   * Updates specific configuration fields of a hub.
   */
  async updateHubConfig(userId: string, input: import("../schemas/hub").PatchHubConfigInput): Promise<{ success: boolean; error?: string }> {
    try {
      const canEdit = await permissionService.canPerform(userId, input.hubId, "MANAGE_HUB_SETTINGS");

      if (!canEdit) {
        return { success: false, error: "You do not have permission to modify hub settings." };
      }

      const updates: any = {};
      if (input.nsfw !== undefined) updates.nsfw = input.nsfw;
      if (input.locked !== undefined) updates.locked = input.locked;
      if (input.appealCooldownHours !== undefined) updates.appealCooldownHours = input.appealCooldownHours;
      if (input.welcomeMessage !== undefined) updates.welcomeMessage = input.welcomeMessage;
      if (input.settings !== undefined) updates.settings = input.settings;

      if (Object.keys(updates).length > 0) {
        updates.updatedAt = new Date().toISOString();

        const result = await db.update(hub)
          .set(updates)
          .where(eq(hub.id, input.hubId));

        if (result.rowCount === 0) {
           return { success: false, error: "Hub not found." };
        }
      }

      return { success: true };
    } catch (error) {
      console.error("Failed to update hub config", error);
      return { success: false, error: "Internal server error while updating configuration." };
    }
  },

  /**
   * Deletes a hub and all associated data (cascaded by FK constraints).
   * Validates that only the actual Hub Owner is authorized.
   */
  async deleteHub(userId: string, hubId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const [hubRecord] = await db
        .select({ ownerId: hub.ownerId })
        .from(hub)
        .where(eq(hub.id, hubId))
        .limit(1);

      if (!hubRecord) {
        return { success: false, error: "Hub not found." };
      }

      if (hubRecord.ownerId !== userId) {
        return { success: false, error: "Only the hub owner can delete a hub." };
      }

      const result = await db.delete(hub).where(eq(hub.id, hubId));
      if (result.rowCount === 0) {
        return { success: false, error: "Hub not found." };
      }
      return { success: true };
    } catch (error) {
      console.error("Failed to delete hub", error);
      return { success: false, error: "Internal server error." };
    }
  },

  /**
   * Transfers ownership of a hub to another user.
   * Validates that only the actual Hub Owner is authorized.
   */
  async transferOwnership(userId: string, hubId: string, newOwnerId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const [hubRecord] = await db
        .select({ ownerId: hub.ownerId })
        .from(hub)
        .where(eq(hub.id, hubId))
        .limit(1);

      if (!hubRecord) {
        return { success: false, error: "Hub not found." };
      }

      if (hubRecord.ownerId !== userId) {
        return { success: false, error: "Only the hub owner can transfer ownership." };
      }

      const result = await db.update(hub)
        .set({ ownerId: newOwnerId, updatedAt: new Date().toISOString() })
        .where(eq(hub.id, hubId));

      if (result.rowCount === 0) {
        return { success: false, error: "Hub not found." };
      }

      await permissionService.invalidateHub(hubId);
      return { success: true };
    } catch (error) {
      console.error("Failed to transfer hub ownership", error);
      return { success: false, error: "Internal server error." };
    }
  },

  /**
   * Deletes all messages in a hub (nuke).
   */
  async nukeHubMessages(userId: string, hubId: string): Promise<{ success: boolean; error?: string; deletedCount?: number }> {
    try {
      const canPerform = await permissionService.canPerform(userId, hubId, "MODERATE_MESSAGES");
      if (!canPerform) {
        return { success: false, error: "You do not have permission to nuke messages." };
      }

      const result = await db.delete(message).where(eq(message.hubId, hubId));
      return { success: true, deletedCount: result.rowCount ?? 0 };
    } catch (error) {
      console.error("Failed to nuke hub messages", error);
      return { success: false, error: "Internal server error." };
    }
  },
};
