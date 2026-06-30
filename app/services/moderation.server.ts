import { db } from "../db.server";
import { automodRule, automodPattern, automodWhitelist, infraction, user, type blockWordAction } from "../../drizzle/schema";
import { eq, inArray, desc, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import type { AutomodRuleResource, InfractionResource } from "../resources/moderation";
import { permissionService } from "./permission.server";

export const moderationService = {
  async getAutomodRules(hubId: string, userId: string): Promise<AutomodRuleResource[]> {
    await permissionService.assertCanPerform(userId, hubId, "MANAGE_RULES");
    const rules = await db.select().from(automodRule).where(eq(automodRule.hubId, hubId));

    const ruleIds = rules.map(r => r.id);

    const patternCounts = ruleIds.length > 0
      ? await db
          .select({
            ruleId: automodPattern.ruleId,
            count: sql<number>`count(*)::int`,
          })
          .from(automodPattern)
          .where(inArray(automodPattern.ruleId, ruleIds))
          .groupBy(automodPattern.ruleId)
      : [];

    const whitelistCounts = ruleIds.length > 0
      ? await db
          .select({
            ruleId: automodWhitelist.ruleId,
            count: sql<number>`count(*)::int`,
          })
          .from(automodWhitelist)
          .where(inArray(automodWhitelist.ruleId, ruleIds))
          .groupBy(automodWhitelist.ruleId)
      : [];

    const patternCountMap = new Map(patternCounts.map(pc => [pc.ruleId, pc.count]));
    const whitelistCountMap = new Map(whitelistCounts.map(wc => [wc.ruleId, wc.count]));

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
        patterns: [],
        whitelist: [],
      },
      status: {
        patternCount: patternCountMap.get(rule.id) || 0,
        whitelistCount: whitelistCountMap.get(rule.id) || 0,
      }
    }));
  },

  async getAutomodRule(hubId: string, ruleId: string, userId: string): Promise<AutomodRuleResource> {
    await permissionService.assertCanPerform(userId, hubId, "MANAGE_RULES");
    const rule = await db.select().from(automodRule).where(eq(automodRule.id, ruleId)).then(rows => rows[0]);
    if (!rule || rule.hubId !== hubId) {
      throw new Error("Rule not found");
    }

    const patterns = await db.select().from(automodPattern).where(eq(automodPattern.ruleId, ruleId));
    const whitelists = await db.select().from(automodWhitelist).where(eq(automodWhitelist.ruleId, ruleId));

    return {
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
        patterns: patterns.map(p => ({
          id: p.id,
          pattern: p.pattern,
          matchType: p.matchType as "EXACT" | "PREFIX" | "SUFFIX" | "WILDCARD",
        })),
        whitelist: whitelists.map(w => ({
          id: w.id,
          word: w.word,
        })),
      },
      status: {
        patternCount: patterns.length,
        whitelistCount: whitelists.length,
      }
    };
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
  },

  async createAutomodRule(
    hubId: string,
    input: {
      name: string;
      actions: (typeof blockWordAction.enumValues)[number][];
      muteDurationMinutes?: number | null;
      patterns: { pattern: string; matchType: "EXACT" | "PREFIX" | "SUFFIX" | "WILDCARD" }[];
      whitelist: string[];
    },
    userId: string
  ): Promise<{ id: string }> {
    await permissionService.assertCanPerform(userId, hubId, "MANAGE_RULES");
    const ruleId = crypto.randomUUID();

    await db.insert(automodRule).values({
      id: ruleId,
      hubId,
      name: input.name,
      createdBy: userId,
      enabled: true,
      muteDurationMinutes: input.muteDurationMinutes || null,
      actions: input.actions,
    });

    if (input.patterns.length > 0) {
      await db.insert(automodPattern).values(
        input.patterns.map(p => ({
          id: crypto.randomUUID(),
          ruleId,
          pattern: p.pattern,
          matchType: p.matchType,
        }))
      );
    }

    if (input.whitelist.length > 0) {
      await db.insert(automodWhitelist).values(
        input.whitelist.map(w => ({
          id: crypto.randomUUID(),
          ruleId,
          word: w,
          createdBy: userId,
        }))
      );
    }

    return { id: ruleId };
  },

  async updateAutomodRule(
    hubId: string,
    ruleId: string,
    input: {
      name?: string;
      enabled?: boolean;
      actions?: (typeof blockWordAction.enumValues)[number][];
      muteDurationMinutes?: number | null;
      patterns?: { pattern: string; matchType: "EXACT" | "PREFIX" | "SUFFIX" | "WILDCARD" }[];
      whitelist?: string[];
    },
    userId: string
  ): Promise<{ success: boolean }> {
    await permissionService.assertCanPerform(userId, hubId, "MANAGE_RULES");

    const updateData: any = {};
    if (input.name !== undefined) updateData.name = input.name;
    if (input.enabled !== undefined) updateData.enabled = input.enabled;
    if (input.muteDurationMinutes !== undefined) updateData.muteDurationMinutes = input.muteDurationMinutes || null;
    if (input.actions !== undefined) updateData.actions = input.actions;

    if (Object.keys(updateData).length > 0) {
      updateData.updatedAt = new Date().toISOString();
      await db.update(automodRule)
        .set(updateData)
        .where(eq(automodRule.id, ruleId));
    }

    if (input.patterns !== undefined) {
      await db.delete(automodPattern).where(eq(automodPattern.ruleId, ruleId));
      if (input.patterns.length > 0) {
        await db.insert(automodPattern).values(
          input.patterns.map(p => ({
            id: crypto.randomUUID(),
            ruleId,
            pattern: p.pattern,
            matchType: p.matchType,
          }))
        );
      }
    }

    if (input.whitelist !== undefined) {
      await db.delete(automodWhitelist).where(eq(automodWhitelist.ruleId, ruleId));
      if (input.whitelist.length > 0) {
        await db.insert(automodWhitelist).values(
          input.whitelist.map(w => ({
            id: crypto.randomUUID(),
            ruleId,
            word: w,
            createdBy: userId,
          }))
        );
      }
    }

    return { success: true };
  },

  async deleteAutomodRule(
    hubId: string,
    ruleId: string,
    userId: string
  ): Promise<{ success: boolean }> {
    await permissionService.assertCanPerform(userId, hubId, "MANAGE_RULES");
    await db.delete(automodRule).where(eq(automodRule.id, ruleId));
    return { success: true };
  }
};
