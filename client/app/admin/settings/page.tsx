"use client";

import { useState } from "react";
import {
  useAdminSettings,
  useUpdateAdminSettings,
  type AppConfig,
  type ProviderKey,
  type ProviderStatus,
} from "@/lib/admin";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Rocket,
  WrenchIcon,
  UserX,
  Upload,
  Database,
  Zap,
  AlertTriangle,
} from "lucide-react";

// ─── Provider metadata ────────────────────────────────────────────────────────

const PROVIDERS: { key: ProviderKey; name: string; desc: string; initials: string; color: string }[] = [
  { key: "S3",       name: "Amazon S3",         desc: "AWS S3-compatible object storage",    initials: "S3",   color: "text-amber-600 bg-amber-500/10" },
  { key: "R2",       name: "Cloudflare R2",     desc: "Zero egress-fee object storage",      initials: "R2",   color: "text-orange-600 bg-orange-500/10" },
  { key: "GCS",      name: "Google Cloud",      desc: "Google Cloud Storage buckets",        initials: "GCS",  color: "text-blue-600 bg-blue-500/10" },
  { key: "Azure",    name: "Azure Blob",        desc: "Microsoft Azure Blob Storage",        initials: "AZ",   color: "text-sky-600 bg-sky-500/10" },
  { key: "MinIO",    name: "MinIO",             desc: "Self-hosted S3-compatible storage",   initials: "MI",   color: "text-red-600 bg-red-500/10" },
  { key: "Supabase", name: "Supabase Storage",  desc: "Supabase file storage bucket",        initials: "SB",   color: "text-emerald-600 bg-emerald-500/10" },
  { key: "Other",    name: "Other (S3-compat)", desc: "Any S3-compatible endpoint",          initials: "S3+",  color: "text-violet-600 bg-violet-500/10" },
];

const STATUS_LABELS: Record<ProviderStatus, string> = {
  enabled: "Enabled",
  coming_soon: "Coming Soon",
  hidden: "Hidden",
};

// ─── File type groups ─────────────────────────────────────────────────────────

