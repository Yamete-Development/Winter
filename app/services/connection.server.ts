import { db } from "../db.server";
import { connection, serverData } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";
import type { HubConnectionResource } from "../resources/connection";
import { discordService } from "./discord.server";

export const connectionService = {
  async getHubConnections(hubId: string): Promise<HubConnectionResource[]> {
    const results = await db
      .select({
        connection,
        serverName: serverData.name,
      })
      .from(connection)
      .leftJoin(serverData, eq(connection.serverId, serverData.id))
      .where(eq(connection.hubId, hubId));

    const connectionsWithChannels = await Promise.all(
      results.map(async ({ connection: conn, serverName }) => {
        let channelName = null;
        if (conn.channelId) {
          channelName = await discordService.getChannelName(conn.channelId);
        }

        return {
          metadata: {
            id: conn.id,
            name: serverName || `Connection-${conn.id}`,
            createdAt: conn.createdAt,
            updatedAt: conn.lastActive || conn.createdAt,
          },
          spec: {
            channelId: conn.channelId || "",
            serverId: conn.serverId,
            connected: conn.connected,
            pausedByBot: conn.pausedByBot,
          },
          status: {
            serverName: serverName || "Unknown Server",
            channelName: channelName || `#${conn.channelId}`,
            lastActive: conn.lastActive || conn.createdAt,
          },
        };
      })
    );

    return connectionsWithChannels;
  },

  async toggleConnection(connectionId: string, hubId: string, enabled: boolean): Promise<{ success: boolean; error?: string }> {
    try {
      const result = await db
        .update(connection)
        .set({
          connected: enabled,
          pausedByBot: !enabled,
          lastActive: new Date().toISOString(),
        })
        .where(and(eq(connection.id, connectionId), eq(connection.hubId, hubId)));

      if (result.rowCount === 0) {
        return { success: false, error: "Connection not found." };
      }
      return { success: true };
    } catch (error) {
      console.error("Failed to toggle connection", error);
      return { success: false, error: "Internal server error." };
    }
  },

  async disconnectConnection(connectionId: string, hubId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const result = await db
        .delete(connection)
        .where(and(eq(connection.id, connectionId), eq(connection.hubId, hubId)));

      if (result.rowCount === 0) {
        return { success: false, error: "Connection not found." };
      }
      return { success: true };
    } catch (error) {
      console.error("Failed to disconnect connection", error);
      return { success: false, error: "Internal server error." };
    }
  },

  async createConnection(
    hubId: string,
    channelId: string,
    serverId: string,
    webhookUrl: string,
    parentId?: string
  ): Promise<{ success: boolean; hubId?: string; error?: string }> {
    const id = crypto.randomUUID();
    try {
      await db.insert(connection).values({
        id,
        hubId,
        channelId,
        serverId,
        webhookURL: webhookUrl,
        parentId: parentId || null,
        connected: true,
        pausedByBot: false,
      });
      return { success: true, hubId };
    } catch (error) {
      const pgErr: any = (error as any)?.cause ?? error;
      const msg: string = pgErr?.message ?? (error instanceof Error ? error.message : "Failed to create connection.");
      if (/duplicate key/i.test(msg)) {
        return { success: false, error: "This channel is already connected." };
      }
      return { success: false, error: msg };
    }
  },
};
