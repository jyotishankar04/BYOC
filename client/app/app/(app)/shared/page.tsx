"use client"

import { useState, useCallback } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  LegalDocument01Icon,
  Video01Icon,
  Image01Icon,
  ZipIcon,
  Folder01Icon,
  LinkSquare01Icon,
  Globe02Icon,
  LockedIcon,
  Copy01Icon,
  Delete01Icon,
  Cancel01Icon,
  CheckmarkCircle01Icon,
  Analytics01Icon,
  Settings01Icon,
  Loading01Icon,
} from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import { ButtonGroup } from "@/components/ui/button-group"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
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
import { CreateShareLinkDialog } from "@/components/custom/dashboard/common/create-share-link-dialog"
import { useWorkspace } from "@/lib/workspace-context"
import { ProviderErrorGuard } from "@/components/custom/dashboard/common/provider-error-guard"
import { FileThumbnail } from "@/components/shared/file-thumbnail"
import {
  useListShareLinks,
  useGetShareLink,
  useUpdateShareLink,
  useDeleteShareLink,
  type ShareLinkResponse,
  type ShareAccessType,
  type ShareLinkStatus,
  type ListShareLinksQuery,
} from "@/lib/share-links"

// ─── Types ─────────────────────────────────────────────────────────────────────

type AccessType  = "Public" | "Password Protected" | "Private"
type LinkStatus  = "Active" | "Expired" | "Revoked" | "Disabled"
type FileType    = "Document" | "Video" | "Image" | "Spreadsheet" | "Slides" | "Archive" | "Folder"
type StatusFilter = "All" | "Active" | "Expired" | "Disabled"
type AccessFilter = "All" | "Public" | "Password Protected" | "Private"
type SortKey      = "newest" | "oldest" | "most-visited"

// ─── Helpers ────────────────────────────────────────────────────────────────────

function detectFileType(fileName: string, mimeType: string | null): FileType {
  if (mimeType?.startsWith("video/")) return "Video"
  if (mimeType?.startsWith("image/")) return "Image"
  const ext = fileName.split(".").pop()?.toLowerCase() ?? ""
  if (["xlsx", "xls", "csv"].includes(ext)) return "Spreadsheet"
  if (["pptx", "ppt"].includes(ext))    return "Slides"
  if (["zip", "rar", "tar", "gz", "7z"].includes(ext)) return "Archive"
  return "Document"
}

function formatAccessType(api: ShareAccessType): AccessType {
  if (api === "PasswordProtected") return "Password Protected"
  return api
}

function formatStatus(api: ShareLinkStatus): LinkStatus {
  if (api === "Revoked") return "Disabled"
  return api
}

function apiAccessType(label: AccessType): ShareAccessType {
  if (label === "Password Protected") return "PasswordProtected"
  return label as ShareAccessType
}

function apiStatusFilter(f: StatusFilter): ShareLinkStatus | undefined {
  if (f === "All") return undefined
  if (f === "Active") return "Active"
  if (f === "Expired") return "Expired"
  return "Disabled"
}

function apiAccessFilter(f: AccessFilter): ShareAccessType | undefined {
  if (f === "All") return undefined
  return apiAccessType(f)
}

function apiSortKey(k: SortKey): "createdAt" | "visits" | "expiresAt" {
  if (k === "newest" || k === "oldest") return "createdAt"
  return "visits"
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
  Folder:      { icon: Folder01Icon,       iconColor: "text-amber-500",   gradFrom: "from-amber-500/15",   gradTo: "to-amber-600/5"   },
}

const ACCESS_CONFIG: Record<AccessType, {
  icon: typeof Globe02Icon
  label: string
  className: string
}> = {
  "Public":              { icon: Globe02Icon, label: "Public",    className: "bg-emerald-500/10 text-emerald-600" },
  "Password Protected":  { icon: LockedIcon,  label: "Protected", className: "bg-amber-500/10 text-amber-600"   },
  "Private":             { icon: LockedIcon,  label: "Private",   className: "bg-slate-500/10 text-slate-500"   },
}

const STATUS_CONFIG: Record<LinkStatus, { className: string }> = {
  Active:   { className: "bg-emerald-500/10 text-emerald-600" },
  Expired:  { className: "bg-rose-500/10 text-rose-600"       },
  Disabled: { className: "bg-slate-500/10 text-slate-500"     },
  Revoked:  { className: "bg-slate-500/10 text-slate-500"     },
}

