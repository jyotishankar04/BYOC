"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  DashboardSquare02Icon,
  Folder01Icon,
  Image01Icon,
  LegalDocument01Icon,
  Video01Icon,
  LinkSquare01Icon,
  Analytics01Icon,
  Plug01Icon,
  CreditCardIcon,
  CalculatorIcon,
  Settings01Icon,
  HardDriveIcon,
  CloudUploadIcon,
  Search01Icon,
  Notification01Icon,
  CloudServerIcon,
  FolderAddIcon,
} from "@hugeicons/core-free-icons";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

// ─── Types ─────────────────────────────────────────────────────────────────────

type HugeIcon = Parameters<typeof HugeiconsIcon>[0]["icon"];

// ─── Data ──────────────────────────────────────────────────────────────────────

const STATS = [
  { label: "Total Storage Used", value: "14.8 GB", icon: HardDriveIcon,   color: "text-violet-500", bg: "bg-violet-500/10" },
  { label: "Total Files",        value: "2,847",   icon: Folder01Icon,     color: "text-blue-500",   bg: "bg-blue-500/10"   },
  { label: "Active Share Links", value: "12",       icon: LinkSquare01Icon, color: "text-emerald-500",bg: "bg-emerald-500/10"},
  { label: "Uploads This Week",  value: "48",       icon: CloudUploadIcon,  color: "text-amber-500",  bg: "bg-amber-500/10"  },
];

const STORAGE_KINDS = [
  { label: "Images",    pct: 42, size: "6.2 GB", dot: "bg-violet-500", bar: "[&>[data-slot=progress-indicator]]:bg-violet-500" },
  { label: "Videos",   pct: 34, size: "5.1 GB", dot: "bg-blue-500",   bar: "[&>[data-slot=progress-indicator]]:bg-blue-500"   },
  { label: "Documents",pct: 15, size: "2.3 GB", dot: "bg-amber-500",  bar: "[&>[data-slot=progress-indicator]]:bg-amber-500"  },
  { label: "Archives", pct:  9, size: "1.2 GB", dot: "bg-cyan-500",   bar: "[&>[data-slot=progress-indicator]]:bg-cyan-500"   },
];

const QUICK_ACTIONS = [
  { label: "Upload File",   desc: "Add files to bucket",  icon: CloudUploadIcon  },
  { label: "New Folder",    desc: "Organize with folders", icon: FolderAddIcon    },
  { label: "Share Link",    desc: "Share files securely",  icon: LinkSquare01Icon },
  { label: "Analytics",     desc: "Storage insights",      icon: Analytics01Icon  },
];

const RECENT_FILES = [
  { name: "hero-banner.jpg",      size: "2.4 MB",  when: "Today, 9:12 AM" },
  { name: "db-snapshot.tar.gz",   size: "420 MB",  when: "Yesterday"      },
  { name: "analytics-june.csv",   size: "840 KB",  when: "3 days ago"     },
];

const NAV_MAIN: { label: string; icon: HugeIcon; active?: boolean }[] = [
  { label: "Dashboard",    icon: DashboardSquare02Icon, active: true },
  { label: "Files",        icon: Folder01Icon           },
  { label: "Gallery",      icon: Image01Icon            },
  { label: "Documents",    icon: LegalDocument01Icon    },
  { label: "Videos",       icon: Video01Icon            },
  { label: "Shared Links", icon: LinkSquare01Icon       },
];

const NAV_MANAGE: { label: string; icon: HugeIcon }[] = [
  { label: "Analytics",      icon: Analytics01Icon },
  { label: "Usage & Pricing",icon: CalculatorIcon  },
  { label: "Integrations",   icon: Plug01Icon      },
  { label: "Billing",        icon: CreditCardIcon  },
  { label: "Settings",       icon: Settings01Icon  },
];

// ─── Sub-components ────────────────────────────────────────────────────────────

