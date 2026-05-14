"use client"

import { useState, useEffect, useRef as useInputRef, Fragment, useCallback } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  CloudUploadIcon,
  FileUploadIcon,
  PencilEdit01Icon,
  Share01Icon,
  Download01Icon,
  Folder01Icon,
  FolderAddIcon,
  FolderOpenIcon,
  Home01Icon,
  Cancel01Icon,
  CheckmarkCircle01Icon,
  Delete01Icon,
  MoveIcon,
  EyeIcon,
  LinkSquare01Icon,
  Loading01Icon,
  FolderSyncIcon,
  AlertCircleIcon,
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
import { SearchInput } from "@/components/shared/search-input"
import { ViewToggle } from "@/components/shared/view-toggle"
import { KebabTrigger } from "@/components/shared/kebab-trigger"
import {
  FileDetailsSidebar,
  type FileItem,
} from "@/components/custom/dashboard/common/file-details-sidebar"
import { UploadDialog } from "@/components/custom/dashboard/common/upload-dialog"
import { CreateShareLinkDialog } from "@/components/custom/dashboard/common/create-share-link-dialog"
import { FILE_VISUAL } from "@/components/shared/file-visual"
import type { FileType } from "@/components/shared/file-visual"
import { useWorkspace } from "@/lib/workspace-context"
import { useSyncStatus, useTriggerSync } from "@/lib/provider"
import { Progress } from "@/components/ui/progress"
import {
  useFiles,
  useCreateFolder,
  useDeleteFolder,
  useRenameFolder,
  useDeleteFile,
  useRenameFile,
  useMoveFile,
  useDownloadFile,
  fileKeys,
  type ApiFolder,
  type ApiFile,
} from "@/lib/files"
import { useQueryClient } from "@tanstack/react-query"

