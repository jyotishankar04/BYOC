import cron from "node-cron";
import { runProviderHealthChecks } from "./provider-health.job";
import { runBucketDiff } from "./bucket-diff.job";
import { startEmailWorker } from "@/core/mail/mail.worker";
import logger from "@/core/logger";

export function startCronJobs(): void {
  startEmailWorker();
  // Provider health check — every 6 hours
  cron.schedule("0 */6 * * *", () => {
    runProviderHealthChecks().catch((err) =>
      logger.error({ err }, "Cron: provider health check failed"),
    );
  });

  // Bucket diff — daily at 02:00 UTC
  cron.schedule("0 2 * * *", () => {
    runBucketDiff().catch((err) =>
      logger.error({ err }, "Cron: bucket diff failed"),
    );
  });

  logger.info("Cron jobs registered: provider health check (*/6h), bucket diff (daily 02:00 UTC)");
}
