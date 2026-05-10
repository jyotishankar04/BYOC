"use client"

import { useState, useCallback } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  LegalDocument01Icon,
  Video01Icon,
  Image01Icon,
  ZipIcon,
  LinkSquare01Icon,
  Globe02Icon,
  LockedIcon,
  Copy01Icon,
  Delete01Icon,
  PencilEdit01Icon,
  Download01Icon,
  EyeIcon,
  Cancel01Icon,
  CheckmarkCircle01Icon,
  Calendar01Icon,
  Analytics01Icon,
  FileUploadIcon,
  Settings01Icon,
  Share01Icon,
} from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import { ButtonGroup } from "@/components/ui/button-group"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"
import { cn } from "@/lib/utils"
import { SearchInput } from "@/components/shared/search-input"
import { KebabTrigger } from "@/components/shared/kebab-trigger"

// ─── Types ─────────────────────────────────────────────────────────────────────

type AccessType  = "Public" | "Password Protected" | "Private"
type LinkStatus  = "Active" | "Expired" | "Disabled"
type FileType    = "Document" | "Video" | "Image" | "Spreadsheet" | "Slides" | "Archive"
type StatusFilter = "All" | "Active" | "Expired" | "Disabled"
type AccessFilter = "All" | "Public" | "Password Protected" | "Private"
type SortKey      = "newest" | "oldest" | "most-visited"
type ExpiryOption = "never" | "1d" | "7d" | "30d" | "custom"

interface SharedLink {
  id: string
  fileName: string
  fileType: FileType
  shareUrl: string
  accessType: AccessType
  status: LinkStatus
  createdAt: string
  createdMs: number
  expiresAt: string | null
  visits: number
  allowDownload: boolean
  password?: string
  folder: string
}

interface CreateFormData {
  fileName: string
  accessType: AccessType
  password: string
  expiry: ExpiryOption
  customExpiry: string
  allowDownload: boolean
}

// ─── Visual configs ────────────────────────────────────────────────────────────

const FILE_TYPE_VISUAL: Record<FileType, {
  icon: typeof LegalDocument01Icon
  iconColor: string
  gradFrom: string
  gradTo: string
}> = {
  Document:    { icon: LegalDocument01Icon, iconColor: "text-amber-500",   gradFrom: "from-amber-500/15",   gradTo: "to-amber-600/5"   },
  Video:       { icon: Video01Icon,         iconColor: "text-blue-500",    gradFrom: "from-blue-500/15",    gradTo: "to-blue-600/5"    },
  Image:       { icon: Image01Icon,         iconColor: "text-violet-500",  gradFrom: "from-violet-500/15",  gradTo: "to-violet-600/5"  },
  Spreadsheet: { icon: LegalDocument01Icon, iconColor: "text-emerald-500", gradFrom: "from-emerald-500/15", gradTo: "to-emerald-600/5" },
  Slides:      { icon: LegalDocument01Icon, iconColor: "text-orange-500",  gradFrom: "from-orange-500/15",  gradTo: "to-orange-600/5"  },
  Archive:     { icon: ZipIcon,            iconColor: "text-slate-500",   gradFrom: "from-slate-500/15",   gradTo: "to-slate-600/5"   },
}

const ACCESS_CONFIG: Record<AccessType, {
  icon: typeof Globe02Icon
  label: string
  className: string
}> = {
  "Public":             { icon: Globe02Icon, label: "Public",    className: "bg-emerald-500/10 text-emerald-600" },
  "Password Protected": { icon: LockedIcon,  label: "Protected", className: "bg-amber-500/10 text-amber-600"   },
  "Private":            { icon: LockedIcon,  label: "Private",   className: "bg-slate-500/10 text-slate-500"   },
}

const STATUS_CONFIG: Record<LinkStatus, { className: string }> = {
  Active:   { className: "bg-emerald-500/10 text-emerald-600" },
  Expired:  { className: "bg-rose-500/10 text-rose-600"       },
  Disabled: { className: "bg-slate-500/10 text-slate-500"     },
}

const STATUS_FILTERS: StatusFilter[] = ["All", "Active", "Expired", "Disabled"]

// ─── Dummy data ────────────────────────────────────────────────────────────────

