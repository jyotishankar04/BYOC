import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

type Status =
  | "Shared"
  | "Private"
  | "Active"
  | "Expired"
  | "Disabled"
  | "Connected"
  | "Disconnected"
  | "Healthy"
  | "Degraded"
  | "Public"
  | "Password"

const STATUS_STYLES: Record<Status, string> = {
  Shared:       "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  Active:       "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  Connected:    "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  Healthy:      "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  Public:       "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  Password:     "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  Private:      "bg-muted text-muted-foreground",
  Disabled:     "bg-muted text-muted-foreground",
  Disconnected: "bg-muted text-muted-foreground",
  Expired:      "bg-red-500/10 text-red-600 dark:text-red-400",
  Degraded:     "bg-red-500/10 text-red-600 dark:text-red-400",
}

interface StatusBadgeProps {
  status: Status
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <Badge
      variant="secondary"
      className={cn("text-[10px] font-medium", STATUS_STYLES[status] ?? "bg-muted text-muted-foreground", className)}
    >
      {status}
    </Badge>
  )
}
