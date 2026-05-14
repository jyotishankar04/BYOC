"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Search01Icon,
  CloudUploadIcon,
  Notification01Icon,
  Logout01Icon,
  UserCircle02Icon,
  Settings01Icon,
  FileUploadIcon,
  Share01Icon,
  HardDriveIcon,
  CloudServerIcon,
  InformationCircleIcon,
  Shield01Icon,
  User02Icon,
  Delete01Icon,
  Link01Icon,
  Time01Icon,
} from "@hugeicons/core-free-icons";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UploadDialog } from "@/components/custom/dashboard/common/upload-dialog";
import { useNotifications } from "@/lib/notifications-context";
import { useSession, signOut } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import type { NotificationType } from "@/lib/notifications";

type HugeIcon = Parameters<typeof HugeiconsIcon>[0]["icon"];

const NOTIFICATION_ICON_MAP: Record<NotificationType, { icon: HugeIcon; color: string; bg: string }> = {
  FILE_SHARED: { icon: Share01Icon, color: "text-violet-500", bg: "bg-violet-500/10" },
  FILE_UPLOADED: { icon: FileUploadIcon, color: "text-blue-500", bg: "bg-blue-500/10" },
  FILE_DELETED: { icon: Delete01Icon, color: "text-red-500", bg: "bg-red-500/10" },
  MEMBER_JOINED: { icon: User02Icon, color: "text-emerald-500", bg: "bg-emerald-500/10" },
  MEMBER_LEFT: { icon: User02Icon, color: "text-amber-500", bg: "bg-amber-500/10" },
  INVITE_SENT: { icon: Share01Icon, color: "text-blue-500", bg: "bg-blue-500/10" },
  STORAGE_ALERT: { icon: HardDriveIcon, color: "text-amber-500", bg: "bg-amber-500/10" },
  SECURITY_ALERT: { icon: Shield01Icon, color: "text-red-500", bg: "bg-red-500/10" },
  LINK_EXPIRED: { icon: Time01Icon, color: "text-slate-500", bg: "bg-slate-500/10" },
  LINK_DISABLED: { icon: Link01Icon, color: "text-slate-500", bg: "bg-slate-500/10" },
  SETTINGS_CHANGED: { icon: CloudServerIcon, color: "text-cyan-500", bg: "bg-cyan-500/10" },
};

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

