"use client"

import { useState, useCallback } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  CloudUploadIcon,
  Image01Icon,
  Video01Icon,
  Download01Icon,
  Share01Icon,
  Delete01Icon,
  ArrowLeft01Icon,
  ArrowRight01Icon,
  Cancel01Icon,
  Copy01Icon,
  LockedIcon,
  Globe02Icon,
  LinkSquare01Icon,
  EyeIcon,
  Calendar01Icon,
  FolderOpenIcon,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { SearchInput } from "@/components/shared/search-input"
import { ViewToggle } from "@/components/shared/view-toggle"
import { UploadDialog } from "@/components/custom/dashboard/common/upload-dialog"
import { CreateShareLinkDialog } from "@/components/custom/dashboard/common/create-share-link-dialog"

// ─── Types ─────────────────────────────────────────────────────────────────────

type MediaType   = "Image" | "Video"
type StatusType  = "Private" | "Shared"
type AspectRatio = "square" | "landscape" | "portrait" | "wide"
type MediaFilter = "All" | "Images" | "Videos"
type SortBy      = "newest" | "oldest" | "name" | "size"

interface GalleryItem {
  id: string
  name: string
  type: MediaType
  size: string
  sizeBytes: number
  uploadedAt: string
  uploadedMs: number
  status: StatusType
  folder: string
  shareLink?: string
  aspect: AspectRatio
}

// ─── Data ──────────────────────────────────────────────────────────────────────

const ITEMS: GalleryItem[] = [
  { id: "g1",  name: "hero-banner.png",      type: "Image", size: "1.1 MB",  sizeBytes: 1_100_000, uploadedAt: "May 8, 2026",  uploadedMs: 1746662400000, status: "Private", folder: "Projects / Assets",                aspect: "wide"      },
  { id: "g2",  name: "project-demo.mp4",     type: "Video", size: "42 MB",   sizeBytes: 42_000_000, uploadedAt: "May 10, 2026", uploadedMs: 1746835200000, status: "Private", folder: "Projects / Videos",               aspect: "landscape" },
  { id: "g3",  name: "profile-photo.jpg",    type: "Image", size: "840 KB",  sizeBytes: 860_000,   uploadedAt: "May 7, 2026",  uploadedMs: 1746576000000, status: "Shared",  folder: "Personal / Photos",               aspect: "portrait",  shareLink: "https://byoc.app/share/photo-xyz789" },
  { id: "g4",  name: "logo-design.png",      type: "Image", size: "280 KB",  sizeBytes: 287_000,   uploadedAt: "Apr 20, 2026", uploadedMs: 1745107200000, status: "Private", folder: "Projects / Assets",               aspect: "square"    },
  { id: "g5",  name: "intro-clip.mp4",       type: "Video", size: "61 MB",   sizeBytes: 61_000_000, uploadedAt: "Apr 28, 2026", uploadedMs: 1745798400000, status: "Shared",  folder: "Projects / Videos",               aspect: "landscape", shareLink: "https://byoc.app/share/intro-def456" },
  { id: "g6",  name: "thumbnail.jpg",        type: "Image", size: "420 KB",  sizeBytes: 430_000,   uploadedAt: "Apr 15, 2026", uploadedMs: 1744675200000, status: "Private", folder: "Projects / Assets",               aspect: "landscape" },
  { id: "g7",  name: "team-photo.png",       type: "Image", size: "2.4 MB",  sizeBytes: 2_400_000, uploadedAt: "Apr 10, 2026", uploadedMs: 1744243200000, status: "Shared",  folder: "Personal / Photos",               aspect: "landscape", shareLink: "https://byoc.app/share/team-abc" },
  { id: "g8",  name: "raw-recording.mp4",    type: "Video", size: "210 MB",  sizeBytes: 210_000_000, uploadedAt: "May 8, 2026", uploadedMs: 1746662400001, status: "Private", folder: "Projects / Videos / Raw Footage", aspect: "landscape" },
  { id: "g9",  name: "product-shot.jpg",     type: "Image", size: "1.8 MB",  sizeBytes: 1_800_000, uploadedAt: "Mar 22, 2026", uploadedMs: 1742601600000, status: "Private", folder: "Projects / Assets",               aspect: "square"    },
  { id: "g10", name: "presentation.mp4",     type: "Video", size: "95 MB",   sizeBytes: 95_000_000, uploadedAt: "Mar 15, 2026", uploadedMs: 1741996800000, status: "Shared",  folder: "Projects / Videos",               aspect: "landscape", shareLink: "https://byoc.app/share/pres-ghi" },
  { id: "g11", name: "icon-set.png",         type: "Image", size: "340 KB",  sizeBytes: 348_000,   uploadedAt: "Feb 28, 2026", uploadedMs: 1740700800000, status: "Private", folder: "Projects / Assets",               aspect: "square"    },
  { id: "g12", name: "background.jpg",       type: "Image", size: "3.2 MB",  sizeBytes: 3_200_000, uploadedAt: "Feb 10, 2026", uploadedMs: 1739145600000, status: "Private", folder: "Projects / Assets",               aspect: "wide"      },
  { id: "g13", name: "event-highlight.mp4",  type: "Video", size: "78 MB",   sizeBytes: 78_000_000, uploadedAt: "Jan 30, 2026", uploadedMs: 1738195200000, status: "Private", folder: "Projects / Videos",               aspect: "landscape" },
  { id: "g14", name: "avatar.jpg",           type: "Image", size: "190 KB",  sizeBytes: 195_000,   uploadedAt: "Jan 22, 2026", uploadedMs: 1737504000000, status: "Shared",  folder: "Personal / Photos",               aspect: "square",   shareLink: "https://byoc.app/share/avatar-jkl" },
  { id: "g15", name: "cover-art.png",        type: "Image", size: "920 KB",  sizeBytes: 942_000,   uploadedAt: "Jan 10, 2026", uploadedMs: 1736467200000, status: "Private", folder: "Projects / Assets",               aspect: "portrait"  },
]

