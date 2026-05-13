"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import api from "@/lib/axios";
import { toast } from "sonner";
import type {
  Workspace,
  WorkspacePermissions,
  WorkspaceSecurity,
} from "@/lib/workspace-context";

// ─── Query key (must match workspace-context.tsx) ─────────────────────────────

const WORKSPACES_KEY = ["workspaces"] as const;

// ─── Cache helpers ─────────────────────────────────────────────────────────────

function patchCache(
  qc: ReturnType<typeof useQueryClient>,
  workspaceId: string,
  patch: Partial<Workspace>,
) {
  qc.setQueryData<Workspace[]>(WORKSPACES_KEY, (prev = []) =>
    prev.map((w) => (w.id === workspaceId ? { ...w, ...patch } : w)),
  );
}

// ─── Hooks ─────────────────────────────────────────────────────────────────────

export function useUpdateWorkspace(workspaceId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { name?: string; slug?: string }) =>
      api.patch<{ workspace: Workspace }>(
        `/api/v1/workspaces/${workspaceId}`,
        data,
      ),
    onSuccess: ({ data }) => {
      patchCache(qc, workspaceId, {
        name: data.workspace.name,
        slug: data.workspace.slug,
      });
      toast.success("Workspace updated");
    },
    onError: (err: Error & { code?: string }) => {
      toast.error(err.message ?? "Failed to update workspace");
    },
  });
}

export function useUpdatePermissions(workspaceId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<WorkspacePermissions>) =>
      api.patch<{ permissions: WorkspacePermissions }>(
        `/api/v1/workspaces/${workspaceId}/permissions`,
        data,
      ),
    onSuccess: ({ data }) => {
      patchCache(qc, workspaceId, { permissions: data.permissions });
      toast.success("Permissions saved");
    },
    onError: (err: Error & { code?: string }) => {
      toast.error(err.message ?? "Failed to save permissions");
    },
  });
}

export function useUpdateSecurity(workspaceId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<WorkspaceSecurity>) =>
      api.patch<{ security: WorkspaceSecurity }>(
        `/api/v1/workspaces/${workspaceId}/security`,
        data,
      ),
    onSuccess: ({ data }) => {
      patchCache(qc, workspaceId, { security: data.security });
    },
    onError: (err: Error & { code?: string }) => {
      toast.error(err.message ?? "Failed to update security settings");
    },
  });
}

export function useDeleteWorkspace(workspaceId: string) {
  const qc = useQueryClient();
  const router = useRouter();
  return useMutation({
    mutationFn: () => api.delete(`/api/v1/workspaces/${workspaceId}`),
    onSuccess: () => {
      qc.setQueryData<Workspace[]>(WORKSPACES_KEY, (prev = []) =>
        prev.filter((w) => w.id !== workspaceId),
      );
      toast.success("Workspace deleted");
      router.push("/app");
    },
    onError: (err: Error & { code?: string }) => {
      toast.error(err.message ?? "Failed to delete workspace");
    },
  });
}

export function useTransferOwnership(workspaceId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (newOwnerId: string) =>
      api.post(`/api/v1/workspaces/${workspaceId}/transfer`, { newOwnerId }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: WORKSPACES_KEY });
      toast.success("Ownership transferred");
    },
    onError: (err: Error & { code?: string }) => {
      toast.error(err.message ?? "Failed to transfer ownership");
    },
  });
}