// ─── Helpers ───────────────────────────────────────────────────────────────────

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B"
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`
}

function kindToType(kind: ApiFile["kind"]): FileType {
  const map: Record<ApiFile["kind"], FileType> = {
    image:    "Image",
    video:    "Video",
    document: "Document",
    audio:    "Document",
    archive:  "Archive",
    other:    "Document",
  }
  return map[kind]
}

function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric", month: "short", day: "numeric",
  }).format(new Date(dateStr))
}

function apiFileToItem(
  file: ApiFile,
  breadcrumbs: { id: string; name: string }[],
  bucket: string,
): FileItem & { kind: "file" } {
  const folderPath =
    breadcrumbs.length > 0
      ? breadcrumbs.map((b) => b.name).join(" / ")
      : "Root"

  return {
    kind: "file",
    id: file.id,
    name: file.name,
    type: kindToType(file.kind),
    extension: file.extension ?? file.name.split(".").pop() ?? "",
    size: formatFileSize(file.size),
    folder: folderPath,
    uploadedAt: formatDate(file.createdAt),
    lastModified: formatDate(file.updatedAt),
    status: "Private",
    owner: file.uploadedBy?.name ?? "Unknown",
    bucket,
    storagePath: file.storagePath,
    activities: [
      {
        action: "File uploaded",
        time: formatDate(file.createdAt),
        icon: FileUploadIcon,
        iconColor: "text-blue-500",
        iconBg: "bg-blue-500/10",
      },
    ],
  }
}

// ─── Types ─────────────────────────────────────────────────────────────────────

type FileNode = FileItem & { kind: "file" }

type FolderNode = {
  kind: "folder"
  id: string
  name: string
  modifiedAt: string
}

// ─── Sync bar ─────────────────────────────────────────────────────────────────

function SyncBar({ workspaceId }: { workspaceId: string }) {
  const { data } = useSyncStatus(workspaceId)
  const trigger  = useTriggerSync(workspaceId)

  const status    = data?.syncStatus ?? "idle"
  const isActive  = status === "pending" || status === "syncing"
  const total     = data?.syncTotalObjects ?? 0
  const completed = data?.syncCompletedObjects ?? 0
  const pct       = total > 0 ? Math.round((completed / total) * 100) : null

  if (status === "completed" || status === "idle") {
    return (
      <div className="flex items-center justify-between gap-3 rounded-lg border bg-muted/30 px-3 py-2">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <HugeiconsIcon icon={FolderSyncIcon} className="size-3.5 shrink-0" strokeWidth={1.5} />
          {status === "completed" && data?.lastSyncedAt
            ? `Last synced ${data.lastSyncedAt}`
            : "Not synced yet"}
        </div>
        <Button
          size="sm"
          variant="outline"
          className="h-6 text-xs"
          disabled={trigger.isPending}
          onClick={() => trigger.mutate()}
        >
          {trigger.isPending
            ? <HugeiconsIcon icon={Loading01Icon} className="size-3 animate-spin" strokeWidth={1.5} />
            : <HugeiconsIcon icon={FolderSyncIcon} className="size-3" strokeWidth={1.5} />
          }
          Sync Now
        </Button>
      </div>
    )
  }

  if (status === "failed") {
    return (
      <div className="flex items-center justify-between gap-3 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2">
        <div className="flex items-center gap-2 text-xs text-destructive">
          <HugeiconsIcon icon={AlertCircleIcon} className="size-3.5 shrink-0" strokeWidth={1.5} />
          Sync failed — check your storage credentials
        </div>
        <Button
          size="sm"
          variant="outline"
          className="h-6 text-xs border-destructive/30 text-destructive hover:bg-destructive/10"
          disabled={trigger.isPending}
          onClick={() => trigger.mutate()}
        >
          Retry
        </Button>
      </div>
    )
  }

  // pending or syncing
  return (
    <div className="space-y-1.5 rounded-lg border bg-blue-500/5 border-blue-500/20 px-3 py-2">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400">
          <HugeiconsIcon icon={FolderSyncIcon} className="size-3.5 shrink-0 animate-spin" strokeWidth={1.5} />
          {status === "pending" ? "Sync queued…" : "Syncing files from your bucket…"}
        </div>
        {pct !== null && (
          <span className="text-[11px] tabular-nums text-blue-600 dark:text-blue-400">
            {pct}%
          </span>
        )}
      </div>
      <Progress value={pct ?? 0} className="h-1" />
      {total > 0 && (
        <p className="text-[11px] text-muted-foreground">
          {completed.toLocaleString()} / {total.toLocaleString()} objects
        </p>
      )}
    </div>
  )
}

// ─── Breadcrumb nav ────────────────────────────────────────────────────────────

interface BreadcrumbNavProps {
  path: { id: string; name: string }[]
  onNavigate: (index: number) => void
}

function BreadcrumbNav({ path, onNavigate }: BreadcrumbNavProps) {
  const overflow = path.length >= 3
  const collapsedItems = overflow ? path.slice(0, path.length - 2) : []
  const visibleTail   = overflow ? path.slice(-2) : path

  return (
    <Breadcrumb>
      <BreadcrumbList className="flex-nowrap overflow-hidden">
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

        {!overflow && visibleTail.map((folder, i) => {
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

// ─── Context menus ─────────────────────────────────────────────────────────────

function FolderMenuItems({
  as: As,
  Sep,
  onOpen,
  onShare,
  onRename,
  onDelete,
}: {
  as: typeof ContextMenuItem | typeof DropdownMenuItem
  Sep: typeof ContextMenuSeparator | typeof DropdownMenuSeparator
  onOpen: () => void
  onShare: () => void
  onRename: () => void
  onDelete: () => void
}) {
  return (
    <>
      <As onClick={onOpen} className="gap-2">
        <HugeiconsIcon icon={FolderOpenIcon} className="size-3.5" strokeWidth={1.5} />
        Open
      </As>
      <Sep />
      <As onClick={onShare} className="gap-2">
        <HugeiconsIcon icon={Share01Icon} className="size-3.5" strokeWidth={1.5} />
        Share folder
      </As>
      <Sep />
      <As onClick={onRename} className="gap-2">
        <HugeiconsIcon icon={PencilEdit01Icon} className="size-3.5" strokeWidth={1.5} />
        Rename
      </As>
      <Sep />
      <As onClick={onDelete} variant="destructive" className="gap-2">
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
  onShare,
  onDownload,
  onRename,
  onMove,
  onDelete,
}: {
  as: typeof ContextMenuItem | typeof DropdownMenuItem
  Sep: typeof ContextMenuSeparator | typeof DropdownMenuSeparator
  file: FileNode
  onPreview: () => void
  onShare: () => void
  onDownload: () => void
  onRename: () => void
  onMove: () => void
  onDelete: () => void
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
        {file.status === "Shared" ? "Manage Link" : "Share"}
      </As>
      {file.status === "Private" && (
        <As onClick={onShare} className="gap-2">
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

// ─── Folder card (grid) ────────────────────────────────────────────────────────

function FolderCard({
  folder,
  onClick,
  onShare,
  onRename,
  onDelete,
}: {
  folder: FolderNode
  onClick: () => void
  onShare: () => void
  onRename: () => void
  onDelete: () => void
}) {
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
              <span className="truncate text-[11px] text-muted-foreground">{folder.modifiedAt}</span>
              <DropdownMenu>
                <KebabTrigger className="opacity-0 group-hover:opacity-100" />
                <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                  <FolderMenuItems
                    as={DropdownMenuItem}
                    Sep={DropdownMenuSeparator}
                    onOpen={onClick}
                    onShare={onShare}
                    onRename={onRename}
                    onDelete={onDelete}
                  />
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <FolderMenuItems
          as={ContextMenuItem}
          Sep={ContextMenuSeparator}
          onOpen={onClick}
          onShare={onShare}
          onRename={onRename}
          onDelete={onDelete}
        />
      </ContextMenuContent>
    </ContextMenu>
  )
}

// ─── New-folder inline card ────────────────────────────────────────────────────

function NewFolderCard({
  onConfirm,
  onCancel,
  loading,
}: {
  onConfirm: (name: string) => void
  onCancel: () => void
  loading?: boolean
}) {
  const [name, setName] = useState("")
  const inputRef = useInputRef<HTMLInputElement>(null)

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
            disabled={loading}
            className="rounded p-0.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <HugeiconsIcon icon={Cancel01Icon} className="size-3.5" strokeWidth={2} />
          </button>
          <button
            onClick={confirm}
            disabled={loading}
            className="rounded p-0.5 text-primary transition-colors hover:bg-primary/10"
          >
            {loading ? (
              <HugeiconsIcon icon={Loading01Icon} className="size-3.5 animate-spin" strokeWidth={2} />
            ) : (
              <HugeiconsIcon icon={CheckmarkCircle01Icon} className="size-3.5" strokeWidth={2} />
            )}
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
  onShare,
  onDownload,
  onRename,
  onMove,
  onDelete,
}: {
  file: FileNode
  isSelected: boolean
  onClick: () => void
  onShare: () => void
  onDownload: () => void
  onRename: () => void
  onMove: () => void
  onDelete: () => void
}) {
  const visual = FILE_VISUAL[file.type]
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
          <div className="absolute right-1.5 top-1.5 opacity-0 transition-opacity group-hover:opacity-100">
            <DropdownMenu>
              <KebabTrigger className="bg-background/80 backdrop-blur-sm" />
              <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                <FileMenuItems
                  as={DropdownMenuItem}
                  Sep={DropdownMenuSeparator}
                  file={file}
                  onPreview={onClick}
                  onShare={onShare}
                  onDownload={onDownload}
                  onRename={onRename}
                  onMove={onMove}
                  onDelete={onDelete}
                />
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
        <FileMenuItems
          as={ContextMenuItem}
          Sep={ContextMenuSeparator}
          file={file}
          onPreview={onClick}
          onShare={onShare}
          onDownload={onDownload}
          onRename={onRename}
          onMove={onMove}
          onDelete={onDelete}
        />
      </ContextMenuContent>
    </ContextMenu>
  )
}

// ─── List rows ────────────────────────────────────────────────────────────────

function FolderListRow({
  folder,
  onClick,
  onShare,
  onRename,
  onDelete,
}: {
  folder: FolderNode
  onClick: () => void
  onShare: () => void
  onRename: () => void
  onDelete: () => void
}) {
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
            <p className="text-[11px] text-muted-foreground">Folder</p>
          </div>
          <div className="hidden items-center gap-4 sm:flex">
            <span className="text-[11px] text-muted-foreground">{folder.modifiedAt}</span>
            <Badge variant="outline" className="text-[10px]">Folder</Badge>
          </div>
          <DropdownMenu>
            <KebabTrigger />
            <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
              <FolderMenuItems
                as={DropdownMenuItem}
                Sep={DropdownMenuSeparator}
                onOpen={onClick}
                onShare={onShare}
                onRename={onRename}
                onDelete={onDelete}
              />
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <FolderMenuItems
          as={ContextMenuItem}
          Sep={ContextMenuSeparator}
          onOpen={onClick}
          onShare={onShare}
          onRename={onRename}
          onDelete={onDelete}
        />
      </ContextMenuContent>
    </ContextMenu>
  )
}

function FileListRow({
  file,
  isSelected,
  onClick,
  showBorder,
  onShare,
  onDownload,
  onRename,
  onMove,
  onDelete,
}: {
  file: FileNode
  isSelected: boolean
  onClick: () => void
  showBorder: boolean
  onShare: () => void
  onDownload: () => void
  onRename: () => void
  onMove: () => void
  onDelete: () => void
}) {
  const visual = FILE_VISUAL[file.type]
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
              <FileMenuItems
                as={DropdownMenuItem}
                Sep={DropdownMenuSeparator}
                file={file}
                onPreview={onClick}
                onShare={onShare}
                onDownload={onDownload}
                onRename={onRename}
                onMove={onMove}
                onDelete={onDelete}
              />
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <FileMenuItems
          as={ContextMenuItem}
          Sep={ContextMenuSeparator}
          file={file}
          onPreview={onClick}
          onShare={onShare}
          onDownload={onDownload}
          onRename={onRename}
          onMove={onMove}
          onDelete={onDelete}
        />
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

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="animate-pulse overflow-hidden rounded-xl border bg-card">
      <div className="h-24 bg-muted/40" />
      <div className="border-t px-3 py-2.5 space-y-2">
        <div className="h-2.5 w-3/4 rounded bg-muted/60" />
        <div className="h-2 w-1/2 rounded bg-muted/40" />
      </div>
    </div>
  )
}

// ─── Inline rename dialog ──────────────────────────────────────────────────────

function RenameModal({
  title,
  defaultName,
  onConfirm,
  onCancel,
  loading,
}: {
  title?: string
  defaultName: string
  onConfirm: (name: string) => void
  onCancel: () => void
  loading?: boolean
}) {
  const [name, setName] = useState(defaultName)
  const inputRef = useInputRef<HTMLInputElement>(null)
  useEffect(() => {
    inputRef.current?.focus()
    inputRef.current?.select()
  }, [])
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-80 rounded-xl border bg-card p-4 shadow-lg space-y-3">
        <p className="text-sm font-semibold">{title ?? "Rename folder"}</p>
        <Input
          ref={inputRef}
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") onConfirm(name.trim())
            if (e.key === "Escape") onCancel()
          }}
          className="text-sm"
        />
        <div className="flex justify-end gap-2">
          <Button size="sm" variant="outline" onClick={onCancel} disabled={loading}>Cancel</Button>
          <Button size="sm" onClick={() => onConfirm(name.trim())} disabled={!name.trim() || loading}>
            {loading && <HugeiconsIcon icon={Loading01Icon} className="size-3.5 animate-spin" strokeWidth={1.5} />}
            Rename
          </Button>
        </div>
      </div>
    </div>
  )
}

// ─── Move file dialog ──────────────────────────────────────────────────────────

function MoveFileDialog({
  folders,
  currentFolderId,
  workspaceId,
  fileId,
  fileName,
  onMove,
  onCancel,
  loading,
}: {
  folders: FolderNode[]
  currentFolderId: string | undefined
  workspaceId: string
  fileId: string
  fileName: string
  onMove: (folderId: string | null) => void
  onCancel: () => void
  loading?: boolean
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-80 rounded-xl border bg-card p-4 shadow-lg space-y-3">
        <p className="text-sm font-semibold">Move file</p>
        <p className="text-xs text-muted-foreground">
          Move <span className="font-medium text-foreground">{fileName}</span> to:
        </p>
        <div className="max-h-60 space-y-1 overflow-y-auto">
          <button
            disabled={loading}
            onClick={() => onMove(null)}
            className={cn(
              "flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-xs transition-colors hover:bg-accent",
              !currentFolderId && "bg-accent",
            )}
          >
            <HugeiconsIcon icon={Home01Icon} className="size-3.5" strokeWidth={1.5} />
            Root
          </button>
          {folders.map((folder) => (
            <button
              key={folder.id}
              disabled={loading}
              onClick={() => onMove(folder.id)}
              className={cn(
                "flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-xs transition-colors hover:bg-accent",
                currentFolderId === folder.id && "bg-accent",
              )}
            >
              <HugeiconsIcon icon={Folder01Icon} className="size-3.5 text-amber-500" strokeWidth={1.5} />
              {folder.name}
            </button>
          ))}
        </div>
        <div className="flex justify-end gap-2">
          <Button size="sm" variant="outline" onClick={onCancel} disabled={loading}>Cancel</Button>
        </div>
      </div>
    </div>
  )
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function FilesPage() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { currentWorkspace } = useWorkspace()
  const workspaceId = currentWorkspace?.id

  const [currentFolderId, setCurrentFolderId] = useState<string | undefined>(undefined)
  const [selectedFile, setSelectedFile]       = useState<FileNode | null>(null)
  const [activeFilter, setActiveFilter]       = useState<FileFilter>("All")
  const [viewMode, setViewMode]               = useState<"grid" | "list">("grid")
  const [searchQuery, setSearchQuery]         = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [isCreatingFolder, setIsCreatingFolder] = useState(false)
  const [uploadOpen, setUploadOpen]           = useState(false)
  const [shareFileName, setShareFileName]     = useState<string | null>(null)
  const [shareFileId, setShareFileId]         = useState<string | null>(null)
  const [shareFolderId, setShareFolderId]     = useState<string | null>(null)
  const [renamingFolder, setRenamingFolder]   = useState<FolderNode | null>(null)
  const [renamingFile, setRenamingFile]       = useState<FileNode | null>(null)
  const [movingFile, setMovingFile]           = useState<FileNode | null>(null)

  // Debounce search so we don't fire on every keystroke
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchQuery), 300)
    return () => clearTimeout(t)
  }, [searchQuery])

  useEffect(() => {
    const folderIdFromUrl = searchParams.get("folderId") ?? undefined
    setCurrentFolderId((prev) =>
      prev === folderIdFromUrl ? prev : folderIdFromUrl,
    )
  }, [searchParams])

  // Build query
  const query = {
    folderId:  currentFolderId,
    search:    debouncedSearch || undefined,
    sortBy:    "createdAt" as const,
    sortDir:   "desc" as const,
  }

  const { data, isLoading, isFetching } = useFiles(workspaceId, query)

  const qc = useQueryClient()
  const createFolderMutation = useCreateFolder(workspaceId)
  const deleteFolderMutation = useDeleteFolder(workspaceId)
  const renameFolderMutation = useRenameFolder(workspaceId)
  const deleteFileMutation   = useDeleteFile(workspaceId)
  const renameFileMutation   = useRenameFile(workspaceId)
  const moveFileMutation     = useMoveFile(workspaceId)
  const downloadFileMutation = useDownloadFile(workspaceId)

  const handleUploadComplete = useCallback(() => {
    qc.invalidateQueries({ queryKey: fileKeys.all(workspaceId ?? "") })
  }, [qc, workspaceId])

  const bucket = currentWorkspace?.storage?.bucket ?? "—"
  const breadcrumbs = data?.breadcrumbs ?? []

  const updateFolderUrl = useCallback(
    (folderId?: string, path?: string) => {
      const params = new URLSearchParams(searchParams.toString())

      if (folderId) {
        params.set("folderId", folderId)
      } else {
        params.delete("folderId")
      }

      if (path) {
        params.set("path", path)
      } else {
        params.delete("path")
      }

      const qs = params.toString()
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
    },
    [pathname, router, searchParams],
  )

  // Transform API data to local node types
  const folders: FolderNode[] = (data?.folders ?? []).map((f: ApiFolder) => ({
    kind: "folder",
    id: f.id,
    name: f.name,
    modifiedAt: formatDate(f.updatedAt),
  }))

  const allFiles: FileNode[] = (data?.files ?? []).map((f: ApiFile) =>
    apiFileToItem(f, breadcrumbs, bucket),
  )

  // Client-side filter by type tab (search already handled server-side)
  const filteredFolders = folders.filter((f) =>
    !searchQuery || f.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )
  const filteredFiles = allFiles.filter((f) => matchesFilter(f, activeFilter))

  const isEmpty = filteredFolders.length === 0 && filteredFiles.length === 0 && !isCreatingFolder && !isLoading

  // ── Navigation ──────────────────────────────────────────────────────────────
  const navigateToFolder = (folder: FolderNode) => {
    setCurrentFolderId(folder.id)
    const nextPath = [...breadcrumbs.map((b) => b.name), folder.name].join("/")
    updateFolderUrl(folder.id, nextPath)
    setSelectedFile(null)
    setSearchQuery("")
    setIsCreatingFolder(false)
  }

  const navigateToBreadcrumb = (index: number) => {
    if (index === -1) {
      setCurrentFolderId(undefined)
      updateFolderUrl(undefined, undefined)
    } else {
      const nextFolderId = breadcrumbs[index]?.id
      const nextPath = breadcrumbs
        .slice(0, index + 1)
        .map((crumb) => crumb.name)
        .join("/")
      setCurrentFolderId(nextFolderId)
      updateFolderUrl(nextFolderId, nextPath)
    }
    setSelectedFile(null)
    setIsCreatingFolder(false)
  }

  // ── Folder actions ──────────────────────────────────────────────────────────
  const handleCreateFolder = (name: string) => {
    createFolderMutation.mutate(
      { name, parentId: currentFolderId ?? null },
      { onSuccess: () => setIsCreatingFolder(false) },
    )
  }

  const handleRenameFolder = (folder: FolderNode) => setRenamingFolder(folder)

  const handleRenameConfirm = (name: string) => {
    if (!renamingFolder) return
    renameFolderMutation.mutate(
      { folderId: renamingFolder.id, name },
      { onSuccess: () => setRenamingFolder(null) },
    )
  }

  const handleDeleteFolder = (folder: FolderNode) => {
    if (!confirm(`Delete folder "${folder.name}" and all its contents?`)) return
    deleteFolderMutation.mutate(folder.id)
  }

  // ── File actions ────────────────────────────────────────────────────────────
  const handleFileClick = (file: FileNode) =>
    setSelectedFile((prev) => (prev?.id === file.id ? null : file))

  const handleDeleteFile = (file: FileNode) => {
    if (!confirm(`Delete "${file.name}"?`)) return
    deleteFileMutation.mutate(file.id, {
      onSuccess: () => {
        if (selectedFile?.id === file.id) setSelectedFile(null)
      },
    })
  }

  const handleRenameFile = (file: FileNode) => setRenamingFile(file)

  const handleRenameFileConfirm = (name: string) => {
    if (!renamingFile) return
    renameFileMutation.mutate(
      { fileId: renamingFile.id, name },
      { onSuccess: () => setRenamingFile(null) },
    )
  }

  const handleMoveFile = (file: FileNode) => setMovingFile(file)

  const handleShareFile = (file: FileNode) => {
    setShareFileName(file.name)
    setShareFileId(file.id)
    setShareFolderId(null)
  }

  const handleShareFolder = (folder: FolderNode) => {
    setShareFileName(folder.name)
    setShareFolderId(folder.id)
    setShareFileId(null)
  }

  const handleDownload = (file: FileNode) => downloadFileMutation.mutate(file.id)

  const isDetailOpen = selectedFile !== null

  return (
    <>
      <div
        className={cn(
          "flex flex-col gap-5 transition-all duration-300",
          isDetailOpen && "lg:mr-[420px]",
        )}
      >
        {/* ── Sync bar — only when a provider is connected ── */}
        {workspaceId && currentWorkspace?.storage && (
          <SyncBar workspaceId={workspaceId} />
        )}

        {/* ── Header ── */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <BreadcrumbNav path={breadcrumbs} onNavigate={navigateToBreadcrumb} />
            <p className="mt-1 text-xs text-muted-foreground">
              {isLoading ? (
                <span className="inline-block h-3 w-24 animate-pulse rounded bg-muted/50" />
              ) : (
                [
                  folders.length > 0 && `${folders.length} folder${folders.length > 1 ? "s" : ""}`,
                  allFiles.length > 0 && `${allFiles.length} file${allFiles.length > 1 ? "s" : ""}`,
                ].filter(Boolean).join(" · ") || "Empty folder"
              )}
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
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search in this folder..."
          />
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
          <ViewToggle viewMode={viewMode} onViewModeChange={setViewMode} />
        </div>

        {/* ── Loading skeletons ── */}
        {isLoading && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
            {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        )}

        {/* ── Empty state ── */}
        {!isLoading && isEmpty && (
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
        {!isLoading && !isEmpty && viewMode === "grid" && (
          <div className={cn("space-y-5", isFetching && "opacity-70 pointer-events-none")}>
            {(filteredFolders.length > 0 || isCreatingFolder) && (
              <section>
                <p className="mb-2.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  Folders
                </p>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
                  {isCreatingFolder && (
                    <NewFolderCard
                      onConfirm={handleCreateFolder}
                      onCancel={() => setIsCreatingFolder(false)}
                      loading={createFolderMutation.isPending}
                    />
                  )}
                  {filteredFolders.map((folder) => (
                    <FolderCard
                      key={folder.id}
                      folder={folder}
                      onClick={() => navigateToFolder(folder)}
                      onShare={() => handleShareFolder(folder)}
                      onRename={() => handleRenameFolder(folder)}
                      onDelete={() => handleDeleteFolder(folder)}
                    />
                  ))}
                </div>
              </section>
            )}

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
                      onShare={() => handleShareFile(file)}
                      onDownload={() => handleDownload(file)}
                      onRename={() => handleRenameFile(file)}
                      onMove={() => handleMoveFile(file)}
                      onDelete={() => handleDeleteFile(file)}
                    />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}

        {/* ── List view ── */}
        {!isLoading && !isEmpty && viewMode === "list" && (
          <div className={cn("overflow-hidden rounded-xl border", isFetching && "opacity-70 pointer-events-none")}>
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
                    const val = (e.target as HTMLInputElement).value.trim()
                    if (e.key === "Enter" && val) handleCreateFolder(val)
                    if (e.key === "Escape") setIsCreatingFolder(false)
                  }}
                />
                <button onClick={() => setIsCreatingFolder(false)} className="text-muted-foreground hover:text-foreground">
                  <HugeiconsIcon icon={Cancel01Icon} className="size-3.5" strokeWidth={2} />
                </button>
              </div>
            )}
            {filteredFolders.map((folder, i) => (
              <div key={folder.id} className={cn(i !== 0 && "border-t")}>
                <FolderListRow
                  folder={folder}
                  onClick={() => navigateToFolder(folder)}
                  onShare={() => handleShareFolder(folder)}
                  onRename={() => handleRenameFolder(folder)}
                  onDelete={() => handleDeleteFolder(folder)}
                />
              </div>
            ))}
            {filteredFiles.map((file, i) => (
              <FileListRow
                key={file.id}
                file={file}
                isSelected={selectedFile?.id === file.id}
                onClick={() => handleFileClick(file)}
                showBorder={i > 0 || filteredFolders.length > 0 || isCreatingFolder}
                onShare={() => handleShareFile(file)}
                onDownload={() => handleDownload(file)}
                onRename={() => handleRenameFile(file)}
                onMove={() => handleMoveFile(file)}
                onDelete={() => handleDeleteFile(file)}
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

      <UploadDialog open={uploadOpen} onOpenChange={setUploadOpen} folderId={currentFolderId} onUploadComplete={handleUploadComplete} />
      <CreateShareLinkDialog
        open={shareFileName !== null}
        onOpenChange={(open) => { if (!open) { setShareFileName(null); setShareFileId(null); setShareFolderId(null) } }}
        defaultName={shareFileName ?? undefined}
        fileId={shareFileId ?? undefined}
        folderId={shareFolderId ?? undefined}
      />

      {renamingFolder && (
        <RenameModal
          defaultName={renamingFolder.name}
          onConfirm={handleRenameConfirm}
          onCancel={() => setRenamingFolder(null)}
          loading={renameFolderMutation.isPending}
        />
      )}

      {renamingFile && (
        <RenameModal
          title="Rename file"
          defaultName={renamingFile.name}
          onConfirm={handleRenameFileConfirm}
          onCancel={() => setRenamingFile(null)}
          loading={renameFileMutation.isPending}
        />
      )}

      {movingFile && (
        <MoveFileDialog
          folders={folders}
          currentFolderId={currentFolderId}
          workspaceId={workspaceId!}
          fileId={movingFile.id}
          fileName={movingFile.name}
          onMove={(folderId) => {
            moveFileMutation.mutate(
              { fileId: movingFile.id, folderId },
              { onSuccess: () => setMovingFile(null) },
            )
          }}
          onCancel={() => setMovingFile(null)}
          loading={moveFileMutation.isPending}
        />
      )}
    </>
  )
}
