import { db } from "../db.server";
import { automodRule, automodPattern, infraction, user, type blockWordAction } from "../../drizzle/schema";
import { eq, inArray, desc } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import type { AutomodRuleResource, InfractionResource } from "../resources/moderation";
import { permissionService } from "./permission.server";

export const moderationService = {
  async getAutomodRules(hubId: string, userId: string): Promise<AutomodRuleResource[]> {
    await permissionService.assertCanPerform(userId, hubId, "MANAGE_RULES");
    const rules = await db.select().from(automodRule).where(eq(automodRule.hubId, hubId));

    const ruleIds = rules.map(r => r.id);

    const patterns = ruleIds.length > 0
      ? await db.select().from(automodPattern).where(inArray(automodPattern.ruleId, ruleIds))
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

  async getRecentInfractions(hubId: string, userId: string, limitCount: number = 20): Promise<InfractionResource[]> {
    await permissionService.assertCanPerform(userId, hubId, "VIEW_LOGS");
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
  },

  async batchUpdateAutomodRules(
    hubId: string,
    rules: {
      id?: string;
      pattern: string;
      matchType: string;
      actions: (typeof blockWordAction.enumValues)[number][];
    }[],
    createdBy: string,
  ) {
    await permissionService.assertCanPerform(createdBy, hubId, "MANAGE_RULES");
    const ruleIdsToKeep = new Set<string>();

    for (const rule of rules) {
      const ruleId = rule.id && rule.id.length > 5 ? rule.id : crypto.randomUUID();
      ruleIdsToKeep.add(ruleId);

      await db
        .insert(automodRule)
        .values({
          id: ruleId,
          hubId,
          name: rule.pattern,
          createdBy,
          enabled: true,
          muteDurationMinutes: 60,
          actions: rule.actions,
        })
        .onConflictDoUpdate({
          target: [automodRule.hubId, automodRule.name],
          set: {
            enabled: true,
            actions: rule.actions,
            updatedAt: new Date().toISOString(),
          },
        });
    }

    const allRuleIds = Array.from(ruleIdsToKeep);
    const existingPatterns = allRuleIds.length > 0
      ? await db.select().from(automodPattern).where(inArray(automodPattern.ruleId, allRuleIds))
      : [];

    for (const rule of rules) {
      const ruleId = rule.id && rule.id.length > 5 ? rule.id : crypto.randomUUID();
      const existing = existingPatterns.filter(p => p.ruleId === ruleId);

      if (existing.length > 0) {
        await db
          .update(automodPattern)
          .set({
            pattern: rule.pattern,
            matchType: rule.matchType.toUpperCase() as "EXACT" | "PREFIX" | "SUFFIX" | "WILDCARD",
          })
          .where(eq(automodPattern.ruleId, ruleId));
      } else {
        await db.insert(automodPattern).values({
          id: crypto.randomUUID(),
          ruleId,
          pattern: rule.pattern,
          matchType: rule.matchType.toUpperCase() as "EXACT" | "PREFIX" | "SUFFIX" | "WILDCARD",
        });
      }
    }

    const existingRules = await db.select({ id: automodRule.id }).from(automodRule).where(eq(automodRule.hubId, hubId));
    const rulesToDelete = existingRules.filter(r => !ruleIdsToKeep.has(r.id)).map(r => r.id);

    if (rulesToDelete.length > 0) {
      await db.delete(automodPattern).where(inArray(automodPattern.ruleId, rulesToDelete));
      await db.delete(automodRule).where(inArray(automodRule.id, rulesToDelete));
    }

    return true;
  }
};
