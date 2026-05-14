"use client"

import { useMemo, useState } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  HardDriveIcon,
  Download01Icon,
  CloudUploadIcon,
  FileCodeIcon,
  InformationCircleIcon,
  CloudServerIcon,
} from "@hugeicons/core-free-icons"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { formatFileSize } from "@/lib/file-utils"
import { useWorkspace } from "@/lib/workspace-context"
import { useDashboard } from "@/lib/analytics"
import {
  PROVIDER_PRICING,
  guessProviderId,
  computeCosts,
  formatCurrency,
  type ProviderPricing,
} from "@/lib/provider-pricing"

const PROVIDER_OPTIONS = [
  { id: "AWS_S3", label: "AWS S3 Standard" },
  { id: "CLOUDFLARE_R2", label: "Cloudflare R2" },
]

function CostRow({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="flex items-center justify-between py-2">
      <div>
        <p className="text-sm">{label}</p>
        {sub && <p className="text-[11px] text-muted-foreground">{sub}</p>}
      </div>
      <p className="text-sm font-medium tabular-nums">{value}</p>
    </div>
  )
}

export default function UsagePricingPage() {
  const { currentWorkspace } = useWorkspace()
  const workspaceId = currentWorkspace?.id
  const provider = currentWorkspace?.storage
  const { data: dashboard } = useDashboard(workspaceId)

  const detectedId = provider ? guessProviderId(provider.name) : "AWS_S3"
  const [selectedProvider, setSelectedProvider] = useState(detectedId)
  const pricing: ProviderPricing = PROVIDER_PRICING[selectedProvider] ?? PROVIDER_PRICING.AWS_S3

  const defaultStorageGb = useMemo(() => {
    if (!dashboard?.totalSize) return 0
    return Math.round((dashboard.totalSize / (1024 * 1024 * 1024)) * 10) / 10
  }, [dashboard?.totalSize])

  const [storageGb, setStorageGb] = useState(defaultStorageGb)
  const [transferGb, setTransferGb] = useState(Math.max(Math.round(defaultStorageGb * 0.15 * 10) / 10, 1))
  const [putRequests, setPutRequests] = useState(1000)
  const [getRequests, setGetRequests] = useState(10000)

  const costs = useMemo(
    () => computeCosts(storageGb, transferGb, putRequests, getRequests, pricing),
    [storageGb, transferGb, putRequests, getRequests, pricing],
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Usage &amp; Pricing</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Estimate your monthly cloud storage costs based on actual usage and provider pricing.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        {/* Left — Inputs */}
        <div className="space-y-6 lg:col-span-3">
          {/* Provider selection */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-sm font-semibold">Provider</CardTitle>
              <CardDescription className="text-xs">Select or confirm your storage provider</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex flex-wrap gap-2">
                {PROVIDER_OPTIONS.map((opt) => (
                  <Button
                    key={opt.id}
                    size="sm"
                    variant={selectedProvider === opt.id ? "default" : "outline"}
                    className="h-8 text-xs"
                    onClick={() => setSelectedProvider(opt.id)}
                  >
                    {opt.label}
                  </Button>
                ))}
              </div>
              {provider && (
                <div className="mt-3 flex items-center gap-2.5 rounded-lg border bg-muted/30 px-3 py-2">
                  <HugeiconsIcon icon={CloudServerIcon} className="size-3.5 text-muted-foreground" strokeWidth={1.5} />
                  <p className="text-xs text-muted-foreground">
                    Detected: <span className="font-medium text-foreground">{provider.name}</span>
                    {" · "}{provider.bucket}
                    {provider.region && <> · {provider.region}</>}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Usage inputs */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-sm font-semibold">Monthly Usage Estimates</CardTitle>
              <CardDescription className="text-xs">
                Adjust the sliders to estimate your monthly costs
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-0">
              {/* Storage */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-medium flex items-center gap-1.5">
                    <HugeiconsIcon icon={HardDriveIcon} className="size-3.5 text-violet-500" strokeWidth={1.5} />
                    Storage
                  </Label>
                  <div className="flex items-center gap-1">
                    <Input
                      type="number"
                      value={storageGb}
                      onChange={(e) => setStorageGb(Math.max(0, Number(e.target.value)))}
                      className="h-7 w-20 text-xs text-right tabular-nums"
                    />
                    <span className="text-xs text-muted-foreground">GB</span>
                  </div>
                </div>
                <Slider
                  value={[storageGb]}
                  onValueChange={([v]) => setStorageGb(v ?? 0)}
                  min={0}
                  max={10000}
                  step={1}
                />
                <div className="flex justify-between text-[11px] text-muted-foreground">
                  <span>{defaultStorageGb > 0 ? `${formatFileSize(dashboard?.totalSize ?? 0)} currently` : "0 GB"}</span>
                  <span>{pricing.storageTiers[0]!.pricePerGb.toFixed(3)}/GB-month</span>
                </div>
              </div>

              {/* Data transfer */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-medium flex items-center gap-1.5">
                    <HugeiconsIcon icon={Download01Icon} className="size-3.5 text-amber-500" strokeWidth={1.5} />
                    Data Transfer Out
                  </Label>
                  <div className="flex items-center gap-1">
                    <Input
                      type="number"
                      value={transferGb}
                      onChange={(e) => setTransferGb(Math.max(0, Number(e.target.value)))}
                      className="h-7 w-20 text-xs text-right tabular-nums"
                    />
                    <span className="text-xs text-muted-foreground">GB</span>
                  </div>
                </div>
                <Slider
                  value={[transferGb]}
                  onValueChange={([v]) => setTransferGb(v ?? 0)}
                  min={0}
                  max={5000}
                  step={0.1}
                />
                <div className="flex justify-between text-[11px] text-muted-foreground">
                  <span>Egress from downloads/shares</span>
                  <span>{pricing.dataTransferLabel}</span>
                </div>
              </div>

              {/* PUT requests */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-medium flex items-center gap-1.5">
                    <HugeiconsIcon icon={CloudUploadIcon} className="size-3.5 text-blue-500" strokeWidth={1.5} />
                    PUT / COPY / POST Requests
                  </Label>
                  <div className="flex items-center gap-1">
                    <Input
                      type="number"
                      value={putRequests}
                      onChange={(e) => setPutRequests(Math.max(0, Number(e.target.value)))}
                      className="h-7 w-20 text-xs text-right tabular-nums"
                    />
                    <span className="text-xs text-muted-foreground">/mo</span>
                  </div>
                </div>
                <Slider
                  value={[putRequests]}
                  onValueChange={([v]) => setPutRequests(v ?? 0)}
                  min={0}
                  max={100000}
                  step={100}
                />
                <div className="flex justify-between text-[11px] text-muted-foreground">
                  <span>Uploads, folder operations</span>
                  <span>{pricing.putCostPerThousand.toFixed(4)}/1K requests</span>
                </div>
              </div>

              {/* GET requests */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-medium flex items-center gap-1.5">
                    <HugeiconsIcon icon={FileCodeIcon} className="size-3.5 text-emerald-500" strokeWidth={1.5} />
                    GET / HEAD / SELECT Requests
                  </Label>
                  <div className="flex items-center gap-1">
                    <Input
                      type="number"
                      value={getRequests}
                      onChange={(e) => setGetRequests(Math.max(0, Number(e.target.value)))}
                      className="h-7 w-20 text-xs text-right tabular-nums"
                    />
                    <span className="text-xs text-muted-foreground">/mo</span>
                  </div>
                </div>
                <Slider
                  value={[getRequests]}
                  onValueChange={([v]) => setGetRequests(v ?? 0)}
                  min={0}
                  max={1000000}
                  step={100}
                />
                <div className="flex justify-between text-[11px] text-muted-foreground">
                  <span>Downloads, previews, API calls</span>
                  <span>{pricing.getCostPerThousand.toFixed(4)}/1K requests</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right — Cost breakdown */}
        <div className="space-y-6 lg:col-span-2">
          <Card className="sticky top-6">
            <CardHeader className="pb-4">
              <CardTitle className="text-sm font-semibold">Estimated Monthly Cost</CardTitle>
              <CardDescription className="text-xs">
                Based on {pricing.name} pricing
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              {/* Total */}
              <div className="rounded-lg bg-primary/5 px-4 py-3">
                <p className="text-[11px] text-muted-foreground">Total estimated this month</p>
                <p className="text-2xl font-bold tracking-tight">{formatCurrency(costs.total)}</p>
              </div>

              <Separator className="my-4" />

              {/* Breakdown */}
              <div className="space-y-1 divide-y">
                <CostRow
                  label="Storage"
                  value={formatCurrency(costs.storage.cost)}
                  sub={`${costs.storage.gb.toLocaleString()} GB @ ${costs.storage.pricePerGb}`}
                />
                <CostRow
                  label="Data Transfer"
                  value={formatCurrency(costs.dataTransfer.cost)}
                  sub={`${costs.dataTransfer.gb.toLocaleString()} GB · ${costs.dataTransfer.pricePerGb}`}
                />
                <CostRow
                  label="PUT/COPY/POST"
                  value={formatCurrency(costs.putRequests.cost)}
                  sub={`${costs.putRequests.count.toLocaleString()} requests @ ${costs.putRequests.pricePerThousand}`}
                />
                <CostRow
                  label="GET/HEAD/SELECT"
                  value={formatCurrency(costs.getRequests.cost)}
                  sub={`${costs.getRequests.count.toLocaleString()} requests @ ${costs.getRequests.pricePerThousand}`}
                />
              </div>

              <Separator className="my-4" />

              {/* Pricing summary */}
              <div className="rounded-lg border bg-card px-3 py-2.5">
                <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide mb-1.5">
                  {pricing.name} Pricing
                </p>
                <div className="space-y-1">
                  {pricing.storageTiers.map((tier) => (
                    <p key={tier.label} className="text-[11px] text-muted-foreground">
                      Storage: {tier.label} @ ${tier.pricePerGb.toFixed(3)}/GB
                    </p>
                  ))}
                  <p className="text-[11px] text-muted-foreground">
                    Egress: {pricing.dataTransferLabel}
                  </p>
                </div>
              </div>

              {/* Note */}
              <div className="mt-4 flex items-start gap-2 rounded-lg border border-blue-500/20 bg-blue-500/5 px-3 py-2">
                <HugeiconsIcon icon={InformationCircleIcon} className="mt-0.5 size-3 shrink-0 text-blue-500" strokeWidth={1.5} />
                <p className="text-[11px] text-blue-700 dark:text-blue-400">
                  Estimates only. Actual charges vary based on provider pricing, region, and usage patterns.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
