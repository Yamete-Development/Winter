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
        authorBadges: user.badges,
        serverName: serverData.name,
      })
      .from(message)
      .leftJoin(user, eq(message.authorId, user.id))
      .leftJoin(serverData, eq(message.guildId, serverData.id))
      .where(and(...conditions))
      .orderBy(desc(message.createdAt))
      .limit(limit);

    // Return items newest-first
    const items = results.map(result => {
      // Force Postgres timestamp string to be interpreted as UTC by appending Z
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
        guildName: result.serverName || "Unknown Server",
        badges: (result.authorBadges as string[]) || [],
      }
    };
  });

    // nextCursor is the raw createdAt of the oldest message fetched for correct database pagination
    const nextCursor = items.length === limit ? results[results.length - 1].message.createdAt : null;

    return { items, nextCursor };
  }
};
