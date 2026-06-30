import { db as defaultDb } from "../db.server";
import { user, userStats } from "../../drizzle/schema";
import { eq, sql } from "drizzle-orm";
import crypto from "crypto";

export interface TopGGWebhookPayload {
  type: "vote.create" | "webhook.test";
  data: {
    id: string;
    weight: number;
    created_at: string;
    expires_at: string;
    project: {
      id: string;
      type: "bot" | "server";
      platform: "discord";
      platform_id: string;
    };
    user: {
      id: string;
      platform_id: string;
      name: string;
      avatar_url: string;
    };
  };
}

export interface VoteResult {
  success: boolean;
  voteValue: number;
  totalVotes: number;
  badgesAwarded?: string[];
  error?: string;
}

/**
 * Service handling Top.gg webhook cryptographic signature validation,
 * vote processing (database persistence), and Discord announcement dispatching.
 */
export class TopGGService {
  private db: typeof defaultDb;

  constructor(dbInstance: typeof defaultDb = defaultDb) {
    this.db = dbInstance;
  }

  /**
   * Cryptographically validates the incoming request payload using the signature header.
   */
  public validateSignature(
    rawBody: string,
    signature: string | null,
    secret: string
  ): boolean {
    if (!signature || !secret) {
      return false;
    }

    try {
      // Parse "t=123456789,v1=abcdef..."
      const parts = signature.split(",");
      if (parts.length !== 2) return false;

      const tPart = parts[0].split("=")[1];
      const v1Part = parts[1].split("=")[1];

      if (!tPart || !v1Part) return false;

      // Compute HMAC SHA-256 digest of {timestamp}.{rawBody}
      const expectedSignature = crypto
        .createHmac("sha256", secret)
        .update(`${tPart}.${rawBody}`)
        .digest("hex");

      const bufferV1 = Buffer.from(v1Part);
      const bufferExpected = Buffer.from(expectedSignature);

      // timingSafeEqual requires buffers to have the exact same length
      if (bufferV1.length !== bufferExpected.length) {
        return false;
      }

      return crypto.timingSafeEqual(bufferV1, bufferExpected);
    } catch (error) {
      console.error("Error executing crypto signature validation:", error);
      return false;
    }
  }

  /**
   * Processes a vote: upserts user, increments vote count in UserStats, and awards VOTER badge if applicable.
   */
  public async processVote(payload: TopGGWebhookPayload): Promise<VoteResult> {
    try {
      const { type, data } = payload;

      if (type === "webhook.test") {
        if (process.env.NODE_ENV === "production") {
          return {
            success: false,
            voteValue: 0,
            totalVotes: 0,
            error: "Test votes not processed in production",
          };
        }
        return { success: true, voteValue: 0, totalVotes: 0 };
      }

      const userId = data.user.platform_id;
      const voteValue = data.weight ?? 1;
      const lastVotedIso = new Date(data.created_at || Date.now()).toISOString();
      const nowIso = new Date().toISOString();

      // Step 1: Upsert primary User record
      await this.db
        .insert(user)
        .values({
          id: userId,
          lastVoted: lastVotedIso,
          updatedAt: nowIso,
        })
        .onConflictDoUpdate({
          target: user.id,
          set: {
            lastVoted: lastVotedIso,
            updatedAt: nowIso,
          },
        });

      // Step 2: Upsert UserStats record
      await this.db
        .insert(userStats)
        .values({
          userId: userId,
          voteCount: voteValue,
          updatedAt: nowIso,
          createdAt: nowIso,
        })
        .onConflictDoUpdate({
          target: userStats.userId,
          set: {
            voteCount: sql`${userStats.voteCount} + ${voteValue}`,
            updatedAt: nowIso,
          },
        });

      // Step 3: Fetch current badges and updated vote count to check for rewards
      const [userInfo] = await this.db
        .select({
          badges: user.badges,
          voteCount: userStats.voteCount,
        })
        .from(user)
        .leftJoin(userStats, eq(user.id, userStats.userId))
        .where(eq(user.id, userId))
        .limit(1);

      if (!userInfo) {
        throw new Error("Failed to retrieve user info after update");
      }

      const currentBadges = (userInfo.badges as string[]) || [];
      const totalVotes = userInfo.voteCount ?? 0;
      const badgesToAward: string[] = [];

      // Award the VOTER badge on the first vote if they don't already have it
      if (totalVotes >= 1 && !currentBadges.includes("VOTER")) {
        badgesToAward.push("VOTER");
      }

      if (badgesToAward.length > 0) {
        const updatedBadges = [...currentBadges, ...badgesToAward];
        await this.db
          .update(user)
          .set({
            badges: updatedBadges as any,
            updatedAt: nowIso,
          })
          .where(eq(user.id, userId));
      }

      return {
        success: true,
        voteValue,
        totalVotes,
        badgesAwarded: badgesToAward.length > 0 ? badgesToAward : undefined,
      };
    } catch (error) {
      console.error("Error processing Top.gg vote:", error);
      return {
        success: false,
        voteValue: 0,
        totalVotes: 0,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Dispatches a formatted notification message to the Discord vote announcer webhook.
   */
  public async sendDiscordVoteAnnouncement(
    payload: TopGGWebhookPayload,
    result: VoteResult
  ): Promise<boolean> {
    try {
      const webhookUrl = process.env.DISCORD_VOTE_WEBHOOK_URL;
      if (!webhookUrl) return false;

      if (payload.type === "webhook.test") {
        return true;
      }

      const username = payload.data.user.name || "A Supporter";
      const avatarUrl = payload.data.user.avatar_url || "https://cdn.discordapp.com/embed/avatars/0.png";
      const botClientId = payload.data.project.platform_id;

      const countOrdinal = this.getOrdinal(result.totalVotes);
      let messageText = `I just voted for **InterChat** on top.gg for the **${countOrdinal}** time!`;

      if (result.badgesAwarded && result.badgesAwarded.length > 0) {
        messageText += `\n-# 🎖️ Unlocked badge: **${result.badgesAwarded.join(", ")}**`;
      }

      const discordPayload = {
        content: messageText,
        username: username,
        avatar_url: avatarUrl,
        components: [
          {
            type: 1,
            components: [
              {
                type: 2,
                style: 5,
                label: "Vote Again",
                url: `https://top.gg/bot/${botClientId}/vote`,
              },
            ],
          },
        ],
      };

      const targetUrl = new URL(webhookUrl);
      if (!targetUrl.searchParams.has("with_components")) {
        targetUrl.searchParams.set("with_components", "true");
      }

      const response = await fetch(targetUrl.toString(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(discordPayload),
      });

      return response.ok;
    } catch (error) {
      console.error("Failed dispatching text webhook alert:", error);
      return false;
    }
  }

  /**
   * Helper function to get ordinal suffix for numbers.
   */
  private getOrdinal(num: number): string {
    const j = num % 10;
    const k = num % 100;
    if (j === 1 && k !== 11) return `${num}st`;
    if (j === 2 && k !== 12) return `${num}nd`;
    if (j === 3 && k !== 13) return `${num}rd`;
    return `${num}th`;
  }
}

// Export singleton instance for app-wide use
export const topGGService = new TopGGService();
