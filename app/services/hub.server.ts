import { db } from "../db.server";
import { hub } from "../../drizzle/schema";
import { eq, or, inArray } from "drizzle-orm";
import type { CreateHubInput } from "../schemas/hub";
import type { HubResource } from "../resources/hub";
import { permissionService } from "./permission.server";
import { hubModerator } from "../../drizzle/schema";

const DEFAULT_HUB_ICON_URL = "https://images.unsplash.com/photo-1542281286-9e0a16bb7366?auto=format&fit=crop&w=300&q=80";

export const hubService = {
  /**
   * Retrieves all hubs owned by a user, formatted as HubResource.
   */
  async getUserHubs(userId: string): Promise<HubResource[]> {
    // Subquery to get hub IDs where the user is a moderator
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
          // Using an inArray subquery to get all hubs this user moderates
          inArray(hub.id, modHubIdsSubquery)
        )
      );
    
    // We fetch effective roles for all hubs concurrently
    const resources = await Promise.all(
      hubRecords.map(async (record) => {
        const effectiveRole = await permissionService.getEffectiveRole(userId, record.id);
        const permissions = permissionService.getPermissionsRecord(effectiveRole);

        return {
          metadata: {
            id: record.id,
            name: record.name,
            createdAt: record.createdAt,
            updatedAt: record.updatedAt,
            effectiveRole: effectiveRole || "NONE",
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
  }
};
