"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import { toast } from "sonner";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AdminStats {
  totalUsers: number;
  newUsersThisWeek: number;
  totalWorkspaces: number;
  totalFiles: number;
  totalShareLinks: number;
  activeSubscriptions: number;
  totalBlogs: number;
  publishedBlogs: number;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  plan: string;
  isAdmin: boolean;
  onboarded: boolean | null;
  createdAt: string;
  updatedAt: string;
  _count: { workspaces: number; shareLinks: number; files: number };
  subscription: { status: string; plan: string } | null;
}

export interface AdminWorkspace {
  id: string;
  name: string;
  plan: string;
  createdAt: string;
  owner: { id: string; name: string; email: string };
  storage: { type: string; status: string } | null;
  _count: { members: number; files: number; shareLinks: number };
}

export interface AdminSubscription {
  id: string;
  status: string;
  plan: string;
  createdAt: string;
  currentPeriodEnd: string | null;
  trialEndsAt: string | null;
  user: { id: string; name: string; email: string; avatar: string | null };
}

export interface AdminBlog {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  coverImage: string | null;
  tags: string[];
  published: boolean;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  content?: string;
  author: { id: string; name: string; avatar: string | null };
}

export interface PaginatedResponse<T> {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  data: T[];
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export function useAdminStats() {
  return useQuery({
    queryKey: ["admin", "stats"],
    queryFn: async () => {
      const res = await api.get<{ stats: AdminStats; recentActivity: unknown[] }>("/api/v1/admin/stats");
      return res.data;
    },
  });
}

// ─── Users ────────────────────────────────────────────────────────────────────

export function useAdminUsers(params: { page?: number; search?: string } = {}) {
  return useQuery({
    queryKey: ["admin", "users", params],
    queryFn: async () => {
      const res = await api.get<{ users: AdminUser[]; total: number; totalPages: number }>("/api/v1/admin/users", { params });
      return res.data;
    },
  });
}

export function useAdminUpdateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<AdminUser> }) => {
      const res = await api.patch(`/api/v1/admin/users/${id}`, data);
      return res.data;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["admin", "users"] });
      toast.success("User updated");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useAdminDeleteUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/api/v1/admin/users/${id}`);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["admin", "users"] });
      toast.success("User deleted");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

// ─── Workspaces ───────────────────────────────────────────────────────────────

export function useAdminWorkspaces(params: { page?: number; search?: string } = {}) {
  return useQuery({
    queryKey: ["admin", "workspaces", params],
    queryFn: async () => {
      const res = await api.get<{ workspaces: AdminWorkspace[]; total: number; totalPages: number }>("/api/v1/admin/workspaces", { params });
      return res.data;
    },
  });
}

export function useAdminDeleteWorkspace() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/api/v1/admin/workspaces/${id}`);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["admin", "workspaces"] });
      toast.success("Workspace deleted");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

// ─── App Settings ─────────────────────────────────────────────────────────────

export type ProviderStatus = "enabled" | "coming_soon" | "hidden";
export type ProviderKey = "S3" | "R2" | "GCS" | "Azure" | "MinIO" | "Supabase" | "Other";

export interface AppConfig {
  betaMode: boolean;
  maintenanceMode: boolean;
  signupsEnabled: boolean;
  allowedFileTypes: string[];
  providers: Record<ProviderKey, ProviderStatus>;
  features: {
    shareLinks: boolean;
    analytics: boolean;
    passwordProtectedLinks: boolean;
  };
}

export const DEFAULT_APP_CONFIG: AppConfig = {
  betaMode: true,
  maintenanceMode: false,
  signupsEnabled: true,
  allowedFileTypes: [],
  providers: {
    S3: "enabled", R2: "enabled", GCS: "coming_soon",
    Azure: "coming_soon", MinIO: "enabled", Supabase: "enabled", Other: "enabled",
  },
  features: { shareLinks: true, analytics: true, passwordProtectedLinks: true },
};

export function useAdminSettings() {
  return useQuery({
    queryKey: ["admin", "settings"],
    queryFn: async () => {
      const res = await api.get<{ settings: AppConfig }>("/api/v1/admin/settings");
      return res.data.settings;
    },
  });
}

export function useUpdateAdminSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<AppConfig>) => {
      const res = await api.patch<{ settings: AppConfig }>("/api/v1/admin/settings", data);
      return res.data.settings;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["admin", "settings"] });
      void qc.invalidateQueries({ queryKey: ["config"] });
      toast.success("Settings updated");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useAppConfig() {
  return useQuery({
    queryKey: ["config"],
    queryFn: async () => {
      const res = await api.get<AppConfig>("/api/v1/config");
      return res.data;
    },
    staleTime: 60_000,
  });
}

/** @deprecated use useAppConfig().data?.betaMode */
export function useBetaMode() {
  const { data } = useAppConfig();
  return { data: data?.betaMode ?? true };
}

// ─── Subscriptions ────────────────────────────────────────────────────────────

export function useAdminSubscriptions(params: { page?: number; status?: string } = {}) {
  return useQuery({
    queryKey: ["admin", "subscriptions", params],
    queryFn: async () => {
      const res = await api.get<{ subscriptions: AdminSubscription[]; total: number; totalPages: number }>("/api/v1/admin/subscriptions", { params });
      return res.data;
    },
  });
}

// ─── Blogs ────────────────────────────────────────────────────────────────────

export function useAdminBlogs(params: { page?: number; search?: string; published?: boolean } = {}) {
  return useQuery({
    queryKey: ["admin", "blogs", params],
    queryFn: async () => {
      const res = await api.get<{ blogs: AdminBlog[]; total: number; totalPages: number }>("/api/v1/admin/blogs", { params });
      return res.data;
    },
  });
}

export function useAdminBlog(id: string) {
  return useQuery({
    queryKey: ["admin", "blogs", id],
    queryFn: async () => {
      const res = await api.get<{ blog: AdminBlog }>(`/api/v1/admin/blogs/${id}`);
      return res.data.blog;
    },
    enabled: !!id,
  });
}

export function useAdminCreateBlog() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<AdminBlog>) => {
      const res = await api.post<{ blog: AdminBlog }>("/api/v1/admin/blogs", data);
      return res.data.blog;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["admin", "blogs"] });
      toast.success("Blog post created");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useAdminUpdateBlog() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<AdminBlog> }) => {
      const res = await api.patch<{ blog: AdminBlog }>(`/api/v1/admin/blogs/${id}`, data);
      return res.data.blog;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["admin", "blogs"] });
      toast.success("Blog post saved");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useAdminDeleteBlog() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/api/v1/admin/blogs/${id}`);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["admin", "blogs"] });
      toast.success("Blog post deleted");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

// ─── Public blog hooks (for website blog page) ────────────────────────────────

export function usePublicBlogs(params: { page?: number; tag?: string } = {}) {
  return useQuery({
    queryKey: ["blogs", params],
    queryFn: async () => {
      const res = await api.get<{ blogs: AdminBlog[]; total: number; totalPages: number }>("/api/v1/blogs", { params });
      return res.data;
    },
  });
}

export function usePublicBlog(slug: string) {
  return useQuery({
    queryKey: ["blogs", slug],
    queryFn: async () => {
      const res = await api.get<{ blog: AdminBlog }>(`/api/v1/blogs/${slug}`);
      return res.data.blog;
    },
    enabled: !!slug,
  });
}
