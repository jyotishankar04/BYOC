"use client"

import { use, useState } from "react"
import { useRouter } from "next/navigation"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  CloudServerIcon,
  UserCircle02Icon,
  CreditCardIcon,
  Settings01Icon,
  LockedIcon,
  Delete01Icon,
  Cancel01Icon,
  PencilEdit01Icon,
  CheckmarkCircle01Icon,
  ArrowLeft01Icon,
  Share01Icon,
  InformationCircleIcon,
} from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import {
  useWorkspace,
  type MemberRole,
  type PermissionLevel,
  type WorkspaceMember,
} from "@/lib/workspace-context"

// ─── Section nav ───────────────────────────────────────────────────────────────

type Section =
  | "overview" | "general" | "members" | "storage"
  | "permissions" | "security" | "billing" | "danger"

const SECTIONS: { id: Section; label: string }[] = [
  { id: "overview",    label: "Overview"     },
  { id: "general",     label: "General"      },
  { id: "members",     label: "Members"      },
  { id: "storage",     label: "Storage"      },
  { id: "permissions", label: "Permissions"  },
  { id: "security",    label: "Security"     },
  { id: "billing",     label: "Billing"      },
  { id: "danger",      label: "Danger Zone"  },
]

// ─── Plan / type badge helpers ─────────────────────────────────────────────────

const PLAN_STYLE: Record<string, string> = {
  Free: "bg-muted text-muted-foreground",
  Pro:  "bg-blue-500/10 text-blue-600",
  Team: "bg-violet-500/10 text-violet-600",
}

const ROLE_STYLE: Record<MemberRole, string> = {
  Owner:  "bg-amber-500/10 text-amber-600",
  Admin:  "bg-blue-500/10 text-blue-600",
  Member: "bg-muted text-muted-foreground",
  Viewer: "bg-muted text-muted-foreground",
}

// ─── Inline toggle ─────────────────────────────────────────────────────────────

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      role="switch"
      aria-checked={value}
      onClick={() => onChange(!value)}
      className={cn(
        "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full transition-colors focus:outline-none",
        value ? "bg-primary" : "bg-muted",
      )}
    >
      <span
        className={cn(
          "absolute top-0.5 left-0.5 size-4 rounded-full bg-white shadow-sm transition-transform",
          value && "translate-x-4",
        )}
      />
    </button>
  )
}

// ─── Section: Overview ─────────────────────────────────────────────────────────

