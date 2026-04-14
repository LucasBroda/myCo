import Redis from "ioredis";
import { env } from "./env";

interface CacheEntry {
  data: unknown;
  expiresAt: number;
}

// Fallback in-memory cache if Redis is unavailable
const memoryCache = new Map<string, CacheEntry>();

function memGet<T>(key: string): T | null {
  const entry = memoryCache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    memoryCache.delete(key);
    return null;
  }
  return entry.data as T;
}

function memSet(key: string, value: unknown, ttlSeconds: number): void {
  memoryCache.set(key, {
    data: value,
    expiresAt: Date.now() + ttlSeconds * 1000,
  });
}

let redisClient: Redis | null = null;
let useRedis = false;

function getRedis(): Redis {
  if (!redisClient) {
    redisClient = new Redis(env.redisUrl, {
      lazyConnect: true,
      maxRetriesPerRequest: 1,
    });
    redisClient.on("error", () => {
      useRedis = false;
    });
    redisClient.on("connect", () => {
      useRedis = true;
    });
    redisClient.connect().catch(() => {
      useRedis = false;
    });
  }
  return redisClient;
}

export const cache = {
  async get<T>(key: string): Promise<T | null> {
    if (useRedis) {
      try {
        const raw = await getRedis().get(key);
        return raw ? (JSON.parse(raw) as T) : null;
      } catch {
        return memGet<T>(key);
      }
    }
    return memGet<T>(key);
  },

  async set(key: string, value: unknown, ttlSeconds: number): Promise<void> {
    if (useRedis) {
      try {
        await getRedis().setex(key, ttlSeconds, JSON.stringify(value));
        return;
      } catch {
        // fall through to memory cache
      }
    }
    memSet(key, value, ttlSeconds);
  },

  async del(key: string): Promise<void> {
    memoryCache.delete(key);
    if (useRedis) {
      try {
        await getRedis().del(key);
      } catch {
        // ignore
      }
    }
  },
};
