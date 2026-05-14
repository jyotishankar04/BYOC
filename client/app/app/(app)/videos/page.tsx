"use client"

import { useState, useCallback, useMemo, useEffect } from "react"
import { toast } from "sonner"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Video01Icon,
  CloudUploadIcon,
  Download01Icon,
  Share01Icon,
  PencilEdit01Icon,
  Delete01Icon,
  EyeIcon,
  Copy01Icon,
  LinkSquare01Icon,
  MoveIcon,
  ArrowLeft01Icon,
  ArrowRight01Icon,
  Globe02Icon,
  LockedIcon,
  Clock01Icon,
} from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import { ButtonGroup } from "@/components/ui/button-group"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
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
import { ViewToggle } from "@/components/shared/view-toggle"
import { KebabTrigger } from "@/components/shared/kebab-trigger"
import { UploadDialog } from "@/components/custom/dashboard/common/upload-dialog"
import { CreateShareLinkDialog } from "@/components/custom/dashboard/common/create-share-link-dialog"
import { useWorkspace } from "@/lib/workspace-context"
import { useFiles, useDeleteFile, useDownloadFile, type ApiFile } from "@/lib/files"
import { formatFileSize, formatDate, getStorageFolderLabel } from "@/lib/file-utils"

// ─── Types ─────────────────────────────────────────────────────────────────────

type Resolution = "4K" | "1080p" | "720p" | "480p" | "Unknown"
type ResFilter  = "All" | "4K" | "1080p" | "720p"
type SortKey    = "newest" | "oldest" | "name-az" | "name-za" | "duration-desc" | "duration-asc" | "size-desc" | "size-asc"

interface VideoItem {
  id: string
  name: string
  extension: string
  resolution: Resolution
  duration: string
  durationSecs: number
  size: string
  sizeBytes: number
  folder: string
  uploadedAt: string
  uploadedMs: number
  status: "Private" | "Shared"
  shareLink?: string
  downloadUrl?: string
  previewUrl?: string
}

// ─── Resolution config ─────────────────────────────────────────────────────────

const RES_STYLE: Record<Resolution, { badge: string }> = {
  "4K":    { badge: "bg-violet-500/10 text-violet-600" },
  "1080p": { badge: "bg-blue-500/10 text-blue-600"     },
  "720p":  { badge: "bg-slate-500/10 text-slate-500"   },
  "480p":  { badge: "bg-muted text-muted-foreground"   },
  "Unknown": { badge: "bg-muted text-muted-foreground" },
}
const PAGE_SIZE = 24

// ─── Helpers ───────────────────────────────────────────────────────────────────

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "newest",        label: "Most Recent"      },
  { key: "oldest",        label: "Oldest First"     },
  { key: "name-az",       label: "Name A → Z"       },
  { key: "name-za",       label: "Name Z → A"       },
  { key: "duration-desc", label: "Longest First"    },
  { key: "duration-asc",  label: "Shortest First"   },
  { key: "size-desc",     label: "Largest First"    },
  { key: "size-asc",      label: "Smallest First"   },
]

function applyFilterSort(
  videos: VideoItem[],
  filter: ResFilter,
  sort: SortKey,
  query: string,
): VideoItem[] {
  const q = query.toLowerCase()
  const filtered = videos.filter((v) => {
    if (filter !== "All" && v.resolution !== filter) return false
    if (q && !v.name.toLowerCase().includes(q)) return false
    return true
  })
  const sorted = [...filtered]
  switch (sort) {
    case "newest":        sorted.sort((a, b) => b.uploadedMs - a.uploadedMs);          break
    case "oldest":        sorted.sort((a, b) => a.uploadedMs - b.uploadedMs);          break
    case "name-az":       sorted.sort((a, b) => a.name.localeCompare(b.name));         break
    case "name-za":       sorted.sort((a, b) => b.name.localeCompare(a.name));         break
    case "duration-desc": sorted.sort((a, b) => b.durationSecs - a.durationSecs);      break
    case "duration-asc":  sorted.sort((a, b) => a.durationSecs - b.durationSecs);      break
    case "size-desc":     sorted.sort((a, b) => b.sizeBytes - a.sizeBytes);            break
    case "size-asc":      sorted.sort((a, b) => a.sizeBytes - b.sizeBytes);            break
  }
  return sorted
}

