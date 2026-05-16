import type { IHealthService } from "./health.interface";
import prisma from "@/config/db.config";
import redisClient from "@/config/redis.config";

export class HealthService implements IHealthService {
  check(): {
    success: boolean;
    timestamp: string;
    uptime: number;
    environment: string;
  } {
    return {
      success: true,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || "development",
    };
  }

  async ready(): Promise<{ success: boolean; checks: { database: boolean; redis: boolean } }> {
    const [dbOk, redisOk] = await Promise.all([
      prisma.$queryRaw`SELECT 1`.then(() => true).catch(() => false),
      redisClient.ping().then(() => true).catch(() => false),
    ]);
    return {
      success: dbOk && redisOk,
      checks: { database: dbOk as boolean, redis: redisOk as boolean },
    };
  }
}
