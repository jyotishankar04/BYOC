"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import { toast } from "sonner";

export type ShareAccessType = "Public" | "PasswordProtected" | "Private";
export type ShareLinkStatus = "Active" | "Expired" | "Revoked" | "Disabled";

export interface ShareLinkResponse {
  id: string;
  slug: string;
  workspaceId: string;
  fileId: string | null;
  folderId: string | null;
  userId: string;
  accessType: ShareAccessType;
  status: ShareLinkStatus;
  allowDownload: boolean;
  visits: number;
  expiresAt: string | null;
  createdAt: string;
  shareUrl: string;
  file?: {
    id: string;
    name: string;
    size: number;
    mimeType: string | null;
  } | null;
  folder?: {
    id: string;
    name: string;
    path: string;
  } | null;
  visitRecords?: {
    id: string;
    ipAddress: string | null;
    userAgent: string | null;
    visitedAt: string;
  }[];
}

export interface ShareLinkListResult {
  links: ShareLinkResponse[];
  total: number;
  stats: {
    status: ShareLinkStatus;
    accessType: ShareAccessType;
    _count: number;
  }[];
}

export interface CreateShareLinkData {
  fileId?: string;
  folderId?: string;
  accessType?: ShareAccessType;
  password?: string;
  expiresAt?: string | null;
  allowDownload?: boolean;
}

export interface UpdateShareLinkData {
  accessType?: ShareAccessType;
  password?: string;
  expiresAt?: string | null;
  allowDownload?: boolean;
  status?: ShareLinkStatus;
}

export interface ListShareLinksQuery {
  status?: ShareLinkStatus;
  accessType?: ShareAccessType;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: "createdAt" | "visits" | "expiresAt";
  sortOrder?: "asc" | "desc";
}

export const shareLinkKeys = {
  all: (workspaceId: string) => ["workspaces", workspaceId, "share-links"] as const,
  detail: (workspaceId: string, id: string) => ["workspaces", workspaceId, "share-links", id] as const,
};

export function useCreateShareLink(workspaceId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateShareLinkData) => {
      const res = await api.post<ShareLinkResponse>(
        `/api/v1/workspaces/${workspaceId}/share-links`,
        data,
      );
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: shareLinkKeys.all(workspaceId ?? "") });
      toast.success("Share link created");
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useListShareLinks(workspaceId: string | undefined, query?: ListShareLinksQuery) {
  return useQuery({
    queryKey: [...shareLinkKeys.all(workspaceId ?? ""), query],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (query?.status) params.set("status", query.status);
      if (query?.accessType) params.set("accessType", query.accessType);
      if (query?.search) params.set("search", query.search);
      if (query?.page) params.set("page", String(query.page));
      if (query?.limit) params.set("limit", String(query.limit));
      if (query?.sortBy) params.set("sortBy", query.sortBy);
      if (query?.sortOrder) params.set("sortOrder", query.sortOrder);

      const res = await api.get<ShareLinkListResult>(
        `/api/v1/workspaces/${workspaceId}/share-links?${params.toString()}`,
      );
      return res.data;
    },
    enabled: !!workspaceId,
  });
}

export function useGetShareLink(workspaceId: string | undefined, linkId: string | undefined) {
  return useQuery({
    queryKey: shareLinkKeys.detail(workspaceId ?? "", linkId ?? ""),
    queryFn: async () => {
      const res = await api.get<ShareLinkResponse>(
        `/api/v1/workspaces/${workspaceId}/share-links/${linkId}`,
      );
      return res.data;
    },
    enabled: !!workspaceId && !!linkId,
  });
}

export function useUpdateShareLink(workspaceId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ linkId, data }: { linkId: string; data: UpdateShareLinkData }) => {
      const res = await api.patch<ShareLinkResponse>(
        `/api/v1/workspaces/${workspaceId}/share-links/${linkId}`,
        data,
      );
      return res.data;
    },
    onSuccess: (_, { linkId }) => {
      qc.invalidateQueries({ queryKey: shareLinkKeys.all(workspaceId ?? "") });
      qc.invalidateQueries({ queryKey: shareLinkKeys.detail(workspaceId ?? "", linkId) });
      toast.success("Share link updated");
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useDeleteShareLink(workspaceId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (linkId: string) => {
      await api.delete(`/api/v1/workspaces/${workspaceId}/share-links/${linkId}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: shareLinkKeys.all(workspaceId ?? "") });
      toast.success("Share link deleted");
    },
    onError: (err: Error) => toast.error(err.message),
  });
}
