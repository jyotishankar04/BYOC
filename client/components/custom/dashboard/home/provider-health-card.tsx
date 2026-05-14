import { HugeiconsIcon } from "@hugeicons/react"
import { CloudServerIcon } from "@hugeicons/core-free-icons"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { formatDate } from "@/lib/file-utils"

interface ProviderStatus {
  status: string;
  lastChecked: string | null;
}

interface ProviderHealthCardProps {
  provider: ProviderStatus | null;
  providerName?: string;
  providerRegion?: string;
}

export function ProviderHealthCard({ provider, providerName, providerRegion }: ProviderHealthCardProps) {
  if (!provider) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Provider Health</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="py-4 text-center text-xs text-muted-foreground">No provider connected</p>
        </CardContent>
      </Card>
    )
  }

  const isHealthy = provider.status === "Active" || provider.status === "Connected"

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle>Provider Health</CardTitle>
          <Badge
            variant="secondary"
            className={cn(
              isHealthy
                ? "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20"
                : "bg-red-500/10 text-red-600 hover:bg-red-500/20",
            )}
          >
            {isHealthy ? "Healthy" : "Error"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center gap-3">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-amber-500/10">
            <HugeiconsIcon icon={CloudServerIcon} className="size-4 text-amber-600" strokeWidth={1.5} />
          </div>
          <div>
            <p className="text-xs font-medium">{providerName ?? "Provider"}</p>
            {providerRegion && (
              <p className="text-[11px] text-muted-foreground">{providerRegion}</p>
            )}
          </div>
        </div>

        {provider.lastChecked && (
          <p className="mt-2 text-[11px] text-muted-foreground">
            Last checked {formatDate(provider.lastChecked)}
          </p>
        )}

        <Separator className="my-3" />

        <div>
          <p className="mb-2 text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Status</p>
          <Badge variant="outline" className="text-[11px] capitalize">
            {provider.status.toLowerCase()}
          </Badge>
        </div>
      </CardContent>
    </Card>
  )
}


