"use client"

import { useState } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Settings01Icon,
  CheckmarkCircle01Icon,
  PlusSignIcon,
  InformationCircleIcon,
  Cancel01Icon,
  ReloadIcon,
  ArrowRight01Icon,
  Edit01Icon,
  Loading01Icon,
} from "@hugeicons/core-free-icons"
import {
  Card,
  CardContent,
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
  SheetFooter,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import { useWorkspace } from "@/lib/workspace-context"
import {
  canUseProvider,
  planDisplayName,
  useSubscriptionSnapshot,
} from "@/lib/subscription"
import {
  useConnectProvider,
  useUpdateProvider,
  useDisconnectProvider,
  useSyncStatus,
  useTriggerSync,
  type ProviderType,
  type ConnectProviderInput,
} from "@/lib/provider"
import { getProviderDisplay } from "@/lib/provider-pricing"
import api from "@/lib/axios"
import { useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { LockedState } from "@/components/custom/subscription/locked-state"
import { UpgradeTooltip } from "@/components/custom/subscription/upgrade-tooltip"

// ─── Available providers metadata ─────────────────────────────────────────────

interface AvailableProvider {
  id: string
  name: string
  description: string
  providerType: ProviderType
  status: "available" | "coming-soon"
  logoColor: string
  logoBg: string
  initials: string
}

const AVAILABLE_PROVIDERS: AvailableProvider[] = [
  {
    id: "aws-s3", name: "Amazon S3", providerType: "S3",
    description: "Industry-standard object storage with 99.999999999% durability and global availability.",
    status: "available",
    logoColor: "text-amber-600", logoBg: "bg-amber-500/10", initials: "S3",
  },
  {
    id: "r2", name: "Cloudflare R2", providerType: "R2",
    description: "Zero egress-fee object storage compatible with the S3 API — ideal for cost savings.",
    status: "available",
    logoColor: "text-orange-600", logoBg: "bg-orange-500/10", initials: "R2",
  },
]

const COMING_SOON_PROVIDERS: AvailableProvider[] = [
  {
    id: "gcs", name: "Google Cloud Storage", providerType: "Other",
    description: "Unified object storage for developers and enterprises with strong consistency.",
    status: "coming-soon",
    logoColor: "text-blue-600", logoBg: "bg-blue-500/10", initials: "GCS",
  },
  {
    id: "azure-blob", name: "Azure Blob Storage", providerType: "Other",
    description: "Massively scalable object storage from Microsoft Azure for any type of unstructured data.",
    status: "coming-soon",
    logoColor: "text-sky-600", logoBg: "bg-sky-500/10", initials: "AZ",
  },
  {
    id: "backblaze", name: "Backblaze B2", providerType: "Other",
    description: "Low-cost cloud storage, 1/4 the price of AWS S3, fully S3-compatible.",
    status: "coming-soon",
    logoColor: "text-red-600", logoBg: "bg-red-500/10", initials: "B2",
  },
  {
    id: "minio", name: "MinIO", providerType: "MinIO",
    description: "High-performance, self-hosted S3-compatible object storage for private cloud.",
    status: "coming-soon",
    logoColor: "text-red-600", logoBg: "bg-red-500/10", initials: "M",
  },
  {
    id: "do-spaces", name: "DigitalOcean Spaces", providerType: "Other",
    description: "Simple, scalable object storage built for developers with a flat monthly fee.",
    status: "coming-soon",
    logoColor: "text-cyan-600", logoBg: "bg-cyan-500/10", initials: "DO",
  },
  {
    id: "wasabi", name: "Wasabi Hot Storage", providerType: "Other",
    description: "Fast, low-cost, and reliable cloud object storage — no egress or API fees.",
    status: "coming-soon",
    logoColor: "text-emerald-600", logoBg: "bg-emerald-500/10", initials: "WS",
  },
  {
    id: "supabase", name: "Supabase Storage", providerType: "Supabase",
    description: "Built-in S3-compatible storage for Supabase projects with PostgreSQL integration.",
    status: "coming-soon",
    logoColor: "text-emerald-600", logoBg: "bg-emerald-500/10", initials: "SB",
  },
]

const ENDPOINT_REQUIRED: ProviderType[] = ["R2"]
const STATUS_CLASSES: Record<string, string> = {
  Connected: "bg-emerald-500/10 text-emerald-600",
  Error: "bg-red-500/10 text-red-600",
  Checking: "bg-amber-500/10 text-amber-600",
  available: "bg-blue-500/10 text-blue-600",
  "coming-soon": "bg-muted text-muted-foreground",
}

// ─── Connect Sheet ────────────────────────────────────────────────────────────

const FORM_DEFAULTS: ConnectProviderInput = {
  providerType: "S3",
  bucket: "",
  region: "",
  accessKeyId: "",
  secretAccessKey: "",
  endpointUrl: "",
}

function ConnectSheet({
  integration,
  workspaceId,
  open,
  onOpenChange,
  onConnected,
}: {
  integration: AvailableProvider | null
  workspaceId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onConnected: () => void
}) {
  const [form, setForm] = useState<ConnectProviderInput>(FORM_DEFAULTS)
  const connectMut = useConnectProvider(workspaceId)

  if (!integration) return null

  const requiresEndpoint = ENDPOINT_REQUIRED.includes(integration.providerType)

  const handleSubmit = () => {
    connectMut.mutate(
      { ...form, providerType: integration.providerType },
      {
        onSuccess: () => {
          setForm(FORM_DEFAULTS)
          onOpenChange(false)
          onConnected()
        },
      },
    )
  }

  const isValid =
    form.bucket &&
    form.accessKeyId &&
    form.secretAccessKey &&
    (!requiresEndpoint || form.endpointUrl)

  return (
    <Sheet open={open} onOpenChange={(o) => { if (!o) { setForm(FORM_DEFAULTS); onOpenChange(false) } }}>
      <SheetContent className="w-full sm:max-w-md flex flex-col p-0 gap-0">
        <SheetHeader className="shrink-0 px-4 pt-4 pb-0">
          <div className="flex items-center gap-3 pr-6">
            <div className={cn("flex size-10 items-center justify-center rounded-xl text-sm font-bold shrink-0", integration.logoBg, integration.logoColor)}>
              {integration.initials}
            </div>
            <div className="min-w-0">
              <SheetTitle className="text-base">Connect {integration.name}</SheetTitle>
              <SheetDescription className="text-xs mt-0.5">{integration.description}</SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Bucket name</Label>
            <Input
              placeholder="my-bucket-name"
              value={form.bucket}
              onChange={(e) => setForm({ ...form, bucket: e.target.value })}
              className="h-8 text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium">
              Region {!requiresEndpoint && <span className="text-destructive">*</span>}
            </Label>
            <Input
              placeholder="us-east-1"
              value={form.region ?? ""}
              onChange={(e) => setForm({ ...form, region: e.target.value })}
              className="h-8 text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Access Key ID</Label>
            <Input
              placeholder="AKIAIOSFODNN7EXAMPLE"
              value={form.accessKeyId}
              onChange={(e) => setForm({ ...form, accessKeyId: e.target.value })}
              className="h-8 text-sm font-mono"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Secret Access Key</Label>
            <Input
              type="password"
              placeholder="••••••••••••••••••••••"
              value={form.secretAccessKey}
              onChange={(e) => setForm({ ...form, secretAccessKey: e.target.value })}
              className="h-8 text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium">
              Endpoint URL {requiresEndpoint && <span className="text-destructive">*</span>}
            </Label>
            <Input
              placeholder={integration.providerType === "R2" ? "https://<accountid>.r2.cloudflarestorage.com" : "https://s3.amazonaws.com"}
              value={form.endpointUrl ?? ""}
              onChange={(e) => setForm({ ...form, endpointUrl: e.target.value })}
              className="h-8 text-sm"
            />
          </div>

          <div className="rounded-lg border border-blue-500/20 bg-blue-500/5 p-3">
            <div className="flex gap-2">
              <HugeiconsIcon icon={InformationCircleIcon} className="mt-0.5 size-3.5 shrink-0 text-blue-500" strokeWidth={1.5} />
              <p className="text-[11px] text-muted-foreground">
                BringBucket stores only the <span className="font-medium text-foreground">bucket name and region</span>. Your access keys are encrypted at rest and never logged.
                {integration.status !== "coming-soon" && " This will replace any existing provider connection."}
              </p>
            </div>
          </div>
        </div>

        <SheetFooter className="shrink-0 border-t px-4 py-3 flex-row gap-2">
          <Button variant="outline" size="sm" className="flex-1" onClick={() => { setForm(FORM_DEFAULTS); onOpenChange(false) }}>
            Cancel
          </Button>
          <Button
            size="sm"
            className="flex-1"
            disabled={!isValid || connectMut.isPending}
            onClick={handleSubmit}
          >
            {connectMut.isPending ? (
              <HugeiconsIcon icon={Loading01Icon} className="size-3.5 animate-spin" strokeWidth={2} />
            ) : (
              "Connect bucket"
            )}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

// ─── Settings Sheet ───────────────────────────────────────────────────────────

function SettingsSheet({
  open,
  onOpenChange,
  onDisconnected,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onDisconnected: () => void
}) {
  const { currentWorkspace } = useWorkspace()
  const workspaceId = currentWorkspace?.id ?? ""
  const provider = currentWorkspace?.storage
  const qc = useQueryClient()
  const disconnectMut = useDisconnectProvider(workspaceId)
  const triggerSync = useTriggerSync(workspaceId)
  const { data: syncData } = useSyncStatus(workspaceId)
  const [confirmDisconnect, setConfirmDisconnect] = useState(false)
  const [editingCreds, setEditingCreds] = useState(false)
  const [editForm, setEditForm] = useState({ accessKeyId: "", secretAccessKey: "" })
  const updateMut = useUpdateProvider(workspaceId)

  if (!provider) return null

  const display = getProviderDisplay(provider.name)

  const handleHealthCheck = async () => {
    toast.promise(
      api.post(`/api/v1/workspaces/${workspaceId}/provider/health-check`),
      {
        loading: "Checking connection...",
        success: () => {
          qc.invalidateQueries({ queryKey: ["workspaces"] })
          return "Connection healthy"
        },
        error: "Health check failed",
      },
    )
  }

  const handleDisconnect = () => {
    disconnectMut.mutate(undefined, {
      onSuccess: () => {
        setConfirmDisconnect(false)
        onOpenChange(false)
        onDisconnected()
      },
    })
  }

  const handleUpdateCreds = () => {
    updateMut.mutate(
      { accessKeyId: editForm.accessKeyId, secretAccessKey: editForm.secretAccessKey },
      {
        onSuccess: () => {
          setEditingCreds(false)
          setEditForm({ accessKeyId: "", secretAccessKey: "" })
        },
      },
    )
  }

  const isSyncing = syncData?.syncStatus === "pending" || syncData?.syncStatus === "syncing"
  const statusBadge =
    provider.status === "Connected"
      ? "bg-emerald-500/10 text-emerald-600"
      : provider.status === "Error"
        ? "bg-red-500/10 text-red-600"
        : "bg-amber-500/10 text-amber-600"

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md flex flex-col p-0 gap-0">
        <SheetHeader className="shrink-0 px-4 pt-4 pb-0">
          <div className="flex items-center gap-3 pr-6">
            <div className={cn("flex size-10 items-center justify-center rounded-xl text-sm font-bold shrink-0", display.logoBg, display.logoColor)}>
              {display.initials}
            </div>
            <div className="min-w-0">
              <SheetTitle className="text-base">{display.name}</SheetTitle>
              <div className="flex items-center gap-2 mt-0.5">
                <Badge className={cn("text-[10px]", statusBadge)}>
                  <HugeiconsIcon icon={CheckmarkCircle01Icon} className="mr-1 size-2.5" strokeWidth={2} />
                  {provider.status}
                </Badge>
                <span className="text-[11px] text-muted-foreground">{provider.bucket}</span>
              </div>
            </div>
          </div>
        </SheetHeader>

        {confirmDisconnect ? (
          <div className="flex-1 overflow-y-auto px-4 py-4">
            <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-4 text-center">
              <p className="text-sm font-medium text-red-600 dark:text-red-400">Disconnect provider?</p>
              <p className="mt-1 text-xs text-muted-foreground">
                All files will remain in your bucket. You can reconnect later.
              </p>
            </div>
            <div className="flex gap-2 mt-4">
              <Button variant="outline" size="sm" className="flex-1" onClick={() => setConfirmDisconnect(false)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                size="sm"
                className="flex-1"
                onClick={handleDisconnect}
                disabled={disconnectMut.isPending}
              >
                {disconnectMut.isPending ? (
                  <HugeiconsIcon icon={Loading01Icon} className="size-3.5 animate-spin" strokeWidth={2} />
                ) : (
                  "Disconnect"
                )}
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5">
              {/* Connection details */}
              <section>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Connection</p>
                <div className="space-y-2 rounded-lg border p-3 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Bucket</span>
                    <span className="font-mono font-medium">{provider.bucket}</span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Region</span>
                    <span className="font-medium">{provider.region || "—"}</span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Provider</span>
                    <span>{display.shortName}</span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Last checked</span>
                    <span className={cn(provider.status === "Connected" ? "text-emerald-600" : provider.status === "Error" ? "text-red-600" : "")}>
                      {provider.lastChecked}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Sync status</span>
                    <span className={cn(isSyncing ? "text-amber-600" : "text-emerald-600")}>
                      {syncData?.syncStatus ?? "idle"}
                    </span>
                  </div>
                </div>
              </section>

              {/* Credentials */}
              <section>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Credentials</p>
                {editingCreds ? (
                  <div className="space-y-2 rounded-lg border p-3">
                    <div className="space-y-1.5">
                      <Label className="text-[11px] font-medium">Access Key ID</Label>
                      <Input
                        value={editForm.accessKeyId}
                        onChange={(e) => setEditForm({ ...editForm, accessKeyId: e.target.value })}
                        className="h-7 text-xs font-mono"
                        placeholder="New access key"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[11px] font-medium">Secret Access Key</Label>
                      <Input
                        type="password"
                        value={editForm.secretAccessKey}
                        onChange={(e) => setEditForm({ ...editForm, secretAccessKey: e.target.value })}
                        className="h-7 text-xs"
                        placeholder="New secret key"
                      />
                    </div>
                    <div className="flex gap-2 pt-1">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 h-7 text-xs"
                        onClick={() => { setEditingCreds(false); setEditForm({ accessKeyId: "", secretAccessKey: "" }) }}
                      >
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        className="flex-1 h-7 text-xs"
                        disabled={!editForm.accessKeyId || !editForm.secretAccessKey || updateMut.isPending}
                        onClick={handleUpdateCreds}
                      >
                        {updateMut.isPending ? "Saving..." : "Save"}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start gap-2 text-xs"
                    onClick={() => setEditingCreds(true)}
                  >
                    <HugeiconsIcon icon={Edit01Icon} className="size-3.5" strokeWidth={1.5} />
                    Update credentials
                  </Button>
                )}
              </section>

              {/* Permissions */}
              <section>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Required Permissions</p>
                <div className="flex flex-wrap gap-1.5">
                  {["s3:GetObject", "s3:PutObject", "s3:DeleteObject", "s3:ListBucket"].map((p) => (
                    <Badge key={p} variant="outline" className="text-[10px] font-mono">{p}</Badge>
                  ))}
                </div>
              </section>
            </div>

            <SheetFooter className="shrink-0 border-t px-4 py-3">
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start gap-2 text-xs"
                onClick={handleHealthCheck}
              >
                <HugeiconsIcon icon={ReloadIcon} className="size-3.5" strokeWidth={1.5} />
                Re-check connection
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start gap-2 text-xs"
                onClick={() => triggerSync.mutate()}
                disabled={isSyncing}
              >
                <HugeiconsIcon icon={ReloadIcon} className={cn("size-3.5", isSyncing && "animate-spin")} strokeWidth={1.5} />
                {isSyncing ? "Syncing..." : "Sync bucket"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start gap-2 text-xs text-destructive hover:text-destructive"
                onClick={() => setConfirmDisconnect(true)}
              >
                <HugeiconsIcon icon={Cancel01Icon} className="size-3.5" strokeWidth={1.5} />
                Disconnect storage
              </Button>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}

// ─── Integration Card ─────────────────────────────────────────────────────────

function IntegrationCard({
  integration,
  onConnect,
  lockedMessage,
}: {
  integration: AvailableProvider
  onConnect: (i: AvailableProvider) => void
  lockedMessage?: string
}) {
  const isComingSoon = integration.status === "coming-soon"
  const isLocked = Boolean(lockedMessage)

  return (
    <Card className={cn("transition-colors", (isComingSoon || isLocked) && "opacity-60")}>
      <CardContent className="p-5">
        <div className="flex items-start gap-3">
          <div className={cn("flex size-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold", integration.logoBg, integration.logoColor)}>
            {integration.initials}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <CardTitle className="text-sm font-semibold">{integration.name}</CardTitle>
              <Badge className={cn("shrink-0 text-[10px]", STATUS_CLASSES[integration.status])}>
                {isComingSoon ? "Coming Soon" : "Available"}
              </Badge>
            </div>
            <CardDescription className="mt-1 text-[11px] leading-relaxed">{integration.description}</CardDescription>
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          {isComingSoon ? (
            <Button size="sm" variant="outline" className="h-7 text-xs" disabled>
              Coming soon
            </Button>
          ) : (
            <UpgradeTooltip disabled={isLocked} message={lockedMessage ?? "Upgrade your plan to unlock this provider"}>
              <Button
                size="sm"
                className="h-7 gap-1.5 text-xs"
                disabled={isLocked}
                onClick={() => onConnect(integration)}
              >
                <HugeiconsIcon icon={PlusSignIcon} className="size-3" strokeWidth={2} />
                {isLocked ? "Upgrade to connect" : "Connect"}
              </Button>
            </UpgradeTooltip>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// ─── Connected Provider Card ─────────────────────────────────────────────────

function ConnectedProviderCard({ onSettings }: { onSettings: () => void }) {
  const { currentWorkspace } = useWorkspace()
  const provider = currentWorkspace?.storage

  if (!provider) return null

  const display = getProviderDisplay(provider.name)

  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start gap-3">
          <div className={cn("flex size-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold", display.logoBg, display.logoColor)}>
            {display.initials}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <CardTitle className="text-sm font-semibold">{display.name}</CardTitle>
              <Badge className={cn("shrink-0 text-[10px]", STATUS_CLASSES[provider.status] ?? STATUS_CLASSES.Connected)}>
                <HugeiconsIcon icon={CheckmarkCircle01Icon} className="mr-1 size-2.5" strokeWidth={2} />
                {provider.status}
              </Badge>
            </div>
            <CardDescription className="mt-1 text-[11px] leading-relaxed">{display.description}</CardDescription>
            <div className="mt-2 flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <span className="font-mono">{provider.bucket}</span>
              {provider.region && (
                <>
                  <span>·</span>
                  <span>{provider.region}</span>
                </>
              )}
              <span>·</span>
              <span className={cn(provider.status === "Connected" ? "text-emerald-600" : "text-amber-600")}>
                Checked {provider.lastChecked}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <Button size="sm" variant="outline" className="h-7 gap-1.5 text-xs" onClick={onSettings}>
            <HugeiconsIcon icon={Settings01Icon} className="size-3" strokeWidth={1.5} />
            Configure
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function IntegrationsPage() {
  const { currentWorkspace } = useWorkspace()
  const { subscription, workspacePlan, loading } = useSubscriptionSnapshot()
  const workspaceId = currentWorkspace?.id ?? ""
  const provider = currentWorkspace?.storage
  const [connectTarget, setConnectTarget] = useState<AvailableProvider | null>(null)
  const [showSettings, setShowSettings] = useState(false)

  // Filter out already-connected provider type from available list
  const available = AVAILABLE_PROVIDERS.filter(
    (p) => p.providerType !== provider?.name,
  )
  const comingSoon = COMING_SOON_PROVIDERS
  const lockedAvailableCount = available.filter(
    (providerOption) => !canUseProvider(subscription, providerOption.providerType),
  ).length

  const handleConnected = () => {
    setConnectTarget(null)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Integrations</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Connect your cloud storage providers. BringBucket works with any S3-compatible bucket.
        </p>
      </div>

      {/* Info banner */}
      <div className="flex items-start gap-3 rounded-lg border border-blue-500/20 bg-blue-500/5 p-4">
        <HugeiconsIcon icon={InformationCircleIcon} className="mt-0.5 size-4 shrink-0 text-blue-500" strokeWidth={1.5} />
        <div>
          <p className="text-xs font-medium text-blue-700 dark:text-blue-400">Bring Your Own Cloud</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            BringBucket connects to your existing cloud storage bucket. You control your data — we only
            read and write files on your behalf. Storage costs are billed directly by your provider.
          </p>
          {lockedAvailableCount > 0 && !loading ? (
            <p className="mt-2 text-xs text-blue-700/80 dark:text-blue-300/80">
              Current workspace plan: <span className="font-medium">{planDisplayName(workspacePlan)}</span>. Some provider options unlock on higher plans.
            </p>
          ) : null}
        </div>
        <Button variant="ghost" size="sm" className="ml-auto shrink-0 h-7 gap-1 text-xs text-blue-600" onClick={() => window.open("https://docs.bringbucket.dev/providers", "_blank")}>
          Docs <HugeiconsIcon icon={ArrowRight01Icon} className="size-3" strokeWidth={2} />
        </Button>
      </div>

      {/* Connected — real data from workspace */}
      {provider && (
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold">Connected</h2>
            <Badge variant="secondary" className="text-[10px]">1</Badge>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <ConnectedProviderCard onSettings={() => setShowSettings(true)} />
          </div>
        </section>
      )}

      {/* Available */}
      {available.length > 0 && (
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
                lockedMessage={
                  canUseProvider(subscription, i.providerType)
                    ? undefined
                    : `Upgrade to Pro to connect ${i.name}. Your ${planDisplayName(workspacePlan)} workspace currently supports ${subscription?.limits.allowedProviders.join(", ") ?? "fewer providers"}.`
                }
              />
            ))}
          </div>
        </section>
      )}

      {!provider && lockedAvailableCount === available.length && !loading ? (
        <LockedState
          title="Additional provider integrations are locked"
          description={`Your ${planDisplayName(workspacePlan)} workspace can connect ${available.length === 0 ? "only its current providers" : "only the providers included in your plan"}. Upgrade to unlock more storage targets and advanced integration workflows.`}
        />
      ) : null}

      {/* Coming Soon */}
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
            />
          ))}
        </div>
      </section>

      {/* Sheets */}
      <ConnectSheet
        integration={connectTarget}
        workspaceId={workspaceId}
        open={connectTarget !== null}
        onOpenChange={(open) => { if (!open) setConnectTarget(null) }}
        onConnected={handleConnected}
      />
      <SettingsSheet
        open={showSettings}
        onOpenChange={setShowSettings}
        onDisconnected={() => setShowSettings(false)}
      />
    </div>
  )
}