// ─── Visuals ───────────────────────────────────────────────────────────────────

const TYPE_VISUAL: Record<MediaType, {
  icon: typeof Image01Icon
  iconColor: string
  gradientFrom: string
  gradientTo: string
}> = {
  Image: { icon: Image01Icon, iconColor: "text-violet-500", gradientFrom: "from-violet-500/20", gradientTo: "to-violet-600/5" },
  Video: { icon: Video01Icon, iconColor: "text-blue-500",   gradientFrom: "from-blue-500/20",   gradientTo: "to-blue-600/5"  },
}

const ASPECT_CLASSES: Record<AspectRatio, string> = {
  square:    "aspect-square",
  landscape: "aspect-video",
  portrait:  "aspect-[3/4]",
  wide:      "aspect-[2/1]",
}

const MEDIA_FILTERS: MediaFilter[] = ["All", "Images", "Videos"]

// ─── Helpers ───────────────────────────────────────────────────────────────────

function filterItems(items: GalleryItem[], filter: MediaFilter, query: string): GalleryItem[] {
  return items.filter((item) => {
    const matchesType =
      filter === "All" ||
      (filter === "Images" && item.type === "Image") ||
      (filter === "Videos" && item.type === "Video")
    const matchesQuery = item.name.toLowerCase().includes(query.toLowerCase())
    return matchesType && matchesQuery
  })
}

function sortItems(items: GalleryItem[], sort: SortBy): GalleryItem[] {
  return [...items].sort((a, b) => {
    if (sort === "newest") return b.uploadedMs - a.uploadedMs
    if (sort === "oldest") return a.uploadedMs - b.uploadedMs
    if (sort === "name")   return a.name.localeCompare(b.name)
    if (sort === "size")   return b.sizeBytes - a.sizeBytes
    return 0
  })
}

// ─── Lightbox ─────────────────────────────────────────────────────────────────

