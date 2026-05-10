import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

const TOTAL_GB = 128.4

const CATEGORIES = [
  { label: "Videos",    used: 61,  color: "bg-blue-500",   progressCls: "[&>[data-slot=progress-indicator]]:bg-blue-500"   },
  { label: "Images",    used: 42,  color: "bg-violet-500", progressCls: "[&>[data-slot=progress-indicator]]:bg-violet-500" },
  { label: "Documents", used: 18,  color: "bg-amber-500",  progressCls: "[&>[data-slot=progress-indicator]]:bg-amber-500"  },
  { label: "Others",    used: 7.4, color: "bg-slate-400",  progressCls: "[&>[data-slot=progress-indicator]]:bg-slate-400"  },
] as const

export function StorageUsageCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Storage Usage</CardTitle>
        <CardDescription>{TOTAL_GB} GB used across all categories</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {CATEGORIES.map((cat) => (
          <div key={cat.label} className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className={cn("size-2 rounded-full", cat.color)} />
                <span>{cat.label}</span>
              </div>
              <span className="text-muted-foreground">{cat.used} GB</span>
            </div>
            <Progress
              value={(cat.used / TOTAL_GB) * 100}
              className={cn("h-1.5", cat.progressCls)}
            />
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
