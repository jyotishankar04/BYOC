"use client"

import { HugeiconsIcon } from "@hugeicons/react"
import {
  Video01Icon,
  LegalDocument01Icon,
  Image01Icon,
  ZipIcon,
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
import { cn } from "@/lib/utils"

const FILES = [
  { name: "project-demo.mp4",  type: "Video",    size: "42 MB",  uploadedAt: "Today",      status: "Private", icon: Video01Icon         },
  { name: "invoice.pdf",       type: "Document", size: "2.1 MB", uploadedAt: "Yesterday",  status: "Shared",  icon: LegalDocument01Icon },
  { name: "profile-image.png", type: "Image",    size: "840 KB", uploadedAt: "2 days ago", status: "Private", icon: Image01Icon         },
  { name: "notes.zip",         type: "Archive",  size: "18 MB",  uploadedAt: "3 days ago", status: "Private", icon: ZipIcon             },
] as const

export function RecentFilesTable() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle>Recent Files</CardTitle>
          <Badge variant="secondary">{FILES.length} files</Badge>
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
              <TableHead>Status</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {FILES.map((file) => (
              <TableRow key={file.name}>
                <TableCell>
                  <div className="flex items-center gap-2.5">
                    <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-muted">
                      <HugeiconsIcon icon={file.icon} className="size-3.5 text-muted-foreground" strokeWidth={1.5} />
                    </div>
                    <span className="max-w-[140px] truncate text-xs font-medium sm:max-w-none">{file.name}</span>
                  </div>
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  <Badge variant="outline" className="text-[11px]">{file.type}</Badge>
                </TableCell>
                <TableCell className="hidden text-xs text-muted-foreground sm:table-cell">{file.size}</TableCell>
                <TableCell className="hidden text-xs text-muted-foreground md:table-cell">{file.uploadedAt}</TableCell>
                <TableCell>
                  <Badge
                    variant="secondary"
                    className={cn(
                      "text-[11px]",
                      file.status === "Shared"
                        ? "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20"
                        : "bg-muted text-muted-foreground",
                    )}
                  >
                    {file.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="icon-sm" variant="ghost">
                        <HugeiconsIcon icon={MoreHorizontalIcon} className="size-3.5" strokeWidth={1.5} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-44">
                      <DropdownMenuItem>
                        <HugeiconsIcon icon={Download01Icon} className="size-3.5" strokeWidth={1.5} />
                        Download
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <HugeiconsIcon icon={Copy01Icon} className="size-3.5" strokeWidth={1.5} />
                        Copy Link
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <HugeiconsIcon icon={PencilEdit01Icon} className="size-3.5" strokeWidth={1.5} />
                        Rename
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem variant="destructive">
                        <HugeiconsIcon icon={Delete01Icon} className="size-3.5" strokeWidth={1.5} />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
