"use client"

import { useState, useRef, Fragment, useEffect, useRef as useInputRef } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  CloudUploadIcon,
  Video01Icon,
  Image01Icon,
  LegalDocument01Icon,
  ZipIcon,
  FileUploadIcon,
  PencilEdit01Icon,
  Share01Icon,
  Download01Icon,
  GridViewIcon,
  ListViewIcon,
  Folder01Icon,
  FolderAddIcon,
  FolderOpenIcon,
  Search01Icon,
  Home01Icon,
  Cancel01Icon,
  CheckmarkCircle01Icon,
  Delete01Icon,
  Copy01Icon,
  MoveIcon,
  EyeIcon,
  LinkSquare01Icon,
  MoreVerticalCircle01Icon,
} from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import { ButtonGroup } from "@/components/ui/button-group"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
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
import {
  FileDetailsSidebar,
  type FileItem,
  type FileActivity,
} from "@/components/custom/dashboard/file-details-sidebar"
import { UploadDialog } from "@/components/custom/dashboard/upload-dialog"

// ─── Types ─────────────────────────────────────────────────────────────────────

type FileNode = FileItem & { kind: "file" }

type FolderNode = {
  kind: "folder"
  id: string
  name: string
  modifiedAt: string
  children: ExplorerNode[]
}

type ExplorerNode = FolderNode | FileNode

// ─── Data helpers ──────────────────────────────────────────────────────────────

function mkFile(
  base: Omit<FileItem, "bucket" | "activities"> & {
    activities?: FileActivity[]
    bucket?: string
  },
): FileNode {
  return {
    kind: "file",
    bucket: "byoc-user-storage",
    activities: [
      {
        action: "File uploaded",
        time: `${base.uploadedAt} · 10:00 AM`,
        icon: FileUploadIcon,
        iconColor: "text-blue-500",
        iconBg: "bg-blue-500/10",
      },
    ],
    ...base,
  } as FileNode
}

function mkFolder(
  id: string,
  name: string,
  modifiedAt: string,
  children: ExplorerNode[],
): FolderNode {
  return { kind: "folder", id, name, modifiedAt, children }
}

// ─── Initial tree (stored in a mutable ref so users can add folders at any depth)