export function TopNavbar() {
  const [uploadOpen, setUploadOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const { notifications, unreadCount, isLoading, markAllAsRead, markAsRead } = useNotifications();
  const { data: session } = useSession();
  const router = useRouter();
  const [searchValue, setSearchValue] = useState("");

  const handleSearchNavigate = () => {
    const params = new URLSearchParams();
    if (searchValue.trim()) params.set("search", searchValue.trim());
    router.push(`/app/files${params.toString() ? `?${params.toString()}` : ""}`);
  };

  const user = session?.user;
  const userInitials = user?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase() || "U";

  const handleSignOut = async () => {
    await signOut();
    router.push("/auth/login");
  };

  return (
    <>
      <header className="sticky top-0 z-10 flex h-13 shrink-0 items-center gap-2 border-b bg-background/95 backdrop-blur-sm px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="h-4" />

        <div className="relative hidden flex-1 sm:flex max-w-sm">
          <HugeiconsIcon
            icon={Search01Icon}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none"
            strokeWidth={1.5}
          />
          <Input
            placeholder="Search files and folders..."
            className="pl-8 h-8 bg-muted/50 border-transparent focus:border-border focus:bg-background transition-colors"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSearchNavigate();
            }}
          />
        </div>

        <div className="ml-auto flex items-center gap-1">
          {/* Mobile search */}
          <Button size="icon" variant="ghost" className="sm:hidden" onClick={() => router.push("/app/files")}>
            <HugeiconsIcon icon={Search01Icon} className="size-4" strokeWidth={1.5} />
          </Button>

          <Button size="sm" onClick={() => setUploadOpen(true)} className="gap-1.5">
            <HugeiconsIcon icon={CloudUploadIcon} className="size-3.5" strokeWidth={1.5} />
            <span className="hidden sm:inline">Upload</span>
          </Button>

          {/* Notification bell */}
          <DropdownMenu open={notifOpen} onOpenChange={setNotifOpen}>
            <DropdownMenuTrigger asChild>
              <Button size="icon" variant="ghost" className="relative size-8">
                <HugeiconsIcon icon={Notification01Icon} className="size-4" strokeWidth={1.5} />
                {unreadCount > 0 && (
                  <span className="absolute right-1.5 top-1.5 flex size-2 items-center justify-center">
                    <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-50" />
                    <span className="relative size-1.5 rounded-full bg-primary" />
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 p-0">
              <div className="flex items-center justify-between border-b px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold">Notifications</span>
                  {unreadCount > 0 && (
                    <Badge className="h-5 min-w-5 rounded-full px-1.5 text-[10px] leading-none">
                      {unreadCount}
                    </Badge>
                  )}
                </div>
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-[11px] text-muted-foreground hover:text-foreground"
                    onClick={() => markAllAsRead()}
                  >
                    Mark all read
                  </Button>
                )}
              </div>

              <div className="max-h-[360px] overflow-y-auto">
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="size-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <HugeiconsIcon
                      icon={Notification01Icon}
                      className="size-8 text-muted-foreground/50 mb-2"
                      strokeWidth={1.5}
                    />
                    <p className="text-sm text-muted-foreground">No notifications</p>
                  </div>
                ) : (
                  notifications.slice(0, 5).map((n) => {
                    const iconConfig = NOTIFICATION_ICON_MAP[n.type] || {
                      icon: InformationCircleIcon,
                      color: "text-slate-500",
                      bg: "bg-slate-500/10",
                    };
                    return (
                      <div
                        key={n.id}
                        className={cn(
                          "flex items-start gap-3 border-b px-4 py-3 last:border-0 transition-colors cursor-pointer",
                          !n.read ? "bg-primary/[0.04] hover:bg-primary/[0.07]" : "hover:bg-muted/40",
                        )}
                        onClick={() => {
                          markAsRead(n.id);
                          if (n.link) {
                            router.push(n.link);
                          } else {
                            router.push("/app/notifications");
                          }
                          setNotifOpen(false);
                        }}
                      >
                        <div className={cn("flex size-7 shrink-0 items-center justify-center rounded-lg mt-0.5", iconConfig.bg)}>
                          <HugeiconsIcon icon={iconConfig.icon} className={cn("size-3.5", iconConfig.color)} strokeWidth={1.5} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className={cn("text-xs leading-snug", !n.read && "font-medium")}>
                            {n.title}
                          </p>
                          {n.message && (
                            <p className="mt-0.5 text-[11px] text-muted-foreground line-clamp-1">
                              {n.message}
                            </p>
                          )}
                          <p className="mt-0.5 text-[11px] text-muted-foreground">
                            {formatTimeAgo(n.createdAt)}
                          </p>
                        </div>
                        {!n.read && (
                          <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" />
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              <div className="border-t px-4 py-2.5">
                <Link
                  href="/app/notifications"
                  className="flex items-center justify-center text-xs font-medium text-primary hover:text-primary/80 transition-colors"
                  onClick={() => setNotifOpen(false)}
                >
                  View all notifications →
                </Link>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full size-8">
                <Avatar size="sm" className="size-7">
                  <AvatarFallback className="text-[11px] font-semibold">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="py-2">
                <p className="text-sm font-semibold">{user?.name || "User"}</p>
                <p className="text-xs font-normal text-muted-foreground">{user?.email || ""}</p>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/app/profile" className="flex items-center gap-2 cursor-pointer">
                  <HugeiconsIcon icon={UserCircle02Icon} className="size-3.5" strokeWidth={1.5} />
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/app/settings" className="flex items-center gap-2 cursor-pointer">
                  <HugeiconsIcon icon={Settings01Icon} className="size-3.5" strokeWidth={1.5} />
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" onClick={handleSignOut}>
                <HugeiconsIcon icon={Logout01Icon} className="size-3.5" strokeWidth={1.5} />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <UploadDialog open={uploadOpen} onOpenChange={setUploadOpen} />
    </>
  );
}
