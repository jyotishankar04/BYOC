"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Cloud,
  Files,
  Clock,
  Share2,
  Trash2,
  Server,
  Users,
  Receipt,
  Settings,
  Upload,
  FolderPlus,
  LayoutGrid,
  ChevronRight,
  FileImage,
  FileArchive,
  FileSpreadsheet,
  FileCode2,
  Folder,
  PlugZap,
  BookOpen,
  Circle,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Types ─────────────────────────────────────────────────────────────────────

interface FolderItem {
  name: string;
  size: string;
  count: string;
  color: string;
  iconColor: string;
}

interface FileItem {
  name: string;
  size: string;
  modified: string;
  type: string;
  badgeBg: string;
  badgeText: string;
  icon: React.ReactNode;
}

interface BucketItem {
  name: string;
  size: string;
  pct: string;
  dotColor: string;
}

interface ProviderItem {
  name: string;
  region: string;
  status: "online" | "warning";
}

// ─── Data ──────────────────────────────────────────────────────────────────────

const FOLDERS: FolderItem[] = [
  { name: "images", size: "1.2 GB", count: "840 files", color: "bg-primary/10", iconColor: "text-primary" },
  { name: "backups", size: "8.4 GB", count: "23 files", color: "bg-amber-500/10", iconColor: "text-amber-500" },
  { name: "exports", size: "340 MB", count: "57 files", color: "bg-emerald-500/10", iconColor: "text-emerald-500" },
  { name: "logs", size: "2.1 GB", count: "4,201 files", color: "bg-muted", iconColor: "text-muted-foreground" },
];

const FILES: FileItem[] = [
  {
    name: "hero-banner.jpg",
    size: "2.4 MB",
    modified: "Today, 9:12 AM",
    type: "JPG",
    badgeBg: "bg-primary/10",
    badgeText: "text-primary",
    icon: <FileImage className="w-4 h-4 text-primary" />,
  },
  {
    name: "db-snapshot.tar.gz",
    size: "420 MB",
    modified: "Yesterday",
    type: "TAR",
    badgeBg: "bg-amber-500/10",
    badgeText: "text-amber-600 dark:text-amber-400",
    icon: <FileArchive className="w-4 h-4 text-amber-500" />,
  },
  {
    name: "analytics-june.csv",
    size: "840 KB",
    modified: "3 days ago",
    type: "CSV",
    badgeBg: "bg-emerald-500/10",
    badgeText: "text-emerald-600 dark:text-emerald-400",
    icon: <FileSpreadsheet className="w-4 h-4 text-emerald-500" />,
  },
  {
    name: "config.json",
    size: "12 KB",
    modified: "Jun 2",
    type: "JSON",
    badgeBg: "bg-violet-500/10",
    badgeText: "text-violet-600 dark:text-violet-400",
    icon: <FileCode2 className="w-4 h-4 text-violet-500" />,
  },
];

const BUCKETS: BucketItem[] = [
  { name: "my-prod-bucket", size: "8.4 GB", pct: "57%", dotColor: "bg-primary" },
  { name: "media-cdn", size: "4.2 GB", pct: "28%", dotColor: "bg-emerald-500" },
  { name: "cold-backups", size: "2.2 GB", pct: "15%", dotColor: "bg-amber-500" },
];

const PROVIDERS: ProviderItem[] = [
  { name: "AWS S3", region: "us-east-1", status: "online" },
  { name: "Cloudflare R2", region: "auto", status: "online" },
  { name: "Backblaze B2", region: "us-west-004", status: "warning" },
];

// ─── Sidebar nav ───────────────────────────────────────────────────────────────

const DISCOVER_NAV = [
  { icon: Files, label: "All files" },
  { icon: Clock, label: "Recent" },
  { icon: Share2, label: "Shared", badge: "4" },
  { icon: Trash2, label: "Trash" },
];

const MANAGE_NAV = [
  { icon: Server, label: "Buckets" },
  { icon: Users, label: "Access" },
  { icon: Receipt, label: "Billing" },
  { icon: Settings, label: "Settings" },
];

// ─── Sub-components ────────────────────────────────────────────────────────────

function SidebarItem({
  icon: Icon,
  label,
  active,
  badge,
  onClick,
}: {
  icon: React.ElementType;
  label: string;
  active?: boolean;
  badge?: string;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-sm transition-colors text-left",
        active
          ? "bg-accent text-accent-foreground font-medium"
          : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
      )}
    >
      <Icon className="w-3.5 h-3.5 shrink-0" />
      <span className="flex-1 truncate">{label}</span>
      {badge && (
        <span className="text-[10px] bg-muted text-muted-foreground rounded-full px-1.5 py-0.5 leading-none">
          {badge}
        </span>
      )}
    </button>
  );
}

