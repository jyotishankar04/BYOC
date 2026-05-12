import type { PrismaClient, FileKind } from "@/generated/prisma/client";

export interface DashboardData {
  totalFiles: number;
  totalSize: number;
  activeShareLinks: number;
  uploadsThisWeek: number;
  storageByKind: { kind: FileKind; size: number; count: number }[];
  recentFiles: {
    id: string;
    name: string;
    size: number;
    kind: FileKind;
    mimeType: string | null;
    createdAt: Date;
    uploadedBy: { id: string; name: string; image: string | null };
  }[];
  recentActivity: {
    id: string;
    action: string;
    details: string | null;
    createdAt: Date;
    user: { id: string; name: string; image: string | null };
  }[];
  providerStatus: { status: string; lastChecked: Date | null } | null;
}

export interface AnalyticsData {
  storageTrend: { date: string; size: number; files: number }[];
  storageByKind: { kind: FileKind; size: number; count: number }[];
  uploadDownloadActivity: { date: string; action: string; count: number }[];
  topSharedLinks: {
    id: string;
    slug: string;
    fileName: string;
    visits: number;
  }[];
  recentActivity: {
    id: string;
    action: string;
    details: string | null;
    createdAt: Date;
    user: { id: string; name: string; image: string | null };
  }[];
}

export class AnalyticsRepository {
  constructor(private prisma: PrismaClient) {}

  async getFileStats(workspaceId: string) {
    const [countResult, sizeResult] = await Promise.all([
      this.prisma.file.count({
        where: { workspaceId, status: "uploaded" },
      }),
      this.prisma.file.aggregate({
        where: { workspaceId, status: "uploaded" },
        _sum: { size: true },
      }),
    ]);
    return {
      totalFiles: countResult,
      totalSize: sizeResult._sum.size ?? 0,
    };
  }

  async getActiveShareLinks(workspaceId: string) {
    return this.prisma.shareLink.count({
      where: { workspaceId, status: "Active" },
    });
  }

  async getUploadsThisWeek(workspaceId: string) {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return this.prisma.file.count({
      where: {
        workspaceId,
        status: "uploaded",
        createdAt: { gte: weekAgo },
      },
    });
  }

  async getStorageByKind(workspaceId: string) {
    const result = await this.prisma.file.groupBy({
      by: ["kind"],
      where: { workspaceId, status: "uploaded" },
      _sum: { size: true },
      _count: { id: true },
    });
    return result.map((r) => ({
      kind: r.kind,
      size: r._sum.size ?? 0,
      count: r._count.id,
    }));
  }

  async getRecentFiles(workspaceId: string) {
    return this.prisma.file.findMany({
      where: { workspaceId, status: "uploaded" },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        name: true,
        size: true,
        kind: true,
        mimeType: true,
        createdAt: true,
        uploadedBy: {
          select: { id: true, name: true, image: true },
        },
      },
    });
  }

  async getRecentActivity(workspaceId: string, take: number) {
    return this.prisma.activityLog.findMany({
      where: { workspaceId },
      orderBy: { createdAt: "desc" },
      take,
      select: {
        id: true,
        action: true,
        details: true,
        createdAt: true,
        user: {
          select: { id: true, name: true, image: true },
        },
      },
    });
  }

  async getProviderStatus(workspaceId: string) {
    return this.prisma.storageProvider.findUnique({
      where: { workspaceId },
      select: { status: true, lastChecked: true },
    });
  }

  async getStorageTrend(workspaceId: string, days: number) {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const files = await this.prisma.file.findMany({
      where: {
        workspaceId,
        status: "uploaded",
        createdAt: { gte: since },
      },
      select: { size: true, createdAt: true },
    });

    const dailyMap = new Map<string, { size: number; files: number }>();
    for (let i = 0; i < days; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      dailyMap.set(key, { size: 0, files: 0 });
    }

    for (const f of files) {
      const key = f.createdAt.toISOString().slice(0, 10);
      const entry = dailyMap.get(key);
      if (entry) {
        entry.size += f.size;
        entry.files += 1;
      }
    }

    return Array.from(dailyMap.entries())
      .map(([date, data]) => ({ date, ...data }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  async getUploadDownloadActivity(workspaceId: string, days: number) {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const logs = await this.prisma.activityLog.findMany({
      where: {
        workspaceId,
        createdAt: { gte: since },
        action: { in: ["FILE_UPLOAD", "FILE_DOWNLOAD"] },
      },
      select: { action: true, createdAt: true },
    });

    const grouped = new Map<string, Map<string, number>>();
    for (const log of logs) {
      const date = log.createdAt.toISOString().slice(0, 10);
      if (!grouped.has(date)) grouped.set(date, new Map());
      const actionMap = grouped.get(date)!;
      actionMap.set(log.action, (actionMap.get(log.action) ?? 0) + 1);
    }

    const result: { date: string; action: string; count: number }[] = [];
    for (const [date, actions] of grouped) {
      for (const [action, count] of actions) {
        result.push({ date, action, count });
      }
    }
    return result.sort((a, b) => a.date.localeCompare(b.date));
  }

  async getTopSharedLinks(workspaceId: string) {
    const links = await this.prisma.shareLink.findMany({
      where: { workspaceId, status: "Active" },
      orderBy: { visits: "desc" },
      take: 10,
      select: {
        id: true,
        slug: true,
        visits: true,
        file: { select: { name: true } },
      },
    });

    return links
      .filter((l) => l.file)
      .map((l) => ({
        id: l.id,
        slug: l.slug,
        fileName: l.file!.name,
        visits: l.visits,
      }));
  }
}