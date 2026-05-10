"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Notification01Icon,
  Share01Icon,
  FileUploadIcon,
  Delete01Icon,
  LinkSquare01Icon,
  UserCircle02Icon,
  CloudServerIcon,
  LockedIcon,
  Settings01Icon,
  CheckmarkCircle01Icon,
  Cancel01Icon,
  InformationCircleIcon,
} from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

// ─── Types ─────────────────────────────────────────────────────────────────────

type NotifType =
  | "file_shared" | "file_uploaded" | "file_deleted"
  | "link_expired" | "link_created"
  | "member_joined"
  | "storage_warning"
  | "security"
  | "system"

type FilterKey = "all" | "unread" | "files" | "members" | "security" | "system"

interface Notif {
  id: string
  type: NotifType
  title: string
  description: string
  timestamp: string
  timestampMs: number
  read: boolean
  workspace: string
  actor?: string
}

// ─── Visual config ─────────────────────────────────────────────────────────────

const TYPE_VISUAL: Record<
  NotifType,
  { icon: typeof Share01Icon; color: string; bg: string; filterKey: Exclude<FilterKey, "all" | "unread"> }
> = {
  file_shared:     { icon: Share01Icon,      color: "text-violet-500", bg: "bg-violet-500/10", filterKey: "files"    },
  file_uploaded:   { icon: FileUploadIcon,   color: "text-blue-500",   bg: "bg-blue-500/10",   filterKey: "files"    },
  file_deleted:    { icon: Delete01Icon,     color: "text-rose-500",   bg: "bg-rose-500/10",   filterKey: "files"    },
  link_expired:    { icon: LinkSquare01Icon, color: "text-slate-500",  bg: "bg-slate-500/10",  filterKey: "files"    },
  link_created:    { icon: LinkSquare01Icon, color: "text-violet-500", bg: "bg-violet-500/10", filterKey: "files"    },
  member_joined:   { icon: UserCircle02Icon, color: "text-emerald-500",bg: "bg-emerald-500/10",filterKey: "members"  },
  storage_warning: { icon: CloudServerIcon,  color: "text-amber-500",  bg: "bg-amber-500/10",  filterKey: "system"   },
  security:        { icon: LockedIcon,       color: "text-rose-500",   bg: "bg-rose-500/10",   filterKey: "security" },
  system:          { icon: Settings01Icon,   color: "text-slate-500",  bg: "bg-slate-500/10",  filterKey: "system"   },
}

// ─── Dummy data ────────────────────────────────────────────────────────────────

const NOW = Date.now()
const H   = 3_600_000
const D   = 86_400_000

