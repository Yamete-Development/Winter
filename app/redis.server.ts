import Redis from "ioredis";

let redis: Redis;

declare global {
  var __redis: Redis | undefined;
}

// this is needed because in development we don't want to restart
// the server with every change, but we want to make sure we don't
// create a new connection to the Redis with every change either.
if (process.env.NODE_ENV === "production") {
  redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379");
} else {
  if (!global.__redis) {
    global.__redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379");
  }
  redis = global.__redis;
}

export { redis };
