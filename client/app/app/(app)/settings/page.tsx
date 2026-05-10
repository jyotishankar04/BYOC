"use client"

import { useState } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  UserCircle02Icon,
  Settings01Icon,
  Notification01Icon,
  LockedIcon,
  EyeIcon,
  Delete01Icon,
  Cancel01Icon,
  CheckmarkCircle01Icon,
  Copy01Icon,
  CloudServerIcon,
  Key01Icon,
  ArrowRight01Icon,
  Globe02Icon,
  ComputerIcon,
  Moon02Icon,
  Sun03Icon,
} from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

// ─── Section types ─────────────────────────────────────────────────────────────

type Section =
  | "profile"
  | "account"
  | "appearance"
  | "notifications"
  | "security"
  | "privacy"
  | "danger"

const SECTIONS: { id: Section; label: string }[] = [
  { id: "profile",       label: "Profile"       },
  { id: "account",       label: "Account"       },
  { id: "appearance",    label: "Appearance"    },
  { id: "notifications", label: "Notifications" },
  { id: "security",      label: "Security"      },
  { id: "privacy",       label: "Privacy"       },
  { id: "danger",        label: "Danger Zone"   },
]

// ─── Shared ────────────────────────────────────────────────────────────────────

function SectionHeader({ title, description }: { title: string; description: string }) {
  return (
    <div>
      <h2 className="text-base font-semibold">{title}</h2>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
    </div>
  )
}

function SaveButton({ onSave }: { onSave: () => void }) {
  const [saved, setSaved] = useState(false)
  const handle = () => { onSave(); setSaved(true); setTimeout(() => setSaved(false), 2000) }
  return (
    <Button size="sm" onClick={handle}>
      {saved
        ? <><HugeiconsIcon icon={CheckmarkCircle01Icon} className="size-3.5" strokeWidth={2} />Saved</>
        : "Save changes"}
    </Button>
  )
}

// ─── Profile ───────────────────────────────────────────────────────────────────

function ProfileSection() {
  const [name,     setName]     = useState("John Doe")
  const [username, setUsername] = useState("johndoe")
  const [bio,      setBio]      = useState("Building BYOC — your cloud, your rules.")
  const [location, setLocation] = useState("Mumbai, India")
  const [website,  setWebsite]  = useState("https://johndoe.dev")

  return (
    <div className="space-y-6">
      <SectionHeader title="Profile" description="Your public profile information." />
      <Separator />

      <div className="max-w-lg space-y-5">
        {/* Avatar */}
        <div className="space-y-2">
          <Label className="text-xs font-medium">Profile picture</Label>
          <div className="flex items-center gap-4">
            <Avatar className="size-16">
              <AvatarFallback className="text-lg font-semibold">JD</AvatarFallback>
            </Avatar>
            <div className="flex gap-2">
              <Button size="sm" variant="outline">Upload photo</Button>
              <Button size="sm" variant="ghost" className="text-muted-foreground">Remove</Button>
            </div>
          </div>
          <p className="text-[11px] text-muted-foreground">JPG or PNG. Max 2 MB.</p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="p-name" className="text-xs font-medium">Display name</Label>
            <Input id="p-name" value={name} onChange={(e) => setName(e.target.value)} className="h-8 text-sm" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="p-user" className="text-xs font-medium">Username</Label>
            <div className="flex items-center">
              <span className="flex h-8 items-center rounded-l-md border border-r-0 bg-muted px-2.5 text-xs text-muted-foreground shrink-0">@</span>
              <Input id="p-user" value={username} onChange={(e) => setUsername(e.target.value)} className="h-8 rounded-l-none text-sm" />
            </div>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="p-bio" className="text-xs font-medium">Bio</Label>
          <Textarea
            id="p-bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={3}
            className="resize-none text-sm"
            placeholder="Tell the world about yourself"
          />
          <p className="text-right text-[11px] text-muted-foreground">{bio.length}/160</p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="p-loc" className="text-xs font-medium">Location</Label>
            <Input id="p-loc" value={location} onChange={(e) => setLocation(e.target.value)} className="h-8 text-sm" placeholder="City, Country" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="p-web" className="text-xs font-medium">Website</Label>
            <Input id="p-web" value={website} onChange={(e) => setWebsite(e.target.value)} className="h-8 text-sm" placeholder="https://" />
          </div>
        </div>

        <SaveButton onSave={() => {}} />
      </div>
    </div>
  )
}