function OverviewSection({ workspace }: { workspace: ReturnType<typeof useWorkspace>["currentWorkspace"] }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-base font-semibold">Overview</h2>
        <p className="mt-1 text-sm text-muted-foreground">Workspace identity and basic information.</p>
      </div>
      <Separator />

      {/* Avatar */}
      <div className="flex items-center gap-4">
        <div className={cn("flex size-16 items-center justify-center rounded-xl text-2xl font-bold text-white", workspace.color)}>
          {workspace.name.charAt(0)}
        </div>
        <div>
          <p className="font-semibold">{workspace.name}</p>
          <p className="text-sm text-muted-foreground">byoc.app/{workspace.slug}</p>
        </div>
        <Badge className={cn("ml-auto", PLAN_STYLE[workspace.plan])}>{workspace.plan}</Badge>
      </div>

      <Separator />

      {/* Info grid */}
      <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {[
          { label: "Workspace name",   value: workspace.name          },
          { label: "Slug",             value: workspace.slug          },
          { label: "Type",             value: workspace.type          },
          { label: "Plan",             value: workspace.plan          },
          { label: "Owner",            value: workspace.owner         },
          { label: "Owner email",      value: workspace.ownerEmail    },
          { label: "Created",          value: workspace.createdAt     },
          { label: "Members",          value: `${workspace.members.length} member${workspace.members.length !== 1 ? "s" : ""}` },
        ].map((row) => (
          <div key={row.label} className="rounded-lg border bg-muted/20 px-4 py-3">
            <dt className="text-[11px] font-medium text-muted-foreground">{row.label}</dt>
            <dd className="mt-0.5 text-sm font-medium">{row.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}

// ─── Section: General ──────────────────────────────────────────────────────────

function GeneralSection({
  workspace,
  onSave,
}: {
  workspace: ReturnType<typeof useWorkspace>["currentWorkspace"]
  onSave: (name: string, slug: string) => void
}) {
  const [name, setName] = useState(workspace.name)
  const [slug, setSlug] = useState(workspace.slug)
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    onSave(name.trim() || workspace.name, slug.trim() || workspace.slug)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-base font-semibold">General</h2>
        <p className="mt-1 text-sm text-muted-foreground">Update your workspace name, slug, and logo.</p>
      </div>
      <Separator />

      <div className="max-w-md space-y-5">
        {/* Logo placeholder */}
        <div className="space-y-2">
          <Label className="text-xs font-medium">Workspace logo</Label>
          <div className="flex items-center gap-3">
            <div className={cn("flex size-12 items-center justify-center rounded-lg text-lg font-bold text-white", workspace.color)}>
              {workspace.name.charAt(0)}
            </div>
            <Button size="sm" variant="outline">Upload logo</Button>
            <Button size="sm" variant="ghost" className="text-muted-foreground">Remove</Button>
          </div>
          <p className="text-[11px] text-muted-foreground">PNG or JPG up to 2 MB. Square recommended.</p>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="g-name" className="text-xs font-medium">Workspace name</Label>
          <Input id="g-name" value={name} onChange={(e) => setName(e.target.value)} className="h-8 text-sm" />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="g-slug" className="text-xs font-medium">Slug</Label>
          <div className="flex items-center">
            <span className="flex h-8 items-center rounded-l-md border border-r-0 bg-muted px-2.5 text-xs text-muted-foreground shrink-0">
              byoc.app/
            </span>
            <Input
              id="g-slug"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="h-8 rounded-l-none text-sm"
            />
          </div>
        </div>

        <Button size="sm" onClick={handleSave}>
          {saved ? (
            <><HugeiconsIcon icon={CheckmarkCircle01Icon} className="size-3.5" strokeWidth={2} /> Saved</>
          ) : "Save changes"}
        </Button>
      </div>
    </div>
  )
}

// ─── Section: Members ──────────────────────────────────────────────────────────

function MembersSection({
  workspace,
  onUpdateMembers,
}: {
  workspace: ReturnType<typeof useWorkspace>["currentWorkspace"]
  onUpdateMembers: (members: WorkspaceMember[]) => void
}) {
  const [members, setMembers] = useState<WorkspaceMember[]>(workspace.members)
  const [inviteEmail, setInviteEmail] = useState("")
  const [inviteRole, setInviteRole] = useState<MemberRole>("Member")

  const handleInvite = () => {
    if (!inviteEmail.trim()) return
    const names = inviteEmail.split("@")[0].split(/[._-]/).map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join(" ")
    const initials = names.split(" ").map((n) => n.charAt(0)).join("").slice(0, 2).toUpperCase()
    const newMember: WorkspaceMember = {
      id: `m${Date.now()}`,
      name: names,
      email: inviteEmail.trim(),
      role: inviteRole,
      initials,
      joinedAt: "Just now",
    }
    const updated = [...members, newMember]
    setMembers(updated)
    onUpdateMembers(updated)
    setInviteEmail("")
  }

  const changeRole = (memberId: string, role: MemberRole) => {
    const updated = members.map((m) => (m.id === memberId ? { ...m, role } : m))
    setMembers(updated)
    onUpdateMembers(updated)
  }

  const removeMember = (memberId: string) => {
    const updated = members.filter((m) => m.id !== memberId)
    setMembers(updated)
    onUpdateMembers(updated)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-base font-semibold">Members</h2>
        <p className="mt-1 text-sm text-muted-foreground">{members.length} member{members.length !== 1 ? "s" : ""} in this workspace.</p>
      </div>
      <Separator />

      {/* Invite */}
      <div className="space-y-2">
        <Label className="text-xs font-medium">Invite member</Label>
        <div className="flex gap-2">
          <Input
            placeholder="colleague@example.com"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleInvite()}
            className="h-8 flex-1 text-sm"
          />
          <Select value={inviteRole} onValueChange={(v) => setInviteRole(v as MemberRole)}>
            <SelectTrigger className="h-8 w-28 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Admin">Admin</SelectItem>
              <SelectItem value="Member">Member</SelectItem>
              <SelectItem value="Viewer">Viewer</SelectItem>
            </SelectContent>
          </Select>
          <Button size="sm" onClick={handleInvite}>Invite</Button>
        </div>
      </div>

      {/* Member list */}
      <div className="overflow-hidden rounded-xl border">
        {members.map((member, i) => (
          <div
            key={member.id}
            className={cn("flex items-center gap-3 px-4 py-3", i > 0 && "border-t")}
          >
            <Avatar size="sm">
              <AvatarFallback className="text-xs">{member.initials}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium">{member.name}</p>
              <p className="truncate text-[11px] text-muted-foreground">{member.email}</p>
            </div>
            <p className="hidden text-[11px] text-muted-foreground sm:block">{member.joinedAt}</p>
            {member.role === "Owner" ? (
              <Badge className={cn("text-[10px]", ROLE_STYLE[member.role])}>Owner</Badge>
            ) : (
              <Select value={member.role} onValueChange={(v) => changeRole(member.id, v as MemberRole)}>
                <SelectTrigger className="h-7 w-24 text-[11px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Admin">Admin</SelectItem>
                  <SelectItem value="Member">Member</SelectItem>
                  <SelectItem value="Viewer">Viewer</SelectItem>
                </SelectContent>
              </Select>
            )}
            {member.role !== "Owner" && (
              <button
                onClick={() => removeMember(member.id)}
                className="ml-1 rounded p-1 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
              >
                <HugeiconsIcon icon={Cancel01Icon} className="size-3.5" strokeWidth={2} />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Section: Storage ──────────────────────────────────────────────────────────

function StorageSection({
  workspace,
}: {
  workspace: ReturnType<typeof useWorkspace>["currentWorkspace"]
}) {
  const s = workspace.storage

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-base font-semibold">Storage Provider</h2>
        <p className="mt-1 text-sm text-muted-foreground">Your connected cloud storage bucket.</p>
      </div>
      <Separator />

      {s ? (
        <div className="space-y-4">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-start gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-amber-500/10">
                  <HugeiconsIcon icon={CloudServerIcon} className="size-5 text-amber-600" strokeWidth={1.5} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold">{s.name}</p>
                    <Badge className="bg-emerald-500/10 text-emerald-600 text-[10px]">
                      {s.status}
                    </Badge>
                  </div>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">Last checked {s.lastChecked}</p>
                </div>
              </div>

              <Separator className="my-4" />

              <dl className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {[
                  { label: "Bucket",   value: s.bucket  },
                  { label: "Region",   value: s.region  },
                  { label: "Status",   value: s.status  },
                ].map((row) => (
                  <div key={row.label}>
                    <dt className="text-[11px] text-muted-foreground">{row.label}</dt>
                    <dd className="mt-0.5 text-xs font-medium font-mono">{row.value}</dd>
                  </div>
                ))}
              </dl>
            </CardContent>
          </Card>

          <div className="flex gap-2">
            <Button size="sm" variant="outline">
              <HugeiconsIcon icon={PencilEdit01Icon} className="size-3.5" strokeWidth={1.5} />
              Change provider
            </Button>
            <Button size="sm" variant="outline" className="text-destructive hover:bg-destructive/5 hover:text-destructive">
              Disconnect
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex h-36 flex-col items-center justify-center gap-3 rounded-xl border border-dashed">
          <HugeiconsIcon icon={CloudServerIcon} className="size-8 text-muted-foreground/30" strokeWidth={1} />
          <p className="text-sm text-muted-foreground">No provider connected</p>
          <Button size="sm">Connect provider</Button>
        </div>
      )}
    </div>
  )
}

// ─── Section: Permissions ──────────────────────────────────────────────────────

function PermissionsSection({
  workspace,
  onSave,
}: {
  workspace: ReturnType<typeof useWorkspace>["currentWorkspace"]
  onSave: (p: typeof workspace.permissions) => void
}) {
  const [perms, setPerms] = useState(workspace.permissions)
  const [saved, setSaved] = useState(false)

  const update = (key: keyof typeof perms, val: PermissionLevel) =>
    setPerms((prev) => ({ ...prev, [key]: val }))

  const handleSave = () => {
    onSave(perms)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const ROWS: { key: keyof typeof perms; label: string; description: string }[] = [
    { key: "canUpload",        label: "Upload files",      description: "Minimum role required to upload files"           },
    { key: "canCreateFolders", label: "Create folders",    description: "Minimum role required to create folders"         },
    { key: "canShareFiles",    label: "Share files",       description: "Minimum role required to create share links"     },
    { key: "canDeleteFiles",   label: "Delete files",      description: "Minimum role required to delete files"           },
    { key: "canManageBilling", label: "Manage billing",    description: "Minimum role required to manage billing"         },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-base font-semibold">Permissions</h2>
        <p className="mt-1 text-sm text-muted-foreground">Control what each role can do in this workspace.</p>
      </div>
      <Separator />

      <div className="space-y-3">
        {ROWS.map((row) => (
          <div key={row.key} className="flex items-center gap-4 rounded-lg border px-4 py-3">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">{row.label}</p>
              <p className="text-[11px] text-muted-foreground">{row.description}</p>
            </div>
            <Select value={perms[row.key]} onValueChange={(v) => update(row.key, v as PermissionLevel)}>
              <SelectTrigger className="h-7 w-28 text-xs shrink-0">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Owner">Owner only</SelectItem>
                <SelectItem value="Admin">Admin+</SelectItem>
                <SelectItem value="Member">Member+</SelectItem>
                <SelectItem value="Viewer">Everyone</SelectItem>
              </SelectContent>
            </Select>
          </div>
        ))}
      </div>

      <Button size="sm" onClick={handleSave}>
        {saved ? (
          <><HugeiconsIcon icon={CheckmarkCircle01Icon} className="size-3.5" strokeWidth={2} /> Saved</>
        ) : "Save permissions"}
      </Button>
    </div>
  )
}

// ─── Section: Security ─────────────────────────────────────────────────────────

function SecuritySection({
  workspace,
  onSave,
}: {
  workspace: ReturnType<typeof useWorkspace>["currentWorkspace"]
  onSave: (s: typeof workspace.security) => void
}) {
  const [sec, setSec] = useState(workspace.security)

  const toggle = (key: keyof typeof sec) => {
    const updated = { ...sec, [key]: !sec[key] }
    setSec(updated)
    onSave(updated)
  }

  const ROWS: { key: keyof typeof sec; label: string; description: string }[] = [
    { key: "requirePasswordForPublicLinks", label: "Require password for public links",  description: "Visitors must enter a password to access shared files"         },
    { key: "disablePublicSharing",          label: "Disable public sharing",             description: "Prevent all members from creating publicly accessible links"  },
    { key: "allowPrivateInviteSharing",     label: "Allow invite-only sharing",          description: "Members can share files with specific people by email"        },
    { key: "enableActivityLogs",            label: "Enable activity logs",               description: "Track uploads, shares, and deletions in the activity feed"    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-base font-semibold">Security</h2>
        <p className="mt-1 text-sm text-muted-foreground">Configure security and sharing policies.</p>
      </div>
      <Separator />

      <div className="space-y-3">
        {ROWS.map((row) => (
          <div key={row.key} className="flex items-center gap-4 rounded-lg border px-4 py-3">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">{row.label}</p>
              <p className="text-[11px] text-muted-foreground">{row.description}</p>
            </div>
            <Toggle value={sec[row.key]} onChange={() => toggle(row.key)} />
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Section: Billing ──────────────────────────────────────────────────────────

function BillingSection({
  workspace,
}: {
  workspace: ReturnType<typeof useWorkspace>["currentWorkspace"]
}) {
  const plans = [
    { name: "Free",  price: "$0/mo",  features: ["1 member", "5 GB storage", "Community support"]                           },
    { name: "Pro",   price: "$9/mo",  features: ["5 members", "50 GB storage", "Priority support", "Advanced analytics"]    },
    { name: "Team",  price: "$29/mo", features: ["Unlimited members", "500 GB storage", "SSO", "Audit logs", "SLA support"] },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-base font-semibold">Billing</h2>
        <p className="mt-1 text-sm text-muted-foreground">Manage your plan and billing settings.</p>
      </div>
      <Separator />

      {/* Current plan */}
      <div className="flex items-center gap-3 rounded-lg border bg-muted/20 px-4 py-3">
        <div>
          <p className="text-xs text-muted-foreground">Current plan</p>
          <p className="text-sm font-semibold">{workspace.plan}</p>
        </div>
        <Badge className={cn("ml-auto", PLAN_STYLE[workspace.plan])}>{workspace.plan}</Badge>
      </div>

      {/* Plans */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {plans.map((plan) => (
          <Card
            key={plan.name}
            className={cn(
              "relative transition-colors",
              workspace.plan === plan.name && "border-primary ring-1 ring-primary",
            )}
          >
            {workspace.plan === plan.name && (
              <Badge className="absolute right-3 top-3 text-[10px]">Current</Badge>
            )}
            <CardHeader className="pb-2 pt-4">
              <CardTitle className="text-sm">{plan.name}</CardTitle>
              <CardDescription className="text-base font-bold text-foreground">{plan.price}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-1 pb-4">
              {plan.features.map((f) => (
                <p key={f} className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                  <HugeiconsIcon icon={CheckmarkCircle01Icon} className="size-3 shrink-0 text-emerald-500" strokeWidth={2} />
                  {f}
                </p>
              ))}
              {workspace.plan !== plan.name && (
                <Button size="sm" variant="outline" className="mt-3 w-full">
                  {workspace.plan === "Free" || (workspace.plan === "Pro" && plan.name === "Team") ? "Upgrade" : "Downgrade"}
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Storage billing note */}
      <Card className="border-blue-500/20 bg-blue-500/5">
        <CardContent className="flex items-start gap-3 py-4">
          <HugeiconsIcon icon={InformationCircleIcon} className="mt-0.5 size-4 shrink-0 text-blue-500" strokeWidth={1.5} />
          <div>
            <p className="text-xs font-medium text-blue-700 dark:text-blue-400">No storage charges from BYOC</p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              Storage and bandwidth costs are billed directly by your connected cloud provider (AWS S3).
              BYOC only charges for platform access.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
        <HugeiconsIcon icon={UserCircle02Icon} className="size-3.5" strokeWidth={1.5} />
        Billing owner: <span className="font-medium text-foreground">{workspace.owner}</span>
      </div>
    </div>
  )
}

// ─── Section: Danger Zone ──────────────────────────────────────────────────────

function DangerSection({
  workspace,
  onDelete,
}: {
  workspace: ReturnType<typeof useWorkspace>["currentWorkspace"]
  onDelete: () => void
}) {
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleteInput, setDeleteInput]     = useState("")

  const ACTIONS = [
    {
      label:       "Transfer ownership",
      description: "Transfer this workspace to another member. You will lose owner privileges.",
      button:      "Transfer",
      variant:     "outline" as const,
      destructive: false,
    },
    {
      label:       "Leave workspace",
      description: "Remove yourself from this workspace. You will lose access to all files.",
      button:      "Leave workspace",
      variant:     "outline" as const,
      destructive: true,
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-base font-semibold">Danger Zone</h2>
        <p className="mt-1 text-sm text-muted-foreground">Irreversible actions — proceed with caution.</p>
      </div>
      <Separator />

      <div className="space-y-3">
        {ACTIONS.map((action) => (
          <div key={action.label} className="flex flex-col gap-3 rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-4 sm:flex-row sm:items-center">
            <div className="flex-1">
              <p className="text-sm font-medium">{action.label}</p>
              <p className="text-[11px] text-muted-foreground">{action.description}</p>
            </div>
            <Button
              size="sm"
              variant={action.variant}
              className={cn(action.destructive && "border-destructive/40 text-destructive hover:bg-destructive/10")}
            >
              {action.button}
            </Button>
          </div>
        ))}

        {/* Delete — with confirmation */}
        <div className="rounded-lg border border-destructive/40 bg-destructive/5 px-4 py-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-destructive">Delete workspace</p>
              <p className="text-[11px] text-muted-foreground">
                Permanently delete <strong>{workspace.name}</strong> and all its data. This cannot be undone.
              </p>
            </div>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => setConfirmDelete(true)}
            >
              <HugeiconsIcon icon={Delete01Icon} className="size-3.5" strokeWidth={1.5} />
              Delete workspace
            </Button>
          </div>

          {confirmDelete && (
            <div className="mt-4 space-y-3 border-t border-destructive/20 pt-4">
              <p className="text-xs text-muted-foreground">
                Type <strong className="text-foreground">{workspace.name}</strong> to confirm deletion.
              </p>
              <div className="flex gap-2">
                <Input
                  placeholder={workspace.name}
                  value={deleteInput}
                  onChange={(e) => setDeleteInput(e.target.value)}
                  className="h-8 text-sm"
                />
                <Button
                  size="sm"
                  variant="destructive"
                  disabled={deleteInput !== workspace.name}
                  onClick={onDelete}
                >
                  Confirm
                </Button>
                <Button size="sm" variant="ghost" onClick={() => { setConfirmDelete(false); setDeleteInput("") }}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function WorkspaceSettingsPage({
  params,
}: {
  params: Promise<{ workspaceId: string }>
}) {
  const { workspaceId } = use(params)
  const router = useRouter()
  const { workspaces, switchWorkspace, updateWorkspace, updateMembers, updatePermissions, updateSecurity } =
    useWorkspace()

  const workspace = workspaces.find((w) => w.id === workspaceId)
  const [section, setSection] = useState<Section>("overview")

  if (!workspace) {
    return (
      <div className="flex h-40 items-center justify-center">
        <p className="text-sm text-muted-foreground">Workspace not found.</p>
      </div>
    )
  }

  const handleDelete = () => {
    const fallback = workspaces.find((w) => w.id !== workspace.id)
    if (fallback) switchWorkspace(fallback.id)
    router.push("/app")
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Page header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} className="size-4" strokeWidth={2} />
        </button>
        <div className="flex items-center gap-2.5">
          <div className={cn("flex size-7 items-center justify-center rounded-md text-xs font-bold text-white", workspace.color)}>
            {workspace.name.charAt(0)}
          </div>
          <div>
            <h1 className="text-base font-semibold leading-none">{workspace.name}</h1>
            <p className="mt-0.5 text-[11px] text-muted-foreground">Workspace Settings</p>
          </div>
        </div>
        <Badge className={cn("ml-2", PLAN_STYLE[workspace.plan])}>{workspace.plan}</Badge>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row lg:gap-10">
        {/* Left nav */}
        <nav className="flex shrink-0 flex-row gap-1 overflow-x-auto lg:w-44 lg:flex-col">
          {SECTIONS.map((s) => (
            <button
              key={s.id}
              onClick={() => setSection(s.id)}
              className={cn(
                "whitespace-nowrap rounded-md px-3 py-1.5 text-left text-sm transition-colors",
                s.id === "danger" && "mt-0 lg:mt-auto text-destructive hover:bg-destructive/10",
                s.id !== "danger" && (
                  section === s.id
                    ? "bg-accent font-medium text-foreground"
                    : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
                ),
              )}
            >
              {s.label}
            </button>
          ))}
        </nav>

        {/* Content */}
        <div className="min-w-0 flex-1">
          {section === "overview"    && <OverviewSection     workspace={workspace} />}
          {section === "general"     && <GeneralSection      workspace={workspace} onSave={(name, slug) => updateWorkspace(workspace.id, { name, slug })} />}
          {section === "members"     && <MembersSection      workspace={workspace} onUpdateMembers={(m) => updateMembers(workspace.id, m)} />}
          {section === "storage"     && <StorageSection      workspace={workspace} />}
          {section === "permissions" && <PermissionsSection  workspace={workspace} onSave={(p) => updatePermissions(workspace.id, p)} />}
          {section === "security"    && <SecuritySection     workspace={workspace} onSave={(s) => updateSecurity(workspace.id, s)} />}
          {section === "billing"     && <BillingSection      workspace={workspace} />}
          {section === "danger"      && <DangerSection       workspace={workspace} onDelete={handleDelete} />}
        </div>
      </div>
    </div>
  )
}
