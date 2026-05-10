"use client"

import { useState, useCallback } from "react"
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

// ─── Types ─────────────────────────────────────────────────────────────────────

type Resolution = "4K" | "1080p" | "720p" | "480p"
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
}

// ─── Resolution config ─────────────────────────────────────────────────────────

const RES_STYLE: Record<Resolution, { badge: string }> = {
  "4K":    { badge: "bg-violet-500/10 text-violet-600" },
  "1080p": { badge: "bg-blue-500/10 text-blue-600"     },
  "720p":  { badge: "bg-slate-500/10 text-slate-500"   },
  "480p":  { badge: "bg-muted text-muted-foreground"   },
}

// ─── Data ──────────────────────────────────────────────────────────────────────

const VIDEOS: VideoItem[] = [
  { id: "v1",  name: "project-demo.mp4",      extension: "mp4", resolution: "1080p", duration: "4:22",  durationSecs: 262,   size: "42 MB",   sizeBytes: 44_040_192,    folder: "Projects / Videos",               uploadedAt: "May 10, 2026", uploadedMs: 1746835200000, status: "Private" },
  { id: "v2",  name: "intro-clip.mp4",        extension: "mp4", resolution: "1080p", duration: "1:45",  durationSecs: 105,   size: "61 MB",   sizeBytes: 63_963_136,    folder: "Projects / Videos",               uploadedAt: "Apr 28, 2026", uploadedMs: 1745798400000, status: "Shared",  shareLink: "https://byoc.app/share/intro-def456" },
  { id: "v3",  name: "raw-recording.mp4",     extension: "mp4", resolution: "4K",    duration: "22:14", durationSecs: 1334,  size: "210 MB",  sizeBytes: 220_200_960,   folder: "Projects / Videos / Raw Footage", uploadedAt: "May 8, 2026",  uploadedMs: 1746662400000, status: "Private" },
  { id: "v4",  name: "presentation.mp4",      extension: "mp4", resolution: "1080p", duration: "8:33",  durationSecs: 513,   size: "95 MB",   sizeBytes: 99_614_720,    folder: "Projects / Videos",               uploadedAt: "Mar 15, 2026", uploadedMs: 1741996800000, status: "Shared",  shareLink: "https://byoc.app/share/pres-ghi" },
  { id: "v5",  name: "event-highlight.mp4",   extension: "mp4", resolution: "1080p", duration: "6:12",  durationSecs: 372,   size: "78 MB",   sizeBytes: 81_788_928,    folder: "Projects / Videos",               uploadedAt: "Jan 30, 2026", uploadedMs: 1738195200000, status: "Private" },
  { id: "v6",  name: "tutorial-part1.mp4",    extension: "mp4", resolution: "720p",  duration: "12:48", durationSecs: 768,   size: "156 MB",  sizeBytes: 163_577_856,   folder: "Tutorials",                       uploadedAt: "Apr 12, 2026", uploadedMs: 1744416000000, status: "Private" },
  { id: "v7",  name: "tutorial-part2.mp4",    extension: "mp4", resolution: "720p",  duration: "15:22", durationSecs: 922,   size: "198 MB",  sizeBytes: 207_618_048,   folder: "Tutorials",                       uploadedAt: "Apr 12, 2026", uploadedMs: 1744416001000, status: "Private" },
  { id: "v8",  name: "product-launch.mp4",    extension: "mp4", resolution: "4K",    duration: "3:40",  durationSecs: 220,   size: "380 MB",  sizeBytes: 398_458_880,   folder: "Marketing",                       uploadedAt: "Apr 20, 2026", uploadedMs: 1745107200000, status: "Shared",  shareLink: "https://byoc.app/share/launch-abc" },
  { id: "v9",  name: "team-meeting.mp4",      extension: "mp4", resolution: "1080p", duration: "45:18", durationSecs: 2718,  size: "1.2 GB",  sizeBytes: 1_288_490_188, folder: "Meetings",                        uploadedAt: "May 5, 2026",  uploadedMs: 1746403200000, status: "Private" },
  { id: "v10", name: "brand-story.mp4",       extension: "mp4", resolution: "4K",    duration: "2:15",  durationSecs: 135,   size: "520 MB",  sizeBytes: 545_259_520,   folder: "Marketing",                       uploadedAt: "Mar 28, 2026", uploadedMs: 1743120000000, status: "Shared",  shareLink: "https://byoc.app/share/brand-jkl" },
  { id: "v11", name: "client-demo.mp4",       extension: "mp4", resolution: "1080p", duration: "28:44", durationSecs: 1724,  size: "342 MB",  sizeBytes: 358_612_992,   folder: "Sales",                           uploadedAt: "Apr 5, 2026",  uploadedMs: 1743811200000, status: "Private" },
  { id: "v12", name: "webinar-q1.mp4",        extension: "mp4", resolution: "720p",  duration: "58:22", durationSecs: 3502,  size: "890 MB",  sizeBytes: 933_232_640,   folder: "Webinars",                        uploadedAt: "Feb 15, 2026", uploadedMs: 1739577600000, status: "Shared",  shareLink: "https://byoc.app/share/webinar-mno" },
  { id: "v13", name: "short-clip.mp4",        extension: "mp4", resolution: "1080p", duration: "0:45",  durationSecs: 45,    size: "18 MB",   sizeBytes: 18_874_368,    folder: "Social Media",                    uploadedAt: "May 9, 2026",  uploadedMs: 1746748800000, status: "Shared",  shareLink: "https://byoc.app/share/clip-pqr" },
  { id: "v14", name: "bts-footage.mp4",       extension: "mp4", resolution: "4K",    duration: "11:30", durationSecs: 690,   size: "2.1 GB",  sizeBytes: 2_254_857_830, folder: "Projects / Raw",                  uploadedAt: "Mar 10, 2026", uploadedMs: 1741564800000, status: "Private" },
  { id: "v15", name: "podcast-episode-1.mp4", extension: "mp4", resolution: "720p",  duration: "32:15", durationSecs: 1935,  size: "445 MB",  sizeBytes: 466_714_624,   folder: "Podcast",                         uploadedAt: "Feb 28, 2026", uploadedMs: 1740700800000, status: "Shared",  shareLink: "https://byoc.app/share/pod-stu" },
  { id: "v16", name: "onboarding-video.mp4",  extension: "mp4", resolution: "1080p", duration: "7:48",  durationSecs: 468,   size: "112 MB",  sizeBytes: 117_440_512,   folder: "HR",                              uploadedAt: "Mar 20, 2026", uploadedMs: 1742428800000, status: "Shared",  shareLink: "https://byoc.app/share/onboard-vwx" },
]

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
}: {
  as: typeof ContextMenuItem | typeof DropdownMenuItem
  Sep: typeof ContextMenuSeparator | typeof DropdownMenuSeparator
  video: VideoItem
  onPreview: () => void
}) {
  return (
    <>
      <As onClick={onPreview} className="gap-2">
        <HugeiconsIcon icon={EyeIcon} className="size-3.5" strokeWidth={1.5} />
        Preview
      </As>
      <As className="gap-2">
        <HugeiconsIcon icon={Download01Icon} className="size-3.5" strokeWidth={1.5} />
        Download
      </As>
      <Sep />
      <As className="gap-2">
        <HugeiconsIcon icon={Share01Icon} className="size-3.5" strokeWidth={1.5} />
        {video.status === "Shared" ? "Manage Link" : "Share"}
      </As>
      {video.status === "Shared" && (
        <As className="gap-2">
          <HugeiconsIcon icon={Copy01Icon} className="size-3.5" strokeWidth={1.5} />
          Copy Link
        </As>
      )}
      {video.status === "Private" && (
        <As className="gap-2">
          <HugeiconsIcon icon={LinkSquare01Icon} className="size-3.5" strokeWidth={1.5} />
          Get Link
        </As>
      )}
      <Sep />
      <As className="gap-2">
        <HugeiconsIcon icon={PencilEdit01Icon} className="size-3.5" strokeWidth={1.5} />
        Rename
      </As>
      <As className="gap-2">
        <HugeiconsIcon icon={MoveIcon} className="size-3.5" strokeWidth={1.5} />
        Move to
      </As>
      <Sep />
      <As variant="destructive" className="gap-2">
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
}: {
  video: VideoItem
  onClick: () => void
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
                <VideoMenuItems as={DropdownMenuItem} Sep={DropdownMenuSeparator} video={video} onPreview={onClick} />
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
        <VideoMenuItems as={ContextMenuItem} Sep={ContextMenuSeparator} video={video} onPreview={onClick} />
      </ContextMenuContent>
    </ContextMenu>
  )
}

