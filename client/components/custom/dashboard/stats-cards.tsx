import { HugeiconsIcon } from "@hugeicons/react"
import {
  HardDriveIcon,
  Folder01Icon,
  DollarCircleIcon,
  LinkSquare01Icon,
} from "@hugeicons/core-free-icons"
import { Card, CardHeader, CardDescription, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

const STATS = [
  { label: "Total Storage Used", value: "128.4 GB", icon: HardDriveIcon,    color: "text-violet-500", bg: "bg-violet-500/10" },
  { label: "Total Files",        value: "2,430",     icon: Folder01Icon,     color: "text-blue-500",   bg: "bg-blue-500/10"   },
  { label: "Est. Monthly Cost",  value: "$4.82",     icon: DollarCircleIcon, color: "text-amber-500",  bg: "bg-amber-500/10"  },
  { label: "Shared Links",       value: "18",        icon: LinkSquare01Icon, color: "text-emerald-500",bg: "bg-emerald-500/10"},
] as const

export function StatsCards() {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {STATS.map((stat) => (
        <Card key={stat.label}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardDescription className="text-xs">{stat.label}</CardDescription>
              <div className={cn("flex size-7 items-center justify-center rounded-md", stat.bg)}>
                <HugeiconsIcon icon={stat.icon} className={cn("size-3.5", stat.color)} strokeWidth={1.5} />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight">{stat.value}</CardTitle>
          </CardHeader>
        </Card>
      ))}
    </div>
  )
}