const INITIAL_TREE: ExplorerNode[] = [
  mkFolder("f-projects", "Projects", "May 10, 2026", [
    mkFolder("f-videos", "Videos", "May 10, 2026", [
      mkFolder("f-raw", "Raw Footage", "May 8, 2026", [
        mkFile({ id: "raw-1", name: "raw-recording.mp4", type: "Video", extension: "mp4", size: "210 MB", folder: "Projects / Videos / Raw Footage", uploadedAt: "May 8, 2026", lastModified: "May 8, 2026", status: "Private", owner: "John Doe", storagePath: "projects/videos/raw/raw-recording.mp4" }),
      ]),
      mkFile({
        id: "1", name: "project-demo.mp4", type: "Video", extension: "mp4", size: "42 MB",
        folder: "Projects / Videos", uploadedAt: "May 10, 2026", lastModified: "May 10, 2026",
        status: "Private", owner: "John Doe", storagePath: "projects/videos/project-demo.mp4",
        activities: [
          { action: "File uploaded", time: "May 10, 2026 · 10:24 AM", icon: FileUploadIcon, iconColor: "text-blue-500", iconBg: "bg-blue-500/10" },
          { action: "Renamed from demo.mp4", time: "May 10, 2026 · 10:30 AM", icon: PencilEdit01Icon, iconColor: "text-amber-500", iconBg: "bg-amber-500/10" },
        ],
      }),
      mkFile({
        id: "7", name: "intro-clip.mp4", type: "Video", extension: "mp4", size: "61 MB",
        folder: "Projects / Videos", uploadedAt: "Apr 28, 2026", lastModified: "Apr 28, 2026",
        status: "Shared", owner: "John Doe", storagePath: "projects/videos/intro-clip.mp4",
        shareLink: "https://byoc.app/share/intro-def456",
        activities: [
          { action: "File uploaded", time: "Apr 28, 2026 · 1:00 PM", icon: FileUploadIcon, iconColor: "text-blue-500", iconBg: "bg-blue-500/10" },
          { action: "Link shared", time: "Apr 28, 2026 · 1:15 PM", icon: Share01Icon, iconColor: "text-violet-500", iconBg: "bg-violet-500/10" },
        ],
      }),
    ]),
    mkFolder("f-assets", "Assets", "May 8, 2026", [
      mkFile({ id: "3", name: "hero-banner.png", type: "Image", extension: "png", size: "1.1 MB", folder: "Projects / Assets", uploadedAt: "May 8, 2026", lastModified: "May 8, 2026", status: "Private", owner: "John Doe", storagePath: "projects/assets/hero-banner.png" }),
      mkFile({ id: "8", name: "logo-design.png", type: "Image", extension: "png", size: "280 KB", folder: "Projects / Assets", uploadedAt: "Apr 20, 2026", lastModified: "Apr 22, 2026", status: "Private", owner: "John Doe", storagePath: "projects/assets/logo-design.png" }),
    ]),
  ]),
  mkFolder("f-finance", "Finance", "May 9, 2026", [
    mkFile({
      id: "2", name: "invoice-may-2026.pdf", type: "Document", extension: "pdf", size: "2.1 MB",
      folder: "Finance", uploadedAt: "May 9, 2026", lastModified: "May 9, 2026",
      status: "Shared", owner: "John Doe", storagePath: "finance/invoices/invoice-may-2026.pdf",
      shareLink: "https://byoc.app/share/inv-abc123",
      activities: [
        { action: "File uploaded", time: "May 9, 2026 · 3:12 PM", icon: FileUploadIcon, iconColor: "text-blue-500", iconBg: "bg-blue-500/10" },
        { action: "Link shared", time: "May 9, 2026 · 3:40 PM", icon: Share01Icon, iconColor: "text-violet-500", iconBg: "bg-violet-500/10" },
        { action: "Downloaded once", time: "May 10, 2026 · 9:00 AM", icon: Download01Icon, iconColor: "text-emerald-500", iconBg: "bg-emerald-500/10" },
      ],
    }),
  ]),
  mkFolder("f-reports", "Reports", "May 6, 2026", [
    mkFile({
      id: "5", name: "q2-report.docx", type: "Document", extension: "docx", size: "540 KB",
      folder: "Reports", uploadedAt: "May 5, 2026", lastModified: "May 6, 2026",
      status: "Private", owner: "John Doe", storagePath: "reports/2026/q2-report.docx",
      activities: [
        { action: "File uploaded", time: "May 5, 2026 · 2:00 PM", icon: FileUploadIcon, iconColor: "text-blue-500", iconBg: "bg-blue-500/10" },
        { action: "File updated", time: "May 6, 2026 · 10:00 AM", icon: PencilEdit01Icon, iconColor: "text-amber-500", iconBg: "bg-amber-500/10" },
        { action: "Downloaded 3 times", time: "May 6, 2026 · 11:30 AM", icon: Download01Icon, iconColor: "text-emerald-500", iconBg: "bg-emerald-500/10" },
      ],
    }),
  ]),
  mkFolder("f-personal", "Personal", "May 7, 2026", [
    mkFolder("f-photos", "Photos", "May 7, 2026", [
      mkFile({
        id: "4", name: "profile-photo.jpg", type: "Image", extension: "jpg", size: "840 KB",
        folder: "Personal / Photos", uploadedAt: "May 7, 2026", lastModified: "May 8, 2026",
        status: "Shared", owner: "John Doe", storagePath: "personal/photos/profile-photo.jpg",
        shareLink: "https://byoc.app/share/photo-xyz789",
        activities: [
          { action: "File uploaded", time: "May 7, 2026 · 4:30 PM", icon: FileUploadIcon, iconColor: "text-blue-500", iconBg: "bg-blue-500/10" },
          { action: "Link shared", time: "May 8, 2026 · 9:15 AM", icon: Share01Icon, iconColor: "text-violet-500", iconBg: "bg-violet-500/10" },
        ],
      }),
    ]),
    mkFolder("f-study", "Study", "Apr 15, 2026", [
      mkFile({ id: "9", name: "college-notes.zip", type: "Archive", extension: "zip", size: "7.4 MB", folder: "Personal / Study", uploadedAt: "Apr 15, 2026", lastModified: "Apr 15, 2026", status: "Private", owner: "John Doe", storagePath: "personal/study/college-notes.zip" }),
    ]),
  ]),
  mkFile({ id: "6", name: "assets-backup.zip", type: "Archive", extension: "zip", size: "18 MB", folder: "Root", uploadedAt: "May 3, 2026", lastModified: "May 3, 2026", status: "Private", owner: "John Doe", storagePath: "assets-backup.zip" }),
]