function Lightbox({
  item,
  allItems,
  onClose,
  onNavigate,
  onShare,
}: {
  item: GalleryItem
  allItems: GalleryItem[]
  onClose: () => void
  onNavigate: (item: GalleryItem) => void
  onShare: () => void
}) {
  const visual  = TYPE_VISUAL[item.type]
  const idx     = allItems.findIndex((i) => i.id === item.id)
  const hasPrev = idx > 0
  const hasNext = idx < allItems.length - 1

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl gap-0 overflow-hidden p-0" showCloseButton={false}>
        <DialogTitle className="sr-only">{item.name}</DialogTitle>

        {/* ── Top bar: nav + name + close ── */}
        <div className="flex items-center gap-2 border-b px-3 py-2.5">
          <div className="flex items-center gap-1">
            <Button
              size="icon-sm"
              variant="ghost"
              disabled={!hasPrev}
              onClick={() => hasPrev && onNavigate(allItems[idx - 1])}
            >
              <HugeiconsIcon icon={ArrowLeft01Icon} className="size-3.5" strokeWidth={2} />
            </Button>
            <Button
              size="icon-sm"
              variant="ghost"
              disabled={!hasNext}
              onClick={() => hasNext && onNavigate(allItems[idx + 1])}
            >
              <HugeiconsIcon icon={ArrowRight01Icon} className="size-3.5" strokeWidth={2} />
            </Button>
          </div>

          <div className="min-w-0 flex-1 px-1">
            <p className="truncate text-xs font-medium">{item.name}</p>
          </div>

          <span className="shrink-0 text-[11px] tabular-nums text-muted-foreground">
            {idx + 1} / {allItems.length}
          </span>

          <Button size="icon-sm" variant="ghost" onClick={onClose}>
            <HugeiconsIcon icon={Cancel01Icon} className="size-3.5" strokeWidth={2} />
          </Button>
        </div>

        {/* ── Preview ── */}
        <div
          className={cn(
            "flex h-64 items-center justify-center bg-gradient-to-br sm:h-72",
            visual.gradientFrom,
            visual.gradientTo,
          )}
        >
          <HugeiconsIcon
            icon={visual.icon}
            className={cn("size-20 opacity-50", visual.iconColor)}
            strokeWidth={1}
          />
          {item.type === "Video" && (
            <div className="absolute flex items-center justify-center">
              <div className="flex size-14 items-center justify-center rounded-full bg-background/80 shadow-lg backdrop-blur-sm">
                <HugeiconsIcon icon={Video01Icon} className="size-6 text-foreground" strokeWidth={1.5} />
              </div>
            </div>
          )}
        </div>

        {/* ── Details ── */}
        <div className="p-5">
          {/* Badges row */}
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className="text-[11px]">{item.type}</Badge>
            <span className="text-[11px] text-muted-foreground">{item.size}</span>
            <Badge
              variant="secondary"
              className={cn(
                "text-[11px]",
                item.status === "Shared"
                  ? "bg-emerald-500/10 text-emerald-600"
                  : "bg-muted text-muted-foreground",
              )}
            >
              {item.status === "Shared" ? (
                <><HugeiconsIcon icon={Globe02Icon} className="size-2.5" strokeWidth={2} /> Shared</>
              ) : (
                <><HugeiconsIcon icon={LockedIcon} className="size-2.5" strokeWidth={2} /> Private</>
              )}
            </Badge>
          </div>

          <Separator className="my-4" />

          {/* Metadata */}
          <div className="space-y-2.5">
            {[
              { icon: Calendar01Icon, label: "Uploaded", value: item.uploadedAt },
              { icon: FolderOpenIcon, label: "Location", value: item.folder     },
            ].map((row) => (
              <div key={row.label} className="flex items-center gap-2">
                <HugeiconsIcon icon={row.icon} className="size-3.5 shrink-0 text-muted-foreground" strokeWidth={1.5} />
                <span className="text-[11px] text-muted-foreground">{row.label}</span>
                <span className="ml-auto max-w-[200px] truncate text-right text-[11px] font-medium" title={row.value}>
                  {row.value}
                </span>
              </div>
            ))}
          </div>

          {/* Share link */}
          {item.status === "Shared" && item.shareLink && (
            <div className="mt-3 flex items-center gap-2">
              <div className="flex-1 truncate rounded-md border bg-muted/30 px-2.5 py-1.5">
                <span className="text-[11px] text-muted-foreground">{item.shareLink}</span>
              </div>
              <Button size="icon-sm" variant="outline">
                <HugeiconsIcon icon={Copy01Icon} className="size-3.5" strokeWidth={1.5} />
              </Button>
            </div>
          )}

          <Separator className="my-4" />

          {/* Actions */}
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline">
              <HugeiconsIcon icon={Download01Icon} className="size-3.5" strokeWidth={1.5} />
              Download
            </Button>
            <Button size="sm" variant="outline" onClick={onShare}>
              <HugeiconsIcon icon={Share01Icon} className="size-3.5" strokeWidth={1.5} />
              {item.status === "Shared" ? "Manage Link" : "Share"}
            </Button>
            {item.status === "Private" && (
              <Button size="sm" variant="outline">
                <HugeiconsIcon icon={LinkSquare01Icon} className="size-3.5" strokeWidth={1.5} />
                Get Link
              </Button>
            )}
            <Button size="sm" variant="destructive" className="ml-auto">
              <HugeiconsIcon icon={Delete01Icon} className="size-3.5" strokeWidth={1.5} />
              Delete
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ─── Gallery card ──────────────────────────────────────────────────────────────

function GalleryCard({
  item,
  viewMode,
  onClick,
}: {
  item: GalleryItem
  viewMode: "grid" | "list"
  onClick: () => void
}) {
  const visual = TYPE_VISUAL[item.type]

  if (viewMode === "list") {
    return (
      <button
        onClick={onClick}
        className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-accent/50"
      >
        <div
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-md bg-gradient-to-br",
            visual.gradientFrom, visual.gradientTo,
          )}
        >
          <HugeiconsIcon icon={visual.icon} className={cn("size-5", visual.iconColor)} strokeWidth={1.5} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-medium">{item.name}</p>
          <p className="text-[11px] text-muted-foreground">{item.folder}</p>
        </div>
        <div className="hidden items-center gap-4 sm:flex">
          <span className="text-[11px] text-muted-foreground">{item.size}</span>
          <span className="text-[11px] text-muted-foreground">{item.uploadedAt}</span>
          <Badge
            variant="secondary"
            className={cn(
              "text-[10px]",
              item.status === "Shared" ? "bg-emerald-500/10 text-emerald-600" : "bg-muted text-muted-foreground",
            )}
          >
            {item.status}
          </Badge>
        </div>
        <HugeiconsIcon icon={EyeIcon} className="size-3.5 shrink-0 text-muted-foreground/40" strokeWidth={1.5} />
      </button>
    )
  }

  return (
    <button
      onClick={onClick}
      className={cn(
        "group relative w-full overflow-hidden rounded-md border bg-card",
        "transition-all duration-150 hover:shadow-md hover:border-border/80",
        ASPECT_CLASSES[item.aspect],
      )}
    >
      {/* Preview */}
      <div
        className={cn(
          "absolute inset-0 flex items-center justify-center bg-gradient-to-br",
          visual.gradientFrom, visual.gradientTo,
        )}
      >
        <HugeiconsIcon
          icon={visual.icon}
          className={cn("size-10 opacity-50 transition-transform duration-200 group-hover:scale-110", visual.iconColor)}
          strokeWidth={1}
        />
        {item.type === "Video" && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex size-10 items-center justify-center rounded-full bg-background/70 shadow backdrop-blur-sm">
              <HugeiconsIcon icon={Video01Icon} className="size-4 text-foreground" strokeWidth={1.5} />
            </div>
          </div>
        )}
      </div>

      {/* Status badge top-right */}
      <div className="absolute right-2 top-2">
        {item.status === "Shared" ? (
          <div className="flex size-5 items-center justify-center rounded-full bg-emerald-500/20 backdrop-blur-sm">
            <HugeiconsIcon icon={Globe02Icon} className="size-3 text-emerald-500" strokeWidth={2} />
          </div>
        ) : (
          <div className="flex size-5 items-center justify-center rounded-full bg-background/60 backdrop-blur-sm">
            <HugeiconsIcon icon={LockedIcon} className="size-3 text-muted-foreground" strokeWidth={2} />
          </div>
        )}
      </div>

      {/* Hover overlay */}
      <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100">
        <div className="p-2.5">
          <p className="truncate text-[11px] font-medium text-white">{item.name}</p>
          <p className="text-[10px] text-white/70">{item.size}</p>
        </div>
      </div>
    </button>
  )
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function GalleryPage() {
  const [filter, setFilter]       = useState<MediaFilter>("All")
  const [sort, setSort]           = useState<SortBy>("newest")
  const [search, setSearch]       = useState("")
  const [viewMode, setViewMode]   = useState<"grid" | "list">("grid")
  const [lightbox,   setLightbox]   = useState<GalleryItem | null>(null)
  const [shareItem,  setShareItem]  = useState<GalleryItem | null>(null)
  const [uploadOpen, setUploadOpen] = useState(false)

  const processed = sortItems(filterItems(ITEMS, filter, search), sort)

  const imageCount = ITEMS.filter((i) => i.type === "Image").length
  const videoCount = ITEMS.filter((i) => i.type === "Video").length

  const openLightbox = useCallback((item: GalleryItem) => setLightbox(item), [])
  const closeLightbox = useCallback(() => setLightbox(null), [])

  return (
    <>
      <div className="space-y-5">

        {/* ── Header ── */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Gallery</h1>
            <p className="mt-1 text-xs text-muted-foreground">
              {imageCount} image{imageCount !== 1 ? "s" : ""} · {videoCount} video{videoCount !== 1 ? "s" : ""}
            </p>
          </div>
          <Button size="sm" onClick={() => setUploadOpen(true)}>
            <HugeiconsIcon icon={CloudUploadIcon} className="size-3.5" strokeWidth={1.5} />
            Upload
          </Button>
        </div>

        {/* ── Toolbar ── */}
        <div className="flex flex-wrap items-center gap-2">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search media..."
          />

          {/* Type filter */}
          <ButtonGroup>
            {MEDIA_FILTERS.map((f) => (
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

          {/* Sort */}
          <Select value={sort} onValueChange={(v) => setSort(v as SortBy)}>
            <SelectTrigger className="h-8 w-32 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="oldest">Oldest</SelectItem>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="size">Size</SelectItem>
            </SelectContent>
          </Select>

          <ViewToggle viewMode={viewMode} onViewModeChange={setViewMode} />
        </div>

        {/* ── Empty state ── */}
        {processed.length === 0 && (
          <div className="flex h-52 flex-col items-center justify-center gap-2 rounded-xl border border-dashed">
            <HugeiconsIcon icon={Image01Icon} className="size-9 text-muted-foreground/30" strokeWidth={1} />
            <p className="text-sm font-medium text-muted-foreground">No media found</p>
          </div>
        )}

        {/* ── List view ── */}
        {processed.length > 0 && viewMode === "list" && (
          <div className="overflow-hidden rounded-xl border">
            {processed.map((item, i) => (
              <div key={item.id} className={cn(i > 0 && "border-t")}>
                <GalleryCard item={item} viewMode="list" onClick={() => openLightbox(item)} />
              </div>
            ))}
          </div>
        )}

        {/* ── Grid view ── */}
        {processed.length > 0 && viewMode === "grid" && (
          <div className="columns-2 gap-3 sm:columns-3 md:columns-4 lg:columns-5">
            {processed.map((item) => (
              <div key={item.id} className="mb-3 break-inside-avoid">
                <GalleryCard item={item} viewMode="grid" onClick={() => openLightbox(item)} />
              </div>
            ))}
          </div>
        )}

      </div>

      {/* ── Lightbox ── */}
      {lightbox && (
        <Lightbox
          item={lightbox}
          allItems={processed}
          onClose={closeLightbox}
          onNavigate={setLightbox}
          onShare={() => { setShareItem(lightbox); closeLightbox() }}
        />
      )}

      <CreateShareLinkDialog
        open={shareItem !== null}
        onOpenChange={(open) => { if (!open) setShareItem(null) }}
        defaultFileName={shareItem?.name}
      />

      <UploadDialog open={uploadOpen} onOpenChange={setUploadOpen} />
    </>
  )
}