const INITIAL_LINKS: SharedLink[] = [
  { id: "sl-1",  fileName: "invoice-may-2026.pdf",    fileType: "Document",    shareUrl: "https://byoc.app/share/inv-abc123",  accessType: "Public",             status: "Active",   createdAt: "May 9, 2026",  createdMs: 1746748800000, expiresAt: null,            visits: 124, allowDownload: true,  folder: "Finance"            },
  { id: "sl-2",  fileName: "project-demo.mp4",        fileType: "Video",       shareUrl: "https://byoc.app/share/demo-def456", accessType: "Password Protected", status: "Active",   createdAt: "May 10, 2026", createdMs: 1746835200000, expiresAt: "Jun 10, 2026",  visits: 340, allowDownload: false, folder: "Projects / Videos", password: "••••••" },
  { id: "sl-3",  fileName: "profile-photo.jpg",       fileType: "Image",       shareUrl: "https://byoc.app/share/photo-xyz789",accessType: "Public",             status: "Disabled", createdAt: "May 7, 2026",  createdMs: 1746576000000, expiresAt: null,            visits: 58,  allowDownload: true,  folder: "Personal / Photos"  },
  { id: "sl-4",  fileName: "budget-2026.xlsx",        fileType: "Spreadsheet", shareUrl: "https://byoc.app/share/budget-ghi",  accessType: "Private",            status: "Expired",  createdAt: "Apr 28, 2026", createdMs: 1745798400000, expiresAt: "May 5, 2026",   visits: 89,  allowDownload: false, folder: "Finance"            },
  { id: "sl-5",  fileName: "marketing-campaign.pdf",  fileType: "Document",    shareUrl: "https://byoc.app/share/mkt-jkl345", accessType: "Password Protected", status: "Active",   createdAt: "Apr 25, 2026", createdMs: 1745539200000, expiresAt: "May 25, 2026",  visits: 210, allowDownload: true,  folder: "Projects",          password: "••••••" },
  { id: "sl-6",  fileName: "employee-handbook.pdf",   fileType: "Document",    shareUrl: "https://byoc.app/share/eh-mno678",  accessType: "Public",             status: "Active",   createdAt: "Apr 10, 2026", createdMs: 1744243200000, expiresAt: null,            visits: 456, allowDownload: true,  folder: "HR"                 },
  { id: "sl-7",  fileName: "product-roadmap.pptx",   fileType: "Slides",      shareUrl: "https://byoc.app/share/rm-pqr901",  accessType: "Password Protected", status: "Active",   createdAt: "Apr 25, 2026", createdMs: 1745539200001, expiresAt: "Jun 25, 2026",  visits: 67,  allowDownload: false, folder: "Projects",          password: "••••••" },
  { id: "sl-8",  fileName: "team-photo.png",          fileType: "Image",       shareUrl: "https://byoc.app/share/team-stu234",accessType: "Public",             status: "Active",   createdAt: "Apr 10, 2026", createdMs: 1744243200001, expiresAt: null,            visits: 89,  allowDownload: true,  folder: "Personal / Photos"  },
  { id: "sl-9",  fileName: "pitch-deck.pptx",        fileType: "Slides",      shareUrl: "https://byoc.app/share/pd-vwx567",  accessType: "Password Protected", status: "Expired",  createdAt: "Feb 28, 2026", createdMs: 1740700800000, expiresAt: "Mar 15, 2026",  visits: 124, allowDownload: false, folder: "Sales",             password: "••••••" },
  { id: "sl-10", fileName: "terms-of-service.pdf",   fileType: "Document",    shareUrl: "https://byoc.app/share/tos-yza890", accessType: "Public",             status: "Active",   createdAt: "Mar 20, 2026", createdMs: 1742428800000, expiresAt: null,            visits: 891, allowDownload: true,  folder: "Legal"              },
]

// ─── Selectable files for create dialog ───────────────────────────────────────

const SELECTABLE_FILES: { name: string; type: FileType; folder: string }[] = [
  { name: "invoice-may-2026.pdf",   type: "Document",    folder: "Finance"           },
  { name: "project-demo.mp4",       type: "Video",       folder: "Projects / Videos" },
  { name: "hero-banner.png",        type: "Image",       folder: "Projects / Assets" },
  { name: "q2-report.docx",        type: "Document",    folder: "Reports"           },
  { name: "budget-2026.xlsx",      type: "Spreadsheet", folder: "Finance"           },
  { name: "product-roadmap.pptx",  type: "Slides",      folder: "Projects"          },
  { name: "profile-photo.jpg",     type: "Image",       folder: "Personal / Photos" },
  { name: "employee-handbook.pdf", type: "Document",    folder: "HR"                },
  { name: "pitch-deck.pptx",      type: "Slides",      folder: "Sales"             },
  { name: "assets-backup.zip",    type: "Archive",     folder: "Root"              },
]

