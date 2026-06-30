import { db } from "../db.server";
import { user } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { redis } from "../redis.server";

export const userService = {
  async getDashboardPreference(userId: string): Promise<Record<string, any> | null> {
    try {
      const val = await redis.get(`user:dashboard_preference:${userId}`);
      if (val) return JSON.parse(val);
    } catch (err) {
      console.warn("Failed to get dashboard preference from redis", err);
    }
    return null;
  },

  async updateDashboardPreference(userId: string, preference: Record<string, any>): Promise<{ success: boolean }> {
    try {
      await redis.set(`user:dashboard_preference:${userId}`, JSON.stringify(preference));
      return { success: true };
    } catch (error) {
      console.error("Failed to update dashboard preference", error);
      return { success: false };
    }
  },

  async getUserPreferences(userId: string): Promise<{
    locale: string | null;
    mentionOnReply: boolean;
    showNsfwHubs: boolean;
    voteRemindersEnabled: boolean;
    showBadges: boolean;
    dashboardPreference: Record<string, any> | null;
  } | null> {
    const result = await db
      .select({
        locale: user.locale,
        mentionOnReply: user.mentionOnReply,
        showNsfwHubs: user.showNsfwHubs,
        voteRemindersEnabled: user.voteRemindersEnabled,
        showBadges: user.showBadges,
      })
      .from(user)
      .where(eq(user.id, userId))
      .limit(1);

    if (result.length === 0) return null;

    let dashboardPreference: Record<string, any> | null = null;
    try {
      const val = await redis.get(`user:dashboard_preference:${userId}`);
      if (val) dashboardPreference = JSON.parse(val);
    } catch (err) {
      console.warn("Failed to get dashboard preference from redis in getUserPreferences", err);
    }

    return {
      locale: result[0].locale,
      mentionOnReply: result[0].mentionOnReply,
      showNsfwHubs: result[0].showNsfwHubs,
      voteRemindersEnabled: result[0].voteRemindersEnabled,
      showBadges: result[0].showBadges,
      dashboardPreference,
    };
  },

  async updateUserPreferences(
    userId: string,
    input: {
      locale?: string;
      mentionOnReply?: boolean;
      showNsfwHubs?: boolean;
      voteRemindersEnabled?: boolean;
      showBadges?: boolean;
      dashboardPreference?: Record<string, any>;
    }
  ): Promise<{ success: boolean }> {
    try {
      const dbUpdates: any = {};
      if (input.locale !== undefined) dbUpdates.locale = input.locale;
      if (input.mentionOnReply !== undefined) dbUpdates.mentionOnReply = input.mentionOnReply;
      if (input.showNsfwHubs !== undefined) dbUpdates.showNsfwHubs = input.showNsfwHubs;
      if (input.voteRemindersEnabled !== undefined) dbUpdates.voteRemindersEnabled = input.voteRemindersEnabled;
      if (input.showBadges !== undefined) dbUpdates.showBadges = input.showBadges;

      if (input.dashboardPreference !== undefined) {
        await redis.set(`user:dashboard_preference:${userId}`, JSON.stringify(input.dashboardPreference));
      }

      if (Object.keys(dbUpdates).length === 0) return { success: true };

      dbUpdates.updatedAt = new Date().toISOString();
      await db.update(user).set(dbUpdates).where(eq(user.id, userId));
      return { success: true };
    } catch (error) {
      console.error("Failed to update user preferences", error);
      return { success: false };
    }
  },
};
