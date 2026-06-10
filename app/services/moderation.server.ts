import { db } from "../db.server";
import { antiSwearRule, antiSwearPattern, infraction, user } from "../../drizzle/schema";
import { eq, inArray, desc } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import type { AntiSwearRuleResource, InfractionResource } from "../resources/moderation";

export const moderationService = {
  async getAntiSwearRules(hubId: string): Promise<AntiSwearRuleResource[]> {
    const rules = await db.select().from(antiSwearRule).where(eq(antiSwearRule.hubId, hubId));
    
    const ruleIds = rules.map(r => r.id);
    
    const patterns = ruleIds.length > 0 
      ? await db.select().from(antiSwearPattern).where(inArray(antiSwearPattern.ruleId, ruleIds))
      : [];

    return rules.map(rule => ({
      metadata: {
        id: rule.id,
        name: rule.name,
        createdAt: rule.createdAt,
        updatedAt: rule.updatedAt,
      },
      spec: {
        name: rule.name,
        enabled: rule.enabled,
        muteDurationMinutes: rule.muteDurationMinutes,
        actions: rule.actions as string[],
        patterns: patterns.filter(p => p.ruleId === rule.id).map(p => ({
          id: p.id,
          pattern: p.pattern,
          matchType: p.matchType,
        })),
      }
    }));
  },

  async getRecentInfractions(hubId: string, limitCount: number = 20): Promise<InfractionResource[]> {
    const targetUser = alias(user, "targetUser");
    const modUser = alias(user, "modUser");

    const records = await db
      .select({
        infraction,
        targetUser: {
          name: targetUser.name,
          image: targetUser.image,
        },
        modUser: {
          name: modUser.name,
          image: modUser.image,
        }
      })
      .from(infraction)
      .leftJoin(targetUser, eq(infraction.userId, targetUser.id))
      .leftJoin(modUser, eq(infraction.moderatorId, modUser.id))
      .where(eq(infraction.hubId, hubId))
      .orderBy(desc(infraction.createdAt))
      .limit(limitCount);

    return records.map(record => {
      const type = record.infraction.type as "BAN" | "BLACKLIST" | "MUTE" | "WARNING";
      const status = record.infraction.status as "ACTIVE" | "REVOKED" | "APPEALED";
      const isServerInfraction = !!record.infraction.serverId;

      return {
        metadata: {
          id: record.infraction.id,
          createdAt: record.infraction.createdAt,
          updatedAt: record.infraction.updatedAt,
        },
        spec: {
          type,
          reason: record.infraction.reason,
          expiresAt: record.infraction.expiresAt,
          targetType: isServerInfraction ? "SERVER" : "USER",
          userId: record.infraction.userId,
          serverId: record.infraction.serverId,
        },
        status: {
          status,
          targetName: isServerInfraction ? record.infraction.serverName : record.targetUser?.name || null,
          targetAvatarUrl: isServerInfraction ? null : record.targetUser?.image || null,
          moderatorName: record.modUser?.name || null,
        }
      };
    });
  }
};
