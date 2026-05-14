import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import { formatFileSize } from "@/lib/file-utils"
import type { FileKind } from "@/lib/analytics"

interface StorageByKind {
  kind: FileKind;
  size: number;
  count: number;
}

interface StorageUsageCardProps {
  storageByKind: StorageByKind[];
  totalSize: number;
}

const KIND_CONFIG: Record<FileKind, { label: string; color: string; progressCls: string }> = {
  video: { label: "Videos", color: "bg-blue-500", progressCls: "[&>[data-slot=progress-indicator]]:bg-blue-500" },
  image: { label: "Images", color: "bg-violet-500", progressCls: "[&>[data-slot=progress-indicator]]:bg-violet-500" },
  document: { label: "Documents", color: "bg-amber-500", progressCls: "[&>[data-slot=progress-indicator]]:bg-amber-500" },
  audio: { label: "Audio", color: "bg-rose-500", progressCls: "[&>[data-slot=progress-indicator]]:bg-rose-500" },
  archive: { label: "Archives", color: "bg-cyan-500", progressCls: "[&>[data-slot=progress-indicator]]:bg-cyan-500" },
  other: { label: "Others", color: "bg-slate-400", progressCls: "[&>[data-slot=progress-indicator]]:bg-slate-400" },
};

export function StorageUsageCard({ storageByKind, totalSize }: StorageUsageCardProps) {
  const displayTotal = totalSize > 0 ? formatFileSize(totalSize) : "0 B"

  return (
    <Card>
      <CardHeader>
        <CardTitle>Storage Usage</CardTitle>
        <CardDescription>{displayTotal} used across all categories</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {storageByKind.length === 0 && (
          <p className="text-xs text-muted-foreground">No files uploaded yet</p>
        )}
        {storageByKind.map((cat) => {
          const config = KIND_CONFIG[cat.kind] ?? KIND_CONFIG.other
          return (
            <div key={cat.kind} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className={cn("size-2 rounded-full", config.color)} />
                  <span>{config.label}</span>
                </div>
                <span className="text-muted-foreground">{formatFileSize(cat.size)}</span>
              </div>
              <Progress
                value={totalSize > 0 ? (cat.size / totalSize) * 100 : 0}
                className={cn("h-1.5", config.progressCls)}
              />
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
