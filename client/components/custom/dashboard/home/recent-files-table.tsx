"use client"

import { HugeiconsIcon } from "@hugeicons/react"
import {
  Video01Icon,
  LegalDocument01Icon,
  Image01Icon,
  ZipIcon,
  AudioBook01Icon,
  File01Icon,
  Download01Icon,
  Copy01Icon,
  PencilEdit01Icon,
  Delete01Icon,
  MoreHorizontalIcon,
} from "@hugeicons/core-free-icons"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { formatFileSize, formatDate } from "@/lib/file-utils"
import { toast } from "sonner"
import type { FileKind } from "@/lib/analytics"

interface RecentFile {
  id: string;
  name: string;
  size: number;
  kind: FileKind;
  mimeType: string | null;
  createdAt: string;
  uploadedBy: { id: string; name: string; image: string | null };
}

interface RecentFilesTableProps {
  files: RecentFile[];
  onDownload?: (file: RecentFile) => void;
  onShare?: (file: RecentFile) => void;
  onRename?: (file: RecentFile) => void;
  onDelete?: (file: RecentFile) => void;
}

const KIND_ICON: Record<FileKind, typeof File01Icon> = {
  video: Video01Icon,
  document: LegalDocument01Icon,
  image: Image01Icon,
  archive: ZipIcon,
  audio: AudioBook01Icon,
  other: File01Icon,
}

const KIND_LABEL: Record<FileKind, string> = {
  video: "Video",
  document: "Document",
  image: "Image",
  archive: "Archive",
  audio: "Audio",
  other: "Other",
}

export function RecentFilesTable({ files, onDownload, onShare, onRename, onDelete }: RecentFilesTableProps) {
  if (files.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle>Recent Files</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="py-6 text-center text-xs text-muted-foreground">No files uploaded yet</p>
        </CardContent>
      </Card>
    )
  }

  const handleCopyLink = async (file: RecentFile) => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/app/files/${file.id}`)
      toast.success("Link copied to clipboard")
    } catch {
      toast.error("Failed to copy link")
    }
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle>Recent Files</CardTitle>
          <Badge variant="secondary">{files.length} files</Badge>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead className="hidden sm:table-cell">Type</TableHead>
              <TableHead className="hidden sm:table-cell">Size</TableHead>
              <TableHead className="hidden md:table-cell">Uploaded</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {files.map((file) => {
              const Icon = KIND_ICON[file.kind] ?? File01Icon
              const hasAnyAction = onDownload || onShare || onRename || onDelete
              return (
                <TableRow key={file.id}>
                  <TableCell>
                    <div className="flex items-center gap-2.5">
                      <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-muted">
                        <HugeiconsIcon icon={Icon} className="size-3.5 text-muted-foreground" strokeWidth={1.5} />
                      </div>
                      <span className="max-w-[140px] truncate text-xs font-medium sm:max-w-none">{file.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <Badge variant="outline" className="text-[11px]">{KIND_LABEL[file.kind]}</Badge>
                  </TableCell>
                  <TableCell className="hidden text-xs text-muted-foreground sm:table-cell">{formatFileSize(file.size)}</TableCell>
                  <TableCell className="hidden text-xs text-muted-foreground md:table-cell">{formatDate(file.createdAt)}</TableCell>
                  <TableCell>
                    {hasAnyAction ? (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="icon-sm" variant="ghost">
                            <HugeiconsIcon icon={MoreHorizontalIcon} className="size-3.5" strokeWidth={1.5} />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-44">
                          {onDownload && (
                            <DropdownMenuItem onClick={() => onDownload(file)}>
                              <HugeiconsIcon icon={Download01Icon} className="size-3.5" strokeWidth={1.5} />
                              Download
                            </DropdownMenuItem>
                          )}
                          {onDownload && (onShare || onRename || onDelete) && <DropdownMenuSeparator />}
                          {onShare && (
                            <DropdownMenuItem onClick={() => onShare(file)}>
                              <HugeiconsIcon icon={Copy01Icon} className="size-3.5" strokeWidth={1.5} />
                              Copy Link
                            </DropdownMenuItem>
                          )}
                          {onShare && (onRename || onDelete) && <DropdownMenuSeparator />}
                          {onRename && (
                            <DropdownMenuItem onClick={() => onRename(file)}>
                              <HugeiconsIcon icon={PencilEdit01Icon} className="size-3.5" strokeWidth={1.5} />
                              Rename
                            </DropdownMenuItem>
                          )}
                          {onRename && onDelete && <DropdownMenuSeparator />}
                          {onDelete && (
                            <DropdownMenuItem variant="destructive" onClick={() => onDelete(file)}>
                              <HugeiconsIcon icon={Delete01Icon} className="size-3.5" strokeWidth={1.5} />
                              Delete
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    ) : null}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