// ─── Helpers ───────────────────────────────────────────────────────────────────

function calcExpiryLabel(expiry: ExpiryOption, custom: string): string | null {
  if (expiry === "never") return null
  if (expiry === "custom") return custom || "Custom"
  const days = expiry === "1d" ? 1 : expiry === "7d" ? 7 : 30
  const d = new Date(Date.now() + days * 86400000)
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
}

function getLinkActivity(link: SharedLink) {
  const acts = [
    { icon: Share01Icon,           iconColor: "text-violet-500", iconBg: "bg-violet-500/10", text: "Link created",                             time: link.createdAt },
    { icon: FileUploadIcon,        iconColor: "text-blue-500",   iconBg: "bg-blue-500/10",   text: `File originally uploaded`,                 time: link.createdAt },
  ]
  if (link.visits > 0) {
    acts.push({ icon: EyeIcon, iconColor: "text-blue-500", iconBg: "bg-blue-500/10", text: `Visited ${link.visits.toLocaleString()} time${link.visits !== 1 ? "s" : ""}`, time: "Various times" })
  }
  if (link.status === "Disabled") {
    acts.push({ icon: Cancel01Icon, iconColor: "text-rose-500", iconBg: "bg-rose-500/10", text: "Link disabled", time: "Recently" })
  }
  if (link.status === "Expired") {
    acts.push({ icon: Calendar01Icon, iconColor: "text-rose-500", iconBg: "bg-rose-500/10", text: `Link expired on ${link.expiresAt}`, time: link.expiresAt ?? "" })
  }
  return acts
}

// ─── Shared menu items (polymorphic) ──────────────────────────────────────────

function LinkMenuItems({
  as: As,
  Sep,
  link,
  onCopy,
  onViewDetails,
  onDisable,
  onDelete,
}: {
  as: typeof ContextMenuItem | typeof DropdownMenuItem
  Sep: typeof ContextMenuSeparator | typeof DropdownMenuSeparator
  link: SharedLink
  onCopy: () => void
  onViewDetails: () => void
  onDisable: () => void
  onDelete: () => void
}) {
  return (
    <>
      <As onClick={onCopy} className="gap-2">
        <HugeiconsIcon icon={Copy01Icon} className="size-3.5" strokeWidth={1.5} />
        Copy Link
      </As>
      <As onClick={() => window.open(link.shareUrl, "_blank")} className="gap-2">
        <HugeiconsIcon icon={LinkSquare01Icon} className="size-3.5" strokeWidth={1.5} />
        Open Link
      </As>
      <Sep />
      <As onClick={onViewDetails} className="gap-2">
        <HugeiconsIcon icon={Settings01Icon} className="size-3.5" strokeWidth={1.5} />
        View Details
      </As>
      <As onClick={onDisable} className="gap-2">
        <HugeiconsIcon
          icon={link.status === "Disabled" ? CheckmarkCircle01Icon : Cancel01Icon}
          className="size-3.5"
          strokeWidth={1.5}
        />
        {link.status === "Disabled" ? "Enable Link" : "Disable Link"}
      </As>
      <Sep />
      <As variant="destructive" onClick={onDelete} className="gap-2">
        <HugeiconsIcon icon={Delete01Icon} className="size-3.5" strokeWidth={1.5} />
        Delete
      </As>
    </>
  )
}

// ─── Shared link row ───────────────────────────────────────────────────────────