// ─── File type visuals ─────────────────────────────────────────────────────────

const TYPE_VISUAL: Record<
  FileItem["type"],
  { icon: typeof Video01Icon; iconColor: string; gradientFrom: string; gradientTo: string }
> = {
  Video:    { icon: Video01Icon,         iconColor: "text-blue-500",   gradientFrom: "from-blue-500/15",   gradientTo: "to-blue-600/5"   },
  Image:    { icon: Image01Icon,         iconColor: "text-violet-500", gradientFrom: "from-violet-500/15", gradientTo: "to-violet-600/5" },
  Document: { icon: LegalDocument01Icon, iconColor: "text-amber-500",  gradientFrom: "from-amber-500/15",  gradientTo: "to-amber-600/5"  },
  Archive:  { icon: ZipIcon,            iconColor: "text-slate-500",  gradientFrom: "from-slate-500/15",  gradientTo: "to-slate-600/5"  },
}

// ─── Breadcrumb ────────────────────────────────────────────────────────────────
//
// Overflow rule:
//   depth 0        → "Files" (page title)
//   depth 1–2      → Files > A  /  Files > A > B   (all shown)
//   depth 3+       → Files > [⋯ dropdown] > penultimate > last
//
// BreadcrumbSeparator is a <li> so it must be a direct child of BreadcrumbList,
// never nested inside BreadcrumbItem (also a <li>). We use Fragment+key to keep
// each (separator, item) pair keyed correctly.

interface BreadcrumbNavProps {
  path: FolderNode[]
  onNavigate: (index: number) => void
}