// ─── Account ───────────────────────────────────────────────────────────────────

function AccountSection() {
  const [email,        setEmail]        = useState("john@example.com")
  const [editingEmail, setEditingEmail] = useState(false)
  const [newEmail,     setNewEmail]     = useState("")
  const [showPwForm,   setShowPwForm]   = useState(false)
  const [showCurrent,  setShowCurrent]  = useState(false)
  const [showNew,      setShowNew]      = useState(false)
  const [currentPw,    setCurrentPw]    = useState("")
  const [newPw,        setNewPw]        = useState("")
  const [confirmPw,    setConfirmPw]    = useState("")

  const PROVIDERS = [
    { name: "Google",  connected: true,  account: "john@example.com" },
    { name: "GitHub",  connected: false, account: null               },
  ]

  return (
    <div className="space-y-6">
      <SectionHeader title="Account" description="Manage your email, password, and connected accounts." />
      <Separator />

      {/* Email */}
      <div className="max-w-lg space-y-3">
        <Label className="text-xs font-medium">Email address</Label>
        {editingEmail ? (
          <div className="flex gap-2">
            <Input
              autoFocus
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder={email}
              className="h-8 text-sm"
            />
            <Button size="sm" onClick={() => { if (newEmail.trim()) setEmail(newEmail.trim()); setEditingEmail(false); setNewEmail("") }}>
              Update
            </Button>
            <Button size="sm" variant="ghost" onClick={() => { setEditingEmail(false); setNewEmail("") }}>Cancel</Button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <div className="flex h-8 flex-1 items-center rounded-md border bg-muted/30 px-3 text-sm">
              {email}
            </div>
            <Button size="sm" variant="outline" onClick={() => setEditingEmail(true)}>Change</Button>
          </div>
        )}
      </div>

      <Separator />

      {/* Password */}
      <div className="max-w-lg space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-medium">Password</Label>
          <Button size="sm" variant="ghost" className="h-6 text-xs" onClick={() => setShowPwForm((v) => !v)}>
            {showPwForm ? "Cancel" : "Change password"}
          </Button>
        </div>

        {!showPwForm && (
          <div className="flex h-8 flex-1 items-center rounded-md border bg-muted/30 px-3 text-sm tracking-widest text-muted-foreground">
            ••••••••••••
          </div>
        )}

        {showPwForm && (
          <div className="space-y-3">
            {[
              { label: "Current password", value: currentPw, set: setCurrentPw, show: showCurrent, toggleShow: () => setShowCurrent(v => !v) },
              { label: "New password",     value: newPw,     set: setNewPw,     show: showNew,    toggleShow: () => setShowNew(v => !v) },
            ].map((field) => (
              <div key={field.label} className="space-y-1.5">
                <Label className="text-xs font-medium">{field.label}</Label>
                <div className="relative">
                  <Input
                    type={field.show ? "text" : "password"}
                    value={field.value}
                    onChange={(e) => field.set(e.target.value)}
                    className="h-8 pr-8 text-sm"
                  />
                  <button
                    type="button"
                    onClick={field.toggleShow}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <HugeiconsIcon icon={EyeIcon} className="size-3.5" strokeWidth={1.5} />
                  </button>
                </div>
              </div>
            ))}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Confirm new password</Label>
              <Input
                type="password"
                value={confirmPw}
                onChange={(e) => setConfirmPw(e.target.value)}
                className={cn("h-8 text-sm", confirmPw && confirmPw !== newPw && "border-destructive")}
              />
              {confirmPw && confirmPw !== newPw && (
                <p className="text-[11px] text-destructive">Passwords do not match</p>
              )}
            </div>
            <Button
              size="sm"
              disabled={!currentPw || !newPw || newPw !== confirmPw}
              onClick={() => { setShowPwForm(false); setCurrentPw(""); setNewPw(""); setConfirmPw("") }}
            >
              Update password
            </Button>
          </div>
        )}
      </div>

      <Separator />

      {/* Connected providers */}
      <div className="max-w-lg space-y-3">
        <Label className="text-xs font-medium">Connected accounts</Label>
        <div className="space-y-2">
          {PROVIDERS.map((p) => (
            <div key={p.name} className="flex items-center gap-3 rounded-lg border px-4 py-3">
              <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted">
                <span className="text-xs font-bold">{p.name.charAt(0)}</span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{p.name}</p>
                {p.connected && <p className="text-[11px] text-muted-foreground">{p.account}</p>}
              </div>
              {p.connected ? (
                <Button size="sm" variant="outline" className="text-destructive hover:bg-destructive/5 hover:text-destructive">
                  Disconnect
                </Button>
              ) : (
                <Button size="sm" variant="outline">Connect</Button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Appearance ────────────────────────────────────────────────────────────────

function AppearanceSection() {
  const [theme,       setTheme]       = useState("system")
  const [compact,     setCompact]     = useState(false)
  const [dateFormat,  setDateFormat]  = useState("MMM D, YYYY")
  const [language,    setLanguage]    = useState("en")

  const THEMES = [
    { value: "light",  label: "Light",  icon: Sun03Icon   },
    { value: "dark",   label: "Dark",   icon: Moon02Icon  },
    { value: "system", label: "System", icon: ComputerIcon },
  ]

  return (
    <div className="space-y-6">
      <SectionHeader title="Appearance" description="Customize how BYOC looks and feels." />
      <Separator />

      <div className="max-w-lg space-y-6">
        {/* Theme */}
        <div className="space-y-3">
          <Label className="text-xs font-medium">Theme</Label>
          <RadioGroup
            value={theme}
            onValueChange={setTheme}
            className="grid grid-cols-3 gap-3"
          >
            {THEMES.map((t) => (
              <div key={t.value}>
                <RadioGroupItem value={t.value} id={`theme-${t.value}`} className="sr-only" />
                <Label
                  htmlFor={`theme-${t.value}`}
                  className={cn(
                    "flex cursor-pointer flex-col items-center gap-2.5 rounded-xl border p-4 transition-all",
                    theme === t.value
                      ? "border-primary bg-primary/5 shadow-sm"
                      : "hover:bg-accent",
                  )}
                >
                  {/* Mini UI preview */}
                  <div className={cn(
                    "w-full rounded-md border overflow-hidden",
                    t.value === "dark" ? "bg-zinc-900 border-zinc-700" : t.value === "light" ? "bg-white border-zinc-200" : "bg-gradient-to-b from-white to-zinc-900 border-zinc-300",
                  )}>
                    <div className={cn("h-2 w-full", t.value === "dark" ? "bg-zinc-800" : "bg-zinc-100")} />
                    <div className="flex gap-1 p-1.5">
                      <div className={cn("h-6 w-6 rounded", t.value === "dark" ? "bg-zinc-700" : "bg-zinc-200")} />
                      <div className="flex-1 space-y-1">
                        <div className={cn("h-1.5 w-full rounded-full", t.value === "dark" ? "bg-zinc-700" : "bg-zinc-200")} />
                        <div className={cn("h-1.5 w-2/3 rounded-full", t.value === "dark" ? "bg-zinc-700" : "bg-zinc-200")} />
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <HugeiconsIcon icon={t.icon} className="size-3.5 text-muted-foreground" strokeWidth={1.5} />
                    <span className="text-xs font-medium">{t.label}</span>
                  </div>
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        <Separator />

        {/* Compact mode */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Compact mode</p>
            <p className="text-[11px] text-muted-foreground">Reduce spacing and padding across the UI</p>
          </div>
          <Switch checked={compact} onCheckedChange={setCompact} />
        </div>

        <Separator />

        {/* Date format */}
        <div className="space-y-2">
          <Label className="text-xs font-medium">Date format</Label>
          <Select value={dateFormat} onValueChange={setDateFormat}>
            <SelectTrigger className="h-8 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="MMM D, YYYY">May 10, 2026</SelectItem>
              <SelectItem value="DD/MM/YYYY">10/05/2026</SelectItem>
              <SelectItem value="MM/DD/YYYY">05/10/2026</SelectItem>
              <SelectItem value="YYYY-MM-DD">2026-05-10</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Language */}
        <div className="space-y-2">
          <Label className="text-xs font-medium">Language</Label>
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger className="h-8 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="hi">Hindi</SelectItem>
              <SelectItem value="de">German</SelectItem>
              <SelectItem value="fr">French</SelectItem>
              <SelectItem value="es">Spanish</SelectItem>
              <SelectItem value="ja">Japanese</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )
}

// ─── Notifications ─────────────────────────────────────────────────────────────

function NotificationsSection() {
  const [email, setEmail] = useState({
    fileShared:    true,
    memberJoined:  true,
    storageAlert:  true,
    weeklyDigest:  false,
    securityAlert: true,
    linkExpiry:    false,
  })
  const [inApp, setInApp] = useState({
    badge: true,
    sound: false,
  })

  const toggleEmail = (key: keyof typeof email) =>
    setEmail((prev) => ({ ...prev, [key]: !prev[key] }))

  const toggleInApp = (key: keyof typeof inApp) =>
    setInApp((prev) => ({ ...prev, [key]: !prev[key] }))

  const EMAIL_ROWS = [
    { key: "fileShared"    as const, label: "File shared with you",          description: "When someone shares a file or folder with you"            },
    { key: "memberJoined"  as const, label: "New member joined",             description: "When someone accepts an invite to your workspace"         },
    { key: "storageAlert"  as const, label: "Storage limit warning",         description: "When your workspace storage reaches 80% or 100%"         },
    { key: "weeklyDigest"  as const, label: "Weekly activity digest",        description: "A summary of your workspace activity every Monday"       },
    { key: "securityAlert" as const, label: "Security alerts",               description: "Sign-ins from new devices or unusual activity"            },
    { key: "linkExpiry"    as const, label: "Share link expiry",             description: "When a share link you created is about to expire"         },
  ]

  const INAPP_ROWS = [
    { key: "badge" as const, label: "Show notification badge",  description: "Display unread count on the bell icon" },
    { key: "sound" as const, label: "Notification sound",       description: "Play a sound when a notification arrives" },
  ]

  return (
    <div className="space-y-6">
      <SectionHeader title="Notifications" description="Choose what updates you want to receive." />
      <Separator />

      <div className="space-y-6">
        {/* Email */}
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Email notifications</p>
          <div className="space-y-2">
            {EMAIL_ROWS.map((row) => (
              <div key={row.key} className="flex items-center gap-4 rounded-lg border px-4 py-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{row.label}</p>
                  <p className="text-[11px] text-muted-foreground">{row.description}</p>
                </div>
                <Switch checked={email[row.key]} onCheckedChange={() => toggleEmail(row.key)} />
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* In-app */}
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">In-app notifications</p>
          <div className="space-y-2">
            {INAPP_ROWS.map((row) => (
              <div key={row.key} className="flex items-center gap-4 rounded-lg border px-4 py-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{row.label}</p>
                  <p className="text-[11px] text-muted-foreground">{row.description}</p>
                </div>
                <Switch checked={inApp[row.key]} onCheckedChange={() => toggleInApp(row.key)} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Security ──────────────────────────────────────────────────────────────────

function SecuritySection() {
  const [twoFAEnabled, setTwoFAEnabled] = useState(false)
  const [copiedKey,    setCopiedKey]    = useState<string | null>(null)

  const SESSIONS = [
    { id: "s1", device: "MacBook Pro",  browser: "Chrome 124",  location: "Mumbai, India",    lastActive: "Now",         current: true  },
    { id: "s2", device: "iPhone 15",    browser: "Safari 17",   location: "Delhi, India",     lastActive: "2 hours ago", current: false },
    { id: "s3", device: "Windows PC",   browser: "Edge 123",    location: "Hyderabad, India", lastActive: "3 days ago",  current: false },
  ]

  const API_KEYS = [
    { id: "k1", name: "Personal Key",  prefix: "byoc_sk_live_3Hm9pL", created: "May 5, 2026",  lastUsed: "Today"       },
    { id: "k2", name: "CI/CD Key",     prefix: "byoc_sk_live_7Xq2nW", created: "Apr 20, 2026", lastUsed: "Yesterday"   },
  ]

  const [sessions, setSessions] = useState(SESSIONS)
  const [apiKeys,  setApiKeys]  = useState(API_KEYS)

  const copyKey = (id: string, prefix: string) => {
    navigator.clipboard.writeText(`${prefix}•••••••••••`).catch(() => {})
    setCopiedKey(id)
    setTimeout(() => setCopiedKey(null), 2000)
  }

  return (
    <div className="space-y-6">
      <SectionHeader title="Security" description="Keep your account safe and manage access." />
      <Separator />

      {/* 2FA */}
      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Two-factor authentication</p>
        <div className="flex items-center gap-4 rounded-lg border px-4 py-4">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted">
            <HugeiconsIcon icon={LockedIcon} className="size-4 text-muted-foreground" strokeWidth={1.5} />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">Two-factor authentication</p>
            <p className="text-[11px] text-muted-foreground">
              {twoFAEnabled ? "2FA is enabled. Your account has an extra layer of security." : "Add an extra layer of security to your account."}
            </p>
          </div>
          <Badge className={cn("text-[10px]", twoFAEnabled ? "bg-emerald-500/10 text-emerald-600" : "bg-muted text-muted-foreground")}>
            {twoFAEnabled ? "Enabled" : "Disabled"}
          </Badge>
          <Button size="sm" variant="outline" onClick={() => setTwoFAEnabled((v) => !v)}>
            {twoFAEnabled ? "Disable" : "Enable"}
          </Button>
        </div>
      </div>

      <Separator />

      {/* Sessions */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Active sessions</p>
          <Button
            size="sm"
            variant="ghost"
            className="h-6 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={() => setSessions((prev) => prev.filter((s) => s.current))}
          >
            Revoke all others
          </Button>
        </div>
        <div className="overflow-hidden rounded-xl border">
          {sessions.map((s, i) => (
            <div key={s.id} className={cn("flex items-center gap-3 px-4 py-3", i > 0 && "border-t")}>
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                <HugeiconsIcon icon={ComputerIcon} className="size-4 text-muted-foreground" strokeWidth={1.5} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate text-xs font-medium">{s.device} · {s.browser}</p>
                  {s.current && <Badge className="bg-emerald-500/10 text-emerald-600 text-[10px]">Current</Badge>}
                </div>
                <p className="text-[11px] text-muted-foreground">{s.location} · {s.lastActive}</p>
              </div>
              {!s.current && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 text-xs text-destructive hover:bg-destructive/10"
                  onClick={() => setSessions((prev) => prev.filter((x) => x.id !== s.id))}
                >
                  Revoke
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* API Keys */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">API keys</p>
          <Button size="sm" variant="outline" onClick={() => {
            setApiKeys((prev) => [
              ...prev,
              { id: `k${Date.now()}`, name: "New Key", prefix: "byoc_sk_live_" + Math.random().toString(36).slice(2, 8), created: "Just now", lastUsed: "Never" },
            ])
          }}>
            Generate key
          </Button>
        </div>
        {apiKeys.length === 0 ? (
          <p className="text-sm text-muted-foreground">No API keys yet.</p>
        ) : (
          <div className="overflow-hidden rounded-xl border">
            {apiKeys.map((k, i) => (
              <div key={k.id} className={cn("flex items-center gap-3 px-4 py-3", i > 0 && "border-t")}>
                <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                  <HugeiconsIcon icon={Key01Icon} className="size-4 text-muted-foreground" strokeWidth={1.5} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium">{k.name}</p>
                  <p className="font-mono text-[11px] text-muted-foreground">{k.prefix}••••••••</p>
                </div>
                <div className="hidden text-right sm:block">
                  <p className="text-[11px] text-muted-foreground">Created {k.created}</p>
                  <p className="text-[11px] text-muted-foreground">Last used {k.lastUsed}</p>
                </div>
                <button
                  onClick={() => copyKey(k.id, k.prefix)}
                  className="flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                >
                  <HugeiconsIcon
                    icon={copiedKey === k.id ? CheckmarkCircle01Icon : Copy01Icon}
                    className={cn("size-3.5", copiedKey === k.id && "text-emerald-500")}
                    strokeWidth={1.5}
                  />
                </button>
                <button
                  onClick={() => setApiKeys((prev) => prev.filter((x) => x.id !== k.id))}
                  className="flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                >
                  <HugeiconsIcon icon={Delete01Icon} className="size-3.5" strokeWidth={1.5} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Privacy ───────────────────────────────────────────────────────────────────

function PrivacySection() {
  const [analytics,    setAnalytics]    = useState(true)
  const [crashReports, setCrashReports] = useState(true)
  const [publicProfile, setPublicProfile] = useState(false)
  const [exported,     setExported]     = useState(false)

  const ROWS = [
    { label: "Usage analytics",     description: "Help improve BYOC by sending anonymous usage data",       value: analytics,     set: setAnalytics     },
    { label: "Crash reports",       description: "Automatically send crash logs to help fix bugs",          value: crashReports,  set: setCrashReports  },
    { label: "Public profile",      description: "Allow others to view your profile and shared activity",   value: publicProfile, set: setPublicProfile  },
  ]

  return (
    <div className="space-y-6">
      <SectionHeader title="Privacy" description="Control your data and how it's used." />
      <Separator />

      <div className="space-y-2">
        {ROWS.map((row) => (
          <div key={row.label} className="flex items-center gap-4 rounded-lg border px-4 py-3">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium">{row.label}</p>
              <p className="text-[11px] text-muted-foreground">{row.description}</p>
            </div>
            <Switch checked={row.value} onCheckedChange={row.set} />
          </div>
        ))}
      </div>

      <Separator />

      {/* Data export */}
      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Your data</p>
        <div className="flex items-center gap-4 rounded-lg border px-4 py-4">
          <div className="flex-1">
            <p className="text-sm font-medium">Export your data</p>
            <p className="text-[11px] text-muted-foreground">
              Download a copy of your account data including profile, activity logs, and settings.
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => { setExported(true); setTimeout(() => setExported(false), 3000) }}
          >
            {exported
              ? <><HugeiconsIcon icon={CheckmarkCircle01Icon} className="size-3.5 text-emerald-500" strokeWidth={2} />Requested</>
              : "Request export"}
          </Button>
        </div>
        {exported && (
          <p className="text-[11px] text-muted-foreground">
            We&apos;ll email you a download link at <strong>john@example.com</strong> within 24 hours.
          </p>
        )}
      </div>
    </div>
  )
}

// ─── Danger Zone ───────────────────────────────────────────────────────────────

function DangerSection() {
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleteInput,   setDeleteInput]   = useState("")

  return (
    <div className="space-y-6">
      <SectionHeader title="Danger Zone" description="Permanent and irreversible account actions." />
      <Separator />

      <div className="space-y-3">
        {/* Deactivate */}
        <div className="flex flex-col gap-3 rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-4 sm:flex-row sm:items-center">
          <div className="flex-1">
            <p className="text-sm font-medium">Deactivate account</p>
            <p className="text-[11px] text-muted-foreground">Temporarily disable your account. You can reactivate at any time.</p>
          </div>
          <Button size="sm" variant="outline" className="border-destructive/30 text-destructive hover:bg-destructive/10">
            Deactivate
          </Button>
        </div>

        {/* Delete */}
        <div className="rounded-lg border border-destructive/40 bg-destructive/5 px-4 py-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-destructive">Delete account</p>
              <p className="text-[11px] text-muted-foreground">
                Permanently delete your account and all associated data. This cannot be undone.
              </p>
            </div>
            <Button size="sm" variant="destructive" onClick={() => setConfirmDelete(true)}>
              <HugeiconsIcon icon={Delete01Icon} className="size-3.5" strokeWidth={1.5} />
              Delete account
            </Button>
          </div>

          {confirmDelete && (
            <div className="mt-4 space-y-3 border-t border-destructive/20 pt-4">
              <p className="text-xs text-muted-foreground">
                Type <strong className="text-foreground">john@example.com</strong> to confirm.
              </p>
              <div className="flex gap-2">
                <Input
                  placeholder="john@example.com"
                  value={deleteInput}
                  onChange={(e) => setDeleteInput(e.target.value)}
                  className="h-8 text-sm"
                />
                <Button size="sm" variant="destructive" disabled={deleteInput !== "john@example.com"}>
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

export default function SettingsPage() {
  const [section, setSection] = useState<Section>("profile")

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Settings</h1>
        <p className="mt-1 text-xs text-muted-foreground">Manage your account, preferences, and security.</p>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row lg:gap-10">
        {/* Left nav */}
        <nav className="flex shrink-0 flex-row gap-1 overflow-x-auto pb-1 lg:w-44 lg:flex-col lg:pb-0">
          {SECTIONS.map((s) => (
            <button
              key={s.id}
              onClick={() => setSection(s.id)}
              className={cn(
                "whitespace-nowrap rounded-md px-3 py-1.5 text-left text-sm transition-colors",
                s.id === "danger"
                  ? "text-destructive hover:bg-destructive/10"
                  : section === s.id
                    ? "bg-accent font-medium text-foreground"
                    : "text-muted-foreground hover:bg-accent/60 hover:text-foreground",
              )}
            >
              {s.label}
            </button>
          ))}
        </nav>

        {/* Content */}
        <div className="min-w-0 flex-1">
          {section === "profile"       && <ProfileSection />}
          {section === "account"       && <AccountSection />}
          {section === "appearance"    && <AppearanceSection />}
          {section === "notifications" && <NotificationsSection />}
          {section === "security"      && <SecuritySection />}
          {section === "privacy"       && <PrivacySection />}
          {section === "danger"        && <DangerSection />}
        </div>
      </div>
    </div>
  )
}