function NavItem({ icon, label, active }: { icon: HugeIcon; label: string; active?: boolean }) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs cursor-default select-none",
        active
          ? "bg-accent text-accent-foreground font-medium"
          : "text-muted-foreground"
      )}
    >
      <HugeiconsIcon icon={icon} className="size-3.5 shrink-0" strokeWidth={1.5} />
      <span className="truncate">{label}</span>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function HeroPreview() {
  return (
    <div className="mx-auto mt-16 max-w-6xl px-4">
      <div className="rounded-2xl border border-border overflow-hidden shadow-xl shadow-black/5 dark:shadow-black/40 bg-card">

        {/* Top navbar */}
        <div className="flex h-12 shrink-0 items-center gap-2 border-b border-border bg-background/95 px-4">
          {/* Brand */}
          <div className="flex w-[156px] shrink-0 items-center gap-2">
            <div className="flex size-6 items-center justify-center rounded-md bg-foreground">
              <svg className="size-3.5 text-background fill-current" viewBox="0 0 24 24">
                <path d="M19.35 10.04A7.49 7.49 0 0012 4C9.11 4 6.6 5.64 5.35 8.04A5.994 5.994 0 000 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z" />
              </svg>
            </div>
            <span className="text-sm font-semibold tracking-tight text-foreground">BringBucket</span>
          </div>

          <Separator orientation="vertical" className="h-4" />

          {/* Search */}
          <div className="relative flex max-w-xs flex-1 items-center">
            <HugeiconsIcon
              icon={Search01Icon}
              className="absolute left-2.5 size-3.5 text-muted-foreground pointer-events-none"
              strokeWidth={1.5}
            />
            <div className="flex h-8 w-full items-center rounded-md border border-transparent bg-muted/50 pl-8 pr-3">
              <span className="text-xs text-muted-foreground">Search files and folders...</span>
            </div>
          </div>

          <div className="ml-auto flex items-center gap-1.5">
            {/* Upload button */}
            <div className="flex h-8 cursor-default items-center gap-1.5 rounded-md bg-primary px-3 text-xs font-medium text-primary-foreground">
              <HugeiconsIcon icon={CloudUploadIcon} className="size-3.5" strokeWidth={1.5} />
              Upload
            </div>

            {/* Notification bell */}
            <div className="relative flex size-8 cursor-default items-center justify-center rounded-md">
              <HugeiconsIcon icon={Notification01Icon} className="size-4 text-muted-foreground" strokeWidth={1.5} />
              <span className="absolute right-1.5 top-1.5 size-1.5 rounded-full bg-primary" />
            </div>

            {/* User avatar */}
            <div className="flex size-7 items-center justify-center rounded-full bg-emerald-500/20 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
              AK
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="grid grid-cols-[156px_1fr] min-h-[440px]">

          {/* Sidebar */}
          <aside className="flex flex-col border-r border-border bg-card py-3 px-2">
            <div className="flex flex-col gap-0.5">
              {NAV_MAIN.map((item) => (
                <NavItem key={item.label} icon={item.icon} label={item.label} active={item.active} />
              ))}
            </div>

            <div className="px-2.5 pb-1 pt-4">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
                Manage
              </p>
            </div>

            <div className="flex flex-col gap-0.5">
              {NAV_MANAGE.map((item) => (
                <NavItem key={item.label} icon={item.icon} label={item.label} />
              ))}
            </div>

            {/* User footer */}
            <div className="mt-auto pt-3">
              <Separator className="mb-3" />
              <div className="flex items-center gap-2 px-2">
                <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/15 text-[11px] font-semibold text-primary">
                  AK
                </div>
                <div className="min-w-0">
                  <p className="truncate text-xs font-medium text-foreground">Alex Kim</p>
                  <p className="truncate text-[10px] text-muted-foreground">Pro plan</p>
                </div>
              </div>
            </div>
          </aside>

          {/* Main content */}
          <div className="overflow-hidden bg-background">
            <div className="space-y-4 px-5 py-4">

              {/* Welcome + connected provider */}
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-sm font-semibold tracking-tight text-foreground">Welcome back, Alex</h2>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">
                    Manage your cloud files, storage, and provider settings.
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2.5 rounded-lg border border-border bg-card px-3 py-2">
                  <div className="flex size-7 items-center justify-center rounded-lg bg-amber-500/10">
                    <HugeiconsIcon icon={CloudServerIcon} className="size-3.5 text-amber-600" strokeWidth={1.5} />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] font-medium text-foreground">AWS S3</span>
                      <span className="rounded-full bg-emerald-500/10 px-1.5 py-0.5 text-[9px] font-medium text-emerald-600 dark:text-emerald-400">
                        connected
                      </span>
                    </div>
                    <p className="text-[10px] text-muted-foreground">my-prod-bucket · us-east-1</p>
                  </div>
                </div>
              </div>

              {/* Stats cards */}
              <div className="grid grid-cols-4 gap-2.5">
                {STATS.map((stat) => (
                  <div key={stat.label} className="rounded-xl border border-border bg-card p-3">
                    <div className="mb-2 flex items-start justify-between gap-1">
                      <p className="text-[10px] leading-tight text-muted-foreground">{stat.label}</p>
                      <div className={cn("flex size-6 shrink-0 items-center justify-center rounded-md", stat.bg)}>
                        <HugeiconsIcon icon={stat.icon} className={cn("size-3", stat.color)} strokeWidth={1.5} />
                      </div>
                    </div>
                    <p className="text-lg font-bold tracking-tight text-foreground">{stat.value}</p>
                  </div>
                ))}
              </div>

              {/* Storage usage + Quick actions */}
              <div className="grid grid-cols-[1fr_196px] gap-3">

                {/* Storage usage */}
                <div className="rounded-xl border border-border bg-card p-4">
                  <p className="text-xs font-semibold text-foreground">Storage Usage</p>
                  <p className="mb-3 mt-0.5 text-[10px] text-muted-foreground">14.8 GB used across all categories</p>
                  <div className="space-y-3">
                    {STORAGE_KINDS.map((k) => (
                      <div key={k.label} className="space-y-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <div className="flex items-center gap-1.5">
                            <span className={cn("size-1.5 rounded-full", k.dot)} />
                            <span className="text-foreground">{k.label}</span>
                          </div>
                          <span className="text-muted-foreground">{k.size}</span>
                        </div>
                        <Progress value={k.pct} className={cn("h-1.5", k.bar)} />
                      </div>
                    ))}
                  </div>

                  {/* Recent files mini-table */}
                  <div className="mt-4 border-t border-border pt-3">
                    <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">Recent Files</p>
                    <div className="space-y-1.5">
                      {RECENT_FILES.map((f) => (
                        <div key={f.name} className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <div className="flex size-5 shrink-0 items-center justify-center rounded-md bg-muted">
                              <HugeiconsIcon icon={Folder01Icon} className="size-3 text-muted-foreground" strokeWidth={1.5} />
                            </div>
                            <span className="truncate text-[11px] font-medium text-foreground">{f.name}</span>
                          </div>
                          <div className="flex shrink-0 items-center gap-3 text-[10px] text-muted-foreground">
                            <span>{f.size}</span>
                            <span>{f.when}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Quick actions */}
                <div className="rounded-xl border border-border bg-card p-3">
                  <p className="mb-3 text-xs font-semibold text-foreground">Quick Actions</p>
                  <div className="grid grid-cols-2 gap-2">
                    {QUICK_ACTIONS.map((action) => (
                      <div
                        key={action.label}
                        className="flex cursor-default flex-col gap-2 rounded-lg border border-border bg-card p-2.5 transition-colors hover:bg-accent/50"
                      >
                        <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10">
                          <HugeiconsIcon icon={action.icon} className="size-3.5 text-primary" strokeWidth={1.5} />
                        </div>
                        <div>
                          <p className="text-[10px] font-medium leading-snug text-foreground">{action.label}</p>
                          <p className="mt-0.5 text-[9px] leading-snug text-muted-foreground">{action.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
