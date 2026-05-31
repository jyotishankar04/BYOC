"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import { toast } from "sonner";

// ─── API types ─────────────────────────────────────────────────────────────────

export interface ApiFolder {
  id: string;
  name: string;
  path: string;
  parentId: string | null;
  source: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiFile {
  id: string;
  workspaceId: string;
  folderId: string | null;
  name: string;
  extension: string | null;
  storagePath: string;
  thumbnailPath: string | null;
  size: number;
  mimeType: string | null;
  kind: "image" | "video" | "document" | "audio" | "archive" | "other";
  status: "uploading" | "uploaded" | "failed" | "deleted";
  source: string;
  durationSeconds: number | null;
  width: number | null;
  height: number | null;
  uploadedBy: { id: string; name: string; email: string; image: string | null };
  createdAt: string;
  updatedAt: string;
}

export interface FilesResponse {
  files: ApiFile[];
  folders: ApiFolder[];
  breadcrumbs: { id: string; name: string }[];
  total: number;
  page: number;
  limit: number;
}

export interface FilesQuery {
  folderId?: string;
  kind?: "image" | "video" | "document" | "audio" | "archive" | "other" | "media";
  includeNested?: boolean;
  search?: string;
  sortBy?: "name" | "size" | "createdAt" | "updatedAt";
  sortDir?: "asc" | "desc";
  page?: number;
  limit?: number;
}

// ─── Query keys ────────────────────────────────────────────────────────────────

export const fileKeys = {
  all: (workspaceId: string) =>
    ["workspaces", workspaceId, "files"] as const,
  list: (workspaceId: string, query: FilesQuery) =>
    ["workspaces", workspaceId, "files", query] as const,
  previewUrl: (workspaceId: string, fileId: string) =>
    ["workspaces", workspaceId, "files", fileId, "preview-url"] as const,
  batchPreviewUrls: (workspaceId: string, fileIds: string[]) =>
    ["workspaces", workspaceId, "files", "batch-preview-urls", [...fileIds].sort().join(",")] as const,
  thumbnailUrl: (workspaceId: string, fileId: string, size: string) =>
    ["workspaces", workspaceId, "files", fileId, "thumbnail", size] as const,
};

// ─── Hooks ─────────────────────────────────────────────────────────────────────

export function useFiles(
  workspaceId: string | undefined,
  query: FilesQuery = {},
) {
  return useQuery<FilesResponse>({
    queryKey: fileKeys.list(workspaceId ?? "", query),
    queryFn: async () => {
      const params = new URLSearchParams();
      if (query.folderId) params.set("folderId", query.folderId);
      if (query.kind) params.set("kind", query.kind);
      if (query.includeNested) params.set("includeNested", "true");
      if (query.search) params.set("search", query.search);
      if (query.sortBy) params.set("sortBy", query.sortBy);
      if (query.sortDir) params.set("sortDir", query.sortDir);
      if (query.page != null) params.set("page", String(query.page));
      if (query.limit != null) params.set("limit", String(query.limit));
      const qs = params.toString();
      const res = await api.get<FilesResponse>(
        `/api/v1/workspaces/${workspaceId}/files${qs ? `?${qs}` : ""}`,
      );
      return res.data;
    },
    enabled: !!workspaceId,
    staleTime: 30_000,
  });
}

export function useCreateFolder(workspaceId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      name,
      parentId,
    }: {
      name: string;
      parentId?: string | null;
    }) => {
      const body: Record<string, unknown> = { name };
      if (parentId) body.parentId = parentId;
      const res = await api.post(
        `/api/v1/workspaces/${workspaceId}/folders`,
        body,
      );
      return res.data as { folder: ApiFolder };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: fileKeys.all(workspaceId ?? "") });
      toast.success("Folder created");
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useDeleteFolder(workspaceId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (folderId: string) => {
      await api.delete(
        `/api/v1/workspaces/${workspaceId}/folders/${folderId}`,
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: fileKeys.all(workspaceId ?? "") });
      toast.success("Folder deleted");
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useRenameFolder(workspaceId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ folderId, name }: { folderId: string; name: string }) => {
      await api.patch(
        `/api/v1/workspaces/${workspaceId}/folders/${folderId}`,
        { name },
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: fileKeys.all(workspaceId ?? "") });
      toast.success("Folder renamed");
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useDeleteFile(workspaceId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (fileId: string) => {
      await api.delete(
        `/api/v1/workspaces/${workspaceId}/files/${fileId}`,
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: fileKeys.all(workspaceId ?? "") });
      toast.success("File deleted");
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useRenameFile(workspaceId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ fileId, name }: { fileId: string; name: string }) => {
      await api.patch(
        `/api/v1/workspaces/${workspaceId}/files/${fileId}/rename`,
        { name },
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: fileKeys.all(workspaceId ?? "") });
      toast.success("File renamed");
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useMoveFile(workspaceId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ fileId, folderId }: { fileId: string; folderId: string | null }) => {
      await api.patch(
        `/api/v1/workspaces/${workspaceId}/files/${fileId}/move`,
        { folderId },
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: fileKeys.all(workspaceId ?? "") });
      toast.success("File moved");
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useDownloadFile(workspaceId: string | undefined) {
  return useMutation({
    mutationFn: async (fileId: string) => {
      const res = await api.get<{ url: string }>(
        `/api/v1/workspaces/${workspaceId}/files/${fileId}/download-url`,
      );
      return res.data.url;
    },
    onSuccess: (url) => {
      window.open(url, "_blank", "noopener,noreferrer");
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function usePreviewUrls(
  workspaceId: string | undefined,
  fileIds: string[],
  enabled: boolean = true,
) {
  return useQuery<{ urls: Record<string, string>; expiresIn: number }>({
    queryKey: fileKeys.batchPreviewUrls(workspaceId ?? "", fileIds),
    queryFn: async () => {
      const res = await api.post<{ urls: Record<string, string>; expiresIn: number }>(
        `/api/v1/workspaces/${workspaceId}/files/preview-urls`,
        { fileIds },
      );
      return res.data;
    },
    enabled: !!workspaceId && fileIds.length > 0 && enabled,
    staleTime: (query) => {
      const expiresIn = (query.state.data as { expiresIn?: number } | null)?.expiresIn;
      return expiresIn ? expiresIn * 1000 * 0.85 : 0;
    },
    gcTime: 65 * 60 * 1000,
    retry: false,
  });
}

export function usePreviewUrl(
  workspaceId: string | undefined,
  fileId: string,
  mimeType: string | null | undefined,
  enabled: boolean = true,
) {
  return useQuery<{ url: string; expiresIn: number } | null>({
    queryKey: fileKeys.previewUrl(workspaceId ?? "", fileId),
    queryFn: async () => {
      const res = await api.get<{ url: string; expiresIn: number }>(
        `/api/v1/workspaces/${workspaceId}/files/${fileId}/preview-url`,
      );
      return res.data;
    },
    enabled: !!workspaceId && !!(mimeType?.startsWith("image/") || mimeType?.startsWith("video/") || mimeType === "application/pdf") && enabled,
    staleTime: (query) => {
      const expiresIn = (query.state.data as { expiresIn?: number } | null)?.expiresIn
      return expiresIn ? expiresIn * 1000 * 0.85 : 0
    },
    gcTime: 65 * 60 * 1000,
    retry: false,
  });
}

export function useThumbnailUrl(
  workspaceId: string | undefined,
  fileId: string,
  mimeType: string | null | undefined,
  size: "sm" | "md" | "lg" = "sm",
  enabled: boolean = true,
) {
  return useQuery<{ url: string | null; expiresIn: number } | null>({
    queryKey: fileKeys.thumbnailUrl(workspaceId ?? "", fileId, size),
    queryFn: async () => {
      const res = await api.get<{ url: string | null; expiresIn: number }>(
        `/api/v1/workspaces/${workspaceId}/files/${fileId}/thumbnail?size=${size}`,
      );
      return res.data;
    },
    enabled: !!workspaceId && !!mimeType?.startsWith("image/") && enabled,
    staleTime: (query) => {
      const expiresIn = (query.state.data as { expiresIn?: number } | null)?.expiresIn
      return expiresIn ? expiresIn * 1000 * 0.85 : 0
    },
    gcTime: 65 * 60 * 1000,
    retry: false,
  });
}
