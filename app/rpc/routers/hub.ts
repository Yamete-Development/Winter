import { ORPCError } from "@orpc/server";
import { base, protectedBase } from "../context";
import { hubService } from "../../services/hub.server";
import { connectionService } from "../../services/connection.server";
import { messageService } from "../../services/message.server";
import { createHubSchema } from "../../schemas/hub";
import { z } from "zod";

export const hubRouter = base.router({
  getUserHubs: protectedBase.handler(async ({ context }) => {
    return hubService.getUserHubs(context.user.id);
  }),

  createHub: protectedBase
    .input(createHubSchema)
    .handler(async ({ input, context }) => {
      const result = await hubService.createHub(context.user.id, input);
      if (!result.success) {
        throw new ORPCError("BAD_REQUEST", { message: result.error });
      }
      return { success: true, hubId: result.hubId };
    }),

  getConnections: protectedBase
    .input(z.object({ hubId: z.string() }))
    .handler(async ({ input }) => {
      return connectionService.getHubConnections(input.hubId);
    }),

  getRecentMessages: protectedBase
    .input(z.object({ hubId: z.string(), limit: z.number().optional().default(50), cursor: z.string().optional() }))
    .handler(async ({ input }) => {
      return messageService.getRecentMessages(input.hubId, input.limit, input.cursor);
    }),
});
