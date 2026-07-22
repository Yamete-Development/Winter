import { base, protectedBase } from "../context";
import { serverService } from "~/services/server.server";
import { patchCallConfigSchema, serverIdSchema } from "~/schemas/server";

export const serverRouter = base.router({
  list: protectedBase.handler(({ context }) => serverService.list(context.user.id)),
  channels: protectedBase.input(serverIdSchema).handler(({ input, context }) => serverService.channels(context.user.id, input.serverId)),
  patchCallConfig: protectedBase.input(patchCallConfigSchema).handler(({ input, context }) => serverService.updateCallConfig(context.user.id, input)),
});