const INITIAL: Notif[] = [
  // Today
  { id: "n1",  type: "file_shared",     title: "Priya Sharma shared a file with you",        description: "invoice-may-2026.pdf in Finance",                              timestamp: "2 minutes ago",       timestampMs: NOW - 2*60*1000,    read: false, workspace: "College Project",      actor: "Priya Sharma"  },
  { id: "n2",  type: "security",         title: "New sign-in from Mumbai",                    description: "Chrome on MacBook Pro · Mumbai, India",                         timestamp: "15 minutes ago",      timestampMs: NOW - 15*60*1000,   read: false, workspace: "Personal Workspace"                   },
  { id: "n3",  type: "member_joined",    title: "Ishaan Kapoor joined Client Assets",         description: "Ishaan accepted your invite and is now a Member",               timestamp: "1 hour ago",          timestampMs: NOW - H,            read: false, workspace: "Client Assets",        actor: "Ishaan Kapoor" },
  { id: "n4",  type: "file_uploaded",    title: "6 files uploaded to Marketing",              description: "product-launch.mp4 and 5 others were added",                   timestamp: "2 hours ago",         timestampMs: NOW - 2*H,          read: true,  workspace: "Startup Team"                         },
  { id: "n5",  type: "storage_warning",  title: "Storage at 80% — Personal Workspace",       description: "You've used 102.4 GB of 128 GB. Consider upgrading.",           timestamp: "3 hours ago",         timestampMs: NOW - 3*H,          read: false, workspace: "Personal Workspace"                   },
  { id: "n6",  type: "link_created",     title: "Share link created for pitch-deck.pptx",    description: "Shared publicly · Expires in 7 days",                           timestamp: "5 hours ago",         timestampMs: NOW - 5*H,          read: true,  workspace: "Startup Team"                         },
  // Yesterday
  { id: "n7",  type: "member_joined",    title: "Dev Bose joined Startup Team",               description: "Dev accepted your invite and is now a Viewer",                  timestamp: "Yesterday, 2:10 PM",  timestampMs: NOW - D - 2*H,      read: true,  workspace: "Startup Team",         actor: "Dev Bose"      },
  { id: "n8",  type: "file_shared",      title: "Ananya Roy shared a folder with you",        description: "Marketing Assets in Startup Team",                              timestamp: "Yesterday, 11:05 AM", timestampMs: NOW - D - 4*H,      read: true,  workspace: "Startup Team",         actor: "Ananya Roy"    },
  { id: "n9",  type: "file_deleted",     title: "Rohan Verma deleted 3 files",                description: "old-invoice.pdf, draft-v1.docx, temp-data.xlsx from Finance",   timestamp: "Yesterday, 9:30 AM",  timestampMs: NOW - D - 5*H,      read: false, workspace: "Client Assets",        actor: "Rohan Verma"   },
  { id: "n10", type: "system",           title: "Platform update · v2.4.0 deployed",          description: "Bulk operations, improved search filters, and performance fixes",timestamp: "Yesterday, 9:00 AM",  timestampMs: NOW - D - 6*H,      read: true,  workspace: "All workspaces"                       },
  // This week
  { id: "n11", type: "security",         title: "API key used from new IP address",           description: "CI/CD Key · 203.0.113.42 · Hyderabad, India",                  timestamp: "May 8, 2026",         timestampMs: NOW - 2*D,          read: false, workspace: "Personal Workspace"                   },
  { id: "n12", type: "link_expired",     title: "Share link expired",                         description: "employee-handbook.pdf link expired. Renew to restore access.",  timestamp: "May 7, 2026",         timestampMs: NOW - 3*D,          read: true,  workspace: "Client Assets"                        },
  { id: "n13", type: "storage_warning",  title: "Storage at 95% — Startup Team",             description: "You've used 47.5 GB of 50 GB. Upgrade to add more storage.",   timestamp: "May 6, 2026",         timestampMs: NOW - 4*D,          read: false, workspace: "Startup Team"                         },
  { id: "n14", type: "file_uploaded",    title: "Tanya Singh uploaded 12 files",              description: "client-assets-batch.zip and 11 others in Client Assets",        timestamp: "May 5, 2026",         timestampMs: NOW - 5*D,          read: true,  workspace: "Client Assets",        actor: "Tanya Singh"   },
  { id: "n15", type: "member_joined",    title: "Maya Nair joined Client Assets",             description: "Maya accepted your invite and is now an Admin",                 timestamp: "May 4, 2026",         timestampMs: NOW - 6*D,          read: true,  workspace: "Client Assets",        actor: "Maya Nair"     },
  // Earlier
  { id: "n16", type: "system",           title: "Your data export is ready",                  description: "Account data from Apr 28 is ready to download.",                timestamp: "Apr 30, 2026",        timestampMs: NOW - 10*D,         read: true,  workspace: "All workspaces"                       },
  { id: "n17", type: "file_shared",      title: "Rahul Patel shared a file with you",         description: "client-contacts.xlsx in Sales",                                 timestamp: "Apr 25, 2026",        timestampMs: NOW - 15*D,         read: true,  workspace: "Startup Team",         actor: "Rahul Patel"   },
  { id: "n18", type: "link_expired",     title: "Share link expired",                         description: "project-proposal.pdf link expired after 30 days.",              timestamp: "Apr 22, 2026",        timestampMs: NOW - 18*D,         read: true,  workspace: "Personal Workspace"                   },
  { id: "n19", type: "security",         title: "Password changed successfully",               description: "Your account password was updated from Mumbai, India.",         timestamp: "Apr 15, 2026",        timestampMs: NOW - 25*D,         read: true,  workspace: "Personal Workspace"                   },
  { id: "n20", type: "file_uploaded",    title: "Bulk sync complete — 28 files",              description: "Local sync uploaded 28 files to Personal Workspace",             timestamp: "Apr 10, 2026",        timestampMs: NOW - 30*D,         read: true,  workspace: "Personal Workspace"                   },
]

