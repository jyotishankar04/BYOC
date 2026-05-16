"use client";

import { useMemo } from "react";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Notification01Icon,
  Share01Icon,
  FileUploadIcon,
  Delete01Icon,
  User02Icon,
  CloudServerIcon,
  Settings01Icon,
  CheckmarkCircle01Icon,
  Cancel01Icon,
  InformationCircleIcon,
  Shield01Icon,
  HardDriveIcon,
  Time01Icon,
  Link01Icon,
} from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useNotifications } from "@/lib/notifications-context";
import type { Notification, NotificationType, NotificationFilter } from "@/lib/notifications";

type HugeIcon = Parameters<typeof HugeiconsIcon>[0]["icon"];

const TYPE_VISUAL: Record<
  NotificationType,
  { icon: HugeIcon; color: string; bg: string }
> = {
  FILE_SHARED: { icon: Share01Icon, color: "text-violet-500", bg: "bg-violet-500/10" },
  FILE_UPLOADED: { icon: FileUploadIcon, color: "text-blue-500", bg: "bg-blue-500/10" },
  FILE_DELETED: { icon: Delete01Icon, color: "text-rose-500", bg: "bg-rose-500/10" },
  MEMBER_JOINED: { icon: User02Icon, color: "text-emerald-500", bg: "bg-emerald-500/10" },
  MEMBER_LEFT: { icon: User02Icon, color: "text-amber-500", bg: "bg-amber-500/10" },
  INVITE_SENT: { icon: Share01Icon, color: "text-blue-500", bg: "bg-blue-500/10" },
  STORAGE_ALERT: { icon: HardDriveIcon, color: "text-amber-500", bg: "bg-amber-500/10" },
  SECURITY_ALERT: { icon: Shield01Icon, color: "text-red-500", bg: "bg-red-500/10" },
  LINK_EXPIRED: { icon: Time01Icon, color: "text-slate-500", bg: "bg-slate-500/10" },
  LINK_DISABLED: { icon: Link01Icon, color: "text-slate-500", bg: "bg-slate-500/10" },
  SETTINGS_CHANGED: { icon: CloudServerIcon, color: "text-cyan-500", bg: "bg-cyan-500/10" },
};

const FILTERS: { key: NotificationFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "unread", label: "Unread" },
  { key: "files", label: "Files" },
  { key: "members", label: "Members" },
  { key: "security", label: "Security" },
  { key: "system", label: "System" },
];

const D = 86_400_000;

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "Just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  return date.toLocaleDateString();
}

function groupNotifications(items: Notification[]) {
  const todayStart = new Date().setHours(0, 0, 0, 0);
  const yesterdayStart = todayStart - D;
  const weekStart = todayStart - 6 * D;

  const groups: { label: string; items: Notification[] }[] = [
    { label: "Today", items: [] },
    { label: "Yesterday", items: [] },
    { label: "This week", items: [] },
    { label: "Earlier", items: [] },
  ];

  for (const n of items) {
    const timestampMs = new Date(n.createdAt).getTime();
    if (timestampMs >= todayStart) groups[0].items.push(n);
    else if (timestampMs >= yesterdayStart) groups[1].items.push(n);
    else if (timestampMs >= weekStart) groups[2].items.push(n);
    else groups[3].items.push(n);
  }

  return groups.filter((g) => g.items.length > 0);
}

function NotifRow({
  notif,
  onMarkRead,
  onDismiss,
}: {
  notif: Notification;
  onMarkRead: (id: string) => void;
  onDismiss: (id: string) => void;
}) {
  const v = TYPE_VISUAL[notif.type];

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
        {notif.message && (
          <p className="mt-0.5 text-[11px] text-muted-foreground leading-snug">{notif.message}</p>
        )}
        <div className="mt-1.5 flex items-center gap-2">
          <span className="text-[11px] text-muted-foreground">{formatTimeAgo(notif.createdAt)}</span>
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
  );
}