// ─── Shared menu ───────────────────────────────────────────────────────────────

function VideoMenuItems({
  as: As,
  Sep,
  video,
  onPreview,
  onDownload,
  onDelete,
  onGetLink,
  onShare,
  onRename,
  onMove,
}: {
  as: typeof ContextMenuItem | typeof DropdownMenuItem
  Sep: typeof ContextMenuSeparator | typeof DropdownMenuSeparator
  video: VideoItem
  onPreview: () => void
  onDownload: () => void
  onDelete: () => void
  onGetLink?: () => void
  onShare?: () => void
  onRename?: () => void
  onMove?: () => void
}) {
  return (
    <>
      <As onClick={onPreview} className="gap-2">
        <HugeiconsIcon icon={EyeIcon} className="size-3.5" strokeWidth={1.5} />
        Preview
      </As>
      <As onClick={onDownload} className="gap-2">
        <HugeiconsIcon icon={Download01Icon} className="size-3.5" strokeWidth={1.5} />
        Download
      </As>
      <Sep />
      <As onClick={onShare} className="gap-2">
        <HugeiconsIcon icon={Share01Icon} className="size-3.5" strokeWidth={1.5} />
        {video.status === "Shared" ? "Manage Link" : "Share"}
      </As>
      {video.status === "Shared" && (
        <As
          onClick={() => {
            if (video.shareLink) {
              void navigator.clipboard.writeText(video.shareLink)
              toast.success("Link copied to clipboard")
            } else {
              toast.error("Not shared")
            }
          }}
          className="gap-2"
        >
          <HugeiconsIcon icon={Copy01Icon} className="size-3.5" strokeWidth={1.5} />
          Copy Link
        </As>
      )}
      {video.status === "Private" && onGetLink && (
        <As onClick={onGetLink} className="gap-2">
          <HugeiconsIcon icon={LinkSquare01Icon} className="size-3.5" strokeWidth={1.5} />
          Get Link
        </As>
      )}
      <Sep />
      <As onClick={onRename} className="gap-2">
        <HugeiconsIcon icon={PencilEdit01Icon} className="size-3.5" strokeWidth={1.5} />
        Rename
      </As>
      <As onClick={onMove} className="gap-2">
        <HugeiconsIcon icon={MoveIcon} className="size-3.5" strokeWidth={1.5} />
        Move to
      </As>
      <Sep />
      <As onClick={onDelete} variant="destructive" className="gap-2">
        <HugeiconsIcon icon={Delete01Icon} className="size-3.5" strokeWidth={1.5} />
        Delete
      </As>
    </>
  )
}

// ─── Video Card (grid) ─────────────────────────────────────────────────────────

