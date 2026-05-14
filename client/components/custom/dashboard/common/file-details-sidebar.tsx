"use client"

import { HugeiconsIcon } from "@hugeicons/react"
import {
  Cancel01Icon,
  EyeIcon,
  Download01Icon,
  Share01Icon,
  PencilEdit01Icon,
  Delete01Icon,
  LockedIcon,
  Globe02Icon,
  Calendar01Icon,
  UserCircle02Icon,
  CloudServerIcon,
  FolderOpenIcon,
  Folder01Icon,
  Copy01Icon,
  FileUploadIcon,
  Clock01Icon,
  Video01Icon,
  Image01Icon,
  LegalDocument01Icon,
  ZipIcon,
  LinkSquare01Icon,
} from "@hugeicons/core-free-icons"
import { useIsMobile } from "@/hooks/use-mobile"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface FileActivity {
  action: string
  time: string
  icon: typeof FileUploadIcon
  iconColor: string
  iconBg: string
}

export interface FileItem {
  id: string
  name: string
  type: "Video" | "Image" | "Document" | "Archive"
  kind?: "image" | "video" | "document" | "audio" | "archive" | "other"
  extension: string | null
  size: string
  sizeBytes?: number
  folder: string
  folderId?: string | null
  mimeType?: string | null
  provider?: string
  source?: string
  uploadedAt: string
  lastModified: string
  status: "Private" | "Shared"
  owner: string
  bucket: string
  storagePath: string
  shareLink?: string
  activities: FileActivity[]
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

const TYPE_META: Record<
  FileItem["type"],
  { icon: typeof Video01Icon; iconColor: string; gradientFrom: string; gradientTo: string }
> = {
  Video:    { icon: Video01Icon,         iconColor: "text-blue-500",   gradientFrom: "from-blue-500/15",   gradientTo: "to-blue-600/5"   },
  Image:    { icon: Image01Icon,         iconColor: "text-violet-500", gradientFrom: "from-violet-500/15", gradientTo: "to-violet-600/5" },
  Document: { icon: LegalDocument01Icon, iconColor: "text-amber-500",  gradientFrom: "from-amber-500/15",  gradientTo: "to-amber-600/5"  },
  Archive:  { icon: ZipIcon,            iconColor: "text-slate-500",  gradientFrom: "from-slate-500/15",  gradientTo: "to-slate-600/5"  },
}

const QUICK_ACTIONS = [
  { label: "Preview",  icon: EyeIcon,         color: "text-foreground"         },
  { label: "Download", icon: Download01Icon,   color: "text-foreground"         },
  { label: "Share",    icon: Share01Icon,      color: "text-foreground"         },
  { label: "Rename",   icon: PencilEdit01Icon, color: "text-foreground"         },
  { label: "Delete",   icon: Delete01Icon,     color: "text-destructive"        },
] as const

const DETAIL_ROWS = (file: FileItem) => [
  { label: "Type",      value: file.type,         icon: Folder01Icon      },
  { label: "Size",      value: file.size,          icon: Folder01Icon      },
  { label: "Location",  value: file.folder,        icon: FolderOpenIcon    },
  { label: "Uploaded",  value: file.uploadedAt,    icon: Calendar01Icon    },
  { label: "Modified",  value: file.lastModified,  icon: Clock01Icon       },
  { label: "Owner",     value: file.owner,         icon: UserCircle02Icon  },
  { label: "Provider",  value: file.provider || file.source || "—", icon: CloudServerIcon },
  { label: "Bucket",    value: file.bucket,        icon: Folder01Icon      },
  { label: "Path",      value: file.storagePath,   icon: Folder01Icon      },
]

// ─── Panel Content ─────────────────────────────────────────────────────────────

function PanelContent({
  file,
  onClose,
  onPreview,
  onDownload,
  onShare,
  onRename,
  onDelete,
}: {
  file: FileItem
  onClose: () => void
  onPreview?: (file: FileItem) => void
  onDownload?: (file: FileItem) => void
  onShare?: (file: FileItem) => void
  onRename?: (file: FileItem) => void
  onDelete?: (file: FileItem) => void
}) {
  const meta = TYPE_META[file.type]

  const handleAction = (label: string) => {
    switch (label) {
      case "Preview":
        if (onPreview) { onPreview(file) } else { toast.info("Preview not available") }
        break
      case "Download":
        if (onDownload) { onDownload(file) } else { toast.info("Action coming soon") }
        break
      case "Share":
        if (onShare) { onShare(file) } else { toast.info("Action coming soon") }
        break
      case "Rename":
        if (onRename) { onRename(file) } else { toast.info("Action coming soon") }
        break
      case "Delete":
        if (onDelete) { onDelete(file) } else { toast.info("Action coming soon") }
        break
    }
  }

  const handleCopyLink = () => {
    if (!file.shareLink) {
      toast.error("No share link available")
      return
    }
    navigator.clipboard.writeText(file.shareLink)
      .then(() => toast.success("Link copied"))
      .catch(() => toast.error("Failed to copy"))
  }

  return (
    <div className="flex h-full flex-col">
      {/* Sticky header */}
      <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-background px-4 py-3">
        <span className="text-sm font-medium">File Details</span>
        <Button size="icon-sm" variant="ghost" onClick={onClose}>
          <HugeiconsIcon icon={Cancel01Icon} className="size-3.5" strokeWidth={2} />
        </Button>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 space-y-4 overflow-y-auto p-4">

        {/* ── Preview ── */}
        <div className="overflow-hidden rounded-xl border">
          <div
            className={cn(
              "flex h-36 items-center justify-center bg-gradient-to-br",
              meta.gradientFrom,
              meta.gradientTo,
            )}
          >
            <HugeiconsIcon
              icon={meta.icon}
              className={cn("size-14 opacity-80", meta.iconColor)}
              strokeWidth={1.2}
            />
          </div>
          <div className="border-t bg-card px-4 py-3">
            <p className="truncate text-sm font-medium">{file.name}</p>
            <div className="mt-1.5 flex items-center gap-2">
              <Badge variant="secondary" className="text-[11px]">{file.type}</Badge>
              <span className="text-[11px] text-muted-foreground">{file.size}</span>
            </div>
          </div>
        </div>

        {/* ── Quick Actions ── */}
        <div>
          <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            Quick Actions
          </p>
          <div className="grid grid-cols-5 gap-1">
            {QUICK_ACTIONS.map((action) => (
              <button
                key={action.label}
                onClick={() => handleAction(action.label)}
                className="flex flex-col items-center gap-1.5 rounded-lg px-1 py-2.5 transition-colors hover:bg-accent"
              >
                <div className="flex size-8 items-center justify-center rounded-md bg-muted">
                  <HugeiconsIcon
                    icon={action.icon}
                    className={cn("size-3.5", action.color)}
                    strokeWidth={1.5}
                  />
                </div>
                <span className={cn("text-[10px] leading-none", action.color === "text-destructive" ? "text-destructive" : "text-muted-foreground")}>
                  {action.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        <Separator />

        {/* ── File Details ── */}
        <div>
          <p className="mb-3 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            Details
          </p>
          <div className="space-y-2.5">
            {DETAIL_ROWS(file).map((row) => (
              <div key={row.label} className="flex items-start justify-between gap-3">
                <span className="shrink-0 text-[11px] text-muted-foreground">{row.label}</span>
                <span className="max-w-[200px] truncate text-right text-[11px] font-medium" title={row.value}>
                  {row.value}
                </span>
              </div>
            ))}
            {/* Privacy row with badge */}
            <div className="flex items-center justify-between gap-3">
              <span className="text-[11px] text-muted-foreground">Privacy</span>
              <Badge
                variant="secondary"
                className={cn(
                  "text-[11px]",
                  file.status === "Shared"
                    ? "bg-emerald-500/10 text-emerald-600"
                    : "bg-muted text-muted-foreground",
                )}
              >
                {file.status}
              </Badge>
            </div>
          </div>
        </div>

        <Separator />

        {/* ── Sharing ── */}
        <div>
          <p className="mb-3 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            Sharing
          </p>
          {file.status === "Private" ? (
            <div className="rounded-lg border bg-muted/30 px-4 py-3">
              <div className="flex items-center gap-2.5">
                <HugeiconsIcon icon={LockedIcon} className="size-4 text-muted-foreground" strokeWidth={1.5} />
                <div>
                  <p className="text-xs font-medium">This file is private</p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">Only you can access this file.</p>
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="mt-3 w-full gap-1.5"
                onClick={() => {
                  if (onShare) { onShare(file) } else { toast.info("Action coming soon") }
                }}
              >
                <HugeiconsIcon icon={LinkSquare01Icon} className="size-3.5" strokeWidth={1.5} />
                Generate Share Link
              </Button>
            </div>
          ) : (
            <div className="rounded-lg border bg-muted/30 px-4 py-3">
              <div className="flex items-center gap-2.5">
                <HugeiconsIcon icon={Globe02Icon} className="size-4 text-emerald-500" strokeWidth={1.5} />
                <div>
                  <p className="text-xs font-medium">Shared via link</p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">Anyone with the link can view.</p>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <div className="flex-1 truncate rounded-md border bg-background px-2.5 py-1.5">
                  <span className="text-[11px] text-muted-foreground">{file.shareLink}</span>
                </div>
                <Button size="icon-sm" variant="outline" onClick={handleCopyLink}>
                  <HugeiconsIcon icon={Copy01Icon} className="size-3.5" strokeWidth={1.5} />
                </Button>
              </div>
            </div>
          )}
        </div>

        <Separator />

        {/* ── Activity ── */}
        <div className="pb-4">
          <p className="mb-3 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            Activity
          </p>
          <div className="space-y-3">
            {file.activities.map((activity, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className={cn("flex size-6 shrink-0 items-center justify-center rounded-md", activity.iconBg)}>
                  <HugeiconsIcon
                    icon={activity.icon}
                    className={cn("size-3", activity.iconColor)}
                    strokeWidth={1.5}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] leading-snug">{activity.action}</p>
                  <p className="mt-0.5 text-[10px] text-muted-foreground">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}

// ─── Main Component ────────────────────────────────────────────────────────────

interface FileDetailsSidebarProps {
  file: FileItem | null
  isOpen: boolean
  onClose: () => void
  onPreview?: (file: FileItem) => void
  onDownload?: (file: FileItem) => void
  onShare?: (file: FileItem) => void
  onRename?: (file: FileItem) => void
  onDelete?: (file: FileItem) => void
}

export function FileDetailsSidebar({
  file,
  isOpen,
  onClose,
  onPreview,
  onDownload,
  onShare,
  onRename,
  onDelete,
}: FileDetailsSidebarProps) {
  const isMobile = useIsMobile()

  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <SheetContent side="right" className="w-full p-0 sm:w-[420px]" showCloseButton={false}>
          <SheetHeader className="sr-only">
            <SheetTitle>File Details</SheetTitle>
          </SheetHeader>
          {file && (
            <PanelContent
              file={file}
              onClose={onClose}
              onPreview={onPreview}
              onDownload={onDownload}
              onShare={onShare}
              onRename={onRename}
              onDelete={onDelete}
            />
          )}
        </SheetContent>
      </Sheet>
    )
  }

  // Desktop: fixed panel with slide transition
  return (
    <div
      className={cn(
        "fixed bottom-0 right-0 top-14 z-30 flex w-[420px] flex-col",
        "border-l bg-background shadow-xl",
        "rounded-l-2xl overflow-hidden",
        "transition-transform duration-300 ease-in-out",
        isOpen && file ? "translate-x-0" : "translate-x-full",
      )}
    >
      {file && (
        <PanelContent
          file={file}
          onClose={onClose}
          onPreview={onPreview}
          onDownload={onDownload}
          onShare={onShare}
          onRename={onRename}
          onDelete={onDelete}
        />
      )}
    </div>
  )
}
