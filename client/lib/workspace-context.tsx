"use client"

import { createContext, useContext, useState, useCallback, type ReactNode } from "react"

// ─── Types ─────────────────────────────────────────────────────────────────────

export type WorkspacePlan   = "Free" | "Pro" | "Team"
export type WorkspaceType   = "Personal" | "Student" | "Startup" | "Team"
export type MemberRole      = "Owner" | "Admin" | "Member" | "Viewer"
export type PermissionLevel = "Owner" | "Admin" | "Member" | "Viewer"

export interface WorkspaceMember {
  id: string
  name: string
  email: string
  role: MemberRole
  initials: string
  joinedAt: string
}

export interface StorageProvider {
  name: string
  bucket: string
  region: string
  status: "Connected" | "Error" | "Checking"
  lastChecked: string
}

export interface WorkspacePermissions {
  canUpload: PermissionLevel
  canCreateFolders: PermissionLevel
  canShareFiles: PermissionLevel
  canDeleteFiles: PermissionLevel
  canManageBilling: PermissionLevel
}

export interface WorkspaceSecurity {
  requirePasswordForPublicLinks: boolean
  disablePublicSharing: boolean
  allowPrivateInviteSharing: boolean
  enableActivityLogs: boolean
}

export interface Workspace {
  id: string
  name: string
  slug: string
  type: WorkspaceType
  plan: WorkspacePlan
  color: string
  owner: string
  ownerEmail: string
  createdAt: string
  members: WorkspaceMember[]
  storage: StorageProvider | null
  permissions: WorkspacePermissions
  security: WorkspaceSecurity
}

export interface CreateWorkspaceData {
  name: string
  slug: string
  type: WorkspaceType
}

// ─── Dummy data ────────────────────────────────────────────────────────────────

const DEFAULT_PERMISSIONS: WorkspacePermissions = {
  canUpload:       "Member",
  canCreateFolders:"Member",
  canShareFiles:   "Member",
  canDeleteFiles:  "Admin",
  canManageBilling:"Owner",
}

const INITIAL_WORKSPACES: Workspace[] = [
  {
    id: "personal",
    name: "Personal Workspace",
    slug: "personal",
    type: "Personal",
    plan: "Free",
    color: "bg-blue-500",
    owner: "John Doe",
    ownerEmail: "john@example.com",
    createdAt: "Jan 15, 2026",
    members: [
      { id: "m1", name: "John Doe", email: "john@example.com", role: "Owner", initials: "JD", joinedAt: "Jan 15, 2026" },
    ],
    storage: { name: "AWS S3", bucket: "byoc-user-storage", region: "ap-south-1", status: "Connected", lastChecked: "2 minutes ago" },
    permissions: DEFAULT_PERMISSIONS,
    security: { requirePasswordForPublicLinks: false, disablePublicSharing: false, allowPrivateInviteSharing: true,  enableActivityLogs: true  },
  },
  {
    id: "college-project",
    name: "College Project",
    slug: "college-project",
    type: "Student",
    plan: "Free",
    color: "bg-emerald-500",
    owner: "John Doe",
    ownerEmail: "john@example.com",
    createdAt: "Feb 10, 2026",
    members: [
      { id: "m1", name: "John Doe",     email: "john@example.com",  role: "Owner",  initials: "JD", joinedAt: "Feb 10, 2026" },
      { id: "m2", name: "Priya Sharma", email: "priya@example.com", role: "Admin",  initials: "PS", joinedAt: "Feb 11, 2026" },
      { id: "m3", name: "Arjun Mehta",  email: "arjun@example.com", role: "Member", initials: "AM", joinedAt: "Feb 12, 2026" },
    ],
    storage: { name: "AWS S3", bucket: "college-project-assets", region: "us-east-1", status: "Connected", lastChecked: "5 minutes ago" },
    permissions: { ...DEFAULT_PERMISSIONS, canCreateFolders: "Admin" },
    security: { requirePasswordForPublicLinks: false, disablePublicSharing: false, allowPrivateInviteSharing: true,  enableActivityLogs: false },
  },
  {
    id: "startup-team",
    name: "Startup Team",
    slug: "startup-team",
    type: "Startup",
    plan: "Pro",
    color: "bg-orange-500",
    owner: "John Doe",
    ownerEmail: "john@example.com",
    createdAt: "Mar 1, 2026",
    members: [
      { id: "m1", name: "John Doe",    email: "john@startup.io",   role: "Owner",  initials: "JD", joinedAt: "Mar 1, 2026" },
      { id: "m2", name: "Ananya Roy",  email: "ananya@startup.io", role: "Admin",  initials: "AR", joinedAt: "Mar 2, 2026" },
      { id: "m3", name: "Rahul Patel", email: "rahul@startup.io",  role: "Member", initials: "RP", joinedAt: "Mar 5, 2026" },
      { id: "m4", name: "Sneha Gupta", email: "sneha@startup.io",  role: "Member", initials: "SG", joinedAt: "Mar 8, 2026" },
      { id: "m5", name: "Dev Bose",    email: "dev@startup.io",    role: "Viewer", initials: "DB", joinedAt: "Apr 1, 2026" },
    ],
    storage: { name: "AWS S3", bucket: "startup-team-assets", region: "eu-west-1", status: "Connected", lastChecked: "Just now" },
    permissions: { ...DEFAULT_PERMISSIONS, canShareFiles: "Admin" },
    security: { requirePasswordForPublicLinks: true,  disablePublicSharing: false, allowPrivateInviteSharing: true,  enableActivityLogs: true  },
  },
  {
    id: "client-assets",
    name: "Client Assets",
    slug: "client-assets",
    type: "Team",
    plan: "Team",
    color: "bg-violet-500",
    owner: "John Doe",
    ownerEmail: "john@example.com",
    createdAt: "Apr 5, 2026",
    members: [
      { id: "m1", name: "John Doe",      email: "john@example.com",  role: "Owner",  initials: "JD", joinedAt: "Apr 5, 2026"  },
      { id: "m2", name: "Maya Nair",     email: "maya@client.co",    role: "Admin",  initials: "MN", joinedAt: "Apr 6, 2026"  },
      { id: "m3", name: "Rohan Verma",   email: "rohan@client.co",   role: "Admin",  initials: "RV", joinedAt: "Apr 6, 2026"  },
      { id: "m4", name: "Ishaan Kapoor", email: "ishaan@client.co",  role: "Member", initials: "IK", joinedAt: "Apr 7, 2026"  },
      { id: "m5", name: "Tanya Singh",   email: "tanya@client.co",   role: "Member", initials: "TS", joinedAt: "Apr 7, 2026"  },
      { id: "m6", name: "Kunal Shah",    email: "kunal@client.co",   role: "Member", initials: "KS", joinedAt: "Apr 8, 2026"  },
      { id: "m7", name: "Meera Joshi",   email: "meera@client.co",   role: "Viewer", initials: "MJ", joinedAt: "Apr 10, 2026" },
      { id: "m8", name: "Aakash Tiwari", email: "aakash@client.co",  role: "Viewer", initials: "AT", joinedAt: "Apr 12, 2026" },
    ],
    storage: { name: "AWS S3", bucket: "client-assets-prod", region: "ap-southeast-1", status: "Connected", lastChecked: "8 minutes ago" },
    permissions: { ...DEFAULT_PERMISSIONS, canShareFiles: "Admin", canDeleteFiles: "Owner" },
    security: { requirePasswordForPublicLinks: true,  disablePublicSharing: true,  allowPrivateInviteSharing: false, enableActivityLogs: true  },
  },
]