const FILE_TYPE_GROUPS = [
  { label: "Images",    pattern: "image/*",       desc: "PNG, JPG, GIF, WebP, SVG…" },
  { label: "Videos",    pattern: "video/*",       desc: "MP4, WebM, MOV…" },
  { label: "Audio",     pattern: "audio/*",       desc: "MP3, WAV, OGG…" },
  { label: "Documents", pattern: "application/pdf", desc: "PDF files" },
  { label: "Archives",  pattern: "application/zip", desc: "ZIP, tar, gz…" },
  { label: "Text",      pattern: "text/*",        desc: "Plain text, CSV, HTML…" },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function AdminSettingsPage() {
  const { data: settings, isLoading } = useAdminSettings();
  const update = useUpdateAdminSettings();

  const [pendingProvider, setPendingProvider] = useState<ProviderKey | null>(null);

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="size-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  const config = settings ?? {
    betaMode: true, maintenanceMode: false, signupsEnabled: true, allowedFileTypes: [],
    providers: { S3: "enabled", R2: "enabled", GCS: "coming_soon", Azure: "coming_soon", MinIO: "enabled", Supabase: "enabled", Other: "enabled" },
    features: { shareLinks: true, analytics: true, passwordProtectedLinks: true },
  } as AppConfig;

  function toggle(field: keyof Pick<AppConfig, "betaMode" | "maintenanceMode" | "signupsEnabled">, val: boolean) {
    update.mutate({ [field]: val });
  }

  function toggleFeature(feature: keyof AppConfig["features"], val: boolean) {
    update.mutate({ features: { ...config.features, [feature]: val } });
  }

  function setProviderStatus(key: ProviderKey, status: ProviderStatus) {
    setPendingProvider(key);
    update.mutate(
      { providers: { ...config.providers, [key]: status } },
      { onSettled: () => setPendingProvider(null) },
    );
  }

  function toggleFileType(pattern: string, checked: boolean) {
    const current = config.allowedFileTypes;
    const next = checked ? [...current, pattern] : current.filter((p) => p !== pattern);
    update.mutate({ allowedFileTypes: next });
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Platform Settings</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">Control platform behaviour — changes apply instantly.</p>
      </div>

      {/* ── Platform ── */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold">
            <Zap className="size-4 text-primary" /> Platform
          </CardTitle>
          <CardDescription className="text-xs">Global toggles that affect all users.</CardDescription>
        </CardHeader>
        <CardContent className="divide-y">
          {/* Beta mode */}
          <div className="flex items-center justify-between py-3">
            <div className="flex items-start gap-3">
              <Rocket className="mt-0.5 size-4 shrink-0 text-amber-500" />
              <div>
                <Label className="text-sm font-medium">Beta Mode</Label>
                <p className="text-xs text-muted-foreground">All users get free Pro access. Pricing cards are hidden.</p>
              </div>
            </div>
            <Switch checked={config.betaMode} disabled={update.isPending} onCheckedChange={(v) => toggle("betaMode", v)} />
          </div>

          {/* Maintenance mode */}
          <div className={`flex items-center justify-between py-3 ${config.maintenanceMode ? "bg-red-500/5 -mx-6 px-6 rounded" : ""}`}>
            <div className="flex items-start gap-3">
              <WrenchIcon className={`mt-0.5 size-4 shrink-0 ${config.maintenanceMode ? "text-red-500" : "text-muted-foreground"}`} />
              <div>
                <Label className="text-sm font-medium flex items-center gap-2">
                  Maintenance Mode
                  {config.maintenanceMode && (
                    <Badge className="bg-red-500/10 text-red-600 text-[10px] gap-1">
                      <AlertTriangle className="size-2.5" /> Active
                    </Badge>
                  )}
                </Label>
                <p className="text-xs text-muted-foreground">Blocks all non-admin API access with a 503 response.</p>
              </div>
            </div>
            <Switch checked={config.maintenanceMode} disabled={update.isPending} onCheckedChange={(v) => toggle("maintenanceMode", v)} />
          </div>

          {/* Sign-ups */}
          <div className="flex items-center justify-between py-3">
            <div className="flex items-start gap-3">
              <UserX className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
              <div>
                <Label className="text-sm font-medium">Sign-ups Enabled</Label>
                <p className="text-xs text-muted-foreground">When off, new Google accounts cannot be created.</p>
              </div>
            </div>
            <Switch checked={config.signupsEnabled} disabled={update.isPending} onCheckedChange={(v) => toggle("signupsEnabled", v)} />
          </div>
        </CardContent>
      </Card>

      {/* ── Storage Providers ── */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold">
            <Database className="size-4 text-primary" /> Storage Providers
          </CardTitle>
          <CardDescription className="text-xs">
            Control which providers appear in onboarding and integrations.
            <span className="ml-1 font-medium">Enabled</span> = selectable,
            <span className="ml-1 font-medium">Coming Soon</span> = visible but disabled,
            <span className="ml-1 font-medium">Hidden</span> = not shown at all.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {PROVIDERS.map(({ key, name, desc, initials, color }) => (
              <div key={key} className="flex items-center gap-3 rounded-lg border p-3">
                <div className={`flex size-9 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${color}`}>
                  {initials}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{name}</p>
                  <p className="text-[11px] text-muted-foreground truncate">{desc}</p>
                </div>
                <Select
                  value={config.providers[key]}
                  onValueChange={(v) => setProviderStatus(key, v as ProviderStatus)}
                  disabled={update.isPending && pendingProvider === key}
                >
                  <SelectTrigger className="h-7 w-32 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="enabled" className="text-xs">Enabled</SelectItem>
                    <SelectItem value="coming_soon" className="text-xs">Coming Soon</SelectItem>
                    <SelectItem value="hidden" className="text-xs">Hidden</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ── Feature Flags ── */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold">
            <Zap className="size-4 text-primary" /> Feature Flags
          </CardTitle>
          <CardDescription className="text-xs">Disable features globally for all users.</CardDescription>
        </CardHeader>
        <CardContent className="divide-y">
          {(
            [
              { key: "shareLinks" as const,            label: "Share Links",               desc: "Allow users to create public share links for files." },
              { key: "analytics" as const,             label: "Analytics",                 desc: "Show the analytics dashboard and usage insights." },
              { key: "passwordProtectedLinks" as const, label: "Password-Protected Links", desc: "Allow users to add passwords to share links." },
            ] as const
          ).map(({ key, label, desc }) => (
            <div key={key} className="flex items-center justify-between py-3">
              <div>
                <Label className="text-sm font-medium">{label}</Label>
                <p className="text-xs text-muted-foreground">{desc}</p>
              </div>
              <Switch
                checked={config.features[key]}
                disabled={update.isPending}
                onCheckedChange={(v) => toggleFeature(key, v)}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* ── File Type Restrictions ── */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold">
            <Upload className="size-4 text-primary" /> File Type Restrictions
          </CardTitle>
          <CardDescription className="text-xs">
            Check the types you want to <span className="font-medium">allow</span>. Leave all unchecked to allow everything.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
            {FILE_TYPE_GROUPS.map(({ label, pattern, desc }) => {
              const checked = config.allowedFileTypes.includes(pattern);
              return (
                <label key={pattern} className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors ${checked ? "border-primary/40 bg-primary/5" : ""}`}>
                  <Checkbox
                    checked={checked}
                    disabled={update.isPending}
                    onCheckedChange={(v) => toggleFileType(pattern, !!v)}
                    className="mt-0.5"
                  />
                  <div>
                    <p className="text-sm font-medium">{label}</p>
                    <p className="text-[11px] text-muted-foreground">{desc}</p>
                  </div>
                </label>
              );
            })}
          </div>
          {config.allowedFileTypes.length === 0 && (
            <p className="mt-3 text-center text-xs text-muted-foreground">All file types are currently allowed.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
