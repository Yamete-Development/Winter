import { db } from "../db.server";
import { message, user, serverData } from "../../drizzle/schema";
import { eq, desc, lt, and } from "drizzle-orm";
import type { MessageResource } from "../resources/message";

export const messageService = {
  async getRecentMessages(hubId: string, limit: number = 50, cursor?: string): Promise<{ items: MessageResource[], nextCursor: string | null }> {
    const conditions = [eq(message.hubId, hubId)];
    if (cursor) {
      conditions.push(lt(message.createdAt, cursor));
    }

    const results = await db
      .select({
        message,
        authorName: user.name,
        authorAvatarUrl: user.image,
        authorBadges: user.badges,
        serverName: serverData.name,
      })
      .from(message)
      .leftJoin(user, eq(message.authorId, user.id))
      .leftJoin(serverData, eq(message.guildId, serverData.id))
      .where(and(...conditions))
      .orderBy(desc(message.createdAt))
      .limit(limit);

    const items = results.map(result => {
      const rawCreatedAt = result.message.createdAt;
      const createdAtUTC = rawCreatedAt.endsWith('Z') ? rawCreatedAt : rawCreatedAt.replace(' ', 'T') + 'Z';
      
      return {
      metadata: {
        id: result.message.id,
        name: `Message-${result.message.id}`,
        createdAt: createdAtUTC,
        updatedAt: createdAtUTC,
      },
      spec: {
        content: result.message.content,
        authorId: result.message.authorId || "",
        guildId: result.message.guildId || "",
        imageUrl: result.message.imageUrl || null,
      },
      status: {
        authorName: result.authorName || "Unknown User",
        authorAvatarUrl: result.authorAvatarUrl || null,
        guildName: result.serverName || "Unknown Server",
        badges: (result.authorBadges as string[]) || [],
      }
    };
  });

    const nextCursor = items.length === limit ? results[results.length - 1].message.createdAt : null;

    return { items, nextCursor };
  },

  async sendMessage(
    hubId: string,
    content: string,
    authorId: string,
    guildId: string,
    channelId: string
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const id = crypto.randomUUID();
      const now = new Date().toISOString();

      await db.insert(message).values({
        id,
        hubId,
        content,
        authorId,
        guildId,
        channelId,
        status: "ACTIVE",
      });

      return { success: true, messageId: id };
    } catch (error) {
      console.error("Failed to send message", error);
      return { success: false, error: "Failed to send message." };
    }
  },
};
