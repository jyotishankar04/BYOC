import cron from "node-cron";
import { runProviderHealthChecks } from "./provider-health.job";
import { runBucketDiff } from "./bucket-diff.job";
import { startEmailWorker } from "@/core/mail/mail.worker";
import logger from "@/core/logger";
import redisClient from "@/config/redis.config";
import prisma from "@/config/db.config";

async function withLock(key: string, ttlSeconds: number, fn: () => Promise<void>): Promise<void> {
  const lockKey = `cron:lock:${key}`;
  const acquired = await redisClient.set(lockKey, "1", "EX", ttlSeconds, "NX");
  if (!acquired) return;
  try {
    await fn();
  } finally {
    await redisClient.del(lockKey);
  }
}

async function cleanupExpiredUploadSessions(): Promise<void> {
  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const { count } = await prisma.uploadSession.deleteMany({
    where: { status: { not: "completed" }, createdAt: { lt: cutoff } },
  });
  if (count > 0) logger.info({ count }, "Cron: cleaned up expired upload sessions");
}

async function cleanupExpiredShareLinks(): Promise<void> {
  const { count } = await prisma.shareLink.updateMany({
    where: { status: "Active", expiresAt: { lt: new Date() } },
    data: { status: "Expired" },
  });
  if (count > 0) logger.info({ count }, "Cron: marked share links as expired");
}

async function pruneActivityLogs(): Promise<void> {
  const cutoff = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
  const { count } = await prisma.activityLog.deleteMany({
    where: { createdAt: { lt: cutoff } },
  });
  if (count > 0) logger.info({ count }, "Cron: pruned old activity logs");
}

export function startCronJobs(): void {
  startEmailWorker();

  // Provider health check — every 6 hours
  cron.schedule("0 */6 * * *", () => {
    withLock("provider-health", 6 * 3600, () => runProviderHealthChecks()).catch((err) =>
      logger.error({ err }, "Cron: provider health check failed"),
    );
  });

  // Bucket diff — daily at 02:00 UTC
  cron.schedule("0 2 * * *", () => {
    withLock("bucket-diff", 23 * 3600, () => runBucketDiff()).catch((err) =>
      logger.error({ err }, "Cron: bucket diff failed"),
    );
  });

  // Clean up stale upload sessions — every hour
  cron.schedule("0 * * * *", () => {
    withLock("upload-session-cleanup", 3500, cleanupExpiredUploadSessions).catch((err) =>
      logger.error({ err }, "Cron: upload session cleanup failed"),
    );
  });

  // Mark expired share links — every 15 minutes
  cron.schedule("*/15 * * * *", () => {
    withLock("share-link-expiry", 14 * 60, cleanupExpiredShareLinks).catch((err) =>
      logger.error({ err }, "Cron: share link expiry check failed"),
    );
  });

  // Prune activity logs older than 90 days — daily at 03:00 UTC
  cron.schedule("0 3 * * *", () => {
    withLock("activity-log-prune", 23 * 3600, pruneActivityLogs).catch((err) =>
      logger.error({ err }, "Cron: activity log pruning failed"),
    );
  });

  logger.info("Cron jobs registered: provider health (*/6h), bucket diff (02:00), upload cleanup (hourly), share link expiry (*/15m), activity log prune (03:00)");
}