function BreadcrumbNav({ path, onNavigate }: BreadcrumbNavProps) {
  const overflow = path.length >= 3
  const collapsedItems = overflow ? path.slice(0, path.length - 2) : []
  const visibleTail   = overflow ? path.slice(-2) : path

  return (
    <Breadcrumb>
      <BreadcrumbList className="flex-nowrap overflow-hidden">

        {/* ── Root "Files" ── */}
        <BreadcrumbItem>
          {path.length === 0 ? (
            <BreadcrumbPage className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
              <HugeiconsIcon icon={Home01Icon} className="size-3.5" strokeWidth={1.5} />
              Files
            </BreadcrumbPage>
          ) : (
            <BreadcrumbLink
              onClick={() => onNavigate(-1)}
              className="flex cursor-pointer select-none items-center gap-1.5 text-sm"
            >
              <HugeiconsIcon icon={Home01Icon} className="size-3.5" strokeWidth={1.5} />
              <span className="hidden sm:inline">Files</span>
            </BreadcrumbLink>
          )}
        </BreadcrumbItem>

        {/* ── No overflow: render each path segment with its own separator sibling ── */}
        {!overflow &&
          visibleTail.map((folder, i) => {
            const isLast = i === visibleTail.length - 1
            return (
              <Fragment key={folder.id}>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  {isLast ? (
                    <BreadcrumbPage className="max-w-[200px] truncate text-sm font-semibold">
                      {folder.name}
                    </BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink
                      onClick={() => onNavigate(i)}
                      className="max-w-[140px] cursor-pointer select-none truncate text-sm"
                    >
                      {folder.name}
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
              </Fragment>
            )
          })}

        {/* ── Overflow: separator + ellipsis dropdown + last-two segments ── */}
        {overflow && (
          <>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center rounded px-1 py-0.5 transition-colors hover:bg-accent focus:outline-none">
                    <BreadcrumbEllipsis />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  {collapsedItems.map((folder, i) => (
                    <DropdownMenuItem
                      key={folder.id}
                      onClick={() => onNavigate(i)}
                      className="gap-2"
                    >
                      <HugeiconsIcon icon={Folder01Icon} className="size-3.5 text-amber-500" strokeWidth={1.5} />
                      {folder.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </BreadcrumbItem>

            {visibleTail.map((folder, i) => {
              const pathIndex = path.length - 2 + i
              const isLast = i === visibleTail.length - 1
              return (
                <Fragment key={folder.id}>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    {isLast ? (
                      <BreadcrumbPage className="max-w-[200px] truncate text-sm font-semibold">
                        {folder.name}
                      </BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink
                        onClick={() => onNavigate(pathIndex)}
                        className="max-w-[140px] cursor-pointer select-none truncate text-sm"
                      >
                        {folder.name}
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                </Fragment>
              )
            })}
          </>
        )}

      </BreadcrumbList>
    </Breadcrumb>
  )
}

// ─── Shared menu helpers ───────────────────────────────────────────────────────

function FolderMenuItems({
  as: As,
  Sep,
  onOpen,
}: {
  as: typeof ContextMenuItem | typeof DropdownMenuItem
  Sep: typeof ContextMenuSeparator | typeof DropdownMenuSeparator
  onOpen: () => void
}) {
  return (
    <>
      <As onClick={onOpen} className="gap-2">
        <HugeiconsIcon icon={FolderOpenIcon} className="size-3.5" strokeWidth={1.5} />
        Open
      </As>
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

function FileMenuItems({
  as: As,
  Sep,
  file,
  onPreview,
}: {
  as: typeof ContextMenuItem | typeof DropdownMenuItem
  Sep: typeof ContextMenuSeparator | typeof DropdownMenuSeparator
  file: FileNode
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
        {file.status === "Shared" ? "Manage Link" : "Share"}
      </As>
      {file.status === "Shared" && (
        <As className="gap-2">
          <HugeiconsIcon icon={Copy01Icon} className="size-3.5" strokeWidth={1.5} />
          Copy Link
        </As>
      )}
      {file.status === "Private" && (
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

// ─── 3-dot trigger button ──────────────────────────────────────────────────────

function KebabTrigger({ className }: { className?: string }) {
  return (
    <DropdownMenuTrigger asChild>
      <button
        onClick={(e) => e.stopPropagation()}
        className={cn(
          "flex size-6 items-center justify-center rounded-md text-muted-foreground",
          "transition-all hover:bg-accent hover:text-foreground focus:outline-none",
          className,
        )}
      >
        <HugeiconsIcon icon={MoreVerticalCircle01Icon} className="size-4" strokeWidth={1.5} />
      </button>
    </DropdownMenuTrigger>
  )
}

// ─── Folder card (grid) ────────────────────────────────────────────────────────

function countItems(folder: FolderNode) {
  let folders = 0
  let files = 0
  for (const item of folder.children) {
    item.kind === "folder" ? folders++ : files++
  }
  return { folders, files }
}

function itemCountLabel(folder: FolderNode) {
  const { folders, files } = countItems(folder)
  const parts = [
    folders > 0 ? `${folders} folder${folders > 1 ? "s" : ""}` : null,
    files > 0   ? `${files} file${files > 1 ? "s" : ""}` : null,
  ].filter(Boolean)
  return parts.length ? parts.join(", ") : "Empty"
}

function FolderCard({ folder, onClick }: { folder: FolderNode; onClick: () => void }) {
  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div
          onClick={onClick}
          className="group relative w-full cursor-pointer overflow-hidden rounded-xl border bg-card text-left transition-all duration-150 hover:border-border/80 hover:shadow-md"
        >
          <div className="flex h-24 items-center justify-center bg-gradient-to-br from-amber-500/10 to-amber-600/5">
            <HugeiconsIcon
              icon={Folder01Icon}
              className="size-10 text-amber-500 opacity-80 transition-transform duration-200 group-hover:scale-110"
              strokeWidth={1.2}
            />
          </div>
          <div className="border-t px-3 py-2.5">
            <p className="truncate text-xs font-medium">{folder.name}</p>
            <div className="mt-0.5 flex items-center justify-between gap-1">
              <span className="truncate text-[11px] text-muted-foreground">{itemCountLabel(folder)}</span>
              <DropdownMenu>
                <KebabTrigger className="opacity-0 group-hover:opacity-100" />
                <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                  <FolderMenuItems as={DropdownMenuItem} Sep={DropdownMenuSeparator} onOpen={onClick} />
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <FolderMenuItems as={ContextMenuItem} Sep={ContextMenuSeparator} onOpen={onClick} />
      </ContextMenuContent>
    </ContextMenu>
  )
}

// ─── New-folder card (inline creation) ────────────────────────────────────────

function NewFolderCard({
  onConfirm,
  onCancel,
}: {
  onConfirm: (name: string) => void
  onCancel: () => void
}) {
  const [name, setName] = useState("")
  const inputRef = useInputRef<HTMLInputElement>(null)

  // Auto-focus when the card mounts
  useEffect(() => { inputRef.current?.focus() }, [])

  const confirm = () => {
    const trimmed = name.trim()
    if (trimmed) onConfirm(trimmed)
    else onCancel()
  }

  return (
    <div className="overflow-hidden rounded-xl border-2 border-dashed border-primary/40 bg-primary/5">
      <div className="flex h-24 items-center justify-center bg-gradient-to-br from-amber-500/5 to-amber-600/3">
        <HugeiconsIcon icon={Folder01Icon} className="size-10 text-amber-400/50" strokeWidth={1.2} />
      </div>
      <div className="border-t px-2.5 py-2">
        <Input
          ref={inputRef}
          placeholder="Folder name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") confirm()
            if (e.key === "Escape") onCancel()
          }}
          className="h-6 text-xs"
        />
        <div className="mt-1.5 flex items-center justify-end gap-1">
          <button
            onClick={onCancel}
            className="rounded p-0.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <HugeiconsIcon icon={Cancel01Icon} className="size-3.5" strokeWidth={2} />
          </button>
          <button
            onClick={confirm}
            className="rounded p-0.5 text-primary transition-colors hover:bg-primary/10"
          >
            <HugeiconsIcon icon={CheckmarkCircle01Icon} className="size-3.5" strokeWidth={2} />
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── File card ─────────────────────────────────────────────────────────────────

function FileCard({
  file,
  isSelected,
  onClick,
}: {
  file: FileNode
  isSelected: boolean
  onClick: () => void
}) {
  const visual = TYPE_VISUAL[file.type]
  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div
          onClick={onClick}
          className={cn(
            "group relative w-full cursor-pointer overflow-hidden rounded-xl border bg-card text-left",
            "transition-all duration-150 hover:border-border/80 hover:shadow-md",
            isSelected && "border-primary/30 ring-2 ring-primary",
          )}
        >
          <div className={cn("flex h-24 items-center justify-center bg-gradient-to-br", visual.gradientFrom, visual.gradientTo)}>
            <HugeiconsIcon
              icon={visual.icon}
              className={cn("size-10 opacity-70 transition-transform duration-200 group-hover:scale-110", visual.iconColor)}
              strokeWidth={1.2}
            />
          </div>
          {/* 3-dot — top-right corner, appears on hover */}
          <div className="absolute right-1.5 top-1.5 opacity-0 transition-opacity group-hover:opacity-100">
            <DropdownMenu>
              <KebabTrigger className="bg-background/80 backdrop-blur-sm" />
              <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                <FileMenuItems as={DropdownMenuItem} Sep={DropdownMenuSeparator} file={file} onPreview={onClick} />
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="border-t px-3 py-2.5">
            <p className="truncate text-xs font-medium">{file.name}</p>
            <div className="mt-1 flex items-center justify-between gap-1">
              <span className="text-[11px] text-muted-foreground">{file.size}</span>
              <Badge
                variant="secondary"
                className={cn(
                  "px-1.5 py-0 text-[10px]",
                  file.status === "Shared" ? "bg-emerald-500/10 text-emerald-600" : "bg-muted text-muted-foreground",
                )}
              >
                {file.status}
              </Badge>
            </div>
          </div>
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <FileMenuItems as={ContextMenuItem} Sep={ContextMenuSeparator} file={file} onPreview={onClick} />
      </ContextMenuContent>
    </ContextMenu>
  )
}

// ─── List-view rows ────────────────────────────────────────────────────────────

function FolderListRow({ folder, onClick }: { folder: FolderNode; onClick: () => void }) {
  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div
          onClick={onClick}
          className="group flex w-full cursor-pointer items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-accent/50"
        >
          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-amber-500/10">
            <HugeiconsIcon icon={Folder01Icon} className="size-4 text-amber-500" strokeWidth={1.5} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-medium">{folder.name}</p>
            <p className="text-[11px] text-muted-foreground">{itemCountLabel(folder)}</p>
          </div>
          <div className="hidden items-center gap-4 sm:flex">
            <span className="text-[11px] text-muted-foreground">{folder.modifiedAt}</span>
            <Badge variant="outline" className="text-[10px]">Folder</Badge>
          </div>
          <DropdownMenu>
            <KebabTrigger />
            <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
              <FolderMenuItems as={DropdownMenuItem} Sep={DropdownMenuSeparator} onOpen={onClick} />
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <FolderMenuItems as={ContextMenuItem} Sep={ContextMenuSeparator} onOpen={onClick} />
      </ContextMenuContent>
    </ContextMenu>
  )
}

function FileListRow({
  file, isSelected, onClick, showBorder,
}: {
  file: FileNode; isSelected: boolean; onClick: () => void; showBorder: boolean
}) {
  const visual = TYPE_VISUAL[file.type]
  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div
          onClick={onClick}
          className={cn(
            "group flex w-full cursor-pointer items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-accent/50",
            showBorder && "border-t",
            isSelected && "bg-primary/5 ring-inset ring-1 ring-primary/20",
          )}
        >
          <div className={cn("flex size-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br", visual.gradientFrom, visual.gradientTo)}>
            <HugeiconsIcon icon={visual.icon} className={cn("size-4", visual.iconColor)} strokeWidth={1.5} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-medium">{file.name}</p>
            <p className="text-[11px] text-muted-foreground">{file.folder}</p>
          </div>
          <div className="hidden items-center gap-3 sm:flex">
            <span className="text-[11px] text-muted-foreground">{file.size}</span>
            <span className="text-[11px] text-muted-foreground">{file.uploadedAt}</span>
            <Badge
              variant="secondary"
              className={cn("text-[10px]", file.status === "Shared" ? "bg-emerald-500/10 text-emerald-600" : "bg-muted text-muted-foreground")}
            >
              {file.status}
            </Badge>
          </div>
          <DropdownMenu>
            <KebabTrigger />
            <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
              <FileMenuItems as={DropdownMenuItem} Sep={DropdownMenuSeparator} file={file} onPreview={onClick} />
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <FileMenuItems as={ContextMenuItem} Sep={ContextMenuSeparator} file={file} onPreview={onClick} />
      </ContextMenuContent>
    </ContextMenu>
  )
}

// ─── Filter tabs ───────────────────────────────────────────────────────────────

const FILE_FILTERS = ["All", "Videos", "Images", "Documents", "Archives"] as const
type FileFilter = (typeof FILE_FILTERS)[number]

function matchesFilter(file: FileNode, f: FileFilter) {
  if (f === "All")       return true
  if (f === "Videos")    return file.type === "Video"
  if (f === "Images")    return file.type === "Image"
  if (f === "Documents") return file.type === "Document"
  if (f === "Archives")  return file.type === "Archive"
  return true
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function FilesPage() {
  // Mutable tree: path holds references into treeRef.current so direct mutation
  // is safe — rerender() refreshes the UI after each change.
  const treeRef                      = useRef<ExplorerNode[]>(INITIAL_TREE)
  const [version, setVersion]        = useState(0)
  const rerender                     = () => setVersion((v) => v + 1)

  const [path, setPath]              = useState<FolderNode[]>([])
  const [selectedFile, setSelectedFile] = useState<FileNode | null>(null)
  const [activeFilter, setActiveFilter] = useState<FileFilter>("All")
  const [viewMode, setViewMode]      = useState<"grid" | "list">("grid")
  const [searchQuery, setSearchQuery] = useState("")
  const [isCreatingFolder, setIsCreatingFolder] = useState(false)
  const [uploadOpen, setUploadOpen] = useState(false)

  // ── Derived: items visible in the current directory ────────────────────────
  const currentItems: ExplorerNode[] =
    path.length === 0 ? treeRef.current : path[path.length - 1].children

  const allFolders = currentItems.filter((i): i is FolderNode => i.kind === "folder")
  const allFiles   = currentItems.filter((i): i is FileNode   => i.kind === "file")

  const q = searchQuery.toLowerCase()
  const filteredFolders = allFolders.filter((f) => f.name.toLowerCase().includes(q))
  const filteredFiles   = allFiles.filter(
    (f) => f.name.toLowerCase().includes(q) && matchesFilter(f, activeFilter),
  )

  const isEmpty = filteredFolders.length === 0 && filteredFiles.length === 0 && !isCreatingFolder
  const isDetailOpen = selectedFile !== null

  // ── Navigation ─────────────────────────────────────────────────────────────
  const navigateToFolder = (folder: FolderNode) => {
    setPath((prev) => [...prev, folder])
    setSelectedFile(null)
    setSearchQuery("")
    setIsCreatingFolder(false)
  }

  const navigateToBreadcrumb = (index: number) => {
    setPath((prev) => (index === -1 ? [] : prev.slice(0, index + 1)))
    setSelectedFile(null)
    setIsCreatingFolder(false)
  }

  const handleFileClick = (file: FileNode) =>
    setSelectedFile((prev) => (prev?.id === file.id ? null : file))

  // ── Create folder (mutate tree directly, then rerender) ────────────────────
  const createFolder = (name: string) => {
    const newFolder = mkFolder(
      `folder-${Date.now()}`,
      name,
      "Just now",
      [],
    )
    if (path.length === 0) {
      treeRef.current.unshift(newFolder)        // Add at top of root
    } else {
      path[path.length - 1].children.unshift(newFolder) // Add at top of current folder
    }
    setIsCreatingFolder(false)
    rerender()
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <>
      <div
        className={cn(
          "flex flex-col gap-5 transition-all duration-300",
          isDetailOpen && "lg:mr-[420px]",
        )}
      >
        {/* ── Header ── */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <BreadcrumbNav path={path} onNavigate={navigateToBreadcrumb} />
            <p className="mt-1 text-xs text-muted-foreground">
              {[
                allFolders.length > 0 && `${allFolders.length} folder${allFolders.length > 1 ? "s" : ""}`,
                allFiles.length > 0   && `${allFiles.length} file${allFiles.length > 1 ? "s" : ""}`,
              ].filter(Boolean).join(" · ") || "Empty folder"}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => { setIsCreatingFolder(true); setSearchQuery("") }}
            >
              <HugeiconsIcon icon={FolderAddIcon} className="size-3.5" strokeWidth={1.5} />
              New Folder
            </Button>
            <Button size="sm" onClick={() => setUploadOpen(true)}>
              <HugeiconsIcon icon={CloudUploadIcon} className="size-3.5" strokeWidth={1.5} />
              Upload
            </Button>
          </div>
        </div>

        {/* ── Toolbar ── */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative flex-1 max-w-xs">
            <HugeiconsIcon
              icon={Search01Icon}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground"
              strokeWidth={1.5}
            />
            <Input
              placeholder="Search in this folder..."
              className="pl-8 h-7"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {allFiles.length > 0 && (
            <ButtonGroup>
              {FILE_FILTERS.map((f) => (
                <Button
                  key={f}
                  size="sm"
                  variant={activeFilter === f ? "default" : "outline"}
                  onClick={() => setActiveFilter(f)}
                >
                  {f}
                </Button>
              ))}
            </ButtonGroup>
          )}

          <div className="ml-auto flex items-center gap-0.5 rounded-md border p-0.5">
            {(["grid", "list"] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={cn(
                  "rounded p-1 transition-colors",
                  viewMode === mode
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <HugeiconsIcon
                  icon={mode === "grid" ? GridViewIcon : ListViewIcon}
                  className="size-3.5"
                  strokeWidth={1.5}
                />
              </button>
            ))}
          </div>
        </div>

        {/* ── Empty state ── */}
        {isEmpty && (
          <div className="flex h-52 flex-col items-center justify-center gap-2 rounded-xl border border-dashed">
            <HugeiconsIcon icon={Folder01Icon} className="size-9 text-muted-foreground/30" strokeWidth={1} />
            <p className="text-sm font-medium text-muted-foreground">
              {searchQuery ? "No items match your search" : "This folder is empty"}
            </p>
            {!searchQuery && (
              <Button size="sm" variant="outline" onClick={() => setIsCreatingFolder(true)}>
                <HugeiconsIcon icon={FolderAddIcon} className="size-3.5" strokeWidth={1.5} />
                Create a folder
              </Button>
            )}
          </div>
        )}

        {/* ── Grid view ── */}
        {!isEmpty && viewMode === "grid" && (
          <div className="space-y-5">
            {/* Folders section */}
            {(filteredFolders.length > 0 || isCreatingFolder) && (
              <section>
                <p className="mb-2.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  Folders
                </p>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
                  {/* New folder card first */}
                  {isCreatingFolder && (
                    <NewFolderCard
                      onConfirm={createFolder}
                      onCancel={() => setIsCreatingFolder(false)}
                    />
                  )}
                  {filteredFolders.map((folder) => (
                    <FolderCard
                      key={folder.id}
                      folder={folder}
                      onClick={() => navigateToFolder(folder)}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Files section */}
            {filteredFiles.length > 0 && (
              <section>
                <p className="mb-2.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  Files
                </p>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
                  {filteredFiles.map((file) => (
                    <FileCard
                      key={file.id}
                      file={file}
                      isSelected={selectedFile?.id === file.id}
                      onClick={() => handleFileClick(file)}
                    />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}

        {/* ── List view ── */}
        {!isEmpty && viewMode === "list" && (
          <div className="overflow-hidden rounded-xl border">
            {/* Inline creation row in list view */}
            {isCreatingFolder && (
              <div className="flex items-center gap-3 border-b px-4 py-2.5">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-amber-500/10">
                  <HugeiconsIcon icon={Folder01Icon} className="size-4 text-amber-400" strokeWidth={1.5} />
                </div>
                <Input
                  autoFocus
                  placeholder="Folder name"
                  className="h-7 flex-1 text-xs"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") createFolder((e.target as HTMLInputElement).value)
                    if (e.key === "Escape") setIsCreatingFolder(false)
                  }}
                />
                <button onClick={() => setIsCreatingFolder(false)} className="text-muted-foreground hover:text-foreground">
                  <HugeiconsIcon icon={Cancel01Icon} className="size-3.5" strokeWidth={2} />
                </button>
              </div>
            )}
            {filteredFolders.map((folder, i) => (
              <div key={folder.id} className={cn((!isCreatingFolder || i > 0) && i !== 0 && "border-t")}>
                <FolderListRow folder={folder} onClick={() => navigateToFolder(folder)} />
              </div>
            ))}
            {filteredFiles.map((file, i) => (
              <FileListRow
                key={file.id}
                file={file}
                isSelected={selectedFile?.id === file.id}
                onClick={() => handleFileClick(file)}
                showBorder={i > 0 || filteredFolders.length > 0 || isCreatingFolder}
              />
            ))}
          </div>
        )}
      </div>

      <FileDetailsSidebar
        file={selectedFile}
        isOpen={isDetailOpen}
        onClose={() => setSelectedFile(null)}
      />

      <UploadDialog open={uploadOpen} onOpenChange={setUploadOpen} />
    </>
  )
}