// ─── Context ───────────────────────────────────────────────────────────────────

interface WorkspaceContextValue {
  workspaces: Workspace[]
  currentWorkspace: Workspace
  switchWorkspace: (id: string) => void
  createWorkspace: (data: CreateWorkspaceData) => string
  updateWorkspace: (id: string, updates: Partial<Pick<Workspace, "name" | "slug">>) => void
  updateMembers: (id: string, members: WorkspaceMember[]) => void
  updatePermissions: (id: string, permissions: WorkspacePermissions) => void
  updateSecurity: (id: string, security: WorkspaceSecurity) => void
}

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null)

const AVATAR_COLORS = [
  "bg-blue-500", "bg-emerald-500", "bg-orange-500",
  "bg-violet-500", "bg-rose-500", "bg-amber-500", "bg-cyan-500",
]

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [workspaces, setWorkspaces] = useState<Workspace[]>(INITIAL_WORKSPACES)
  const [currentId, setCurrentId]   = useState("personal")

  const currentWorkspace = workspaces.find((w) => w.id === currentId) ?? workspaces[0]

  const switchWorkspace = useCallback((id: string) => setCurrentId(id), [])

  const createWorkspace = useCallback((data: CreateWorkspaceData): string => {
    const id    = data.slug || data.name.toLowerCase().replace(/\s+/g, "-")
    const color = AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)]
    const today = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    const ws: Workspace = {
      id,
      name: data.name,
      slug: data.slug,
      type: data.type,
      plan: "Free",
      color,
      owner: "John Doe",
      ownerEmail: "john@example.com",
      createdAt: today,
      members: [{ id: "m1", name: "John Doe", email: "john@example.com", role: "Owner", initials: "JD", joinedAt: today }],
      storage: null,
      permissions: DEFAULT_PERMISSIONS,
      security: { requirePasswordForPublicLinks: false, disablePublicSharing: false, allowPrivateInviteSharing: true, enableActivityLogs: false },
    }
    setWorkspaces((prev) => [...prev, ws])
    setCurrentId(id)
    return id
  }, [])

  const updateWorkspace = useCallback((id: string, updates: Partial<Pick<Workspace, "name" | "slug">>) => {
    setWorkspaces((prev) => prev.map((w) => (w.id === id ? { ...w, ...updates } : w)))
  }, [])

  const updateMembers = useCallback((id: string, members: WorkspaceMember[]) => {
    setWorkspaces((prev) => prev.map((w) => (w.id === id ? { ...w, members } : w)))
  }, [])

  const updatePermissions = useCallback((id: string, permissions: WorkspacePermissions) => {
    setWorkspaces((prev) => prev.map((w) => (w.id === id ? { ...w, permissions } : w)))
  }, [])

  const updateSecurity = useCallback((id: string, security: WorkspaceSecurity) => {
    setWorkspaces((prev) => prev.map((w) => (w.id === id ? { ...w, security } : w)))
  }, [])

  return (
    <WorkspaceContext.Provider
      value={{ workspaces, currentWorkspace, switchWorkspace, createWorkspace, updateWorkspace, updateMembers, updatePermissions, updateSecurity }}
    >
      {children}
    </WorkspaceContext.Provider>
  )
}

export function useWorkspace() {
  const ctx = useContext(WorkspaceContext)
  if (!ctx) throw new Error("useWorkspace must be used within WorkspaceProvider")
  return ctx
}
