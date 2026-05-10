import { HugeiconsIcon } from "@hugeicons/react"
import {
  Video01Icon,
  Image01Icon,
  LegalDocument01Icon,
  ZipIcon,
} from "@hugeicons/core-free-icons"
import { cn } from "@/lib/utils"

export type FileType = "Video" | "Image" | "Document" | "Archive"

export interface FileVisual {
  icon: typeof Video01Icon
  iconColor: string
  gradientFrom: string
  gradientTo: string
}

export const FILE_VISUAL: Record<FileType, FileVisual> = {
  Video:    { icon: Video01Icon,         iconColor: "text-blue-500",   gradientFrom: "from-blue-500/15",   gradientTo: "to-blue-600/5"   },
  Image:    { icon: Image01Icon,         iconColor: "text-violet-500", gradientFrom: "from-violet-500/15", gradientTo: "to-violet-600/5" },
  Document: { icon: LegalDocument01Icon, iconColor: "text-amber-500",  gradientFrom: "from-amber-500/15",  gradientTo: "to-amber-600/5"  },
  Archive:  { icon: ZipIcon,            iconColor: "text-slate-500",  gradientFrom: "from-slate-500/15",  gradientTo: "to-slate-600/5"  },
}

export function FileTypeIcon({ type, className }: { type: FileType; className?: string }) {
  const v = FILE_VISUAL[type]
  return (
    <HugeiconsIcon
      icon={v.icon}
      className={cn(v.iconColor, className)}
      strokeWidth={1.5}
    />
  )
}
