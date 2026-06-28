import { db } from "../db.server";
import { hub, hubModerator, message } from "../../drizzle/schema";
import { eq, or, and, inArray } from "drizzle-orm";
import type { CreateHubInput } from "../schemas/hub";
import type { HubResource } from "../resources/hub";
import { permissionService } from "./permission.server";

const DEFAULT_HUB_ICON_URL = "https://images.unsplash.com/photo-1542281286-9e0a16bb7366?auto=format&fit=crop&w=300&q=80";

export const hubService = {
  /**
   * Retrieves all hubs where the user is owner or moderator.
   * Owners get full permissions; non-owners get permissions resolved via Iris (3-layer cache).
   */
  async getUserHubs(userId: string): Promise<HubResource[]> {
    const modHubIdsSubquery = db
      .select({ hubId: hubModerator.hubId })
      .from(hubModerator)
      .where(eq(hubModerator.userId, userId));

    const hubRecords = await db
      .select()
      .from(hub)
      .where(
        or(
          eq(hub.ownerId, userId),
          inArray(hub.id, modHubIdsSubquery)
        )
      );

    const resources = await Promise.all(
      hubRecords.map(async (record) => {
        const isOwner = record.ownerId === userId;

        let effectiveRole: string;
        let permissions: import("../resources/hub").HubResource["metadata"]["permissions"];

        if (isOwner) {
          effectiveRole = "OWNER";
          permissions = permissionService.getOwnerPermissions();
        } else {
          permissions = await permissionService.getPermissionsRecord(userId, record.id);
          const [modRecord] = await db
            .select({ role: hubModerator.role })
            .from(hubModerator)
            .where(and(eq(hubModerator.hubId, record.id), eq(hubModerator.userId, userId)))
            .limit(1);
          effectiveRole = modRecord?.role ?? "NONE";
        }

        return {
          metadata: {
            id: record.id,
            name: record.name,
            createdAt: record.createdAt,
            updatedAt: record.updatedAt,
            effectiveRole,
            permissions,
          },
          spec: {
            description: record.description,
            shortDescription: record.shortDescription,
            visibility: record.visibility,
            language: record.language,
            region: record.region,
            welcomeMessage: record.welcomeMessage,
            iconUrl: record.iconUrl,
            bannerUrl: record.bannerUrl,
            locked: record.locked,
            nsfw: record.nsfw,
            rules: record.rules,
            appealCooldownHours: record.appealCooldownHours,
            settings: record.settings,
          },
          status: {
            activityLevel: record.activityLevel,
            verified: record.verified,
            partnered: record.partnered,
            featured: record.featured,
            weeklyMessageCount: record.weeklyMessageCount,
            averageRating: record.averageRating,
            connectionCount: record.connectionCount,
            upvoteCount: record.upvoteCount,
            reviewCount: record.reviewCount,
          }
        };
      })
    );

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
   */
  async deleteHub(userId: string, hubId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const canPerform = await permissionService.canPerform(userId, hubId, "ADMINISTRATOR");
      if (!canPerform) {
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
   */
  async transferOwnership(userId: string, hubId: string, newOwnerId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const canPerform = await permissionService.canPerform(userId, hubId, "ADMINISTRATOR");
      if (!canPerform) {
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
      const canPerform = await permissionService.canPerform(userId, hubId, "LOCKDOWN_HUB");
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