// ─── Filter config ─────────────────────────────────────────────────────────────

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "all",      label: "All"      },
  { key: "unread",   label: "Unread"   },
  { key: "files",    label: "Files"    },
  { key: "members",  label: "Members"  },
  { key: "security", label: "Security" },
  { key: "system",   label: "System"   },
]

function matchesFilter(n: Notif, filter: FilterKey): boolean {
  if (filter === "all")    return true
  if (filter === "unread") return !n.read
  return TYPE_VISUAL[n.type].filterKey === filter
}

// ─── Date grouping ─────────────────────────────────────────────────────────────

function groupNotifications(items: Notif[]) {
  const todayStart     = new Date().setHours(0, 0, 0, 0)
  const yesterdayStart = todayStart - D
  const weekStart      = todayStart - 6 * D

  const groups: { label: string; items: Notif[] }[] = [
    { label: "Today",     items: [] },
    { label: "Yesterday", items: [] },
    { label: "This week", items: [] },
    { label: "Earlier",   items: [] },
  ]

  for (const n of items) {
    if      (n.timestampMs >= todayStart)     groups[0].items.push(n)
    else if (n.timestampMs >= yesterdayStart) groups[1].items.push(n)
    else if (n.timestampMs >= weekStart)      groups[2].items.push(n)
    else                                      groups[3].items.push(n)
  }

  return groups.filter((g) => g.items.length > 0)
}

// ─── Notification row ──────────────────────────────────────────────────────────

