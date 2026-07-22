import { eq, inArray } from "drizzle-orm";
import { serverData } from "../../drizzle/schema";
import { db } from "../db.server";
import { redis } from "../redis.server";
import type { DiscordChannelResource, ServerResource } from "../resources/server";
import { getDiscordAccessToken } from "./oauthToken.server";
import type { PatchCallConfigInput } from "../schemas/server";

const MANAGE_GUILD = 1n << 5n;
const ADMINISTRATOR = 1n << 3n;

type DiscordGuild = { id: string; name: string; icon: string | null; owner?: boolean; permissions: string };

async function discordFetch(path: string, authorization: string) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), Number(process.env.DISCORD_API_TIMEOUT_MS || 4000));
  try {
    return await fetch(`https://discord.com/api/v10${path}`, {
      headers: { Authorization: authorization },
      signal: controller.signal,
    });
  } catch {
    throw new Error("Discord is temporarily unavailable.");
  } finally {
    clearTimeout(timeout);
  }
}

async function manageableGuilds(userId: string): Promise<DiscordGuild[]> {
  const token = await getDiscordAccessToken(userId);
  const response = await discordFetch("/users/@me/guilds", `Bearer ${token}`);
  if (!response.ok) throw new Error("Discord servers could not be loaded.");
  const guilds = await response.json() as DiscordGuild[];
  return guilds.filter((guild) => guild.owner || (BigInt(guild.permissions) & (MANAGE_GUILD | ADMINISTRATOR)) !== 0n);
}

async function assertManageable(userId: string, serverId: string) {
  const guild = (await manageableGuilds(userId)).find((item) => item.id === serverId);
  if (!guild) throw new Error("You need Manage Server permission in Discord.");
  return guild;
}

export const serverService = {
  async list(userId: string): Promise<ServerResource[]> {
    const guilds = await manageableGuilds(userId);
    if (guilds.length === 0) return [];
    const rows = await db.select().from(serverData).where(inArray(serverData.id, guilds.map((guild) => guild.id)));
    const byId = new Map(rows.map((row) => [row.id, row]));
    return guilds.map((guild) => {
      const row = byId.get(guild.id);
      return {
        metadata: { id: guild.id, name: guild.name, iconUrl: guild.icon ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.webp?size=128` : null },
        spec: {
          hideServerName: row?.hideServerName ?? false,
          pingOnMatch: row?.pingOnMatch ?? false,
          autoRequeueOnSkip: row?.autoRequeueOnSkip ?? false,
          autoRequeueOnHangup: row?.autoRequeueOnHangup ?? false,
          filterNsfw: row?.filterNsfw ?? true,
          lobbyChannelIds: row?.lobbyChannelIds ?? [],
        },
        status: { botInstalled: !!row, manageable: true, callCount: row?.callCount ?? 0, messageCount: row?.messageCount ?? 0 },
      };
    });
  },

  async channels(userId: string, serverId: string): Promise<DiscordChannelResource[]> {
    await assertManageable(userId, serverId);
    const botToken = process.env.DISCORD_TOKEN;
    if (!botToken) throw new Error("Discord bot credentials are unavailable.");
    const response = await discordFetch(`/guilds/${serverId}/channels`, `Bot ${botToken}`);
    if (!response.ok) throw new Error("InterChat cannot read channels in this server.");
    const channels = await response.json() as Array<{ id: string; name: string; type: number }>;
    return channels.filter((channel) => channel.type === 0 || channel.type === 5).map((channel) => ({ ...channel, canCreateWebhook: true }));
  },

  async updateCallConfig(userId: string, input: PatchCallConfigInput) {
    const guild = await assertManageable(userId, input.serverId);
    const [existing] = await db.select().from(serverData).where(eq(serverData.id, input.serverId)).limit(1);
    if (!existing) throw new Error("Install InterChat in this server before changing Call settings.");
    const { serverId, ...settings } = input;
    await db.update(serverData).set({ ...settings, updatedAt: new Date().toISOString() }).where(eq(serverData.id, serverId));
    await redis.del(`server:settings:${serverId}`);
    await redis.incr(`server:settings:version:${serverId}`);
    return { success: true, serverName: guild.name };
  },
};
