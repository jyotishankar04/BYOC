"use client"

import { useState } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  UserCircle02Icon,
  Mail01Icon,
  SmartPhone01Icon,
  Location01Icon,
  Edit01Icon,
  CheckmarkCircle01Icon,
  Cancel01Icon,
  Camera01Icon,
  Key01Icon,
  Shield01Icon,
  Clock01Icon,
  Folder01Icon,
  LinkSquare01Icon,
  HardDriveIcon,
} from "@hugeicons/core-free-icons"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

// ─── Data ─────────────────────────────────────────────────────────────────────

const ACTIVITY = [
  { icon: HardDriveIcon,  text: "Uploaded project-demo.mp4",          time: "Just now",    color: "text-blue-500",    bg: "bg-blue-500/10"    },
  { icon: LinkSquare01Icon, text: "Created share link for invoice.pdf", time: "2 hours ago", color: "text-violet-500",  bg: "bg-violet-500/10"  },
  { icon: Folder01Icon,   text: "Created folder 'College Notes'",       time: "Yesterday",   color: "text-amber-500",   bg: "bg-amber-500/10"   },
  { icon: HardDriveIcon,  text: "Uploaded design-assets.zip",          time: "2 days ago",  color: "text-blue-500",    bg: "bg-blue-500/10"    },
  { icon: LinkSquare01Icon, text: "Shared team-photo.png",             time: "3 days ago",  color: "text-violet-500",  bg: "bg-violet-500/10"  },
]

const SESSIONS = [
  { device: "Chrome on macOS",  location: "Mumbai, IN",   lastSeen: "Active now",    current: true  },
  { device: "Safari on iPhone", location: "Mumbai, IN",   lastSeen: "1 hour ago",    current: false },
  { device: "Firefox on Linux", location: "Bengaluru, IN",lastSeen: "3 days ago",    current: false },
]

// ─── Editable field ────────────────────────────────────────────────────────────