// ─── Video List Row ────────────────────────────────────────────────────────────

function VideoListRow({
  video,
  showBorder,
  onClick,
}: {
  video: VideoItem
  showBorder: boolean
  onClick: () => void
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
              <VideoMenuItems as={DropdownMenuItem} Sep={DropdownMenuSeparator} video={video} onPreview={onClick} />
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <VideoMenuItems as={ContextMenuItem} Sep={ContextMenuSeparator} video={video} onPreview={onClick} />
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
}: {
  video: VideoItem
  allVideos: VideoItem[]
  onClose: () => void
  onNavigate: (v: VideoItem | null) => void
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
        {/* Player placeholder */}
        <div className="flex aspect-video items-center justify-center rounded-lg bg-gradient-to-br from-blue-500/15 to-blue-600/5">
          <div className="flex size-16 items-center justify-center rounded-full bg-background/80 shadow-lg">
            <div className="ml-1.5 size-0 border-y-[12px] border-l-[20px] border-y-transparent border-l-foreground" />
          </div>
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
  const [filter, setFilter]           = useState<ResFilter>("All")
  const [sort, setSort]               = useState<SortKey>("newest")
  const [viewMode, setViewMode]       = useState<"grid" | "list">("grid")
  const [searchQuery, setSearchQuery] = useState("")
  const [lightbox, setLightbox]       = useState<VideoItem | null>(null)
  const [uploadOpen, setUploadOpen]   = useState(false)

  const visible     = applyFilterSort(VIDEOS, filter, sort, searchQuery)
  const activeSort  = SORT_OPTIONS.find((s) => s.key === sort)!

  const totalDuration = VIDEOS.reduce((acc, v) => acc + v.durationSecs, 0)
  const totalHours    = Math.floor(totalDuration / 3600)
  const totalMins     = Math.floor((totalDuration % 3600) / 60)

  const resCounts = (["4K", "1080p", "720p"] as Resolution[]).reduce<Record<string, number>>(
    (acc, r) => ({ ...acc, [r]: VIDEOS.filter((v) => v.resolution === r).length }),
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
              {VIDEOS.length} videos &middot; {totalHours}h {totalMins}m total &middot; {VIDEOS.filter((v) => v.status === "Shared").length} shared
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

        {/* ── Empty state ── */}
        {visible.length === 0 && (
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
              <VideoCard key={video.id} video={video} onClick={() => openLightbox(video)} />
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
              />
            ))}
          </div>
        )}
      </div>

      {lightbox && (
        <VideoLightbox
          video={lightbox}
          allVideos={visible}
          onClose={closeLightbox}
          onNavigate={setLightbox}
        />
      )}

      <UploadDialog open={uploadOpen} onOpenChange={setUploadOpen} />
    </>
  )
}
