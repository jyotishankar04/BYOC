"use client"

import { useState } from "react"
import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
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
} from "@hugeicons/core-free-icons"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { UploadDialog } from "@/components/custom/dashboard/common/upload-dialog"
import { cn } from "@/lib/utils"

type HugeIcon = Parameters<typeof HugeiconsIcon>[0]["icon"]

interface QuickNotif {
  id: string
  icon: HugeIcon
  iconColor: string
  iconBg: string
  title: string
  time: string
  read: boolean
}

const INITIAL_NOTIFS: QuickNotif[] = [
  { id: "q1", icon: FileUploadIcon,       iconColor: "text-blue-500",    iconBg: "bg-blue-500/10",    title: "project-demo.mp4 uploaded successfully", time: "Just now",    read: false },
  { id: "q2", icon: Share01Icon,           iconColor: "text-violet-500",  iconBg: "bg-violet-500/10",  title: "invoice.pdf shared via public link",     time: "2 hours ago", read: false },
  { id: "q3", icon: HardDriveIcon,         iconColor: "text-amber-500",   iconBg: "bg-amber-500/10",   title: "Storage usage reached 78% of limit",     time: "Yesterday",   read: false },
  { id: "q4", icon: CloudServerIcon,       iconColor: "text-emerald-500", iconBg: "bg-emerald-500/10", title: "AWS S3 bucket connected successfully",   time: "2 days ago",  read: true  },
  { id: "q5", icon: InformationCircleIcon, iconColor: "text-slate-500",   iconBg: "bg-slate-500/10",   title: "Scheduled maintenance on May 15",        time: "3 days ago",  read: true  },
]

export function TopNavbar() {
  const [uploadOpen, setUploadOpen] = useState(false)
  const [notifOpen, setNotifOpen]   = useState(false)
  const [notifs, setNotifs]         = useState(INITIAL_NOTIFS)

  const unreadCount = notifs.filter((n) => !n.read).length
  const markAllRead = () => setNotifs((p) => p.map((n) => ({ ...n, read: true })))

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
          />
        </div>

        <div className="ml-auto flex items-center gap-1">
          {/* Mobile search */}
          <Button size="icon" variant="ghost" className="sm:hidden">
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
                    onClick={markAllRead}
                  >
                    Mark all read
                  </Button>
                )}
              </div>

              <div className="max-h-[360px] overflow-y-auto">
                {notifs.map((n) => (
                  <div
                    key={n.id}
                    className={cn(
                      "flex items-start gap-3 border-b px-4 py-3 last:border-0 transition-colors cursor-default",
                      n.read ? "hover:bg-muted/40" : "bg-primary/[0.04] hover:bg-primary/[0.07]",
                    )}
                  >
                    <div className={cn("flex size-7 shrink-0 items-center justify-center rounded-lg mt-0.5", n.iconBg)}>
                      <HugeiconsIcon icon={n.icon} className={cn("size-3.5", n.iconColor)} strokeWidth={1.5} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className={cn("text-xs leading-snug", !n.read && "font-medium")}>
                        {n.title}
                      </p>
                      <p className="mt-0.5 text-[11px] text-muted-foreground">{n.time}</p>
                    </div>
                    {!n.read && (
                      <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" />
                    )}
                  </div>
                ))}
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
                  <AvatarFallback className="text-[11px] font-semibold">JD</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="py-2">
                <p className="text-sm font-semibold">John Doe</p>
                <p className="text-xs font-normal text-muted-foreground">john@example.com</p>
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
              <DropdownMenuItem variant="destructive">
                <HugeiconsIcon icon={Logout01Icon} className="size-3.5" strokeWidth={1.5} />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <UploadDialog open={uploadOpen} onOpenChange={setUploadOpen} />
    </>
  )
}
