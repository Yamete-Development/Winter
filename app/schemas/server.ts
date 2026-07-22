import { z } from "zod";

export const serverIdSchema = z.object({ serverId: z.string().min(1) });
export const patchCallConfigSchema = serverIdSchema.extend({
  hideServerName: z.boolean(),
  pingOnMatch: z.boolean(),
  autoRequeueOnSkip: z.boolean(),
  autoRequeueOnHangup: z.boolean(),
  filterNsfw: z.boolean(),
  lobbyChannelIds: z.array(z.string()).max(25),
});
export type PatchCallConfigInput = z.infer<typeof patchCallConfigSchema>;
