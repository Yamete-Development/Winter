import { base, protectedBase } from "../context";
import { moderationService } from "../../services/moderation.server";
import { z } from "zod";

export const moderationRouter = base.router({
  getAntiSwearRules: protectedBase
    .input(z.object({ hubId: z.string() }))
    .handler(async ({ input }) => {
      return moderationService.getAntiSwearRules(input.hubId);
    }),
  getRecentInfractions: protectedBase
    .input(z.object({ hubId: z.string() }))
    .handler(async ({ input }) => {
      return moderationService.getRecentInfractions(input.hubId);
    }),
});
