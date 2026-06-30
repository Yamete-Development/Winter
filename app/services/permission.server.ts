import { redis } from "../redis.server";
import { irisClient } from "./iris.server";
import { permissionCache } from "./permissionCache.server";
import { ORPCError } from "@orpc/server";
import { db } from "../db.server";
import { hub } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import {
  PERMISSION_ACTIONS,
  PERMISSION_BITMASKS,
  ALL_PERMISSIONS,
  getDefaultPermissions,
  type PermissionAction,
  type HubRole,
} from "../permissions/config";

const CACHE_KEY_PREFIX = "iris:perms:v1";

function cacheKey(userId: string, hubId: string): string {
  return `${CACHE_KEY_PREFIX}:${userId}:${hubId}`;
}

function bitsToRecord(bits: number): Record<PermissionAction, boolean> {
  const record = getDefaultPermissions();
  for (const action of PERMISSION_ACTIONS) {
    const mask = PERMISSION_BITMASKS[action];
    record[action] = (bits & mask) === mask;
  }
  return record;
}

export const permissionService = {
  // ------------------------------------------------------------------ //
  //  Permission checks (3-layer cache: L1 → L2 Redis → L3 Iris)        //
  // ------------------------------------------------------------------ //

  async canPerform(userId: string, hubId: string, action: PermissionAction): Promise<boolean> {
    // 0. Hub Owner bypass
    try {
      const [hubRecord] = await db
        .select({ ownerId: hub.ownerId })
        .from(hub)
        .where(eq(hub.id, hubId))
        .limit(1);
      if (hubRecord && hubRecord.ownerId === userId) {
        return true;
      }
    } catch (err) {
      console.warn("[permissionService] Hub owner check failed:", err);
    }

    const mask = PERMISSION_BITMASKS[action];

    // 1. L1: in-memory lru-cache
    const l1Bits = permissionCache.get(userId, hubId);
    if (l1Bits !== undefined) {
      return !!(l1Bits & mask);
    }

    // 2. L2: Redis
    const key = cacheKey(userId, hubId);
    try {
      const l2Val = await redis.get(key);
      if (l2Val !== null) {
        const bits = parseInt(l2Val, 10);
        permissionCache.set(userId, hubId, bits);
        return !!(bits & mask);
      }
    } catch (err) {
      console.warn("[permissionService] Redis get failed:", err);
    }

    // 3. L3: Iris microservice → Postgres. Iris writes back to Redis.
    const bits = await irisClient.getEffectivePermissions(userId, hubId);
    permissionCache.set(userId, hubId, bits);
    return !!(bits & mask);
  },

  async assertCanPerform(userId: string, hubId: string, action: PermissionAction): Promise<void> {
    const ok = await this.canPerform(userId, hubId, action);
    if (!ok) {
      throw new ORPCError("FORBIDDEN", {
        message: `You do not have permission to perform ${action} in this hub.`,
      });
    }
  },

  // ------------------------------------------------------------------ //
  //  Full permission record (for UI hydration)                           //
  // ------------------------------------------------------------------ //

  async getPermissionsRecord(userId: string, hubId: string): Promise<Record<PermissionAction, boolean>> {
    // 0. Hub Owner bypass
    try {
      const [hubRecord] = await db
        .select({ ownerId: hub.ownerId })
        .from(hub)
        .where(eq(hub.id, hubId))
        .limit(1);
      if (hubRecord && hubRecord.ownerId === userId) {
        return this.getOwnerPermissions();
      }
    } catch (err) {
      console.warn("[permissionService] Hub owner check failed:", err);
    }

    // 1. L1
    const l1Bits = permissionCache.get(userId, hubId);
    if (l1Bits !== undefined) return bitsToRecord(l1Bits);

    // 2. L2
    const key = cacheKey(userId, hubId);
    try {
      const l2Val = await redis.get(key);
      if (l2Val !== null) {
        const bits = parseInt(l2Val, 10);
        permissionCache.set(userId, hubId, bits);
        return bitsToRecord(bits);
      }
    } catch (err) {
      console.warn("[permissionService] Redis get failed:", err);
    }

    // 3. L3
    const bits = await irisClient.getEffectivePermissions(userId, hubId);
    permissionCache.set(userId, hubId, bits);
    return bitsToRecord(bits);
  },

  /**
   * Returns the all-true permissions record for hub owners.
   */
  getOwnerPermissions(): Record<PermissionAction, boolean> {
    return { ...ALL_PERMISSIONS };
  },

  // ------------------------------------------------------------------ //
  //  Staff authorization                                                 //
  // ------------------------------------------------------------------ //

  async checkIsStaff(userId: string): Promise<boolean> {
    // Staff = user has ADMINISTRATOR bit. Call Iris without a hub context.
    const bits = await irisClient.getEffectivePermissions(userId);
    return !!(bits & PERMISSION_BITMASKS.ADMINISTRATOR);
  },

  // ------------------------------------------------------------------ //
  //  Cache invalidation (delegates to Iris)                              //
  // ------------------------------------------------------------------ //

  async invalidateRole(hubId: string, userId: string): Promise<void> {
    await irisClient.invalidateUserPermissions(hubId, userId);
  },

  async invalidateHub(hubId: string): Promise<void> {
    await irisClient.invalidateHubPermissions(hubId);
  },
};
