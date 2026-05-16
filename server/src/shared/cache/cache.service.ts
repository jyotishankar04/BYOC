import type { RedisClientType } from "redis";
import logger from "@/core/logger";
import cacheClient from "@/config/cache.config";

export class CacheService {
  constructor(private client: RedisClientType) {}

  async get<T>(key: string): Promise<T | null> {
    try {
      const raw = await this.client.get(key);
      if (!raw) return null;
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  }

  async set(key: string, value: unknown, ttlSeconds: number): Promise<void> {
    try {
      await this.client.set(key, JSON.stringify(value), { EX: ttlSeconds });
    } catch (err) {
      logger.warn({ err, key }, "Cache set failed");
    }
  }

  async del(...keys: string[]): Promise<void> {
    if (keys.length === 0) return;
    try {
      await this.client.del(keys);
    } catch (err) {
      logger.warn({ err, keys }, "Cache del failed");
    }
  }

  async delPattern(pattern: string): Promise<void> {
    try {
      let cursor = "0";
      const toDelete: string[] = [];
      do {
        const result = await (this.client as unknown as { scan: (cursor: string, opts: { MATCH: string; COUNT: number }) => Promise<{ cursor: string; keys: string[] }> }).scan(cursor, { MATCH: pattern, COUNT: 100 });
        cursor = result.cursor;
        toDelete.push(...result.keys);
      } while (cursor !== "0");
      if (toDelete.length > 0) {
        await this.client.del(toDelete);
      }
    } catch (err) {
      logger.warn({ err, pattern }, "Cache delPattern failed");
    }
  }

  async wrap<T>(key: string, ttlSeconds: number, fn: () => Promise<T>): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== null) {
      logger.debug({ key }, "Cache hit");
      return cached;
    }
    const value = await fn();
    void this.set(key, value, ttlSeconds);
    return value;
  }
}

export const cache = new CacheService(cacheClient as unknown as RedisClientType);
