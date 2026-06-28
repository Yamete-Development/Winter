import { ORPCError } from "@orpc/server";
import { base, protectedBase } from "../context";
import { moderationService } from "../../services/moderation.server";
import { hubStaffService } from "../../services/hubStaff.server";
import { z } from "zod";
import { batchUpdateAutomodRulesSchema } from "../../schemas/moderation";

const hubRoleSchema = z.enum(["MANAGER", "MODERATOR"]);

export const moderationRouter = base.router({
  getAutomodRules: protectedBase
    .input(z.object({ hubId: z.string() }))
    .handler(async ({ input }) => {
      return moderationService.getAutomodRules(input.hubId);
    }),

  getRecentInfractions: protectedBase
    .input(z.object({ hubId: z.string() }))
    .handler(async ({ input }) => {
      return moderationService.getRecentInfractions(input.hubId);
    }),

  batchUpdateAutomodRules: protectedBase
    .input(batchUpdateAutomodRulesSchema)
    .handler(async ({ input, context }) => {
      return moderationService.batchUpdateAutomodRules(input.hubId, input.rules, context.user.id);
    }),

  // ------------------------------------------------------------------ //
  // Hub staff management                                                 //
  // ------------------------------------------------------------------ //

  getStaff: protectedBase
    .input(z.object({ hubId: z.string() }))
    .handler(async ({ input }) => {
      return hubStaffService.getStaff(input.hubId);
    }),

  addModerator: protectedBase
    .input(
      z.object({
        hubId: z.string(),
        targetUserId: z.string(),
        role: hubRoleSchema,
      })
    )
    .handler(async ({ input, context }) => {
      const result = await hubStaffService.assignRole(
        context.user.id,
        input.targetUserId,
        input.hubId,
        input.role
      );
      if (!result.success) {
        throw new ORPCError("BAD_REQUEST", { message: result.error });
      }
      return { success: true };
    }),

  removeModerator: protectedBase
    .input(
      z.object({
        hubId: z.string(),
        targetUserId: z.string(),
      })
    )
    .handler(async ({ input, context }) => {
      const result = await hubStaffService.removeRole(
        context.user.id,
        input.targetUserId,
        input.hubId
      );
      if (!result.success) {
        throw new ORPCError("BAD_REQUEST", { message: result.error });
      }
      return { success: true };
    }),
});

