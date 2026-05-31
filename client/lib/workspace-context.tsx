"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import { useSession } from "@/lib/auth-client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import { toast } from "sonner";
import { fileKeys } from "@/lib/files";
import { memberKeys } from "@/lib/members";

const STORAGE_KEY = "bringbucket:currentWorkspaceId";

// ─── Types ─────────────────────────────────────────────────────────────────────

export type WorkspacePlan = "Free" | "Pro" | "Team";
export type WorkspaceType = "Personal" | "Student" | "Startup" | "Team";
export type MemberRole = "Owner" | "Admin" | "Member" | "Viewer";
export type PermissionLevel = "Owner" | "Admin" | "Member" | "Viewer";

export interface WorkspaceMember {
  id: string;
  userId: string;
  name: string;
  email: string;
  role: MemberRole;
  initials: string;
  joinedAt: string;
}

export type SyncStatus = "idle" | "pending" | "syncing" | "completed" | "failed";

export interface StorageProvider {
  name: string;
  bucket: string;
  region: string;
  status: "Connected" | "Error" | "Checking";
  lastChecked: string;
  syncStatus: SyncStatus;
  syncTotalObjects: number;
  syncCompletedObjects: number;
  lastSyncedAt: string | null;
}

export interface WorkspacePermissions {
  canUpload: PermissionLevel;
  canCreateFolders: PermissionLevel;
  canShareFiles: PermissionLevel;
  canDeleteFiles: PermissionLevel;
  canManageBilling: PermissionLevel;
}

export interface WorkspaceSecurity {
  requirePasswordForPublicLinks: boolean;
  disablePublicSharing: boolean;
  allowPrivateInviteSharing: boolean;
  enableActivityLogs: boolean;
}

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  type: WorkspaceType;
  plan: WorkspacePlan;
  color: string;
  logoUrl: string | null;
  bannerUrl: string | null;
  owner: string;
  ownerEmail: string;
  createdAt: string;
  members: WorkspaceMember[];
  storage: StorageProvider | null;
  permissions: WorkspacePermissions;
  security: WorkspaceSecurity;
}

export interface CreateWorkspaceData {
  name: string;
  slug: string;
  type: WorkspaceType;
}

type WorkspaceEvent =
  | { type: "file.uploaded"; payload: unknown }
  | { type: "file.deleted"; payload: { fileId: string } }
  | { type: "file.renamed"; payload: { fileId: string; name: string } }
  | { type: "member.joined"; payload: unknown }
  | { type: "member.removed"; payload: { memberId: string } }
  | {
      type: "notification.new";
      payload: { title: string; message?: string | null };
    }
  | {
      type: "provider.status";
      payload: { status: string; lastChecked: string };
    }
  | {
      type: "sync.progress";
      payload: { completed: number; total: number; status: string };
    }
  | { type: "link.expired"; payload: { linkId: string } }
  | { type: "ping"; payload: null };

// ─── API shape → UI shape ─────────────────────────────────────────────────────

const API_TYPE_MAP: Record<string, WorkspaceType> = {
  PERSONAL: "Personal",
  STARTUP: "Startup",
  TEAM: "Team",
};

const UI_TYPE_MAP: Record<WorkspaceType, string> = {
  Personal: "PERSONAL",
  Student: "PERSONAL",
  Startup: "STARTUP",
  Team: "TEAM",
};

const DEFAULT_PERMISSIONS: WorkspacePermissions = {
  canUpload: "Member",
  canCreateFolders: "Member",
  canShareFiles: "Member",
  canDeleteFiles: "Admin",
  canManageBilling: "Owner",
};

const AVATAR_COLORS = [
  "bg-blue-500",
  "bg-emerald-500",
  "bg-orange-500",
  "bg-violet-500",
  "bg-rose-500",
  "bg-amber-500",
  "bg-cyan-500",
];

function toInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0] ?? "")
    .join("")
    .toUpperCase();
}

