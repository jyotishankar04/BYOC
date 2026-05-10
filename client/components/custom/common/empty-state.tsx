import { HugeiconsIcon } from "@hugeicons/react"
import { Folder01Icon } from "@hugeicons/core-free-icons"
import { cn } from "@/lib/utils"

type HugeIcon = Parameters<typeof HugeiconsIcon>[0]["icon"]

interface EmptyStateProps {
  icon?: HugeIcon
  title: string
  description?: string
  children?: React.ReactNode
  className?: string
}

export function EmptyState({
  icon = Folder01Icon,
  title,
  description,
  children,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed py-16 text-center",
        className,
      )}
    >
      <div className="flex size-12 items-center justify-center rounded-full bg-muted">
        <HugeiconsIcon
          icon={icon}
          className="size-6 text-muted-foreground"
          strokeWidth={1.5}
        />
      </div>
      <div className="space-y-1">
        <p className="text-sm font-medium">{title}</p>
        {description && (
          <p className="max-w-xs text-xs text-muted-foreground">{description}</p>
        )}
      </div>
      {children && <div className="mt-1">{children}</div>}
    </div>
  )
}