const STATUS_FILTERS: StatusFilter[] = ["All", "Active", "Expired", "Disabled"]

// ─── Shared menu items (polymorphic) ──────────────────────────────────────────

interface LinkMenuItemProps {
  as: typeof ContextMenuItem | typeof DropdownMenuItem
  Sep: typeof ContextMenuSeparator | typeof DropdownMenuSeparator
  link: DisplayLink
  onCopy: () => void
  onViewDetails: () => void
  onDisable: () => void
  onDelete: () => void
}

function LinkMenuItems({ as: As, Sep, link, onCopy, onViewDetails, onDisable, onDelete }: LinkMenuItemProps) {
  const accessLabel = formatAccessType(link.accessType)
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

// ─── Display type (mapped from API) ──────────────────────────────────────────

interface DisplayLink {
  id: string
  fileId: string | null
  targetName: string
  targetKind: "file" | "folder"
  fileType: FileType
  shareUrl: string
  accessType: ShareAccessType
  status: ShareLinkStatus
  createdAt: string
  expiresAt: string | null
  visits: number
  allowDownload: boolean
  hasPassword: boolean
  fileMimeType: string | null
}

function toDisplayLink(raw: ShareLinkResponse): DisplayLink {
  const targetKind = raw.folder ? "folder" : "file"
  return {
    id: raw.id,
    fileId: raw.file?.id ?? null,
    targetName: raw.folder?.name ?? raw.file?.name ?? "Unknown item",
    targetKind,
    fileType: targetKind === "folder" ? "Folder" : detectFileType(raw.file?.name ?? "", raw.file?.mimeType ?? null),
    shareUrl: raw.shareUrl,
    accessType: raw.accessType,
    status: raw.status,
    createdAt: new Date(raw.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    expiresAt: raw.expiresAt ? new Date(raw.expiresAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : null,
    visits: raw.visits ?? 0,
    allowDownload: raw.allowDownload,
    hasPassword: raw.accessType === "PasswordProtected",
    fileMimeType: raw.file?.mimeType ?? null,
  }
}

// ─── Shared link row ──────────────────────────────────────────────────────────

function SharedLinkRow({
  link,
  workspaceId,
  isSelected,
  copiedId,
  showBorder,
  onClick,
  onCopy,
  onDisable,
  onDelete,
}: {
  link: DisplayLink
  workspaceId: string | undefined
  isSelected: boolean
  copiedId: string | null
  showBorder: boolean
  onClick: (link: DisplayLink) => void
  onCopy: (id: string, url: string) => void
  onDisable: (id: string) => void
  onDelete: (id: string) => void
}) {
  const ftv = FILE_TYPE_VISUAL[link.fileType]
  const accessLabel = formatAccessType(link.accessType)
  const acc = ACCESS_CONFIG[accessLabel]
  const displayStatus = formatStatus(link.status)
  const sta = STATUS_CONFIG[displayStatus]
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
          <FileThumbnail
            workspaceId={workspaceId}
            fileId={link.fileId ?? ""}
            mimeType={link.targetKind === "file" ? link.fileMimeType : null}
            alt={link.targetName}
            className={cn("size-9 shrink-0 rounded-lg bg-gradient-to-br", ftv.gradFrom, ftv.gradTo)}
            imgClassName="object-cover"
            fallback={<HugeiconsIcon icon={ftv.icon} className={cn("size-4", ftv.iconColor)} strokeWidth={1.5} />}
          />

          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-medium">{link.targetName}</p>
            <p className="truncate text-[11px] text-muted-foreground">{link.shareUrl}</p>
          </div>

          <div className="hidden items-center gap-3 sm:flex">
            <Badge variant="secondary" className={cn("shrink-0 gap-1 text-[10px]", acc.className)}>
              <HugeiconsIcon icon={acc.icon} className="size-2.5" strokeWidth={2} />
              {acc.label}
            </Badge>
            <Badge variant="secondary" className={cn("shrink-0 text-[10px]", sta.className)}>
              {displayStatus}
            </Badge>
            <span className="hidden w-20 text-right text-[11px] tabular-nums text-muted-foreground md:block">
              {link.visits.toLocaleString()} visits
            </span>
            <span className="hidden w-24 text-right text-[11px] text-muted-foreground lg:block">
              {link.expiresAt ?? "Never"}
            </span>
          </div>

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

// ─── Link details drawer ─────────────────────────────────────────────────────

function LinkDetailsDrawer({
  link,
  onClose,
  copiedId,
  onCopy,
  onDisable,
  onDelete,
}: {
  link: DisplayLink
  onClose: () => void
  copiedId: string | null
  onCopy: (id: string, url: string) => void
  onDisable: (id: string) => void
  onDelete: (id: string) => void
}) {
  const ftv = FILE_TYPE_VISUAL[link.fileType]
  const accessLabel = formatAccessType(link.accessType)
  const acc = ACCESS_CONFIG[accessLabel]
  const displayStatus = formatStatus(link.status)
  const sta = STATUS_CONFIG[displayStatus]
  const isCopied = copiedId === link.id

  return (
    <Sheet open onOpenChange={(o) => !o && onClose()}>
      <SheetContent
        side="right"
        className="flex w-80 flex-col gap-0 p-0 sm:w-96"
        style={{ ["--sheet-width" as string]: "24rem" }}
      >
        <SheetHeader className="flex flex-row items-center justify-between border-b px-4 py-3 space-y-0">
          <SheetTitle className="truncate pr-2 text-sm">{link.targetName}</SheetTitle>
          <Button size="icon-sm" variant="ghost" onClick={onClose} className="shrink-0">
            <HugeiconsIcon icon={Cancel01Icon} className="size-3.5" strokeWidth={2} />
          </Button>
        </SheetHeader>

        <div className="flex-1 space-y-5 overflow-y-auto p-4">
          <div className={cn("flex h-28 items-center justify-center rounded-xl bg-gradient-to-br", ftv.gradFrom, ftv.gradTo)}>
            <HugeiconsIcon icon={ftv.icon} className={cn("size-12 opacity-60", ftv.iconColor)} strokeWidth={1} />
          </div>

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

          <div className="space-y-3">
            {[
              {
                label: "Access",
                value: (
                  <Badge variant="secondary" className={cn("gap-1 text-[10px]", acc.className)}>
                    <HugeiconsIcon icon={acc.icon} className="size-2.5" strokeWidth={2} />
                    {accessLabel}
                  </Badge>
                ),
              },
              {
                label: "Status",
                value: (
                  <Badge variant="secondary" className={cn("text-[10px]", sta.className)}>
                    {displayStatus}
                  </Badge>
                ),
              },
              { label: "Target type", value: <span className="text-xs">{link.targetKind === "folder" ? "Folder" : link.fileType}</span> },
              { label: "Created", value: <span className="text-xs">{link.createdAt}</span> },
              { label: "Expires", value: <span className="text-xs">{link.expiresAt ?? "Never"}</span> },
              { label: "Total visits", value: <span className="text-xs font-medium tabular-nums">{link.visits.toLocaleString()}</span> },
              { label: "Allow download", value: <span className="text-xs">{link.allowDownload ? "Yes" : "No"}</span> },
              ...(link.hasPassword ? [{ label: "Password", value: <span className="font-mono text-xs tracking-widest">••••••</span> }] : []),
            ].map(({ label, value }) => (
              <div key={label} className="flex items-center justify-between gap-3">
                <span className="shrink-0 text-[11px] text-muted-foreground">{label}</span>
                <div className="min-w-0 text-right">{value}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2 border-t p-4">
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

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SharedLinksPage() {
  const { currentWorkspace } = useWorkspace()
  const workspaceId = currentWorkspace?.id

  const [statusFilter, setStatusFilter] = useState<StatusFilter>("All")
  const [accessFilter, setAccessFilter] = useState<AccessFilter>("All")
  const [sortKey, setSortKey]           = useState<SortKey>("newest")
  const [searchQuery, setSearchQuery]   = useState("")
  const [selectedId, setSelectedId]     = useState<string | null>(null)
  const [createOpen, setCreateOpen]     = useState(false)
  const [createFileId, setCreateFileId] = useState<string | undefined>(undefined)
  const [copiedId, setCopiedId]         = useState<string | null>(null)

  const updateLink = useUpdateShareLink(workspaceId)
  const deleteLink = useDeleteShareLink(workspaceId)

  const query: ListShareLinksQuery = {
    status: apiStatusFilter(statusFilter),
    accessType: apiAccessFilter(accessFilter),
    search: searchQuery || undefined,
    sortBy: apiSortKey(sortKey),
    sortOrder: sortKey === "oldest" ? "asc" : "desc",
    page: 1,
    limit: 100,
  }

  const { data, isLoading } = useListShareLinks(workspaceId, query)

  const links: DisplayLink[] = (data?.links ?? []).map(toDisplayLink)

  const selectedLink = links.find((l) => l.id === selectedId) ?? null
  const isDetailOpen = selectedLink !== null

  const sortedLinks = [...links].sort((a, b) => {
    if (sortKey === "most-visited") return b.visits - a.visits
    if (sortKey === "oldest") return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })

  const activeCount = (data?.stats ?? []).filter((s) => s.status === "Active").reduce((sum, s) => sum + s._count, 0)
  const expiredCount = (data?.stats ?? []).filter((s) => s.status === "Expired").reduce((sum, s) => sum + s._count, 0)
  const totalVisits = links.reduce((sum, l) => sum + l.visits, 0)
  const passwordCount = (data?.stats ?? []).filter((s) => s.accessType === "PasswordProtected").reduce((sum, s) => sum + s._count, 0)

  const handleCopy = useCallback((id: string, url: string) => {
    navigator.clipboard.writeText(url).catch(() => {})
    setCopiedId(id)
    setTimeout(() => setCopiedId((prev) => (prev === id ? null : prev)), 2000)
  }, [])

  const handleDisable = useCallback((id: string) => {
    const link = links.find((l) => l.id === id)
    if (!link) return
    const newStatus: ShareLinkStatus = link.status === "Disabled" ? "Active" : "Disabled"
    updateLink.mutate({ linkId: id, data: { status: newStatus } })
  }, [links, updateLink])

  const handleDelete = useCallback((id: string) => {
    deleteLink.mutate(id)
    setSelectedId((prev) => (prev === id ? null : prev))
  }, [deleteLink])

  if (workspaceId && (!currentWorkspace?.storage || currentWorkspace.storage.status === "Error")) {
    return <ProviderErrorGuard workspaceId={workspaceId} storage={currentWorkspace?.storage ?? null} />
  }

  return (
    <>
      <div className={cn("flex flex-col gap-5 transition-all duration-300", isDetailOpen && "lg:mr-[var(--detail-sidebar-width)]")}>

        {/* ── Header ── */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Shared Links</h1>
            <p className="mt-1 text-xs text-muted-foreground">
              Manage public and private share links created from your files and folders.
            </p>
          </div>
          <Button size="sm" onClick={() => { setCreateFileId(undefined); setCreateOpen(true) }}>
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

        {/* ── Loading ── */}
        {isLoading && (
          <div className="flex h-56 items-center justify-center">
            <HugeiconsIcon icon={Loading01Icon} className="size-6 animate-spin text-muted-foreground" strokeWidth={2} />
          </div>
        )}

        {/* ── Empty state ── */}
        {!isLoading && sortedLinks.length === 0 && (
          <div className="flex h-56 flex-col items-center justify-center gap-3 rounded-xl border border-dashed">
            <HugeiconsIcon icon={LinkSquare01Icon} className="size-9 text-muted-foreground/30" strokeWidth={1} />
            <div className="text-center">
              <p className="text-sm font-medium text-muted-foreground">No shared links found</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Create a share link to securely share files or folders from your cloud storage.
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
        {!isLoading && sortedLinks.length > 0 && (
          <div className="overflow-hidden rounded-xl border">
            <div className="hidden items-center gap-3 border-b bg-muted/30 px-4 py-2 sm:flex">
              <div className="size-9 shrink-0" />
              <div className="flex-1 text-[11px] font-medium text-muted-foreground">Item · Share URL</div>
              <div className="flex items-center gap-3 text-[11px] font-medium text-muted-foreground">
                <span className="w-24">Access</span>
                <span className="w-16">Status</span>
                <span className="hidden w-20 text-right md:block">Visits</span>
                <span className="hidden w-24 text-right lg:block">Expires</span>
              </div>
              <div className="hidden w-16 sm:block" />
              <div className="size-6 shrink-0" />
            </div>

            {sortedLinks.map((link, i) => (
              <SharedLinkRow
                key={link.id}
                link={link}
                workspaceId={workspaceId}
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
      <CreateShareLinkDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        fileId={createFileId}
      />
    </>
  )
}
