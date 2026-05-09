"use client"

import { useState } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Search01Icon,
  CloudUploadIcon,
  Notification01Icon,
  Logout01Icon,
} from "@hugeicons/core-free-icons"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { UploadDialog } from "@/components/custom/dashboard/upload-dialog"

export function TopNavbar() {
  const [uploadOpen, setUploadOpen] = useState(false)

  return (
    <>
      <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b bg-background px-4">
        <SidebarTrigger />
        <Separator orientation="vertical" className="h-4" />

        <div className="relative flex-1 max-w-xs">
          <HugeiconsIcon
            icon={Search01Icon}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground"
            strokeWidth={1.5}
          />
          <Input placeholder="Search files..." className="pl-8 h-7" />
        </div>

        <div className="ml-auto flex items-center gap-1">
          <Button size="sm" onClick={() => setUploadOpen(true)}>
            <HugeiconsIcon icon={CloudUploadIcon} className="size-3.5" strokeWidth={1.5} />
            <span className="hidden sm:inline">Upload</span>
          </Button>

        <div className="relative">
          <Button size="icon" variant="ghost">
            <HugeiconsIcon icon={Notification01Icon} className="size-4" strokeWidth={1.5} />
          </Button>
          <span className="absolute right-1.5 top-1.5 size-1.5 rounded-full bg-primary" />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Avatar size="sm">
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuLabel>
              <p className="font-medium">John Doe</p>
              <p className="text-xs font-normal text-muted-foreground">john@example.com</p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
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
