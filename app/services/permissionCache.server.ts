import { LRUCache } from "lru-cache";
import { redis } from "../redis.server";

const TTL_MS = 300_000; // 5 minutes

const l1Cache = new LRUCache<string, number>({
  max: 20000,
  ttl: TTL_MS,
});

const PUBSUB_CHANNEL = "sync:hub_permissions";

const CACHE_KEY_PREFIX = "iris:perms:v1";

let pubsubStarted = false;

function startPubSubListener(): void {
  if (pubsubStarted) return;
  pubsubStarted = true;

  const subscriber = redis.duplicate();
  subscriber.subscribe(PUBSUB_CHANNEL, (err) => {
    if (err) {
      console.error("[permissionCache] Failed to subscribe to invalidation channel:", err);
    }
  });

  subscriber.on("message", (channel, raw) => {
    if (channel !== PUBSUB_CHANNEL) return;
    try {
      const data = JSON.parse(raw) as { hub_id?: string; user_id?: string };
      const { hub_id: hubId, user_id: userId } = data;

      if (hubId && userId) {
        l1Cache.delete(`${CACHE_KEY_PREFIX}:${userId}:${hubId}`);
      } else if (hubId) {
        for (const key of l1Cache.keys()) {
          if (key.endsWith(`:${hubId}`)) {
            l1Cache.delete(key);
          }
        }
      }
    } catch (err) {
      console.error("[permissionCache] Failed to parse invalidation message:", err);
    }
  });
}

export const permissionCache = {
  get(userId: string, hubId: string): number | undefined {
    startPubSubListener();
    return l1Cache.get(`${CACHE_KEY_PREFIX}:${userId}:${hubId}`);
  },

  set(userId: string, hubId: string, bits: number): void {
    startPubSubListener();
    l1Cache.set(`${CACHE_KEY_PREFIX}:${userId}:${hubId}`, bits);
  },

  delete(userId: string, hubId: string): void {
    l1Cache.delete(`${CACHE_KEY_PREFIX}:${userId}:${hubId}`);
  },

  invalidateHub(hubId: string): void {
    for (const key of l1Cache.keys()) {
      if (key.endsWith(`:${hubId}`)) {
        l1Cache.delete(key);
      }
    }
  },
};
