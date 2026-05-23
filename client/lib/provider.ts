"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import { toast } from "sonner";
import type { SyncStatus, Workspace } from "@/lib/workspace-context";

export type ProviderType = "S3" | "R2" | "MinIO" | "Supabase" | "Other";

export interface ConnectProviderInput {
  providerType: ProviderType;
  bucket: string;
  region?: string;
  accessKeyId: string;
  secretAccessKey: string;
  endpointUrl?: string;
}

export interface UpdateProviderInput {
  providerType?: ProviderType;
  bucket?: string;
  region?: string;
  accessKeyId?: string;
  secretAccessKey?: string;
  endpointUrl?: string;
}

export interface SyncStatusData {
  syncStatus: SyncStatus;
  syncTotalObjects: number;
  syncCompletedObjects: number;
  lastSyncedAt: string | null;
}

const ACTIVE_STATUSES: SyncStatus[] = ["pending", "syncing"];

export function useSyncStatus(workspaceId: string) {
  return useQuery<SyncStatusData>({
    queryKey: ["sync-status", workspaceId],
    queryFn: async () => {
      const res = await api.get(
        `/api/v1/workspaces/${workspaceId}/provider/sync/status`,
      );
      return res.data;
    },
    refetchInterval: (query) => {
      const status = query.state.data?.syncStatus;
      return status && ACTIVE_STATUSES.includes(status) ? 2000 : false;
    },
    staleTime: 0,
  });
}

export function useTriggerSync(workspaceId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await api.post(`/api/v1/workspaces/${workspaceId}/provider/sync`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["sync-status", workspaceId] });
      toast.success("Sync started");
    },
    onError: (err: unknown) => {
      const msg =
        (err as { response?: { data?: { error?: { message?: string } } } })
          ?.response?.data?.error?.message ?? "Failed to start sync";
      toast.error(msg);
    },
  });
}

function apiErrorMsg(err: unknown, fallback: string): string {
  return (
    (err as { response?: { data?: { error?: { message?: string } } } })
      ?.response?.data?.error?.message ?? fallback
  );
}

export function useConnectProvider(workspaceId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (input: ConnectProviderInput) => {
      const res = await api.post(
        `/api/v1/workspaces/${workspaceId}/provider`,
        input,
      );
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["workspaces"] });
      toast.success("Provider connected");
    },
    onError: (err: unknown) => {
      toast.error(apiErrorMsg(err, "Failed to connect provider"));
    },
  });
}

export function useUpdateProvider(workspaceId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (input: UpdateProviderInput) => {
      const res = await api.patch(
        `/api/v1/workspaces/${workspaceId}/provider`,
        input,
      );
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["workspaces"] });
      toast.success("Provider updated");
    },
    onError: (err: unknown) => {
      toast.error(apiErrorMsg(err, "Failed to update provider"));
    },
  });
}

export function useDisconnectProvider(workspaceId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await api.delete(`/api/v1/workspaces/${workspaceId}/provider`);
    },
    onSuccess: () => {
      // Immediately clear storage so the disconnect button vanishes before the refetch
      qc.setQueryData<Workspace[]>(["workspaces"], (prev = []) =>
        prev.map((w) => (w.id === workspaceId ? { ...w, storage: null } : w)),
      );
      void qc.invalidateQueries({ queryKey: ["workspaces"] });
      toast.success("Provider disconnected");
    },
    onError: (err: unknown) => {
      toast.error(apiErrorMsg(err, "Failed to disconnect provider"));
    },
  });
}