function VideoCard({
  video,
  onClick,
  onDownload,
  onDelete,
  onGetLink,
  onShare,
  onRename,
  onMove,
}: {
  video: VideoItem
  onClick: () => void
  onDownload: () => void
  onDelete: () => void
  onGetLink?: () => void
  onShare?: () => void
  onRename?: () => void
  onMove?: () => void
}) {
  const resStyle = RES_STYLE[video.resolution]

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div
          onClick={onClick}
          className="group relative aspect-video w-full cursor-pointer overflow-hidden rounded-xl border bg-card transition-all duration-150 hover:border-border/80 hover:shadow-md"
        >
          {/* Gradient background */}
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-500/15 to-blue-600/5">
            <HugeiconsIcon icon={Video01Icon} className="size-12 text-blue-500/25" strokeWidth={1} />
          </div>

          {/* Play button — hidden until hover */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-200 group-hover:opacity-100">
            <div className="flex size-11 items-center justify-center rounded-full bg-background/85 shadow-lg backdrop-blur-sm">
              <div className="ml-1 size-0 border-y-[8px] border-l-[14px] border-y-transparent border-l-foreground" />
            </div>
          </div>

          {/* Resolution badge — top left */}
          <span className={cn("absolute left-2 top-2 rounded px-1.5 py-0.5 text-[9px] font-bold", resStyle.badge)}>
            {video.resolution}
          </span>

          {/* Status — top right */}
          <div className="absolute right-2 top-2">
            {video.status === "Shared" ? (
              <div className="flex size-5 items-center justify-center rounded-full bg-emerald-500/20 backdrop-blur-sm">
                <HugeiconsIcon icon={Globe02Icon} className="size-3 text-emerald-500" strokeWidth={2} />
              </div>
            ) : (
              <div className="flex size-5 items-center justify-center rounded-full bg-background/60 backdrop-blur-sm">
                <HugeiconsIcon icon={LockedIcon} className="size-3 text-muted-foreground" strokeWidth={2} />
              </div>
            )}
          </div>

          {/* Duration — bottom right */}
          <span className="absolute bottom-9 right-2 flex items-center gap-1 rounded bg-black/55 px-1.5 py-0.5 text-[10px] font-medium text-white">
            {video.duration}
          </span>

          {/* 3-dot — bottom right of gradient, above footer */}
          <div className="absolute bottom-9 left-2 opacity-0 transition-opacity group-hover:opacity-100">
            <DropdownMenu>
              <KebabTrigger className="bg-background/80 backdrop-blur-sm" />
              <DropdownMenuContent align="start" onClick={(e) => e.stopPropagation()}>
              <VideoMenuItems as={DropdownMenuItem} Sep={DropdownMenuSeparator} video={video} onPreview={onClick} onDownload={onDownload} onDelete={onDelete} onGetLink={onGetLink} onShare={onShare} onRename={onRename} onMove={onMove} />
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Hover overlay */}
          <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100">
            <div className="px-2.5 pb-9 pt-2">
              <p className="truncate text-[11px] font-medium text-white">{video.name}</p>
            </div>
          </div>

          {/* Footer */}
          <div className="absolute bottom-0 left-0 right-0 border-t bg-card px-3 py-2">
            <p className="truncate text-[11px] font-medium">{video.name}</p>
          </div>
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <VideoMenuItems as={ContextMenuItem} Sep={ContextMenuSeparator} video={video} onPreview={onClick} onDownload={onDownload} onDelete={onDelete} onGetLink={onGetLink} onShare={onShare} onRename={onRename} onMove={onMove} />
      </ContextMenuContent>
    </ContextMenu>
  )
}

// ─── Video List Row ────────────────────────────────────────────────────────────

function VideoListRow({
  video,
  showBorder,
  onClick,
  onDownload,
  onDelete,
  onGetLink,
  onShare,
  onRename,
  onMove,
}: {
  video: VideoItem
  showBorder: boolean
  onClick: () => void
  onDownload: () => void
  onDelete: () => void
  onGetLink?: () => void
  onShare?: () => void
  onRename?: () => void
  onMove?: () => void
}) {
  const resStyle = RES_STYLE[video.resolution]

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div
          onClick={onClick}
          className={cn(
            "group flex w-full cursor-pointer items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-accent/50",
            showBorder && "border-t",
          )}
        >
          {/* Icon chip */}
          <div className="relative flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-blue-500/15 to-blue-600/5">
            <HugeiconsIcon icon={Video01Icon} className="size-5 text-blue-500/60" strokeWidth={1.5} />
            {/* Mini play */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
              <div className="flex size-7 items-center justify-center rounded-full bg-background/80">
                <div className="ml-0.5 size-0 border-y-[4px] border-l-[7px] border-y-transparent border-l-foreground" />
              </div>
            </div>
          </div>

          {/* Name + folder */}
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-medium">{video.name}</p>
            <p className="truncate text-[11px] text-muted-foreground">{video.folder}</p>
          </div>

          {/* Metadata */}
          <div className="hidden items-center gap-4 sm:flex">
            <Badge variant="secondary" className={cn("text-[10px]", resStyle.badge)}>
              {video.resolution}
            </Badge>
            <span className="flex w-14 items-center justify-end gap-1 text-[11px] text-muted-foreground">
              <HugeiconsIcon icon={Clock01Icon} className="size-3 shrink-0" strokeWidth={1.5} />
              {video.duration}
            </span>
            <span className="w-14 text-right text-[11px] text-muted-foreground">{video.size}</span>
            <span className="hidden w-28 text-right text-[11px] text-muted-foreground lg:block">{video.uploadedAt}</span>
            <Badge
              variant="secondary"
              className={cn("text-[10px]", video.status === "Shared" ? "bg-emerald-500/10 text-emerald-600" : "bg-muted text-muted-foreground")}
            >
              {video.status}
            </Badge>
          </div>

{/* Kebab */}
          <DropdownMenu>
            <KebabTrigger />
            <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
              <VideoMenuItems as={DropdownMenuItem} Sep={DropdownMenuSeparator} video={video} onPreview={onClick} onDownload={onDownload} onDelete={onDelete} onGetLink={onGetLink} onShare={onShare} onRename={onRename} onMove={onMove} />
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <VideoMenuItems as={ContextMenuItem} Sep={ContextMenuSeparator} video={video} onPreview={onClick} onDownload={onDownload} onDelete={onDelete} onGetLink={onGetLink} onShare={onShare} onRename={onRename} onMove={onMove} />
      </ContextMenuContent>
    </ContextMenu>
  )
}

