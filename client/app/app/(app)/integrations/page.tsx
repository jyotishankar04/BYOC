"use client"

import { useState } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  CloudServerIcon,
  Settings01Icon,
  CheckmarkCircle01Icon,
  PlusSignIcon,
  InformationCircleIcon,
  Cancel01Icon,
  Copy01Icon,
  ReloadIcon,
  ArrowRight01Icon,
  Edit01Icon,
} from "@hugeicons/core-free-icons"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

// ─── Types ─────────────────────────────────────────────────────────────────────

type ProviderStatus = "Connected" | "Available" | "Coming Soon"

interface Integration {
  id: string
  name: string
  description: string
  status: ProviderStatus
  bucket?: string
  region?: string
  accessKeyId?: string
  lastChecked?: string
  logoColor: string
  logoBg: string
  initials: string
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const INTEGRATIONS: Integration[] = [
  {
    id: "aws-s3",
    name: "Amazon S3",
    description: "Industry-standard object storage with 99.999999999% durability and global availability.",
    status: "Connected",
    bucket: "byoc-user-storage",
    region: "ap-south-1",
    accessKeyId: "AKIA••••••••••••XKQP",
    lastChecked: "2 minutes ago",
    logoColor: "text-amber-600",
    logoBg: "bg-amber-500/10",
    initials: "S3",
  },
  {
    id: "gcs",
    name: "Google Cloud Storage",
    description: "Unified object storage for developers and enterprises with strong consistency.",
    status: "Available",
    logoColor: "text-blue-600",
    logoBg: "bg-blue-500/10",
    initials: "GCS",
  },
  {
    id: "azure-blob",
    name: "Azure Blob Storage",
    description: "Massively scalable object storage from Microsoft Azure for any type of unstructured data.",
    status: "Available",
    logoColor: "text-sky-600",
    logoBg: "bg-sky-500/10",
    initials: "AZ",
  },
  {
    id: "r2",
    name: "Cloudflare R2",
    description: "Zero egress-fee object storage compatible with the S3 API — ideal for cost savings.",
    status: "Available",
    logoColor: "text-orange-600",
    logoBg: "bg-orange-500/10",
    initials: "R2",
  },
  {
    id: "backblaze",
    name: "Backblaze B2",
    description: "Low-cost cloud storage, 1/4 the price of AWS S3, fully S3-compatible.",
    status: "Available",
    logoColor: "text-red-600",
    logoBg: "bg-red-500/10",
    initials: "B2",
  },
  {
    id: "do-spaces",
    name: "DigitalOcean Spaces",
    description: "Simple, scalable object storage built for developers with a flat monthly fee.",
    status: "Coming Soon",
    logoColor: "text-cyan-600",
    logoBg: "bg-cyan-500/10",
    initials: "DO",
  },
  {
    id: "wasabi",
    name: "Wasabi Hot Storage",
    description: "Fast, low-cost, and reliable cloud object storage — no egress or API fees.",
    status: "Coming Soon",
    logoColor: "text-emerald-600",
    logoBg: "bg-emerald-500/10",
    initials: "WS",
  },
]

const AWS_REGIONS = [
  "ap-south-1", "us-east-1", "us-west-2",
  "eu-west-1", "eu-central-1", "ap-southeast-1", "ap-northeast-1",
]

const STATUS_CONFIG: Record<ProviderStatus, { label: string; className: string }> = {
  Connected:    { label: "Connected",    className: "bg-emerald-500/10 text-emerald-600" },
  Available:    { label: "Available",    className: "bg-blue-500/10 text-blue-600"       },
  "Coming Soon":{ label: "Coming Soon", className: "bg-muted text-muted-foreground"      },
}

// ─── Connect Dialog ────────────────────────────────────────────────────────────

function ConnectSheet({
  integration,
  open,
  onOpenChange,
}: {
  integration: Integration | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [bucket, setBucket] = useState("")
  const [region, setRegion] = useState("us-east-1")
  const [accessKey, setAccessKey] = useState("")
  const [secretKey, setSecretKey] = useState("")

  if (!integration) return null

  const handleConnect = () => {
    onOpenChange(false)
    setBucket(""); setAccessKey(""); setSecretKey("")
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className={cn("flex size-10 items-center justify-center rounded-xl text-sm font-bold", integration.logoBg, integration.logoColor)}>
              {integration.initials}
            </div>
            <div>
              <SheetTitle className="text-base">Connect {integration.name}</SheetTitle>
              <p className="text-xs text-muted-foreground">{integration.description}</p>
            </div>
          </div>
        </SheetHeader>

        <Separator className="mb-5" />

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Bucket name</Label>
            <Input placeholder="my-bucket-name" value={bucket} onChange={(e) => setBucket(e.target.value)} className="h-8 text-sm" />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Region</Label>
            <Select value={region} onValueChange={setRegion}>
              <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                {AWS_REGIONS.map((r) => (
                  <SelectItem key={r} value={r}>{r}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Access Key ID</Label>
            <Input placeholder="AKIAIOSFODNN7EXAMPLE" value={accessKey} onChange={(e) => setAccessKey(e.target.value)} className="h-8 text-sm font-mono" />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Secret Access Key</Label>
            <Input type="password" placeholder="••••••••••••••••••••••" value={secretKey} onChange={(e) => setSecretKey(e.target.value)} className="h-8 text-sm" />
          </div>

          <div className="rounded-lg border border-blue-500/20 bg-blue-500/5 p-3">
            <div className="flex gap-2">
              <HugeiconsIcon icon={InformationCircleIcon} className="mt-0.5 size-3.5 shrink-0 text-blue-500" strokeWidth={1.5} />
              <p className="text-[11px] text-muted-foreground">
                BYOC stores only the <span className="font-medium text-foreground">bucket name and region</span>. Your access keys are encrypted at rest and never logged.
              </p>
            </div>
          </div>

          <div className="flex gap-2 pt-1">
            <Button variant="outline" size="sm" className="flex-1" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button size="sm" className="flex-1" disabled={!bucket || !accessKey || !secretKey} onClick={handleConnect}>
              Connect bucket
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}

// ─── Settings Sheet (for connected integrations) ───────────────────────────────

function SettingsSheet({
  integration,
  open,
  onOpenChange,
}: {
  integration: Integration | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [copied, setCopied] = useState(false)

  if (!integration) return null

  const handleCopy = () => {
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className={cn("flex size-10 items-center justify-center rounded-xl text-sm font-bold", integration.logoBg, integration.logoColor)}>
              {integration.initials}
            </div>
            <div>
              <SheetTitle className="text-base">{integration.name}</SheetTitle>
              <Badge className="mt-0.5 text-[10px] bg-emerald-500/10 text-emerald-600">
                <HugeiconsIcon icon={CheckmarkCircle01Icon} className="mr-1 size-2.5" strokeWidth={2} />
                Connected
              </Badge>
            </div>
          </div>
        </SheetHeader>

        <Separator className="mb-5" />

        <div className="space-y-5">
          {/* Connection details */}
          <div className="space-y-3">
            <p className="text-xs font-medium">Connection details</p>
            <div className="space-y-2 rounded-lg border p-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Bucket</span>
                <span className="font-mono font-medium">{integration.bucket}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Region</span>
                <span className="font-medium">{integration.region}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Access Key</span>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono">{integration.accessKeyId}</span>
                  <button onClick={handleCopy} className="text-muted-foreground hover:text-foreground transition-colors">
                    <HugeiconsIcon icon={copied ? CheckmarkCircle01Icon : Copy01Icon} className="size-3" strokeWidth={2} />
                  </button>
                </div>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Last checked</span>
                <span className="text-emerald-600">{integration.lastChecked}</span>
              </div>
            </div>
          </div>

          {/* Permissions */}
          <div className="space-y-2">
            <p className="text-xs font-medium">Bucket permissions</p>
            <div className="flex flex-wrap gap-1.5">
              {["s3:GetObject", "s3:PutObject", "s3:DeleteObject", "s3:ListBucket"].map((p) => (
                <Badge key={p} variant="outline" className="text-[10px] font-mono">{p}</Badge>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-2">
            <Button variant="outline" size="sm" className="w-full justify-start gap-2 text-xs">
              <HugeiconsIcon icon={ReloadIcon} className="size-3.5" strokeWidth={1.5} />
              Re-check connection
            </Button>
            <Button variant="outline" size="sm" className="w-full justify-start gap-2 text-xs">
              <HugeiconsIcon icon={Edit01Icon} className="size-3.5" strokeWidth={1.5} />
              Update credentials
            </Button>
            <Button variant="outline" size="sm" className="w-full justify-start gap-2 text-xs text-destructive hover:text-destructive">
              <HugeiconsIcon icon={Cancel01Icon} className="size-3.5" strokeWidth={1.5} />
              Disconnect storage
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}

// ─── Integration Card ──────────────────────────────────────────────────────────

function IntegrationCard({
  integration,
  onConnect,
  onSettings,
}: {
  integration: Integration
  onConnect: (i: Integration) => void
  onSettings: (i: Integration) => void
}) {
  const { label, className } = STATUS_CONFIG[integration.status]
  const isConnected   = integration.status === "Connected"
  const isComingSoon  = integration.status === "Coming Soon"

  return (
    <Card className={cn("transition-colors", isComingSoon && "opacity-60")}>
      <CardContent className="p-5">
        <div className="flex items-start gap-3">
          <div className={cn("flex size-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold", integration.logoBg, integration.logoColor)}>
            {integration.initials}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <CardTitle className="text-sm font-semibold">{integration.name}</CardTitle>
              <Badge className={cn("shrink-0 text-[10px]", className)}>
                {isConnected && <HugeiconsIcon icon={CheckmarkCircle01Icon} className="mr-1 size-2.5" strokeWidth={2} />}
                {label}
              </Badge>
            </div>
            <CardDescription className="mt-1 text-[11px] leading-relaxed">{integration.description}</CardDescription>

            {isConnected && (
              <div className="mt-2 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <span className="font-mono">{integration.bucket}</span>
                <span>·</span>
                <span>{integration.region}</span>
                <span>·</span>
                <span className="text-emerald-600">Checked {integration.lastChecked}</span>
              </div>
            )}
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          {isConnected ? (
            <Button size="sm" variant="outline" className="h-7 gap-1.5 text-xs" onClick={() => onSettings(integration)}>
              <HugeiconsIcon icon={Settings01Icon} className="size-3" strokeWidth={1.5} />
              Configure
            </Button>
          ) : isComingSoon ? (
            <Button size="sm" variant="outline" className="h-7 text-xs" disabled>
              Coming soon
            </Button>
          ) : (
            <Button size="sm" className="h-7 gap-1.5 text-xs" onClick={() => onConnect(integration)}>
              <HugeiconsIcon icon={PlusSignIcon} className="size-3" strokeWidth={2} />
              Connect
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function IntegrationsPage() {
  const [connectTarget, setConnectTarget]   = useState<Integration | null>(null)
  const [settingsTarget, setSettingsTarget] = useState<Integration | null>(null)

  const connected   = INTEGRATIONS.filter((i) => i.status === "Connected")
  const available   = INTEGRATIONS.filter((i) => i.status === "Available")
  const comingSoon  = INTEGRATIONS.filter((i) => i.status === "Coming Soon")

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Integrations</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Connect your cloud storage providers. BYOC works with any S3-compatible bucket.
        </p>
      </div>

      {/* Info banner */}
      <div className="flex items-start gap-3 rounded-lg border border-blue-500/20 bg-blue-500/5 p-4">
        <HugeiconsIcon icon={InformationCircleIcon} className="mt-0.5 size-4 shrink-0 text-blue-500" strokeWidth={1.5} />
        <div>
          <p className="text-xs font-medium text-blue-700 dark:text-blue-400">Bring Your Own Cloud</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            BYOC connects to your existing cloud storage bucket. You control your data — we only
            read and write files on your behalf. Storage costs are billed directly by your provider.
          </p>
        </div>
        <a href="#" className="ml-auto shrink-0">
          <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs text-blue-600">
            Docs <HugeiconsIcon icon={ArrowRight01Icon} className="size-3" strokeWidth={2} />
          </Button>
        </a>
      </div>

      {/* Connected */}
      {connected.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold">Connected</h2>
            <Badge variant="secondary" className="text-[10px]">{connected.length}</Badge>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {connected.map((i) => (
              <IntegrationCard
                key={i.id}
                integration={i}
                onConnect={setConnectTarget}
                onSettings={setSettingsTarget}
              />
            ))}
          </div>
        </section>
      )}

      {/* Available */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold">Available</h2>
          <Badge variant="secondary" className="text-[10px]">{available.length}</Badge>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {available.map((i) => (
            <IntegrationCard
              key={i.id}
              integration={i}
              onConnect={setConnectTarget}
              onSettings={setSettingsTarget}
            />
          ))}
        </div>
      </section>

      {/* Coming soon */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold">Coming Soon</h2>
          <Badge variant="secondary" className="text-[10px]">{comingSoon.length}</Badge>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {comingSoon.map((i) => (
            <IntegrationCard
              key={i.id}
              integration={i}
              onConnect={setConnectTarget}
              onSettings={setSettingsTarget}
            />
          ))}
        </div>
      </section>

      {/* Sheets */}
      <ConnectSheet
        integration={connectTarget}
        open={connectTarget !== null}
        onOpenChange={(open) => { if (!open) setConnectTarget(null) }}
      />
      <SettingsSheet
        integration={settingsTarget}
        open={settingsTarget !== null}
        onOpenChange={(open) => { if (!open) setSettingsTarget(null) }}
      />
    </div>
  )
}