function NotifRow({
  notif,
  onMarkRead,
  onDismiss,
}: {
  notif: Notif
  onMarkRead: (id: string) => void
  onDismiss: (id: string) => void
}) {
  const v = TYPE_VISUAL[notif.type]

  return (
    <div
      className={cn(
        "group relative flex items-start gap-3 px-5 py-4 transition-colors hover:bg-accent/40",
        !notif.read && "bg-primary/[0.03]",
      )}
    >
      {/* Unread dot */}
      <span
        className={cn(
          "mt-2 size-1.5 shrink-0 rounded-full transition-opacity",
          notif.read ? "opacity-0" : "bg-primary",
        )}
      />

      {/* Icon chip */}
      <div className={cn("flex size-9 shrink-0 items-center justify-center rounded-xl", v.bg)}>
        <HugeiconsIcon icon={v.icon} className={cn("size-4", v.color)} strokeWidth={1.5} />
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <p className={cn("text-sm leading-snug", !notif.read && "font-medium")}>{notif.title}</p>
        <p className="mt-0.5 text-[11px] text-muted-foreground leading-snug">{notif.description}</p>
        <div className="mt-1.5 flex items-center gap-2">
          <Badge variant="secondary" className="px-1.5 py-0 text-[10px]">{notif.workspace}</Badge>
          <span className="text-[11px] text-muted-foreground">{notif.timestamp}</span>
        </div>
      </div>

      {/* Hover actions */}
      <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
        {!notif.read && (
          <button
            onClick={() => onMarkRead(notif.id)}
            title="Mark as read"
            className="flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <HugeiconsIcon icon={CheckmarkCircle01Icon} className="size-3.5" strokeWidth={1.5} />
          </button>
        )}
        <button
          onClick={() => onDismiss(notif.id)}
          title="Dismiss"
          className="flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <HugeiconsIcon icon={Cancel01Icon} className="size-3.5" strokeWidth={2} />
        </button>
      </div>
    </div>
  )
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function NotificationsPage() {
  const [notifs,      setNotifs]      = useState<Notif[]>(INITIAL)
  const [activeFilter, setActiveFilter] = useState<FilterKey>("all")

  const markRead    = (id: string) => setNotifs((p) => p.map((n) => n.id === id ? { ...n, read: true } : n))
  const markAllRead = ()          => setNotifs((p) => p.map((n) => ({ ...n, read: true })))
  const dismiss     = (id: string) => setNotifs((p) => p.filter((n) => n.id !== id))
  const dismissAll  = ()           => setNotifs((p) => p.filter((n) => !matchesFilter(n, activeFilter)))

  const filtered = useMemo(
    () => notifs.filter((n) => matchesFilter(n, activeFilter)),
    [notifs, activeFilter],
  )

  const grouped = useMemo(() => groupNotifications(filtered), [filtered])

  const counts = useMemo(() => {
    const c: Record<FilterKey, number> = { all: 0, unread: 0, files: 0, members: 0, security: 0, system: 0 }
    for (const n of notifs) {
      c.all++
      if (!n.read) c.unread++
      c[TYPE_VISUAL[n.type].filterKey]++
    }
    return c
  }, [notifs])

  const unreadCount = counts.unread

  return (
    <div className="flex flex-col gap-5">

      {/* ── Header ── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10">
            <HugeiconsIcon icon={Notification01Icon} className="size-4.5 text-primary" strokeWidth={1.5} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-semibold tracking-tight">Notifications</h1>
              {unreadCount > 0 && (
                <Badge className="bg-primary text-primary-foreground text-[10px] px-1.5 py-0">
                  {unreadCount}
                </Badge>
              )}
            </div>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {unreadCount > 0 ? `${unreadCount} unread` : "All caught up"} · {notifs.length} total
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {unreadCount > 0 && (
            <Button size="sm" variant="outline" onClick={markAllRead}>
              <HugeiconsIcon icon={CheckmarkCircle01Icon} className="size-3.5" strokeWidth={1.5} />
              Mark all read
            </Button>
          )}
          <Button size="sm" variant="ghost" asChild>
            <Link href="/app/settings">
              <HugeiconsIcon icon={Settings01Icon} className="size-3.5" strokeWidth={1.5} />
              <span className="hidden sm:inline">Notification settings</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* ── Filter tabs ── */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setActiveFilter(f.key)}
            className={cn(
              "flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1 text-xs transition-colors",
              activeFilter === f.key
                ? "border-foreground bg-foreground text-background"
                : "text-muted-foreground hover:bg-accent hover:text-foreground",
            )}
          >
            {f.label}
            {counts[f.key] > 0 && (
              <span className={cn(
                "tabular-nums",
                activeFilter === f.key ? "text-background/70" : "text-muted-foreground",
              )}>
                {counts[f.key]}
              </span>
            )}
          </button>
        ))}

        {filtered.length > 0 && (
          <button
            onClick={dismissAll}
            className="ml-auto shrink-0 text-[11px] text-muted-foreground transition-colors hover:text-destructive"
          >
            Clear {activeFilter === "all" ? "all" : "filtered"}
          </button>
        )}
      </div>

      {/* ── List ── */}
      {filtered.length === 0 ? (
        <div className="flex h-52 flex-col items-center justify-center gap-2 rounded-xl border border-dashed">
          <div className="flex size-10 items-center justify-center rounded-xl bg-muted">
            <HugeiconsIcon icon={Notification01Icon} className="size-5 text-muted-foreground/50" strokeWidth={1} />
          </div>
          <p className="text-sm font-medium text-muted-foreground">
            {activeFilter === "unread" ? "No unread notifications" : "No notifications"}
          </p>
          {activeFilter !== "all" && (
            <button
              onClick={() => setActiveFilter("all")}
              className="text-xs text-primary hover:underline"
            >
              View all notifications
            </button>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border">
          {grouped.map((group, gi) => (
            <div key={group.label}>
              {/* Group header */}
              <div className={cn(
                "flex items-center gap-3 bg-muted/30 px-5 py-2",
                gi > 0 && "border-t",
              )}>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {group.label}
                </span>
                <span className="text-[11px] text-muted-foreground">
                  {group.items.filter((n) => !n.read).length > 0
                    ? `${group.items.filter((n) => !n.read).length} unread`
                    : `${group.items.length} notification${group.items.length !== 1 ? "s" : ""}`}
                </span>
              </div>

              {/* Notifications */}
              {group.items.map((n, i) => (
                <div key={n.id} className={cn(i > 0 && "border-t")}>
                  <NotifRow notif={n} onMarkRead={markRead} onDismiss={dismiss} />
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* ── Billing-style info note ── */}
      {notifs.length > 0 && (
        <div className="flex items-start gap-2.5 rounded-xl border border-blue-500/20 bg-blue-500/5 px-4 py-3">
          <HugeiconsIcon icon={InformationCircleIcon} className="mt-0.5 size-3.5 shrink-0 text-blue-500" strokeWidth={1.5} />
          <p className="text-[11px] text-muted-foreground">
            Notifications are retained for <strong className="text-foreground">30 days</strong>.
            Manage what you receive in{" "}
            <Link href="/app/settings" className="text-primary hover:underline">
              Notification settings
            </Link>.
          </p>
        </div>
      )}
    </div>
  )
}