// ─── Video Lightbox ────────────────────────────────────────────────────────────

function VideoLightbox({
  video,
  allVideos,
  onClose,
  onNavigate,
  onDownload,
  onDelete,
}: {
  video: VideoItem
  allVideos: VideoItem[]
  onClose: () => void
  onNavigate: (v: VideoItem | null) => void
  onDownload: () => void
  onDelete: () => void
}) {
  const idx = allVideos.findIndex((v) => v.id === video.id)
  const hasPrev = idx > 0
  const hasNext = idx < allVideos.length - 1

  return (
    <Dialog open onOpenChange={(open) => { if (!open) onClose() }}>
      <DialogContent className="max-w-2xl">
        <DialogTitle className="flex items-center gap-2 text-base">
          <HugeiconsIcon icon={Video01Icon} className="size-4 text-blue-500" strokeWidth={1.5} />
          {video.name}
        </DialogTitle>
        {/* Player */}
        <div className="flex aspect-video items-center justify-center rounded-lg bg-black overflow-hidden">
          {video.previewUrl || video.downloadUrl ? (
            <video
              controls
              autoPlay
              className="w-full h-full object-contain"
              src={video.previewUrl || video.downloadUrl}
            />
          ) : (
            <div className="flex size-16 items-center justify-center rounded-full bg-background/80 shadow-lg">
              <div className="ml-1.5 size-0 border-y-[12px] border-l-[20px] border-y-transparent border-l-foreground" />
            </div>
          )}
        </div>
        {/* Video info */}
        <div className="grid grid-cols-3 gap-3 text-xs">
          <div>
            <span className="text-muted-foreground">Resolution</span>
            <p className="font-medium">{video.resolution}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Duration</span>
            <p className="font-medium">{video.duration}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Size</span>
            <p className="font-medium">{video.size}</p>
          </div>
        </div>
        {/* Navigation */}
        <div className="flex items-center justify-between gap-2">
          <Button
            size="sm"
            variant="outline"
            disabled={!hasPrev}
            onClick={() => hasPrev && onNavigate(allVideos[idx - 1])}
          >
            <HugeiconsIcon icon={ArrowLeft01Icon} className="size-3.5" strokeWidth={1.5} />
            Previous
          </Button>
          <span className="text-xs text-muted-foreground">
            {idx + 1} of {allVideos.length}
          </span>
          <Button
            size="sm"
            variant="outline"
            disabled={!hasNext}
            onClick={() => hasNext && onNavigate(allVideos[idx + 1])}
          >
            Next
            <HugeiconsIcon icon={ArrowRight01Icon} className="size-3.5" strokeWidth={1.5} />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ─── Page ──────────────────────────────────────────────────────────────────────

const RES_FILTERS: ResFilter[] = ["All", "4K", "1080p", "720p"]

export default function VideosPage() {
  const { currentWorkspace } = useWorkspace()
  const workspaceId = currentWorkspace?.id

  const deleteFileMutation = useDeleteFile(workspaceId)
  const downloadFileMutation = useDownloadFile(workspaceId)

  const [filter, setFilter]           = useState<ResFilter>("All")
  const [sort, setSort]               = useState<SortKey>("newest")
  const [viewMode, setViewMode]       = useState<"grid" | "list">("grid")
  const [searchQuery, setSearchQuery] = useState("")
  const [page, setPage]               = useState(1)
  const [lightbox, setLightbox]       = useState<VideoItem | null>(null)
  const [uploadOpen, setUploadOpen]   = useState(false)
  const [shareItemId, setShareItemId]   = useState<string | null>(null)
  const [shareItemName, setShareItemName] = useState<string | null>(null)

  const sortQuery =
    sort === "oldest"
      ? { sortBy: "createdAt" as const, sortDir: "asc" as const }
      : sort === "name-az"
        ? { sortBy: "name" as const, sortDir: "asc" as const }
        : sort === "name-za"
          ? { sortBy: "name" as const, sortDir: "desc" as const }
          : sort === "size-asc"
            ? { sortBy: "size" as const, sortDir: "asc" as const }
            : sort === "size-desc"
              ? { sortBy: "size" as const, sortDir: "desc" as const }
              : { sortBy: "createdAt" as const, sortDir: "desc" as const }

  const { data: filesData, isLoading } = useFiles(workspaceId, {
    kind: "video",
    includeNested: true,
    search: searchQuery || undefined,
    page,
    limit: PAGE_SIZE,
    ...sortQuery,
  })

  const allVideos = useMemo(() => {
    if (!filesData?.files) return [] as VideoItem[]
    return filesData.files.map((f): VideoItem => ({
      id: f.id,
      name: f.name,
      extension: f.extension?.replace(".", "") || "mp4",
      resolution: "Unknown" as Resolution,
      duration: "Unknown",
      durationSecs: 0,
      size: formatFileSize(f.size),
      sizeBytes: f.size,
      folder: getStorageFolderLabel(f.storagePath),
      uploadedAt: formatDate(f.createdAt),
      uploadedMs: new Date(f.createdAt).getTime(),
      status: "Private" as const,
      downloadUrl: (f as unknown as Record<string, unknown>).downloadUrl as string | undefined,
      previewUrl: (f as unknown as Record<string, unknown>).previewUrl as string | undefined,
    }))
  }, [filesData])

  const visible     = applyFilterSort(allVideos, filter, sort, searchQuery)
  const activeSort  = SORT_OPTIONS.find((s) => s.key === sort)!
  const total = filesData?.total ?? 0
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  useEffect(() => {
    setPage(1)
  }, [currentWorkspace?.id, filter, sort, searchQuery])

  useEffect(() => {
    if (page > totalPages) setPage(totalPages)
  }, [page, totalPages])

  const resCounts = (["4K", "1080p", "720p"] as Resolution[]).reduce<Record<string, number>>(
    (acc, r) => ({ ...acc, [r]: allVideos.filter((v) => v.resolution === r).length }),
    {},
  )

  const openLightbox  = useCallback((v: VideoItem) => setLightbox(v), [])
  const closeLightbox = useCallback(() => setLightbox(null), [])

  return (
    <>
      <div className="flex flex-col gap-5">

        {/* ── Header ── */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Videos</h1>
            <p className="mt-1 text-xs text-muted-foreground">
              {isLoading ? "Loading..." : `${total} videos · Page ${page} of ${totalPages}`}
            </p>
          </div>
          <Button size="sm" onClick={() => setUploadOpen(true)}>
            <HugeiconsIcon icon={CloudUploadIcon} className="size-3.5" strokeWidth={1.5} />
            Upload Video
          </Button>
        </div>

        {/* ── Resolution stat pills ── */}
        <div className="flex flex-wrap gap-2">
          {(["4K", "1080p", "720p"] as ResFilter[]).map((r) => {
            const style = RES_STYLE[r as Resolution]
            return (
              <button
                key={r}
                onClick={() => setFilter(r)}
                className={cn(
                  "flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs transition-colors",
                  filter === r
                    ? "border-transparent bg-foreground text-background"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground",
                )}
              >
                <span className={cn(
                  "size-1.5 rounded-full",
                  r === "4K"    && "bg-violet-500",
                  r === "1080p" && "bg-blue-500",
                  r === "720p"  && "bg-slate-400",
                )} />
                {r}
                <span className="tabular-nums">{resCounts[r]}</span>
              </button>
            )
          })}
        </div>

        {/* ── Toolbar ── */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search videos..."
          />

          {/* Resolution filter */}
          <ButtonGroup>
            {RES_FILTERS.map((f) => (
              <Button
                key={f}
                size="sm"
                variant={filter === f ? "default" : "outline"}
                onClick={() => setFilter(f)}
              >
                {f}
              </Button>
            ))}
          </ButtonGroup>

          <div className="ml-auto flex items-center gap-2">
            {/* Sort */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="outline">
                  {activeSort.label}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuLabel className="text-xs">Sort by</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {SORT_OPTIONS.map((opt) => (
                  <DropdownMenuItem key={opt.key} onClick={() => setSort(opt.key)} className="gap-2 text-xs">
                    {opt.label}
                    {sort === opt.key && <span className="ml-auto text-primary">✓</span>}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <ViewToggle viewMode={viewMode} onViewModeChange={setViewMode} />
          </div>
        </div>

        {/* ── Loading state ── */}
        {isLoading && allVideos.length === 0 && (
          <div className="flex h-52 items-center justify-center">
            <div className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        )}

        {/* ── Empty state ── */}
        {!isLoading && visible.length === 0 && (
          <div className="flex h-52 flex-col items-center justify-center gap-2 rounded-xl border border-dashed">
            <HugeiconsIcon icon={Video01Icon} className="size-9 text-muted-foreground/30" strokeWidth={1} />
            <p className="text-sm font-medium text-muted-foreground">No videos found</p>
            {searchQuery && <p className="text-xs text-muted-foreground">Try a different search or filter</p>}
          </div>
        )}

        {/* ── Grid view ── */}
        {visible.length > 0 && viewMode === "grid" && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
            {visible.map((video) => (
              <VideoCard
                key={video.id}
                video={video}
                onClick={() => openLightbox(video)}
                onDownload={() => downloadFileMutation.mutate(video.id)}
                onDelete={() => { if (confirm(`Delete "${video.name}"?`)) deleteFileMutation.mutate(video.id) }}
                onGetLink={() => { setShareItemId(video.id); setShareItemName(video.name) }}
                onShare={() => { setShareItemId(video.id); setShareItemName(video.name) }}
              />
            ))}
          </div>
        )}

        {/* ── List view ── */}
        {visible.length > 0 && viewMode === "list" && (
          <div className="overflow-hidden rounded-xl border">
            {/* Column header */}
            <div className="hidden items-center gap-3 border-b bg-muted/30 px-4 py-2 sm:flex">
              <div className="size-12 shrink-0" />
              <div className="flex-1 text-[11px] font-medium text-muted-foreground">Name</div>
              <div className="flex items-center gap-4 text-[11px] font-medium text-muted-foreground">
                <span className="w-14">Quality</span>
                <span className="w-14 text-right">Duration</span>
                <span className="w-14 text-right">Size</span>
                <span className="hidden w-28 text-right lg:block">Uploaded</span>
                <span className="w-14">Status</span>
              </div>
              <div className="size-6 shrink-0" />
            </div>
            {visible.map((video, i) => (
              <VideoListRow
                key={video.id}
                video={video}
                showBorder={i > 0}
                onClick={() => openLightbox(video)}
                onDownload={() => downloadFileMutation.mutate(video.id)}
                onDelete={() => { if (confirm(`Delete "${video.name}"?`)) deleteFileMutation.mutate(video.id) }}
                onGetLink={() => { setShareItemId(video.id); setShareItemName(video.name) }}
                onShare={() => { setShareItemId(video.id); setShareItemName(video.name) }}
              />
            ))}
          </div>
        )}

        {total > 0 && (
          <div className="flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-muted-foreground">
              Showing {visible.length} video{visible.length !== 1 ? "s" : ""} on page {page} of {totalPages}
            </p>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage((current) => current - 1)}>
                Previous
              </Button>
              <Button size="sm" variant="outline" disabled={page >= totalPages} onClick={() => setPage((current) => current + 1)}>
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {lightbox && (
        <VideoLightbox
          video={lightbox}
          allVideos={visible}
          onClose={closeLightbox}
          onNavigate={setLightbox}
          onDownload={() => { downloadFileMutation.mutate(lightbox.id); closeLightbox() }}
          onDelete={() => { if (confirm(`Delete "${lightbox.name}"?`)) { deleteFileMutation.mutate(lightbox.id); closeLightbox() } }}
        />
      )}

      <UploadDialog open={uploadOpen} onOpenChange={setUploadOpen} />

      <CreateShareLinkDialog
        open={shareItemId !== null}
        onOpenChange={(open) => { if (!open) { setShareItemId(null); setShareItemName(null) } }}
        defaultName={shareItemName ?? undefined}
        fileId={shareItemId ?? undefined}
      />
    </>
  )
}
