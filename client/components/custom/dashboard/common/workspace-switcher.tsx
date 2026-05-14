"use client"

import { useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ArrowDown01Icon,
  CheckmarkCircle01Icon,
  Settings01Icon,
  Add01Icon,
  UserCircle02Icon,
} from "@hugeicons/core-free-icons"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { useSubscriptionSnapshot } from "@/lib/subscription"
import { UpgradeTooltip } from "@/components/custom/subscription/upgrade-tooltip"
import {
  useWorkspace,
  type CreateWorkspaceData,
  type WorkspaceType,
} from "@/lib/workspace-context"

// ─── Plan badge ────────────────────────────────────────────────────────────────

const PLAN_BADGE: Record<string, string> = {
  Free: "bg-muted text-muted-foreground",
  Pro:  "bg-blue-500/10 text-blue-600",
  Team: "bg-violet-500/10 text-violet-600",
}

// ─── Create Workspace Dialog ───────────────────────────────────────────────────

function CreateWorkspaceDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const { createWorkspace, switchWorkspace } = useWorkspace()
  const { subscription, checks, loading } = useSubscriptionSnapshot()
  const router = useRouter()

  const [name, setName]   = useState("")
  const [slug, setSlug]   = useState("")
  const [type, setType]   = useState<WorkspaceType>("Personal")
  const [slugTouched, setSlugTouched] = useState(false)

  const derivedSlug = slugTouched ? slug : name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")

  const handleNameChange = (v: string) => {
    setName(v)
    if (!slugTouched) setSlug(v.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""))
  }

  const handleCreate = async () => {
    if (!name.trim()) return
    const data: CreateWorkspaceData = { name: name.trim(), slug: derivedSlug || name.toLowerCase().replace(/\s+/g, "-"), type }
    const id = await createWorkspace(data)
    onOpenChange(false)
    setName(""); setSlug(""); setType("Personal"); setSlugTouched(false)
    if (id) switchWorkspace(id)
    router.push(`/app`)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create workspace</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="ws-name" className="text-xs font-medium">Workspace name</Label>
            <Input
              id="ws-name"
              placeholder="My Workspace"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              className="h-8 text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="ws-slug" className="text-xs font-medium">Slug</Label>
            <div className="flex items-center gap-0">
              <span className="flex h-8 items-center rounded-l-md border border-r-0 bg-muted px-2.5 text-xs text-muted-foreground">
                byoc.app/
              </span>
              <Input
                id="ws-slug"
                placeholder="my-workspace"
                value={derivedSlug}
                onChange={(e) => { setSlugTouched(true); setSlug(e.target.value) }}
                className="h-8 rounded-l-none text-sm"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Workspace type</Label>
            <Select value={type} onValueChange={(v) => setType(v as WorkspaceType)}>
              <SelectTrigger className="h-8 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Personal">Personal</SelectItem>
                <SelectItem value="Student">Student</SelectItem>
                <SelectItem value="Startup">Startup</SelectItem>
                <SelectItem value="Team">Team</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>Cancel</Button>
          <UpgradeTooltip
            disabled={!checks.canCreateWorkspace || loading}
            message={`Upgrade to Pro to create more workspaces. Current plan: ${subscription?.plan ?? "Free"}.`}
          >
            <Button
              size="sm"
              disabled={!name.trim() || !checks.canCreateWorkspace || loading}
              onClick={handleCreate}
            >
              Create workspace
            </Button>
          </UpgradeTooltip>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── Workspace Switcher ────────────────────────────────────────────────────────

export function WorkspaceSwitcher() {
  const { workspaces, currentWorkspace, switchWorkspace } = useWorkspace()
  const { subscription, checks, loading } = useSubscriptionSnapshot()
  const { state } = useSidebar()
  const router = useRouter()
  const pathname = usePathname()
  const [createOpen, setCreateOpen] = useState(false)

  const isCollapsed = state === "collapsed"

  const handleSwitch = (id: string) => {
    switchWorkspace(id)
    // If on a workspace-specific page, navigate to the same page for the new workspace
    const wsSettingsMatch = /^\/app\/workspaces\/([^/]+)(.*)$/.exec(pathname)
    if (wsSettingsMatch) {
      const rest = wsSettingsMatch[2] ?? ""
      router.push(`/app/workspaces/${id}${rest}`)
    }
  }

  if (!currentWorkspace) {
    return (
      <>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" disabled className="opacity-50">
              <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-muted" />
              <span className="text-sm text-muted-foreground">Loading…</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <CreateWorkspaceDialog open={createOpen} onOpenChange={setCreateOpen} />
      </>
    )
  }

  return (
    <>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                tooltip={currentWorkspace.name}
                className="data-[state=open]:bg-sidebar-accent"
              >
                {/* Avatar chip */}
                <div className={cn(
                  "flex size-7 shrink-0 items-center justify-center rounded-md text-[11px] font-bold text-white",
                  currentWorkspace.color,
                )}>
                  {currentWorkspace.name.charAt(0)}
                </div>

                {/* Name + plan (hidden when collapsed) */}
                <div className="flex min-w-0 flex-1 flex-col text-left leading-none">
                  <span className="truncate text-sm font-medium">{currentWorkspace.name}</span>
                  <span className="text-[11px] text-muted-foreground">{currentWorkspace.plan} plan</span>
                </div>

                {/* Chevron */}
                <HugeiconsIcon
                  icon={ArrowDown01Icon}
                  className="ml-auto size-3.5 shrink-0 text-muted-foreground"
                  strokeWidth={2}
                />
              </SidebarMenuButton>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              side={isCollapsed ? "right" : "bottom"}
              align="start"
              className="w-64"
            >
              {/* Current workspace info */}
              <DropdownMenuLabel className="font-normal">
                <div className="flex items-center gap-2.5">
                  <div className={cn("flex size-8 shrink-0 items-center justify-center rounded-md text-xs font-bold text-white", currentWorkspace.color)}>
                    {currentWorkspace.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{currentWorkspace.name}</p>
                    <p className="truncate text-[11px] text-muted-foreground">{currentWorkspace.ownerEmail}</p>
                  </div>
                  <Badge className={cn("ml-auto shrink-0 text-[10px]", PLAN_BADGE[currentWorkspace.plan])}>
                    {currentWorkspace.plan}
                  </Badge>
                </div>
              </DropdownMenuLabel>

              <DropdownMenuSeparator />

              {/* Workspace list */}
              <DropdownMenuLabel className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Workspaces
              </DropdownMenuLabel>
              {workspaces.map((ws) => (
                <DropdownMenuItem
                  key={ws.id}
                  onClick={() => handleSwitch(ws.id)}
                  className="gap-2.5"
                >
                  <div className={cn("flex size-6 shrink-0 items-center justify-center rounded text-[10px] font-bold text-white", ws.color)}>
                    {ws.name.charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-medium">{ws.name}</p>
                    <p className="text-[10px] text-muted-foreground">{ws.members.length} member{ws.members.length !== 1 ? "s" : ""}</p>
                  </div>
                  {ws.id === currentWorkspace.id && (
                    <HugeiconsIcon icon={CheckmarkCircle01Icon} className="size-3.5 shrink-0 text-primary" strokeWidth={2} />
                  )}
                </DropdownMenuItem>
              ))}

              <DropdownMenuSeparator />

              {/* Actions */}
              <DropdownMenuItem
                className="gap-2"
                onClick={() => router.push(`/app/workspaces/${currentWorkspace.id}/settings`)}
              >
                <HugeiconsIcon icon={Settings01Icon} className="size-3.5" strokeWidth={1.5} />
                Manage workspace
              </DropdownMenuItem>
              <UpgradeTooltip
                disabled={!checks.canCreateWorkspace || loading}
                message={`Upgrade to Pro to create more workspaces. You are currently on the ${subscription?.plan ?? "Free"} plan.`}
                className="w-full"
              >
                <DropdownMenuItem
                  className={cn("gap-2", (!checks.canCreateWorkspace || loading) && "pointer-events-none opacity-60")}
                  onClick={() => setCreateOpen(true)}
                >
                  <HugeiconsIcon icon={Add01Icon} className="size-3.5" strokeWidth={2} />
                  Create new workspace
                </DropdownMenuItem>
              </UpgradeTooltip>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>

      <CreateWorkspaceDialog open={createOpen} onOpenChange={setCreateOpen} />
    </>
  )
}