export default function NotificationsPage() {
  const {
    notifications,
    unreadCount,
    isLoading,
    filter,
    setFilter,
    markAsRead,
    markAllAsRead,
    dismiss,
    dismissAll,
  } = useNotifications();

  const grouped = useMemo(() => groupNotifications(notifications), [notifications]);

  const counts = useMemo(() => {
    const c: Record<NotificationFilter, number> = {
      all: notifications.length,
      unread: notifications.filter((n) => !n.read).length,
      files: notifications.filter((n) =>
        ["FILE_SHARED", "FILE_UPLOADED", "FILE_DELETED", "LINK_EXPIRED", "LINK_DISABLED"].includes(n.type),
      ).length,
      members: notifications.filter((n) => ["MEMBER_JOINED", "MEMBER_LEFT", "INVITE_SENT"].includes(n.type)).length,
      security: notifications.filter((n) => ["SECURITY_ALERT", "STORAGE_ALERT"].includes(n.type)).length,
      system: notifications.filter((n) => ["SETTINGS_CHANGED"].includes(n.type)).length,
    };
    return c;
  }, [notifications]);

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

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
                <Badge className="bg-primary text-primary-foreground text-[10px] px-1.5 py-0">{unreadCount}</Badge>
              )}
            </div>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {unreadCount > 0 ? `${unreadCount} unread` : "All caught up"} · {notifications.length} total
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {unreadCount > 0 && (
            <Button size="sm" variant="outline" onClick={markAllAsRead}>
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
            onClick={() => setFilter(f.key)}
            className={cn(
              "flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1 text-xs transition-colors",
              filter === f.key
                ? "border-foreground bg-foreground text-background"
                : "text-muted-foreground hover:bg-accent hover:text-foreground",
            )}
          >
            {f.label}
            {counts[f.key] > 0 && (
              <span
                className={cn(
                  "tabular-nums",
                  filter === f.key ? "text-background/70" : "text-muted-foreground",
                )}
              >
                {counts[f.key]}
              </span>
            )}
          </button>
        ))}

        {notifications.length > 0 && (
          <button
            onClick={dismissAll}
            className="ml-auto shrink-0 text-[11px] text-muted-foreground transition-colors hover:text-destructive"
          >
            Clear {filter === "all" ? "all" : "filtered"}
          </button>
        )}
      </div>

      {/* ── List ── */}
      {notifications.length === 0 ? (
        <div className="flex h-52 flex-col items-center justify-center gap-2 rounded-xl border border-dashed">
          <div className="flex size-10 items-center justify-center rounded-xl bg-muted">
            <HugeiconsIcon icon={Notification01Icon} className="size-5 text-muted-foreground/50" strokeWidth={1} />
          </div>
          <p className="text-sm font-medium text-muted-foreground">
            {filter === "unread" ? "No unread notifications" : "No notifications"}
          </p>
          {filter !== "all" && (
            <button onClick={() => setFilter("all")} className="text-xs text-primary hover:underline">
              View all notifications
            </button>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border">
          {grouped.map((group, gi) => (
            <div key={group.label}>
              {/* Group header */}
              <div
                className={cn(
                  "flex items-center gap-3 bg-muted/30 px-5 py-2",
                  gi > 0 && "border-t",
                )}
              >
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
                  <NotifRow notif={n} onMarkRead={markAsRead} onDismiss={dismiss} />
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* ── Info note ── */}
      {notifications.length > 0 && (
        <div className="flex items-start gap-2.5 rounded-xl border border-blue-500/20 bg-blue-500/5 px-4 py-3">
          <HugeiconsIcon
            icon={InformationCircleIcon}
            className="mt-0.5 size-3.5 shrink-0 text-blue-500"
            strokeWidth={1.5}
          />
          <p className="text-[11px] text-muted-foreground">
            Notifications are retained for <strong className="text-foreground">30 days</strong>. Manage what you
            receive in{" "}
            <Link href="/app/settings" className="text-primary hover:underline">
              Notification settings
            </Link>
            .
          </p>
        </div>
      )}
    </div>
  );
}
