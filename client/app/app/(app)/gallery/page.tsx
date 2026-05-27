"use client"

import { useState, useCallback, useMemo, useEffect, useRef } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  CloudUploadIcon,
  Image01Icon,
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
import { toast } from "sonner"
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
import { useWorkspace } from "@/lib/workspace-context"
import { ProviderErrorGuard } from "@/components/custom/dashboard/common/provider-error-guard"
import { useFiles, useDeleteFile, useDownloadFile, usePreviewUrl, usePreviewUrls, type ApiFile } from "@/lib/files"
import { FileThumbnail } from "@/components/shared/file-thumbnail"
import { formatFileSize, formatDate, getStorageFolderLabel } from "@/lib/file-utils"

// ─── Types ─────────────────────────────────────────────────────────────────────

type SortBy = "newest" | "oldest" | "name" | "size"

interface GalleryItem {
  id: string
  name: string
  size: string
  sizeBytes: number
  uploadedAt: string
  uploadedMs: number
  status: "Private" | "Shared"
  folder: string
  shareLink?: string
  mimeType: string | null
}

const PAGE_SIZE = 24

// ─── Helpers ───────────────────────────────────────────────────────────────────

function apiFileToGalleryItem(file: ApiFile): GalleryItem {
  return {
    id: file.id,
    name: file.name,
    size: formatFileSize(file.size),
    sizeBytes: file.size,
    uploadedAt: formatDate(file.createdAt),
    uploadedMs: new Date(file.createdAt).getTime(),
    status: "Private",
    folder: getStorageFolderLabel(file.storagePath),
    mimeType: file.mimeType,
  }
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
  workspaceId,
  previewUrl,
  onClose,
  onNavigate,
  onShare,
  onDownload,
  onDelete,
  onGetLink,
}: {
  item: GalleryItem
  allItems: GalleryItem[]
  workspaceId: string | undefined
  previewUrl?: string
  onClose: () => void
  onNavigate: (item: GalleryItem) => void
  onShare: () => void
  onDownload: () => void
  onDelete: () => void
  onGetLink?: () => void
}) {
  // Fall back to individual fetch only when URL wasn't pre-fetched (e.g., direct navigation)
  const { data: thumbData } = usePreviewUrl(workspaceId, item.id, item.mimeType, !previewUrl)
  const imgUrl = previewUrl ?? thumbData?.url
  const idx     = allItems.findIndex((i) => i.id === item.id)
  const hasPrev = idx > 0
  const hasNext = idx < allItems.length - 1

  // ── Zoom & pan ────────────────────────────────────────────────────────────────
  const [scale, setScale]       = useState(1)
  const [offset, setOffset]     = useState({ x: 0, y: 0 })
  const [isDragging, setIsDrag] = useState(false)
  const dragStart               = useRef<{ mx: number; my: number; ox: number; oy: number } | null>(null)

  // Reset when switching images
  useEffect(() => {
    setScale(1)
    setOffset({ x: 0, y: 0 })
  }, [item.id])

  const zoomBy = useCallback((delta: number) => {
    setScale((s) => {
      const next = Math.min(5, Math.max(0.25, s + delta))
      if (next <= 1) setOffset({ x: 0, y: 0 })
      return next
    })
  }, [])

  const resetZoom = useCallback(() => {
    setScale(1)
    setOffset({ x: 0, y: 0 })
  }, [])

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault()
    zoomBy(e.deltaY < 0 ? 0.25 : -0.25)
  }, [zoomBy])

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (scale <= 1) return
    dragStart.current = { mx: e.clientX, my: e.clientY, ox: offset.x, oy: offset.y }
    setIsDrag(true)
  }, [scale, offset])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragStart.current) return
    setOffset({
      x: dragStart.current.ox + (e.clientX - dragStart.current.mx),
      y: dragStart.current.oy + (e.clientY - dragStart.current.my),
    })
  }, [])

  const stopDrag = useCallback(() => {
    dragStart.current = null
    setIsDrag(false)
  }, [])

  // Keyboard shortcuts: +/= zoom in, - zoom out, 0 reset
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "+" || e.key === "=") zoomBy(0.25)
      else if (e.key === "-") zoomBy(-0.25)
      else if (e.key === "0") resetZoom()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [zoomBy, resetZoom])

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="flex h-[88vh] w-full max-w-7xl flex-col gap-0 overflow-hidden p-0 sm:max-w-7xl" showCloseButton={false}>
        <DialogTitle className="sr-only">{item.name}</DialogTitle>

        {/* ── Top bar ── */}
        <div className="flex shrink-0 items-center gap-2 border-b px-3 py-2.5">
          <div className="flex items-center gap-1">
            <Button size="icon-sm" variant="ghost" disabled={!hasPrev} onClick={() => hasPrev && onNavigate(allItems[idx - 1])}>
              <HugeiconsIcon icon={ArrowLeft01Icon} className="size-3.5" strokeWidth={2} />
            </Button>
            <Button size="icon-sm" variant="ghost" disabled={!hasNext} onClick={() => hasNext && onNavigate(allItems[idx + 1])}>
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

        {/* ── Body: preview + sidebar ── */}
        <div className="flex min-h-0 flex-1 overflow-hidden">

          {/* Preview */}
          <div
            className="relative flex flex-1 items-center justify-center overflow-hidden bg-black/90 dark:bg-black"
            style={{ cursor: scale > 1 ? (isDragging ? "grabbing" : "grab") : "default" }}
            onWheel={handleWheel}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={stopDrag}
            onMouseLeave={stopDrag}
          >
            {imgUrl ? (
              <img
                src={imgUrl}
                alt={item.name}
                draggable={false}
                style={{
                  transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
                  transition: isDragging ? "none" : "transform 0.15s ease",
                }}
                className="max-h-full max-w-full object-contain select-none pointer-events-none"
              />
            ) : (
              <HugeiconsIcon icon={Image01Icon} className="size-24 text-white/20" strokeWidth={1} />
            )}

            {/* ── Floating action bar ── */}
            <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-full border border-white/10 bg-black/40 px-2 py-1.5 backdrop-blur-md">
              {/* Zoom controls */}
              <button
                onClick={() => zoomBy(-0.25)}
                title="Zoom out (−)"
                className="flex size-7 items-center justify-center rounded-full text-[15px] font-light text-white/70 transition-colors hover:bg-white/10 hover:text-white"
              >
                −
              </button>
              <button
                onClick={resetZoom}
                title="Reset zoom (0)"
                className="flex min-w-[3rem] items-center justify-center rounded-full px-1.5 py-1 text-[11px] tabular-nums text-white/70 transition-colors hover:bg-white/10 hover:text-white"
              >
                {Math.round(scale * 100)}%
              </button>
              <button
                onClick={() => zoomBy(0.25)}
                title="Zoom in (+)"
                className="flex size-7 items-center justify-center rounded-full text-[15px] font-light text-white/70 transition-colors hover:bg-white/10 hover:text-white"
              >
                +
              </button>
              <div className="h-4 w-px bg-white/10" />
              <button
                onClick={onDownload}
                className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-medium text-white/80 transition-colors hover:bg-white/10 hover:text-white"
              >
                <HugeiconsIcon icon={Download01Icon} className="size-3.5" strokeWidth={1.5} />
                Download
              </button>
              <div className="h-4 w-px bg-white/10" />
              <button
                onClick={onShare}
                className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-medium text-white/80 transition-colors hover:bg-white/10 hover:text-white"
              >
                <HugeiconsIcon icon={Share01Icon} className="size-3.5" strokeWidth={1.5} />
                {item.status === "Shared" ? "Manage Link" : "Share"}
              </button>
              {item.status === "Private" && onGetLink && (
                <>
                  <div className="h-4 w-px bg-white/10" />
                  <button
                    onClick={onGetLink}
                    className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-medium text-white/80 transition-colors hover:bg-white/10 hover:text-white"
                  >
                    <HugeiconsIcon icon={LinkSquare01Icon} className="size-3.5" strokeWidth={1.5} />
                    Get Link
                  </button>
                </>
              )}
              <div className="h-4 w-px bg-white/10" />
              <button
                onClick={onDelete}
                className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-medium text-red-400/80 transition-colors hover:bg-red-500/15 hover:text-red-400"
              >
                <HugeiconsIcon icon={Delete01Icon} className="size-3.5" strokeWidth={1.5} />
                Delete
              </button>
            </div>
          </div>

          {/* Sidebar */}
          <div className="flex w-64 shrink-0 flex-col overflow-y-auto border-l p-5">
            {/* Badges */}
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary" className="text-[11px]">Image</Badge>
              <span className="text-[11px] text-muted-foreground">{item.size}</span>
              <Badge
                variant="secondary"
                className={cn(
                  "text-[11px]",
                  item.status === "Shared" ? "bg-emerald-500/10 text-emerald-600" : "bg-muted text-muted-foreground",
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
                <div key={row.label} className="flex items-start gap-2">
                  <HugeiconsIcon icon={row.icon} className="mt-0.5 size-3.5 shrink-0 text-muted-foreground" strokeWidth={1.5} />
                  <span className="text-[11px] text-muted-foreground">{row.label}</span>
                  <span className="ml-auto max-w-[130px] truncate text-right text-[11px] font-medium" title={row.value}>
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
                <Button size="icon-sm" variant="outline" onClick={() => { navigator.clipboard.writeText(item.shareLink ?? ""); toast.success("Copied to clipboard") }}>
                  <HugeiconsIcon icon={Copy01Icon} className="size-3.5" strokeWidth={1.5} />
                </Button>
              </div>
            )}

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
  workspaceId,
  previewUrl,
  skipFetch,
  onClick,
}: {
  item: GalleryItem
  viewMode: "grid" | "list"
  workspaceId: string | undefined
  previewUrl?: string
  skipFetch?: boolean
  onClick: () => void
}) {
  if (viewMode === "list") {
    return (
      <button
        onClick={onClick}
        className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-accent/50"
      >
        <FileThumbnail
          workspaceId={workspaceId}
          fileId={item.id}
          mimeType={item.mimeType}
          alt={item.name}
          previewUrl={previewUrl}
          skipFetch={skipFetch}
          className="flex size-10 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-violet-500/20 to-violet-600/5"
          imgClassName="object-cover"
          fallback={<HugeiconsIcon icon={Image01Icon} className="size-5 text-violet-500" strokeWidth={1.5} />}
        />
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
      className="group relative block w-full overflow-hidden"
    >
      <FileThumbnail
        workspaceId={workspaceId}
        fileId={item.id}
        mimeType={item.mimeType}
        alt={item.name}
        previewUrl={previewUrl}
        skipFetch={skipFetch}
        natural
        fallback={
          <div className="flex h-28 w-full items-center justify-center bg-gradient-to-br from-violet-500/20 to-violet-600/5">
            <HugeiconsIcon icon={Image01Icon} className="size-10 text-violet-500 opacity-50" strokeWidth={1} />
          </div>
        }
      />

      {/* Status badge */}
      <div className="absolute right-1.5 top-1.5">
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
  const { currentWorkspace } = useWorkspace()
  const workspaceId = currentWorkspace?.id

  const deleteFileMutation = useDeleteFile(workspaceId)
  const downloadFileMutation = useDownloadFile(workspaceId)

  const [sort, setSort]           = useState<SortBy>("newest")
  const [search, setSearch]       = useState("")
  const [page, setPage]           = useState(1)
  const [viewMode, setViewMode]   = useState<"grid" | "list">("grid")
  const [lightbox,   setLightbox]   = useState<GalleryItem | null>(null)
  const [shareItem,  setShareItem]  = useState<GalleryItem | null>(null)
  const [uploadOpen, setUploadOpen] = useState(false)

  const sortQuery =
    sort === "oldest"
      ? { sortBy: "createdAt" as const, sortDir: "asc" as const }
      : sort === "name"
        ? { sortBy: "name" as const, sortDir: "asc" as const }
        : sort === "size"
          ? { sortBy: "size" as const, sortDir: "desc" as const }
          : { sortBy: "createdAt" as const, sortDir: "desc" as const }

  const { data: mediaData, isLoading } = useFiles(currentWorkspace?.id, {
    kind: "image",
    includeNested: true,
    search: search || undefined,
    page,
    limit: PAGE_SIZE,
    ...sortQuery,
  })

  useEffect(() => {
    setPage(1)
  }, [currentWorkspace?.id, sort, search])

  const processed = useMemo(
    () => sortItems((mediaData?.files ?? []).map(apiFileToGalleryItem), sort),
    [mediaData, sort],
  )
  const total = mediaData?.total ?? 0

  const fileIds = useMemo(() => processed.map((f) => f.id), [processed])
  const { data: batchUrls } = usePreviewUrls(workspaceId, fileIds)
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  useEffect(() => {
    if (page > totalPages) setPage(totalPages)
  }, [page, totalPages])

  const openLightbox = useCallback((item: GalleryItem) => setLightbox(item), [])
  const closeLightbox = useCallback(() => setLightbox(null), [])

  if (workspaceId && (!currentWorkspace?.storage || currentWorkspace.storage.status === "Error")) {
    return <ProviderErrorGuard workspaceId={workspaceId} storage={currentWorkspace?.storage ?? null} />
  }

  return (
    <>
      <div className="space-y-5">

        {/* ── Header ── */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Gallery</h1>
            <p className="mt-1 text-xs text-muted-foreground">
              {isLoading ? "Loading..." : `${total} images · Page ${page} of ${totalPages}`}
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

        {/* ── Loading state ── */}
        {isLoading && processed.length === 0 && (
          <div className="flex h-52 items-center justify-center">
            <div className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        )}

        {/* ── Empty state ── */}
        {!isLoading && processed.length === 0 && (
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
                <GalleryCard item={item} viewMode="list" workspaceId={workspaceId} previewUrl={batchUrls?.urls[item.id]} skipFetch onClick={() => openLightbox(item)} />
              </div>
            ))}
          </div>
        )}

        {/* ── Grid view ── */}
        {processed.length > 0 && viewMode === "grid" && (
          <div className="columns-2 sm:columns-3 md:columns-4 lg:columns-5">
            {processed.map((item) => (
              <div key={item.id} className="break-inside-avoid">
                <GalleryCard item={item} viewMode="grid" workspaceId={workspaceId} previewUrl={batchUrls?.urls[item.id]} skipFetch onClick={() => openLightbox(item)} />
              </div>
            ))}
          </div>
        )}

        {total > 0 && (
          <div className="flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-muted-foreground">
              Showing {processed.length} item{processed.length !== 1 ? "s" : ""} on page {page} of {totalPages}
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

      {/* ── Lightbox ── */}
{lightbox && (
        <Lightbox
          item={lightbox}
          allItems={processed}
          workspaceId={workspaceId}
          previewUrl={batchUrls?.urls[lightbox.id]}
          onClose={closeLightbox}
          onNavigate={setLightbox}
          onShare={() => { setShareItem(lightbox); closeLightbox() }}
          onDownload={() => { downloadFileMutation.mutate(lightbox.id); closeLightbox() }}
          onDelete={() => { if (confirm(`Delete "${lightbox.name}"?`)) { deleteFileMutation.mutate(lightbox.id); closeLightbox() } }}
          onGetLink={() => { setShareItem(lightbox); closeLightbox() }}
        />
      )}

      <CreateShareLinkDialog
        open={shareItem !== null}
        onOpenChange={(open) => { if (!open) setShareItem(null) }}
        defaultName={shareItem?.name}
        fileId={shareItem?.id}
      />

      <UploadDialog open={uploadOpen} onOpenChange={setUploadOpen} />
    </>
  )
}