function EditableField({
  label,
  value,
  icon,
  type = "text",
  placeholder,
}: {
  label: string
  value: string
  icon: typeof Mail01Icon
  type?: string
  placeholder?: string
}) {
  const [editing, setEditing] = useState(false)
  const [val, setVal] = useState(value)
  const [saved, setSaved] = useState(value)

  const handleSave = () => {
    setSaved(val)
    setEditing(false)
  }
  const handleCancel = () => {
    setVal(saved)
    setEditing(false)
  }

  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-muted-foreground">{label}</Label>
      {editing ? (
        <div className="flex items-center gap-2">
          <Input
            type={type}
            value={val}
            placeholder={placeholder}
            onChange={(e) => setVal(e.target.value)}
            className="h-8 text-sm"
            autoFocus
          />
          <Button size="icon" variant="ghost" className="h-8 w-8 shrink-0 text-emerald-600 hover:text-emerald-600" onClick={handleSave}>
            <HugeiconsIcon icon={CheckmarkCircle01Icon} className="size-4" strokeWidth={2} />
          </Button>
          <Button size="icon" variant="ghost" className="h-8 w-8 shrink-0" onClick={handleCancel}>
            <HugeiconsIcon icon={Cancel01Icon} className="size-4" strokeWidth={1.5} />
          </Button>
        </div>
      ) : (
        <div className="group flex items-center justify-between gap-2 rounded-md border px-3 py-2">
          <div className="flex items-center gap-2 min-w-0">
            <HugeiconsIcon icon={icon} className="size-3.5 shrink-0 text-muted-foreground" strokeWidth={1.5} />
            <span className="truncate text-sm">{saved || <span className="text-muted-foreground">{placeholder}</span>}</span>
          </div>
          <Button
            size="icon"
            variant="ghost"
            className="h-6 w-6 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => setEditing(true)}
          >
            <HugeiconsIcon icon={Edit01Icon} className="size-3" strokeWidth={1.5} />
          </Button>
        </div>
      )}
    </div>
  )
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const [displayName, setDisplayName] = useState("John Doe")
  const [editingName, setEditingName] = useState(false)
  const [nameVal, setNameVal] = useState("John Doe")

  const handleNameSave = () => {
    setDisplayName(nameVal)
    setEditingName(false)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Profile</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Manage your personal information and account security.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left column */}
        <div className="space-y-6 lg:col-span-2">
          {/* Avatar + name card */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
                {/* Avatar */}
                <div className="relative shrink-0">
                  <Avatar className="size-20 text-2xl">
                    <AvatarFallback className="bg-blue-500 text-white">JD</AvatarFallback>
                  </Avatar>
                  <button className="absolute bottom-0 right-0 flex size-6 items-center justify-center rounded-full border-2 border-background bg-foreground text-background shadow-sm hover:opacity-80 transition-opacity">
                    <HugeiconsIcon icon={Camera01Icon} className="size-3" strokeWidth={1.5} />
                  </button>
                </div>

                {/* Name + badges */}
                <div className="flex-1 min-w-0 text-center sm:text-left">
                  {editingName ? (
                    <div className="flex items-center gap-2">
                      <Input
                        value={nameVal}
                        onChange={(e) => setNameVal(e.target.value)}
                        className="h-8 text-base font-semibold"
                        autoFocus
                      />
                      <Button size="icon" variant="ghost" className="h-8 w-8 shrink-0 text-emerald-600 hover:text-emerald-600" onClick={handleNameSave}>
                        <HugeiconsIcon icon={CheckmarkCircle01Icon} className="size-4" strokeWidth={2} />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-8 w-8 shrink-0" onClick={() => { setNameVal(displayName); setEditingName(false) }}>
                        <HugeiconsIcon icon={Cancel01Icon} className="size-4" strokeWidth={1.5} />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2 sm:justify-start">
                      <h2 className="text-lg font-semibold">{displayName}</h2>
                      <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => setEditingName(true)}>
                        <HugeiconsIcon icon={Edit01Icon} className="size-3" strokeWidth={1.5} />
                      </Button>
                    </div>
                  )}
                  <p className="mt-0.5 text-sm text-muted-foreground">john@example.com</p>
                  <div className="mt-2 flex flex-wrap items-center justify-center gap-1.5 sm:justify-start">
                    <Badge variant="secondary" className="text-[10px]">Free Plan</Badge>
                    <Badge className="bg-emerald-500/10 text-emerald-600 text-[10px]">
                      <HugeiconsIcon icon={CheckmarkCircle01Icon} className="mr-1 size-2.5" strokeWidth={2} />
                      Verified
                    </Badge>
                  </div>
                  <p className="mt-3 text-[11px] text-muted-foreground">Member since Jan 15, 2026</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact info */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Personal Information</CardTitle>
              <CardDescription className="text-xs">Update your contact details. Changes are saved immediately.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <EditableField label="Email address" value="john@example.com" icon={Mail01Icon} type="email" placeholder="you@example.com" />
              <EditableField label="Phone number" value="" icon={SmartPhone01Icon} type="tel" placeholder="+1 (555) 000-0000" />
              <EditableField label="Location" value="Mumbai, India" icon={Location01Icon} placeholder="City, Country" />
              <EditableField label="Bio" value="" icon={UserCircle02Icon} placeholder="A short bio about yourself…" />
            </CardContent>
          </Card>

          {/* Password */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Password & Security</CardTitle>
              <CardDescription className="text-xs">Keep your account secure with a strong password.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">Current password</Label>
                <Input type="password" placeholder="••••••••••••" className="h-8 text-sm" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">New password</Label>
                <Input type="password" placeholder="••••••••••••" className="h-8 text-sm" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">Confirm new password</Label>
                <Input type="password" placeholder="••••••••••••" className="h-8 text-sm" />
              </div>
              <Button size="sm" className="gap-1.5">
                <HugeiconsIcon icon={Key01Icon} className="size-3.5" strokeWidth={1.5} />
                Update password
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Account stats */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Account Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { label: "Total files",    value: "2,430",   color: "text-blue-500",    bg: "bg-blue-500/10",    icon: Folder01Icon     },
                { label: "Storage used",   value: "128.4 GB",color: "text-violet-500",  bg: "bg-violet-500/10",  icon: HardDriveIcon    },
                { label: "Share links",    value: "18",      color: "text-emerald-500", bg: "bg-emerald-500/10", icon: LinkSquare01Icon  },
                { label: "Workspaces",     value: "4",       color: "text-amber-500",   bg: "bg-amber-500/10",   icon: Folder01Icon     },
              ].map((s) => (
                <div key={s.label} className="flex items-center gap-3">
                  <div className={cn("flex size-8 shrink-0 items-center justify-center rounded-lg", s.bg)}>
                    <HugeiconsIcon icon={s.icon} className={cn("size-3.5", s.color)} strokeWidth={1.5} />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground">{s.label}</p>
                    <p className="text-sm font-semibold">{s.value}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Active sessions */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold">Active Sessions</CardTitle>
                <HugeiconsIcon icon={Shield01Icon} className="size-4 text-muted-foreground" strokeWidth={1.5} />
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {SESSIONS.map((s, i) => (
                <div key={i}>
                  {i > 0 && <Separator className="mb-3" />}
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-xs font-medium truncate">{s.device}</p>
                        {s.current && (
                          <Badge className="bg-emerald-500/10 text-emerald-600 text-[9px] leading-none py-0.5">You</Badge>
                        )}
                      </div>
                      <p className="mt-0.5 text-[11px] text-muted-foreground">{s.location}</p>
                      <div className="mt-0.5 flex items-center gap-1 text-[11px] text-muted-foreground">
                        <HugeiconsIcon icon={Clock01Icon} className="size-2.5" strokeWidth={1.5} />
                        {s.lastSeen}
                      </div>
                    </div>
                    {!s.current && (
                      <Button size="sm" variant="ghost" className="h-6 shrink-0 text-[10px] text-destructive hover:text-destructive px-2">
                        Revoke
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Recent activity */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {ACTIVITY.map((a, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <div className={cn("mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-md", a.bg)}>
                    <HugeiconsIcon icon={a.icon} className={cn("size-3", a.color)} strokeWidth={1.5} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs">{a.text}</p>
                    <p className="text-[11px] text-muted-foreground">{a.time}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Danger zone */}
          <Card className="border-destructive/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-destructive">Danger Zone</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-[11px] text-muted-foreground">
                Deleting your account is permanent and cannot be undone. All your data will be removed from BYOC — your cloud storage bucket is unaffected.
              </p>
              <Button size="sm" variant="outline" className="w-full border-destructive/30 text-destructive hover:text-destructive hover:bg-destructive/5 text-xs">
                Delete account
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
