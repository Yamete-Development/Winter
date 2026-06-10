import { db } from "../db.server";
import { connection, serverData } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
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
        // Fetch channel name if we have a channelId
        let channelName = null;
        if (conn.channelId) {
          channelName = await discordService.getChannelName(conn.channelId);
        }

        return {
          metadata: {
            id: conn.id,
            name: `Connection-${conn.id}`,
            createdAt: conn.createdAt,
            updatedAt: conn.lastActive || conn.createdAt,
          },
          spec: {
            channelId: conn.channelId || "",
            serverId: conn.serverId,
            connected: conn.connected,
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
};
