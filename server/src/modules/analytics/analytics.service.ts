import type { PrismaClient } from "@/generated/prisma/client";
import redis from "@/config/redis.config";
import { AnalyticsRepository, type DashboardData, type AnalyticsData } from "./analytics.repository";
import { SubscriptionSnapshotService } from "@/modules/billing/subscription-snapshot.service";
import { assertFeatureAccess } from "@/modules/billing/subscription-access";

export class AnalyticsService {
  private repo: AnalyticsRepository;

  constructor(private prisma: PrismaClient) {
    this.repo = new AnalyticsRepository(prisma);
  }

  async getDashboard(workspaceId: string): Promise<DashboardData> {
    const cacheKey = `ws:${workspaceId}:dashboard`;
    const cached = await redis.get(cacheKey);
    if (cached) return JSON.parse(cached) as DashboardData;

    const [
      fileStats,
      activeShareLinks,
      uploadsThisWeek,
      storageByKind,
      recentFiles,
      recentActivity,
      providerStatus,
    ] = await Promise.all([
      this.repo.getFileStats(workspaceId),
      this.repo.getActiveShareLinks(workspaceId),
      this.repo.getUploadsThisWeek(workspaceId),
      this.repo.getStorageByKind(workspaceId),
      this.repo.getRecentFiles(workspaceId),
      this.repo.getRecentActivity(workspaceId, 10),
      this.repo.getProviderStatus(workspaceId),
    ]);

    const data: DashboardData = {
      ...fileStats,
      activeShareLinks,
      uploadsThisWeek,
      storageByKind,
      recentFiles,
      recentActivity,
      providerStatus,
    };

    await redis.setex(cacheKey, 120, JSON.stringify(data));
    return data;
  }

  async getAnalytics(workspaceId: string, days: number): Promise<AnalyticsData> {
    const snapshot = await new SubscriptionSnapshotService(
      this.prisma,
    ).getWorkspaceSnapshot(workspaceId);
    assertFeatureAccess(
      snapshot.plan,
      "advancedAnalytics",
      "Upgrade to Pro to access advanced analytics",
      "ADVANCED_ANALYTICS_LOCKED",
    );

    const [storageTrend, storageByKind, uploadDownloadActivity, topSharedLinks, recentActivity] =
      await Promise.all([
        this.repo.getStorageTrend(workspaceId, days),
        this.repo.getStorageByKind(workspaceId),
        this.repo.getUploadDownloadActivity(workspaceId, days),
        this.repo.getTopSharedLinks(workspaceId),
        this.repo.getRecentActivity(workspaceId, 20),
      ]);

    return {
      storageTrend,
      storageByKind,
      uploadDownloadActivity,
      topSharedLinks,
      recentActivity,
    };
  }
}