function formatDate(iso: string | null | undefined): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function fromApiWorkspace(raw: any): Workspace {
  return {
    id: raw.id,
    name: raw.name,
    slug: raw.slug,
    type: API_TYPE_MAP[raw.type] ?? "Personal",
    plan: (raw.plan as WorkspacePlan) ?? "Free",
    color: raw.color ?? "bg-blue-500",
    logoUrl: raw.logoUrl ?? null,
    bannerUrl: raw.bannerUrl ?? null,
    owner: raw.owner?.name ?? "",
    ownerEmail: raw.owner?.email ?? "",
    createdAt: formatDate(raw.createdAt),
    members: (raw.members ?? []).map(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (m: any): WorkspaceMember => ({
        id: m.id,
        userId: m.userId,
        name: m.user?.name ?? m.userId,
        email: m.user?.email ?? "",
        role: m.role as MemberRole,
        initials: toInitials(m.user?.name ?? "?"),
        joinedAt: formatDate(m.joinedAt),
      }),
    ),
    storage: raw.storageProvider
      ? {
          name: raw.storageProvider.providerType,
          bucket: raw.storageProvider.bucket,
          region: raw.storageProvider.region ?? "",
          status:
            raw.storageProvider.status === "Active"
              ? "Connected"
              : raw.storageProvider.status === "Unchecked"
                ? "Checking"
                : "Error",
          lastChecked: raw.storageProvider.lastChecked
            ? formatDate(raw.storageProvider.lastChecked)
            : "Never",
          syncStatus: (raw.storageProvider.syncStatus ?? "idle") as SyncStatus,
          syncTotalObjects: raw.storageProvider.syncTotalObjects ?? 0,
          syncCompletedObjects: raw.storageProvider.syncCompletedObjects ?? 0,
          lastSyncedAt: raw.storageProvider.lastSyncedAt
            ? formatDate(raw.storageProvider.lastSyncedAt)
            : null,
        }
      : null,
    permissions: raw.permissions
      ? {
          canUpload: raw.permissions.canUpload as PermissionLevel,
          canCreateFolders: raw.permissions.canCreateFolders as PermissionLevel,
          canShareFiles: raw.permissions.canShareFiles as PermissionLevel,
          canDeleteFiles: raw.permissions.canDeleteFiles as PermissionLevel,
          canManageBilling: raw.permissions.canManageBilling as PermissionLevel,
        }
      : DEFAULT_PERMISSIONS,
    security: raw.security ?? {
      requirePasswordForPublicLinks: false,
      disablePublicSharing: false,
      allowPrivateInviteSharing: true,
      enableActivityLogs: true,
    },
  };
}

// ─── Query functions ───────────────────────────────────────────────────────────

async function fetchWorkspaces(): Promise<Workspace[]> {
  const res = await api.get<{ workspaces: unknown[] }>("/api/v1/workspaces");
  return res.data.workspaces.map(fromApiWorkspace);
}

async function postWorkspace(
  data: CreateWorkspaceData & { color: string },
): Promise<Workspace> {
  const res = await api.post<{ workspace: unknown }>("/api/v1/workspaces", {
    name: data.name,
    slug: data.slug,
    type: UI_TYPE_MAP[data.type] ?? "PERSONAL",
  });
  return fromApiWorkspace({ ...(res.data.workspace as object), color: data.color });
}

// ─── Context ───────────────────────────────────────────────────────────────────

