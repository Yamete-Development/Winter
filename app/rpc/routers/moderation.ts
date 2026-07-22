import { ORPCError } from "@orpc/server";
import { base, protectedBase } from "../context";
import { hubStaffService } from "../../services/hubStaff.server";
import { z } from "zod";

const hubRoleSchema = z.enum(["MANAGER", "MODERATOR"]);

export const moderationRouter = base.router({
  // ------------------------------------------------------------------ //
  // Hub staff management                                                 //
  // ------------------------------------------------------------------ //

  getStaff: protectedBase
    .input(z.object({ hubId: z.string() }))
    .handler(async ({ input, context }) => {
      return hubStaffService.getStaff(input.hubId, context.user.id);
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