function FolderCard({ folder }: { folder: FolderItem }) {
  return (
    <div className="group border border-border rounded-xl p-3 cursor-pointer hover:border-border/80 hover:bg-accent/50 transition-all">
      <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center mb-2", folder.color)}>
        <Folder className={cn("w-4 h-4", folder.iconColor)} />
      </div>
      <p className="text-xs font-medium text-foreground truncate">{folder.name}</p>
      <p className="text-[11px] text-muted-foreground mt-0.5">{folder.size} · {folder.count}</p>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function HeroPreview() {
  const [activeNav, setActiveNav] = useState("All files");

  return (
    <div className="mx-auto mt-16 max-w-6xl px-4">
      <div className="rounded-2xl border border-border overflow-hidden shadow-xl shadow-black/5 dark:shadow-black/40 bg-card">

        {/* Top bar */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-muted/50">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-foreground flex items-center justify-center">
              <Cloud className="w-3.5 h-3.5 text-background" />
            </div>
            <span className="text-sm font-semibold text-foreground tracking-tight">BYOC</span>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-card border border-border rounded-full px-3 py-1">
              <Server className="w-3 h-3" />
              3 buckets connected
            </div>
            <div className="w-7 h-7 rounded-full bg-emerald-500/20 flex items-center justify-center text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
              AK
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="grid grid-cols-[180px_1fr_196px] min-h-[360px]">

          {/* Sidebar */}
          <aside className="border-r border-border bg-card py-4 px-2.5 flex flex-col gap-1">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 px-2.5 pb-1">Storage</p>
            {DISCOVER_NAV.map(({ icon, label, badge }) => (
              <SidebarItem
                key={label}
                icon={icon}
                label={label}
                badge={badge}
                active={activeNav === label}
                onClick={() => setActiveNav(label)}
              />
            ))}
            <Separator className="my-2" />
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 px-2.5 pb-1">Manage</p>
            {MANAGE_NAV.map(({ icon, label }) => (
              <SidebarItem
                key={label}
                icon={icon}
                label={label}
                active={activeNav === label}
                onClick={() => setActiveNav(label)}
              />
            ))}
          </aside>

          {/* Main */}
          <ScrollArea className="bg-card">
            <div className="px-5 py-4">
              {/* Toolbar */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <span>my-prod-bucket</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                  <span className="text-foreground font-medium">assets /</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {[Upload, FolderPlus, LayoutGrid].map((Icon, i) => (
                    <button
                      key={i}
                      className="w-7 h-7 rounded-md border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Folder grid */}
              <div className="grid grid-cols-4 gap-2.5 mb-5">
                {FOLDERS.map((f) => (
                  <FolderCard key={f.name} folder={f} />
                ))}
              </div>

              {/* File table */}
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border">
                    {["Name", "Size", "Modified", "Type"].map((h) => (
                      <th key={h} className="text-left text-[11px] font-medium text-muted-foreground pb-2 px-1.5">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {FILES.map((f) => (
                    <tr
                      key={f.name}
                      className="border-b border-border/50 hover:bg-accent/30 transition-colors group"
                    >
                      <td className="px-1.5 py-2.5">
                        <div className="flex items-center gap-2 text-foreground font-medium">
                          {f.icon}
                          <span className="truncate max-w-[140px]">{f.name}</span>
                        </div>
                      </td>
                      <td className="px-1.5 py-2.5 text-muted-foreground">{f.size}</td>
                      <td className="px-1.5 py-2.5 text-muted-foreground/70">{f.modified}</td>
                      <td className="px-1.5 py-2.5">
                        <span className={cn("text-[10px] font-semibold px-1.5 py-0.5 rounded-md", f.badgeBg, f.badgeText)}>
                          {f.type}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </ScrollArea>

          {/* Right panel */}
          <aside className="border-l border-border bg-card px-3.5 py-4 flex flex-col gap-5 overflow-hidden">

            {/* Storage used */}
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 mb-2.5">Storage used</p>
              <div className="bg-muted/50 rounded-xl p-3">
                <p className="text-[11px] text-muted-foreground mb-1">Total across buckets</p>
                <p className="text-xl font-semibold text-foreground leading-none mb-2.5">14.8 GB</p>
                <Progress value={59} className="h-1.5 mb-1.5" />
                <p className="text-[11px] text-muted-foreground">of 25 GB · 59% used</p>
              </div>
            </div>

            {/* Buckets */}
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 mb-2.5">Buckets</p>
              <div className="flex flex-col gap-2.5">
                {BUCKETS.map((b) => (
                  <div key={b.name} className="flex items-center gap-2">
                    <div className={cn("w-2 h-2 rounded-full shrink-0", b.dotColor)} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-foreground font-medium truncate">{b.name}</p>
                      <p className="text-[11px] text-muted-foreground">{b.size}</p>
                    </div>
                    <span className="text-[11px] text-muted-foreground shrink-0">{b.pct}</span>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Providers */}
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 mb-2.5">Providers</p>
              <div className="flex flex-col gap-0">
                {PROVIDERS.map((p, i) => (
                  <div
                    key={p.name}
                    className={cn(
                      "flex items-center gap-2 py-2",
                      i < PROVIDERS.length - 1 && "border-b border-border/50"
                    )}
                  >
                    <div className="w-7 h-7 rounded-lg border border-border flex items-center justify-center shrink-0">
                      <Server className="w-3.5 h-3.5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-foreground truncate">{p.name}</p>
                      <p className="text-[11px] text-muted-foreground">{p.region}</p>
                    </div>
                    <Circle
                      className={cn(
                        "w-2 h-2 shrink-0 fill-current",
                        p.status === "online"
                          ? "text-emerald-500"
                          : "text-amber-400"
                      )}
                    />
                  </div>
                ))}
              </div>
            </div>

          </aside>
        </div>
      </div>
    </div>
  );
}