function SharedLinkRow({
  link,
  isSelected,
  copiedId,
  showBorder,
  onClick,
  onCopy,
  onDisable,
  onDelete,
}: {
  link: SharedLink
  isSelected: boolean
  copiedId: string | null
  showBorder: boolean
  onClick: (link: SharedLink) => void
  onCopy: (id: string, url: string) => void
  onDisable: (id: string) => void
  onDelete: (id: string) => void
}) {
  const ftv = FILE_TYPE_VISUAL[link.fileType]
  const acc = ACCESS_CONFIG[link.accessType]
  const sta = STATUS_CONFIG[link.status]
  const isCopied = copiedId === link.id

  const menuProps = {
    link,
    onCopy:        () => onCopy(link.id, link.shareUrl),
    onViewDetails: () => onClick(link),
    onDisable:     () => onDisable(link.id),
    onDelete:      () => onDelete(link.id),
  }

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div
          onClick={() => onClick(link)}
          className={cn(
            "group flex w-full cursor-pointer items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-accent/50",
            showBorder && "border-t",
            isSelected && "bg-primary/5 ring-inset ring-1 ring-primary/20",
            link.status !== "Active" && "opacity-70",
          )}
        >
          {/* File icon */}
          <div className={cn("flex size-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br", ftv.gradFrom, ftv.gradTo)}>
            <HugeiconsIcon icon={ftv.icon} className={cn("size-4", ftv.iconColor)} strokeWidth={1.5} />
          </div>

          {/* Name + URL */}
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-medium">{link.fileName}</p>
            <p className="truncate text-[11px] text-muted-foreground">{link.shareUrl}</p>
          </div>

          {/* Metadata columns */}
          <div className="hidden items-center gap-3 sm:flex">
            <Badge variant="secondary" className={cn("shrink-0 gap-1 text-[10px]", acc.className)}>
              <HugeiconsIcon icon={acc.icon} className="size-2.5" strokeWidth={2} />
              {acc.label}
            </Badge>
            <Badge variant="secondary" className={cn("shrink-0 text-[10px]", sta.className)}>
              {link.status}
            </Badge>
            <span className="hidden w-20 text-right text-[11px] tabular-nums text-muted-foreground md:block">
              {link.visits.toLocaleString()} visits
            </span>
            <span className="hidden w-24 text-right text-[11px] text-muted-foreground lg:block">
              {link.expiresAt ?? "Never"}
            </span>
          </div>

          {/* Inline copy button */}
          <button
            onClick={(e) => { e.stopPropagation(); onCopy(link.id, link.shareUrl) }}
            className={cn(
              "hidden shrink-0 items-center gap-1 rounded-md border px-2 py-1 text-[10px] transition-colors sm:flex",
              isCopied
                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600"
                : "text-muted-foreground hover:bg-accent hover:text-foreground",
            )}
          >
            <HugeiconsIcon
              icon={isCopied ? CheckmarkCircle01Icon : Copy01Icon}
              className="size-3"
              strokeWidth={1.5}
            />
            {isCopied ? "Copied!" : "Copy"}
          </button>

          {/* Kebab */}
          <DropdownMenu>
            <KebabTrigger />
            <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
              <LinkMenuItems as={DropdownMenuItem} Sep={DropdownMenuSeparator} {...menuProps} />
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <LinkMenuItems as={ContextMenuItem} Sep={ContextMenuSeparator} {...menuProps} />
      </ContextMenuContent>
    </ContextMenu>
  )
}

// ─── Create link dialog ────────────────────────────────────────────────────────

const DEFAULT_FORM: CreateFormData = {
  fileName: SELECTABLE_FILES[0].name,
  accessType: "Public",
  password: "",
  expiry: "never",
  customExpiry: "",
  allowDownload: true,
}

