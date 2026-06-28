import { base, protectedBase } from "../context";
import { userService } from "../../services/user.server";
import { z } from "zod";

export const preferencesRouter = base.router({
  getUserPreferences: protectedBase.handler(async ({ context }) => {
    const prefs = await userService.getUserPreferences(context.user.id);
    return prefs ?? { dashboardPreference: null };
  }),

  updateDashboardPreference: protectedBase
    .input(z.object({
      preference: z.record(z.string(), z.any()),
    }))
    .handler(async ({ input, context }) => {
      const result = await userService.updateDashboardPreference(context.user.id, input.preference);
      return result;
    }),

  updateUserPreferences: protectedBase
    .input(z.object({
      locale: z.string().optional(),
      mentionOnReply: z.boolean().optional(),
      showNsfwHubs: z.boolean().optional(),
      voteRemindersEnabled: z.boolean().optional(),
      showBadges: z.boolean().optional(),
      dashboardPreference: z.record(z.string(), z.any()).optional(),
    }))
    .handler(async ({ input, context }) => {
      const result = await userService.updateUserPreferences(context.user.id, input);
      return result;
    }),
});
