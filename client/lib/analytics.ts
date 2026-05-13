"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";

export type FileKind = "image" | "video" | "document" | "audio" | "archive" | "other";

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
    createdAt: string;
    uploadedBy: { id: string; name: string; image: string | null };
  }[];
  recentActivity: {
    id: string;
    action: string;
    details: string | null;
    createdAt: string;
    user: { id: string; name: string; image: string | null };
  }[];
  providerStatus: { status: string; lastChecked: string | null } | null;
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
    createdAt: string;
    user: { id: string; name: string; image: string | null };
  }[];
}

export const analyticsKeys = {
  dashboard: (workspaceId: string) => ["workspaces", workspaceId, "dashboard"] as const,
  analytics: (workspaceId: string, days: number) => ["workspaces", workspaceId, "analytics", days] as const,
};

export function useDashboard(workspaceId: string | undefined) {
  return useQuery<DashboardData>({
    queryKey: analyticsKeys.dashboard(workspaceId ?? ""),
    queryFn: async () => {
      const res = await api.get<DashboardData>(
        `/api/v1/workspaces/${workspaceId}/dashboard`,
      );
      return res.data;
    },
    enabled: !!workspaceId,
    staleTime: 60_000,
  });
}

export function useAnalytics(workspaceId: string | undefined, days: number = 30) {
  return useQuery<AnalyticsData>({
    queryKey: analyticsKeys.analytics(workspaceId ?? "", days),
    queryFn: async () => {
      const res = await api.get<AnalyticsData>(
        `/api/v1/workspaces/${workspaceId}/analytics?days=${days}`,
      );
      return res.data;
    },
    enabled: !!workspaceId,
  });
}
