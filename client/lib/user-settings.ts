"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import { toast } from "sonner";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  username: string | null;
  bio: string | null;
  location: string | null;
  website: string | null;
  avatar: string | null;
  avatarUrl: string | null;
  onboarded: boolean | null;
  isAdmin: boolean;
  createdAt: string;
  updatedAt: string;
  subscription: UserSubscriptionSnapshot;
}

export type WorkspacePlan = "Free" | "Pro" | "Team";

export interface PlanLimits {
  maxWorkspaces: number | null;
  maxTeamMembers: number | null;
  maxActiveShareLinks: number | null;
  maxUploadFileSize: number | null;
  activityLogRetentionDays: number;
  allowedProviders: string[];
  passwordProtectedLinks: boolean;
  customDomains: boolean;
  advancedAnalytics: boolean;
  apiAccess: boolean;
  teamManagement: boolean;
  auditLogs: boolean;
  integrations: boolean;
}

export interface WorkspaceUsageSnapshot {
  workspaceId: string;
  workspaceName: string;
  plan: WorkspacePlan;
  membersCount: number;
  pendingInvitesCount: number;
  activeLinksCount: number;
  providerConnected: boolean;
}

export interface UserSubscriptionSnapshot {
  plan: WorkspacePlan;
  status: string | null;
  currentPeriodEnd: string | null;
  trialEndsAt: string | null;
  limits: PlanLimits;
  featureAccess: {
    passwordProtectedLinks: boolean;
    customDomains: boolean;
    advancedAnalytics: boolean;
    apiAccess: boolean;
    teamManagement: boolean;
    auditLogs: boolean;
    integrations: boolean;
  };
  usage: {
    workspacesOwned: number;
    activeLinksTotal: number;
    workspaceCountByPlan: Record<WorkspacePlan, number>;
  };
  remaining: {
    workspacesOwned: number | null;
  };
  checks: {
    canCreateWorkspace: boolean;
  };
  workspaces: WorkspaceUsageSnapshot[];
}

export interface UserPreferences {
  emailNotifications: boolean;
  pushNotifications: boolean;
  theme: "light" | "dark" | "system";
  language: string;
}

export interface ConnectedAccount {
  id: string;
  providerId: string;
  accountId: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserSession {
  id: string;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
  ipAddress: string | null;
  userAgent: string | null;
  current: boolean;
}

export const userSettingsKeys = {
  profile: ["user-settings", "profile"] as const,
  preferences: ["user-settings", "preferences"] as const,
  accounts: ["user-settings", "accounts"] as const,
  sessions: ["user-settings", "sessions"] as const,
};

export function useUserProfile() {
  return useQuery({
    queryKey: userSettingsKeys.profile,
    queryFn: async () => {
      const res = await api.get<{ user: UserProfile }>("/api/v1/users/me");
      return res.data.user;
    },
  });
}

export function useUpdateUserProfile() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (payload: Partial<UserProfile>) => {
      const res = await api.patch<{ user: UserProfile }>("/api/v1/users/me", payload);
      return res.data.user;
    },
    onSuccess: (user) => {
      qc.setQueryData(userSettingsKeys.profile, user);
      toast.success("Profile updated");
    },
    onError: (err: Error) => {
      toast.error(err.message ?? "Failed to update profile");
    },
  });
}

export function useUserPreferences() {
  return useQuery({
    queryKey: userSettingsKeys.preferences,
    queryFn: async () => {
      const res = await api.get<{ preferences: UserPreferences }>("/api/v1/users/preferences");
      return res.data.preferences;
    },
  });
}

export function useUpdateUserPreferences() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (payload: Partial<UserPreferences>) => {
      const res = await api.patch<{ preferences: UserPreferences }>(
        "/api/v1/users/preferences",
        payload,
      );
      return res.data.preferences;
    },
    onSuccess: (preferences) => {
      qc.setQueryData(userSettingsKeys.preferences, preferences);
      toast.success("Preferences updated");
    },
    onError: (err: Error) => {
      toast.error(err.message ?? "Failed to update preferences");
    },
  });
}

export function useConnectedAccounts() {
  return useQuery({
    queryKey: userSettingsKeys.accounts,
    queryFn: async () => {
      const res = await api.get<{ accounts: ConnectedAccount[] }>("/api/v1/users/me/accounts");
      return res.data.accounts;
    },
  });
}

export function useUserSessions() {
  return useQuery({
    queryKey: userSettingsKeys.sessions,
    queryFn: async () => {
      const res = await api.get<{ sessions: UserSession[] }>("/api/v1/users/me/sessions");
      return res.data.sessions;
    },
  });
}

export function useRevokeSession() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (sessionId: string) => {
      await api.delete(`/api/v1/users/me/sessions/${sessionId}`);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: userSettingsKeys.sessions });
      toast.success("Session revoked");
    },
    onError: (err: Error) => {
      toast.error(err.message ?? "Failed to revoke session");
    },
  });
}

export function useRevokeOtherSessions() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await api.delete("/api/v1/users/me/sessions/others");
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: userSettingsKeys.sessions });
      toast.success("Other sessions revoked");
    },
    onError: (err: Error) => {
      toast.error(err.message ?? "Failed to revoke sessions");
    },
  });
}

export function useUploadAvatar() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (file: File) => {
      // Step 1: get presigned PUT URL
      const { data: { uploadUrl, key } } = await api.post<{ uploadUrl: string; key: string }>(
        "/api/v1/users/me/avatar/presign",
        { contentType: file.type },
      );
      // Step 2: upload directly to S3 (no server bandwidth used)
      await fetch(uploadUrl, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      });
      // Step 3: confirm — server writes key to DB and returns resolved URL
      const { data: { avatarUrl } } = await api.post<{ avatarUrl: string }>(
        "/api/v1/users/me/avatar/confirm",
        { key },
      );
      return avatarUrl;
    },
    onSuccess: (avatarUrl) => {
      qc.setQueryData<UserProfile>(userSettingsKeys.profile, (old) =>
        old ? { ...old, avatarUrl } : old,
      );
      toast.success("Profile picture updated");
    },
    onError: (err: Error) => {
      toast.error(err.message ?? "Failed to upload avatar");
    },
  });
}
