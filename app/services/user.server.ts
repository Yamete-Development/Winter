import { db } from "../db.server";
import { user } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

export const userService = {
  async getDashboardPreference(userId: string): Promise<Record<string, any> | null> {
    const result = await db
      .select({ dashboardPreference: user.dashboardPreference })
      .from(user)
      .where(eq(user.id, userId))
      .limit(1);

    if (result.length === 0) return null;
    return result[0].dashboardPreference as Record<string, any> | null;
  },

  async updateDashboardPreference(userId: string, preference: Record<string, any>): Promise<{ success: boolean }> {
    try {
      await db
        .update(user)
        .set({
          dashboardPreference: preference,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(user.id, userId));
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
        dashboardPreference: user.dashboardPreference,
      })
      .from(user)
      .where(eq(user.id, userId))
      .limit(1);

    if (result.length === 0) return null;
    return {
      locale: result[0].locale,
      mentionOnReply: result[0].mentionOnReply,
      showNsfwHubs: result[0].showNsfwHubs,
      voteRemindersEnabled: result[0].voteRemindersEnabled,
      showBadges: result[0].showBadges,
      dashboardPreference: result[0].dashboardPreference as Record<string, any> | null,
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
      const updates: any = {};
      if (input.locale !== undefined) updates.locale = input.locale;
      if (input.mentionOnReply !== undefined) updates.mentionOnReply = input.mentionOnReply;
      if (input.showNsfwHubs !== undefined) updates.showNsfwHubs = input.showNsfwHubs;
      if (input.voteRemindersEnabled !== undefined) updates.voteRemindersEnabled = input.voteRemindersEnabled;
      if (input.showBadges !== undefined) updates.showBadges = input.showBadges;
      if (input.dashboardPreference !== undefined) updates.dashboardPreference = input.dashboardPreference;

      if (Object.keys(updates).length === 0) return { success: true };

      updates.updatedAt = new Date().toISOString();
      await db.update(user).set(updates).where(eq(user.id, userId));
      return { success: true };
    } catch (error) {
      console.error("Failed to update user preferences", error);
      return { success: false };
    }
  },
};