interface WorkspaceContextValue {
  workspaces: Workspace[];
  currentWorkspace: Workspace | null;
  loading: boolean;
  switchWorkspace: (id: string) => void;
  createWorkspace: (data: CreateWorkspaceData) => Promise<string>;
  updateWorkspace: (
    id: string,
    updates: Partial<Pick<Workspace, "name" | "slug">>,
  ) => void;
  updateMembers: (id: string, members: WorkspaceMember[]) => void;
  updatePermissions: (id: string, permissions: WorkspacePermissions) => void;
  updateSecurity: (id: string, security: WorkspaceSecurity) => void;
}

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const [currentId, setCurrentId] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(STORAGE_KEY);
  });

  const { data: workspaces = [], isLoading } = useQuery({
    queryKey: ["workspaces"],
    queryFn: fetchWorkspaces,
    enabled: !!session?.user,
    staleTime: 60 * 1000,
  });

  // Sync currentId: initialize to first workspace if unset, reset if workspace removed
  useEffect(() => {
    if (workspaces.length === 0) return;
    const valid = workspaces.find((w) => w.id === currentId);
    if (!valid) {
      const firstId = workspaces[0]!.id;
      setCurrentId(firstId);
      localStorage.setItem(STORAGE_KEY, firstId);
    }
  }, [workspaces, currentId]);

  const createMutation = useMutation({
    mutationFn: postWorkspace,
    onSuccess: (ws) => {
      queryClient.setQueryData<Workspace[]>(["workspaces"], (prev = []) => [
        ...prev,
        ws,
      ]);
      setCurrentId(ws.id);
      localStorage.setItem(STORAGE_KEY, ws.id);
    },
    onError: () => {
      toast.error("Failed to create workspace");
    },
  });

  const currentWorkspace =
    workspaces.find((w) => w.id === currentId) ?? workspaces[0] ?? null;

  const patchWorkspaceStorage = useCallback(
    (
      workspaceId: string,
      updater: (storage: StorageProvider | null) => StorageProvider | null,
    ) => {
      queryClient.setQueryData<Workspace[]>(["workspaces"], (prev = []) =>
        prev.map((workspace) =>
          workspace.id === workspaceId
            ? { ...workspace, storage: updater(workspace.storage) }
            : workspace,
        ),
      );
    },
    [queryClient],
  );

  useEffect(() => {
    if (!currentWorkspace?.id) return;

    const workspaceId = currentWorkspace.id;
    const source = new EventSource(`/api/v1/workspaces/${workspaceId}/events`);

    const refreshFiles = () => {
      void queryClient.invalidateQueries({ queryKey: fileKeys.all(workspaceId) });
    };

    const refreshMembers = () => {
      void queryClient.invalidateQueries({ queryKey: memberKeys.list(workspaceId) });
      void queryClient.invalidateQueries({ queryKey: memberKeys.invites(workspaceId) });
      void queryClient.invalidateQueries({ queryKey: ["workspaces"] });
    };

    source.addEventListener("file.uploaded", refreshFiles);
    source.addEventListener("file.deleted", refreshFiles);
    source.addEventListener("file.renamed", refreshFiles);
    source.addEventListener("member.joined", refreshMembers);
    source.addEventListener("member.removed", refreshMembers);

    source.addEventListener("provider.status", (event) => {
      const payload = JSON.parse((event as MessageEvent<string>).data) as Extract<
        WorkspaceEvent,
        { type: "provider.status" }
      >["payload"];

      patchWorkspaceStorage(workspaceId, (storage) =>
        storage
          ? {
              ...storage,
              status: payload.status === "Active" ? "Connected" : "Error",
              lastChecked: formatDate(payload.lastChecked),
            }
          : storage,
      );
    });

    source.addEventListener("sync.progress", (event) => {
      const payload = JSON.parse((event as MessageEvent<string>).data) as Extract<
        WorkspaceEvent,
        { type: "sync.progress" }
      >["payload"];

      queryClient.setQueryData(["sync-status", workspaceId], {
        syncStatus: payload.status as SyncStatus,
        syncTotalObjects: payload.total,
        syncCompletedObjects: payload.completed,
        lastSyncedAt:
          payload.status === "completed" ? new Date().toISOString() : null,
      });

      patchWorkspaceStorage(workspaceId, (storage) =>
        storage
          ? {
              ...storage,
              syncStatus: payload.status as SyncStatus,
              syncTotalObjects: payload.total,
              syncCompletedObjects: payload.completed,
              lastSyncedAt:
                payload.status === "completed"
                  ? formatDate(new Date().toISOString())
                  : storage.lastSyncedAt,
            }
          : storage,
      );
    });

    source.addEventListener("notification.new", (event) => {
      const payload = JSON.parse((event as MessageEvent<string>).data) as Extract<
        WorkspaceEvent,
        { type: "notification.new" }
      >["payload"];

      toast(payload.title, {
        description: payload.message ?? undefined,
      });
    });

    source.addEventListener("link.expired", () => {
      toast("Share link expired");
    });

    source.onerror = () => {
      // EventSource auto-reconnects. Keep the UI quiet unless the user reports issues.
    };

    return () => {
      source.close();
    };
  }, [currentWorkspace?.id, patchWorkspaceStorage, queryClient]);

  const switchWorkspace = useCallback((id: string) => {
    setCurrentId(id);
    localStorage.setItem(STORAGE_KEY, id);
  }, []);

  const createWorkspace = useCallback(
    async (data: CreateWorkspaceData): Promise<string> => {
      const color =
        AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)] ??
        "bg-blue-500";
      const ws = await createMutation.mutateAsync({ ...data, color });
      return ws.id;
    },
    [createMutation],
  );

  const updateWorkspace = useCallback(
    (id: string, updates: Partial<Pick<Workspace, "name" | "slug">>) => {
      queryClient.setQueryData<Workspace[]>(["workspaces"], (prev = []) =>
        prev.map((w) => (w.id === id ? { ...w, ...updates } : w)),
      );
    },
    [queryClient],
  );

  const updateMembers = useCallback(
    (id: string, members: WorkspaceMember[]) => {
      queryClient.setQueryData<Workspace[]>(["workspaces"], (prev = []) =>
        prev.map((w) => (w.id === id ? { ...w, members } : w)),
      );
    },
    [queryClient],
  );

  const updatePermissions = useCallback(
    (id: string, permissions: WorkspacePermissions) => {
      queryClient.setQueryData<Workspace[]>(["workspaces"], (prev = []) =>
        prev.map((w) => (w.id === id ? { ...w, permissions } : w)),
      );
    },
    [queryClient],
  );

  const updateSecurity = useCallback(
    (id: string, security: WorkspaceSecurity) => {
      queryClient.setQueryData<Workspace[]>(["workspaces"], (prev = []) =>
        prev.map((w) => (w.id === id ? { ...w, security } : w)),
      );
    },
    [queryClient],
  );

  return (
    <WorkspaceContext.Provider
      value={{
        workspaces,
        currentWorkspace,
        loading: isLoading,
        switchWorkspace,
        createWorkspace,
        updateWorkspace,
        updateMembers,
        updatePermissions,
        updateSecurity,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const ctx = useContext(WorkspaceContext);
  if (!ctx)
    throw new Error("useWorkspace must be used within WorkspaceProvider");
  return ctx;
}
