"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import { toast } from "sonner";

// ─── Types ─────────────────────────────────────────────────────────────────────

export type MemberRole = "Owner" | "Admin" | "Member" | "Viewer";

export interface Member {
  id: string;
  workspaceId: string;
  userId: string;
  role: MemberRole;
  joinedAt: string;
  invitedById: string | null;
  user: { id: string; name: string; email: string; image: string | null };
}

export interface Invite extends Member {
  invitedBy: { id: string; name: string; email: string } | null;
}

// ─── Query keys ────────────────────────────────────────────────────────────────

export const memberKeys = {
  list: (workspaceId: string) =>
    ["workspaces", workspaceId, "members"] as const,
  invites: (workspaceId: string) =>
    ["workspaces", workspaceId, "members", "invites"] as const,
};

// ─── API functions ─────────────────────────────────────────────────────────────

async function fetchMembers(workspaceId: string): Promise<Member[]> {
  const res = await api.get<{ members: Member[] }>(
    `/api/v1/workspaces/${workspaceId}/members`,
  );
  return res.data.members;
}

async function fetchInvites(workspaceId: string): Promise<Invite[]> {
  const res = await api.get<{ invites: Invite[] }>(
    `/api/v1/workspaces/${workspaceId}/members/invites`,
  );
  return res.data.invites;
}

// ─── Hooks ─────────────────────────────────────────────────────────────────────

export function useMembers(workspaceId: string) {
  return useQuery({
    queryKey: memberKeys.list(workspaceId),
    queryFn: () => fetchMembers(workspaceId),
    enabled: !!workspaceId,
  });
}

export function useInvites(workspaceId: string, enabled = true) {
  return useQuery({
    queryKey: memberKeys.invites(workspaceId),
    queryFn: () => fetchInvites(workspaceId),
    enabled: !!workspaceId && enabled,
  });
}

export function useInviteByEmail(workspaceId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (email: string) =>
      api.post(`/api/v1/workspaces/${workspaceId}/members/invite-by-email`, {
        email,
      }),
    onSuccess: () => {
      toast.success("Invite sent");
      void qc.invalidateQueries({ queryKey: memberKeys.invites(workspaceId) });
    },
    onError: (err: Error & { code?: string }) => {
      toast.error(err.message ?? "Failed to send invite");
    },
  });
}

export function useChangeRole(workspaceId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: MemberRole }) =>
      api.put(`/api/v1/workspaces/${workspaceId}/members/${userId}/role`, {
        role,
      }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: memberKeys.list(workspaceId) });
    },
    onError: (err: Error & { code?: string }) => {
      toast.error(err.message ?? "Failed to update role");
    },
  });
}

export function useRemoveMember(workspaceId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) =>
      api.delete(`/api/v1/workspaces/${workspaceId}/members/${userId}`),
    onSuccess: () => {
      toast.success("Member removed");
      void qc.invalidateQueries({ queryKey: memberKeys.list(workspaceId) });
    },
    onError: (err: Error & { code?: string }) => {
      toast.error(err.message ?? "Failed to remove member");
    },
  });
}

export function useRevokeInvite(workspaceId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) =>
      api.post(
        `/api/v1/workspaces/${workspaceId}/members/invites/${userId}/reject`,
      ),
    onSuccess: () => {
      toast.success("Invite revoked");
      void qc.invalidateQueries({ queryKey: memberKeys.invites(workspaceId) });
    },
    onError: (err: Error & { code?: string }) => {
      toast.error(err.message ?? "Failed to revoke invite");
    },
  });
}

// ─── Invite details (for invitee — no active membership required) ─────────────

export interface MyInvite {
  id: string;
  workspaceId: string;
  userId: string;
  role: MemberRole;
  joinedAt: string;
  workspace: { id: string; name: string; color: string };
  invitedBy: { id: string; name: string; email: string } | null;
}

async function fetchMyInvite(workspaceId: string): Promise<MyInvite> {
  const res = await api.get<{ invite: MyInvite }>(
    `/api/v1/workspaces/${workspaceId}/members/invites/me`,
  );
  return res.data.invite;
}

export function useMyInvite(workspaceId: string) {
  return useQuery({
    queryKey: ["workspaces", workspaceId, "my-invite"] as const,
    queryFn: () => fetchMyInvite(workspaceId),
    enabled: !!workspaceId,
    retry: false,
  });
}

export function useAcceptInvite(workspaceId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) =>
      api.post(
        `/api/v1/workspaces/${workspaceId}/members/invites/${userId}/accept`,
      ),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["workspaces"] });
    },
  });
}

export function useDeclineInvite(workspaceId: string) {
  return useMutation({
    mutationFn: (userId: string) =>
      api.post(
        `/api/v1/workspaces/${workspaceId}/members/invites/${userId}/reject`,
      ),
  });
}

// ─── All pending invites for the current user (cross-workspace) ───────────────

async function fetchMyInvites(): Promise<MyInvite[]> {
  const res = await api.get<{ invites: MyInvite[] }>("/api/v1/users/me/invites");
  return res.data.invites;
}

export function useMyInvites() {
  return useQuery({
    queryKey: ["my-invites"] as const,
    queryFn: fetchMyInvites,
    staleTime: 30 * 1000,
  });
}

export function useAcceptInviteFromList(workspaceId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) =>
      api.post(
        `/api/v1/workspaces/${workspaceId}/members/invites/${userId}/accept`,
      ),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["workspaces"] });
      void qc.invalidateQueries({ queryKey: ["my-invites"] });
      toast.success("Invite accepted");
    },
    onError: () => toast.error("Failed to accept invite"),
  });
}

export function useDeclineInviteFromList(workspaceId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) =>
      api.post(
        `/api/v1/workspaces/${workspaceId}/members/invites/${userId}/reject`,
      ),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["my-invites"] });
      toast.success("Invite declined");
    },
    onError: () => toast.error("Failed to decline invite"),
  });
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

export function toInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0] ?? "")
    .join("")
    .toUpperCase();
}