function CreateLinkDialog({
  open,
  onOpenChange,
  onSubmit,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: CreateFormData) => void
}) {
  const [form, setForm] = useState<CreateFormData>(DEFAULT_FORM)
  const set = <K extends keyof CreateFormData>(k: K, v: CreateFormData[K]) =>
    setForm((prev) => ({ ...prev, [k]: v }))

  const handleSubmit = () => {
    onSubmit(form)
    setForm(DEFAULT_FORM)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md gap-0 p-0">
        <DialogHeader className="border-b px-5 py-4">
          <DialogTitle className="text-sm font-semibold">Create Share Link</DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Generate a shareable link for a file in your cloud storage.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 px-5 py-4">
          {/* File */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">File</Label>
            <Select value={form.fileName} onValueChange={(v) => set("fileName", v)}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SELECTABLE_FILES.map((f) => (
                  <SelectItem key={f.name} value={f.name} className="text-xs">
                    <span className="flex items-center gap-2">
                      <HugeiconsIcon
                        icon={FILE_TYPE_VISUAL[f.type].icon}
                        className={cn("size-3.5", FILE_TYPE_VISUAL[f.type].iconColor)}
                        strokeWidth={1.5}
                      />
                      {f.name}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Access type */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Access type</Label>
            <ButtonGroup>
              {(["Public", "Password Protected", "Private"] as AccessType[]).map((t) => (
                <Button
                  key={t}
                  type="button"
                  size="sm"
                  variant={form.accessType === t ? "default" : "outline"}
                  onClick={() => set("accessType", t)}
                >
                  {t}
                </Button>
              ))}
            </ButtonGroup>
          </div>

          {/* Password field — conditional */}
          {form.accessType === "Password Protected" && (
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Password</Label>
              <Input
                type="password"
                placeholder="Set a password for this link"
                value={form.password}
                onChange={(e) => set("password", e.target.value)}
                className="h-8 text-xs"
              />
            </div>
          )}

          {/* Expiry */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Expiry</Label>
            <Select value={form.expiry} onValueChange={(v) => set("expiry", v as ExpiryOption)}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="never" className="text-xs">Never expires</SelectItem>
                <SelectItem value="1d"    className="text-xs">1 Day</SelectItem>
                <SelectItem value="7d"    className="text-xs">7 Days</SelectItem>
                <SelectItem value="30d"   className="text-xs">30 Days</SelectItem>
                <SelectItem value="custom" className="text-xs">Custom date</SelectItem>
              </SelectContent>
            </Select>
            {form.expiry === "custom" && (
              <Input
                type="date"
                value={form.customExpiry}
                onChange={(e) => set("customExpiry", e.target.value)}
                className="h-8 text-xs"
              />
            )}
          </div>

          {/* Allow download toggle */}
          <div className="flex items-center justify-between rounded-lg border px-3 py-3">
            <div>
              <p className="text-xs font-medium">Allow download</p>
              <p className="text-[11px] text-muted-foreground">Recipients can download the original file</p>
            </div>
            <Switch
              size="sm"
              checked={form.allowDownload}
              onCheckedChange={(v) => set("allowDownload", v)}
            />
          </div>
        </div>

        <DialogFooter className="border-t px-5 py-3">
          <Button size="sm" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleSubmit}>
            <HugeiconsIcon icon={LinkSquare01Icon} className="size-3.5" strokeWidth={1.5} />
            Create Link
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── Link details drawer ───────────────────────────────────────────────────────

function LinkDetailsDrawer({
  link,
  onClose,
  copiedId,
  onCopy,
  onDisable,
  onDelete,
}: {
  link: SharedLink
  onClose: () => void
  copiedId: string | null
  onCopy: (id: string, url: string) => void
  onDisable: (id: string) => void
  onDelete: (id: string) => void
}) {
  const ftv = FILE_TYPE_VISUAL[link.fileType]
  const acc = ACCESS_CONFIG[link.accessType]
  const sta = STATUS_CONFIG[link.status]
  const isCopied = copiedId === link.id
  const activity = getLinkActivity(link)

  return (
    <Sheet open onOpenChange={(o) => !o && onClose()}>
      <SheetContent
        side="right"
        className="flex w-80 flex-col gap-0 p-0 sm:w-96"
        style={{ ["--sheet-width" as string]: "24rem" }}
      >
        {/* Header */}
        <SheetHeader className="flex flex-row items-center justify-between border-b px-4 py-3 space-y-0">
          <SheetTitle className="truncate pr-2 text-sm">{link.fileName}</SheetTitle>
          <Button size="icon-sm" variant="ghost" onClick={onClose} className="shrink-0">
            <HugeiconsIcon icon={Cancel01Icon} className="size-3.5" strokeWidth={2} />
          </Button>
        </SheetHeader>

        {/* Scrollable body */}
        <div className="flex-1 space-y-5 overflow-y-auto p-4">

          {/* File preview tile */}
          <div className={cn("flex h-28 items-center justify-center rounded-xl bg-gradient-to-br", ftv.gradFrom, ftv.gradTo)}>
            <HugeiconsIcon icon={ftv.icon} className={cn("size-12 opacity-60", ftv.iconColor)} strokeWidth={1} />
          </div>

          {/* Share URL */}
          <div className="space-y-1.5">
            <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Share URL</p>
            <div className="flex items-center gap-2">
              <div className="min-w-0 flex-1 truncate rounded-md border bg-muted/30 px-2.5 py-2">
                <span className="text-[11px] text-muted-foreground">{link.shareUrl}</span>
              </div>
              <Button
                size="icon-sm"
                variant="outline"
                onClick={() => onCopy(link.id, link.shareUrl)}
                className={cn(
                  "shrink-0 transition-colors",
                  isCopied && "border-emerald-500/30 bg-emerald-500/10 text-emerald-600",
                )}
              >
                <HugeiconsIcon
                  icon={isCopied ? CheckmarkCircle01Icon : Copy01Icon}
                  className="size-3.5"
                  strokeWidth={1.5}
                />
              </Button>
            </div>
          </div>

          <Separator />

          {/* Metadata grid */}
          <div className="space-y-3">
            {[
              {
                label: "Access",
                value: (
                  <Badge variant="secondary" className={cn("gap-1 text-[10px]", acc.className)}>
                    <HugeiconsIcon icon={acc.icon} className="size-2.5" strokeWidth={2} />
                    {link.accessType}
                  </Badge>
                ),
              },
              {
                label: "Status",
                value: (
                  <Badge variant="secondary" className={cn("text-[10px]", sta.className)}>
                    {link.status}
                  </Badge>
                ),
              },
              { label: "File type",       value: <span className="text-xs">{link.fileType}</span>                             },
              { label: "Folder",          value: <span className="truncate text-xs">{link.folder}</span>                      },
              { label: "Created",         value: <span className="text-xs">{link.createdAt}</span>                            },
              { label: "Expires",         value: <span className="text-xs">{link.expiresAt ?? "Never"}</span>                 },
              { label: "Total visits",    value: <span className="text-xs font-medium tabular-nums">{link.visits.toLocaleString()}</span> },
              { label: "Allow download",  value: <span className="text-xs">{link.allowDownload ? "Yes" : "No"}</span>         },
              ...(link.password ? [{ label: "Password", value: <span className="font-mono text-xs tracking-widest">{link.password}</span> }] : []),
            ].map(({ label, value }) => (
              <div key={label} className="flex items-center justify-between gap-3">
                <span className="shrink-0 text-[11px] text-muted-foreground">{label}</span>
                <div className="min-w-0 text-right">{value}</div>
              </div>
            ))}
          </div>

          <Separator />

          {/* Activity feed */}
          <div className="space-y-3">
            <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Activity</p>
            {activity.map((a, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <div className={cn("flex size-6 shrink-0 items-center justify-center rounded-full", a.iconBg)}>
                  <HugeiconsIcon icon={a.icon} className={cn("size-3", a.iconColor)} strokeWidth={1.5} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs">{a.text}</p>
                  <p className="text-[11px] text-muted-foreground">{a.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer actions */}
        <div className="space-y-2 border-t p-4">
          <Button size="sm" variant="outline" className="w-full gap-2">
            <HugeiconsIcon icon={Download01Icon} className="size-3.5" strokeWidth={1.5} />
            Download File
          </Button>
          <div className="grid grid-cols-2 gap-2">
            <Button
              size="sm"
              variant="outline"
              className="gap-2"
              onClick={() => onDisable(link.id)}
            >
              <HugeiconsIcon
                icon={link.status === "Disabled" ? CheckmarkCircle01Icon : Cancel01Icon}
                className="size-3.5"
                strokeWidth={1.5}
              />
              {link.status === "Disabled" ? "Enable" : "Disable"}
            </Button>
            <Button
              size="sm"
              variant="destructive"
              className="gap-2"
              onClick={() => { onDelete(link.id); onClose() }}
            >
              <HugeiconsIcon icon={Delete01Icon} className="size-3.5" strokeWidth={1.5} />
              Delete
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function SharedLinksPage() {
  const [links, setLinks]               = useState<SharedLink[]>(INITIAL_LINKS)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("All")
  const [accessFilter, setAccessFilter] = useState<AccessFilter>("All")
  const [sortKey, setSortKey]           = useState<SortKey>("newest")
  const [searchQuery, setSearchQuery]   = useState("")
  const [selectedId, setSelectedId]     = useState<string | null>(null)
  const [createOpen, setCreateOpen]     = useState(false)
  const [copiedId, setCopiedId]         = useState<string | null>(null)

  // Derive selected link from state so it stays in sync with mutations
  const selectedLink = links.find((l) => l.id === selectedId) ?? null
  const isDetailOpen = selectedLink !== null

  // ── Derived list ──────────────────────────────────────────────────────────
  const q = searchQuery.toLowerCase()
  const visible = links
    .filter((l) => statusFilter === "All" || l.status === statusFilter)
    .filter((l) => accessFilter === "All" || l.accessType === accessFilter)
    .filter((l) => !q || l.fileName.toLowerCase().includes(q))
    .sort((a, b) => {
      if (sortKey === "newest")      return b.createdMs - a.createdMs
      if (sortKey === "oldest")      return a.createdMs - b.createdMs
      return b.visits - a.visits // most-visited
    })

  // ── Stats ─────────────────────────────────────────────────────────────────
  const activeCount    = links.filter((l) => l.status === "Active").length
  const expiredCount   = links.filter((l) => l.status === "Expired").length
  const totalVisits    = links.reduce((sum, l) => sum + l.visits, 0)
  const passwordCount  = links.filter((l) => l.accessType === "Password Protected").length

  // ── Actions ───────────────────────────────────────────────────────────────
  const handleCopy = useCallback((id: string, url: string) => {
    navigator.clipboard.writeText(url).catch(() => {})
    setCopiedId(id)
    setTimeout(() => setCopiedId((prev) => (prev === id ? null : prev)), 2000)
  }, [])

  const handleDisable = useCallback((id: string) => {
    setLinks((prev) =>
      prev.map((l) =>
        l.id === id
          ? { ...l, status: (l.status === "Disabled" ? "Active" : "Disabled") as LinkStatus }
          : l,
      ),
    )
  }, [])

  const handleDelete = useCallback((id: string) => {
    setLinks((prev) => prev.filter((l) => l.id !== id))
    setSelectedId((prev) => (prev === id ? null : prev))
  }, [])

  const handleCreate = useCallback((form: CreateFormData) => {
    const fileEntry = SELECTABLE_FILES.find((f) => f.name === form.fileName)
    const slug = Math.random().toString(36).slice(2, 10)
    const newLink: SharedLink = {
      id: `sl-${Date.now()}`,
      fileName: form.fileName,
      fileType: fileEntry?.type ?? "Document",
      shareUrl: `https://byoc.app/share/${slug}`,
      accessType: form.accessType,
      status: "Active",
      createdAt: "Just now",
      createdMs: Date.now(),
      expiresAt: calcExpiryLabel(form.expiry, form.customExpiry),
      visits: 0,
      allowDownload: form.allowDownload,
      password: form.accessType === "Password Protected" ? "••••••" : undefined,
      folder: fileEntry?.folder ?? "Root",
    }
    setLinks((prev) => [newLink, ...prev])
    setSelectedId(newLink.id)
  }, [])

  return (
    <>
      <div className={cn("flex flex-col gap-5 transition-all duration-300", isDetailOpen && "lg:mr-[400px]")}>

        {/* ── Header ── */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Shared Links</h1>
            <p className="mt-1 text-xs text-muted-foreground">
              Manage public and private share links created from your cloud files.
            </p>
          </div>
          <Button size="sm" onClick={() => setCreateOpen(true)}>
            <HugeiconsIcon icon={LinkSquare01Icon} className="size-3.5" strokeWidth={1.5} />
            Create Share Link
          </Button>
        </div>

        {/* ── Stats cards ── */}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[
            { label: "Active Links",       value: activeCount,                   icon: LinkSquare01Icon,    iconColor: "text-emerald-500", iconBg: "bg-emerald-500/10" },
            { label: "Expired Links",      value: expiredCount,                  icon: Cancel01Icon,        iconColor: "text-rose-500",    iconBg: "bg-rose-500/10"    },
            { label: "Total Visits",       value: totalVisits.toLocaleString(),  icon: Analytics01Icon,     iconColor: "text-violet-500",  iconBg: "bg-violet-500/10"  },
            { label: "Password Protected", value: passwordCount,                 icon: LockedIcon,          iconColor: "text-amber-500",   iconBg: "bg-amber-500/10"   },
          ].map((s) => (
            <Card key={s.label}>
              <CardHeader className="pb-2 pt-4">
                <div className="flex items-center justify-between">
                  <CardDescription className="text-xs">{s.label}</CardDescription>
                  <div className={cn("flex size-7 items-center justify-center rounded-md", s.iconBg)}>
                    <HugeiconsIcon icon={s.icon} className={cn("size-3.5", s.iconColor)} strokeWidth={1.5} />
                  </div>
                </div>
                <CardTitle className="text-2xl font-bold tracking-tight">{s.value}</CardTitle>
              </CardHeader>
            </Card>
          ))}
        </div>

        {/* ── Toolbar ── */}
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search links..."
          />

          {/* Status filter tabs */}
          <ButtonGroup>
            {STATUS_FILTERS.map((f) => (
              <Button
                key={f}
                size="sm"
                variant={statusFilter === f ? "default" : "outline"}
                onClick={() => setStatusFilter(f)}
              >
                {f}
              </Button>
            ))}
          </ButtonGroup>

          <div className="ml-auto flex items-center gap-2">
            {/* Access filter */}
            <Select value={accessFilter} onValueChange={(v) => setAccessFilter(v as AccessFilter)}>
              <SelectTrigger className="h-8 w-44 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All"                  className="text-xs">All access types</SelectItem>
                <SelectItem value="Public"               className="text-xs">Public</SelectItem>
                <SelectItem value="Password Protected"   className="text-xs">Password Protected</SelectItem>
                <SelectItem value="Private"              className="text-xs">Private</SelectItem>
              </SelectContent>
            </Select>

            {/* Sort */}
            <Select value={sortKey} onValueChange={(v) => setSortKey(v as SortKey)}>
              <SelectTrigger className="h-8 w-36 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest"      className="text-xs">Newest first</SelectItem>
                <SelectItem value="oldest"      className="text-xs">Oldest first</SelectItem>
                <SelectItem value="most-visited" className="text-xs">Most visited</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* ── Empty state ── */}
        {visible.length === 0 && (
          <div className="flex h-56 flex-col items-center justify-center gap-3 rounded-xl border border-dashed">
            <HugeiconsIcon icon={LinkSquare01Icon} className="size-9 text-muted-foreground/30" strokeWidth={1} />
            <div className="text-center">
              <p className="text-sm font-medium text-muted-foreground">No shared links found</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Create a share link to securely share files from your cloud storage.
              </p>
            </div>
            {!searchQuery && statusFilter === "All" && accessFilter === "All" && (
              <Button size="sm" onClick={() => setCreateOpen(true)}>
                <HugeiconsIcon icon={LinkSquare01Icon} className="size-3.5" strokeWidth={1.5} />
                Create Share Link
              </Button>
            )}
          </div>
        )}

        {/* ── Links list ── */}
        {visible.length > 0 && (
          <div className="overflow-hidden rounded-xl border">
            {/* Column header */}
            <div className="hidden items-center gap-3 border-b bg-muted/30 px-4 py-2 sm:flex">
              <div className="size-9 shrink-0" />
              <div className="flex-1 text-[11px] font-medium text-muted-foreground">File · Share URL</div>
              <div className="flex items-center gap-3 text-[11px] font-medium text-muted-foreground">
                <span className="w-24">Access</span>
                <span className="w-16">Status</span>
                <span className="hidden w-20 text-right md:block">Visits</span>
                <span className="hidden w-24 text-right lg:block">Expires</span>
              </div>
              <div className="hidden w-16 sm:block" />
              <div className="size-6 shrink-0" />
            </div>

            {visible.map((link, i) => (
              <SharedLinkRow
                key={link.id}
                link={link}
                isSelected={selectedId === link.id}
                copiedId={copiedId}
                showBorder={i > 0}
                onClick={(l) => setSelectedId((prev) => (prev === l.id ? null : l.id))}
                onCopy={handleCopy}
                onDisable={handleDisable}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Details drawer ── */}
      {selectedLink && (
        <LinkDetailsDrawer
          link={selectedLink}
          onClose={() => setSelectedId(null)}
          copiedId={copiedId}
          onCopy={handleCopy}
          onDisable={handleDisable}
          onDelete={handleDelete}
        />
      )}

      {/* ── Create dialog ── */}
      <CreateLinkDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSubmit={handleCreate}
      />
    </>
  )
}
