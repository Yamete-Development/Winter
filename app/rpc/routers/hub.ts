import { ORPCError } from "@orpc/server";
import { base, protectedBase } from "../context";
import { hubService } from "../../services/hub.server";
import { connectionService } from "../../services/connection.server";
import { messageService } from "../../services/message.server";
import { permissionService } from "../../services/permission.server";
import { createHubSchema, patchHubConfigSchema } from "../../schemas/hub";
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

  patchConfig: protectedBase
    .input(patchHubConfigSchema)
    .handler(async ({ input, context }) => {
      const result = await hubService.updateHubConfig(context.user.id, input);
      if (!result.success) {
        throw new ORPCError("FORBIDDEN", { message: result.error });
      }
      return { success: true };
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

  sendMessage: protectedBase
    .input(z.object({
      hubId: z.string(),
      content: z.string().min(1).max(4000),
      guildId: z.string(),
      channelId: z.string(),
    }))
    .handler(async ({ input, context }) => {
      await permissionService.assertCanPerform(context.user.id, input.hubId, "MODERATE_MESSAGES");
      const result = await messageService.sendMessage(
        input.hubId,
        input.content,
        context.user.id,
        input.guildId,
        input.channelId
      );
      if (!result.success) {
        throw new ORPCError("BAD_REQUEST", { message: result.error });
      }
      return { success: true, messageId: result.messageId };
    }),

  toggleConnection: protectedBase
    .input(z.object({
      connectionId: z.string(),
      enabled: z.boolean(),
      hubId: z.string(),
    }))
    .handler(async ({ input, context }) => {
      await permissionService.assertCanPerform(context.user.id, input.hubId, "MANAGE_CONNECTIONS");
      const result = await connectionService.toggleConnection(input.connectionId, input.hubId, input.enabled);
      if (!result.success) {
        throw new ORPCError("BAD_REQUEST", { message: result.error });
      }
      return { success: true };
    }),

  disconnectConnection: protectedBase
    .input(z.object({
      connectionId: z.string(),
      hubId: z.string(),
    }))
    .handler(async ({ input, context }) => {
      await permissionService.assertCanPerform(context.user.id, input.hubId, "MANAGE_CONNECTIONS");
      const result = await connectionService.disconnectConnection(input.connectionId, input.hubId);
      if (!result.success) {
        throw new ORPCError("BAD_REQUEST", { message: result.error });
      }
      return { success: true };
    }),

  createConnection: protectedBase
    .input(z.object({
      hubId: z.string(),
      channelId: z.string(),
      serverId: z.string(),
      webhookUrl: z.string(),
      parentId: z.string().optional(),
    }))
    .handler(async ({ input, context }) => {
      await permissionService.assertCanPerform(context.user.id, input.hubId, "MANAGE_CONNECTIONS");
      const result = await connectionService.createConnection(
        input.hubId,
        input.channelId,
        input.serverId,
        input.webhookUrl,
        input.parentId
      );
      if (!result.success) {
        throw new ORPCError("BAD_REQUEST", { message: result.error });
      }
      return { success: true };
    }),

  deleteHub: protectedBase
    .input(z.object({ hubId: z.string() }))
    .handler(async ({ input, context }) => {
      const result = await hubService.deleteHub(context.user.id, input.hubId);
      if (!result.success) {
        throw new ORPCError("FORBIDDEN", { message: result.error });
      }
      return { success: true };
    }),

  transferOwnership: protectedBase
    .input(z.object({
      hubId: z.string(),
      newOwnerId: z.string(),
    }))
    .handler(async ({ input, context }) => {
      const result = await hubService.transferOwnership(context.user.id, input.hubId, input.newOwnerId);
      if (!result.success) {
        throw new ORPCError("FORBIDDEN", { message: result.error });
      }
      return { success: true };
    }),

  nukeMessages: protectedBase
    .input(z.object({ hubId: z.string() }))
    .handler(async ({ input, context }) => {
      const result = await hubService.nukeHubMessages(context.user.id, input.hubId);
      if (!result.success) {
        throw new ORPCError("FORBIDDEN", { message: result.error });
      }
      return { success: true, deletedCount: result.deletedCount };
    }),
});
