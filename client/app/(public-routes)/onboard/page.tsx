"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Check,
  CircleCheck,
  Cloud,
  LoaderCircle,
  Server,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Logo } from "@/components/common/logo";
import { ProviderGuideDialog } from "@/components/custom/provider-guide-dialog";
import { LockedState } from "@/components/custom/subscription/locked-state";
import { UpgradeTooltip } from "@/components/custom/subscription/upgrade-tooltip";
import { AuthGuard } from "@/components/custom/auth-guard";
import { useSession } from "@/lib/auth-client";
import api from "@/lib/axios";
import { useUserProfile } from "@/lib/user-settings";
import { toast } from "sonner";

// ─── Data ──────────────────────────────────────────────────────────────────────

const STEPS = [
  { id: 1, label: "Provider" },
  { id: 2, label: "Details" },
  { id: 3, label: "Verify" },
];

interface Provider {
  id: string;
  apiType: string;
  name: string;
  description: string;
  available: boolean;
  color: string;
  bgColor: string;
}

const PROVIDERS: Provider[] = [
  {
    id: "aws",
    apiType: "S3",
    name: "AWS S3",
    description: "Scalable object storage from Amazon Web Services",
    available: true,
    color: "text-amber-600",
    bgColor: "bg-amber-500/10",
  },
  {
    id: "r2",
    apiType: "R2",
    name: "Cloudflare R2",
    description: "S3-compatible storage with zero egress fees",
    available: true,
    color: "text-orange-600",
    bgColor: "bg-orange-500/10",
  },
  {
    id: "minio",
    apiType: "MinIO",
    name: "MinIO",
    description: "High-performance S3-compatible storage",
    available: true,
    color: "text-red-600",
    bgColor: "bg-red-500/10",
  },
  {
    id: "supabase",
    apiType: "Supabase",
    name: "Supabase Storage",
    description: "S3-compatible storage from Supabase",
    available: true,
    color: "text-emerald-600",
    bgColor: "bg-emerald-500/10",
  },
  {
    id: "do",
    apiType: "Other",
    name: "DigitalOcean Spaces",
    description: "Simple S3-compatible object storage",
    available: false,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
  },
  {
    id: "b2",
    apiType: "Other",
    name: "Backblaze B2",
    description: "Reliable cloud object storage",
    available: false,
    color: "text-red-500",
    bgColor: "bg-red-500/10",
  },
  {
    id: "wasabi",
    apiType: "Other",
    name: "Wasabi",
    description: "Hot cloud object storage",
    available: false,
    color: "text-green-600",
    bgColor: "bg-green-500/10",
  },
];

// ─── Onboard Page ──────────────────────────────────────────────────────────────

export default function OnboardPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const { data: profile, isLoading: subscriptionLoading } = useUserProfile();

  const [step, setStep] = useState(1);
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(
    null,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [guideOpen, setGuideOpen] = useState(false);

  // Form state
  const [bucketName, setBucketName] = useState("");
  const [region, setRegion] = useState("");
  const [accessKey, setAccessKey] = useState("");
  const [secretKey, setSecretKey] = useState("");
  const [endpointUrl, setEndpointUrl] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  // If already onboarded, go straight to app
  useEffect(() => {
    if (!isPending && session?.user?.onboarded) {
      router.replace("/app");
    }
  }, [isPending, session, router]);

  const handleSelectProvider = (p: Provider) => {
    if (!p.available) return;
    if (
      profile?.subscription &&
      !profile.subscription.limits.allowedProviders.includes(p.apiType)
    ) {
      toast.error(`Upgrade to Pro to connect ${p.name}.`);
      return;
    }
    setSelectedProvider(p);
  };

  const validateForm = () => {
    const e: Record<string, string> = {};
    if (!bucketName.trim()) e.bucketName = "Bucket name is required";
    if (!region.trim() && selectedProvider?.id !== "r2")
      e.region = "Region is required";
    if (!accessKey.trim()) e.accessKey = "Access key is required";
    if (!secretKey.trim()) e.secretKey = "Secret key is required";
    if (["r2", "minio", "supabase"].includes(selectedProvider?.id ?? "") && !endpointUrl.trim())
      e.endpointUrl = "Endpoint URL is required for this provider";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleVerify = async () => {
    if (!validateForm() || !selectedProvider) return;
    setIsSubmitting(true);
    setVerifyError(null);

    try {
      await api.post("/api/v1/onboard/provider", {
        providerType: selectedProvider.apiType,
        bucket: bucketName.trim(),
        region: region.trim() || undefined,
        accessKeyId: accessKey.trim(),
        secretAccessKey: secretKey.trim(),
        endpointUrl: endpointUrl.trim() || undefined,
      });
      setIsVerified(true);
      setStep(3);
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "Connection failed. Check your credentials.";
      setVerifyError(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoToDashboard = () => {
    // Full navigation forces session re-read so onboarded=true is picked up
    window.location.replace("/app");
  };

  const progressValue =
    step === 1 ? 15 : step === 2 ? 50 : isVerified ? 100 : 75;

  const isR2 = selectedProvider?.id === "r2";
  const allowedProviders = profile?.subscription?.limits.allowedProviders ?? [];

  if (isPending) {
    return (
      <div className="flex h-screen items-center justify-center">
        <LoaderCircle className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <AuthGuard requireOnboarded={false}>
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <Logo className="mb-6 size-10" />
        <div className="w-full max-w-5xl">
          <div className="w-full rounded-xl border border-border/70 sm:bg-card sm:p-1 sm:shadow-lg/3">
            <div
              className="rounded-lg border border-border/70 bg-muted/60 p-8 sm:shadow-sm/2"
              style={{ minHeight: "480px" }}
            >
              {/* Step indicator */}
              <div className="mt-6">
                <div className="flex items-center justify-between">
                  {STEPS.map((s, i) => (
                    <div key={s.id} className="flex items-center gap-2">
                      <div
                        className={
                          step >= s.id
                            ? "flex size-7 items-center justify-center rounded-full bg-primary text-[11px] font-semibold text-primary-foreground"
                            : "flex size-7 items-center justify-center rounded-full border text-[11px] font-semibold text-muted-foreground"
                        }
                      >
                        {step > s.id ? <Check className="size-3.5" /> : s.id}
                      </div>
                      <span className="hidden text-xs font-medium text-muted-foreground sm:block">
                        {s.label}
                      </span>
                      {i < STEPS.length - 1 && (
                        <div className="hidden h-px w-8 bg-border sm:block" />
                      )}
                    </div>
                  ))}
                </div>
                <Progress value={progressValue} className="mt-3 h-1.5" />
              </div>

              {/* Heading */}
              <div className="mt-8 text-center">
                <h1 className="text-xl font-semibold tracking-tight">
                  Connect your cloud storage
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  Use your own cloud provider to store and manage files
                  securely.
                </p>
              </div>

              {/* Step 1: Provider selection */}
              {step === 1 && (
                <div className="mt-8">
                  <div className="grid grid-cols-2 gap-2.5">
                    {PROVIDERS.map((provider) => {
                      const isSelected = selectedProvider?.id === provider.id;
                      const planLocked =
                        provider.available &&
                        allowedProviders.length > 0 &&
                        !allowedProviders.includes(provider.apiType);
                      const isDisabled = !provider.available || planLocked;
                      return (
                        <UpgradeTooltip
                          key={provider.id}
                          disabled={planLocked}
                          message={`Upgrade to Pro to connect ${provider.name}.`}
                        >
                          <button
                            type="button"
                            disabled={isDisabled}
                            onClick={() => handleSelectProvider(provider)}
                            className={
                              isSelected
                                ? "relative flex flex-col items-start gap-2 rounded-lg border-2 border-primary bg-card p-3.5 text-left transition-all"
                                : isDisabled
                                  ? "relative flex cursor-not-allowed flex-col items-start gap-2 rounded-lg border border-border/50 bg-card/50 p-3.5 text-left opacity-50 transition-all"
                                  : "relative flex flex-col items-start gap-2 rounded-lg border border-border bg-card p-3.5 text-left transition-all hover:border-border/80 hover:bg-accent/50"
                            }
                          >
                            <div className="flex w-full items-center justify-between">
                              <div
                                className={`flex size-8 items-center justify-center rounded-lg ${provider.bgColor}`}
                              >
                                <Cloud className={`size-4 ${provider.color}`} />
                              </div>
                              {isSelected && (
                                <CircleCheck className="size-4 text-primary" />
                              )}
                            </div>
                            <div>
                              <p className="text-sm font-medium">
                                {provider.name}
                              </p>
                              <p className="mt-0.5 text-[11px] text-muted-foreground leading-tight">
                                {provider.description}
                              </p>
                            </div>
                            <Badge
                              variant={provider.available && !planLocked ? "default" : "outline"}
                              className="mt-1"
                            >
                              {!provider.available ? "Coming soon" : planLocked ? "Pro required" : "Available"}
                            </Badge>
                          </button>
                        </UpgradeTooltip>
                      );
                    })}
                  </div>

                  {!subscriptionLoading && profile?.subscription?.plan === "Free" ? (
                    <div className="mt-4">
                      <LockedState
                        title="More provider options unlock on paid plans"
                        description="Free workspaces can connect Amazon S3 and Cloudflare R2 during onboarding. Upgrade to Pro later to use MinIO, Supabase, and additional S3-compatible targets."
                      />
                    </div>
                  ) : null}

                  <div className="mt-6 flex justify-end">
                    <Button
                      size="lg"
                      disabled={!selectedProvider}
                      onClick={() => setStep(2)}
                    >
                      Continue
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 2: Bucket details */}
              {step === 2 && (
                <div className="mt-8 space-y-4">
                  {selectedProvider && (
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-medium text-muted-foreground">
                        Provider:{" "}
                        <span className="text-foreground">
                          {selectedProvider.name}
                        </span>
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-[11px] gap-1"
                        onClick={() => setGuideOpen(true)}
                      >
                        <Shield className="size-3" />
                        Show Guide
                      </Button>
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <Field>
                      <FieldLabel htmlFor="bucketName">Bucket name</FieldLabel>
                      <Input
                        id="bucketName"
                        placeholder="my-storage-bucket"
                        value={bucketName}
                        onChange={(e) => setBucketName(e.target.value)}
                        aria-invalid={!!errors.bucketName}
                      />
                      {errors.bucketName && (
                        <FieldError errors={[{ message: errors.bucketName }]} />
                      )}
                    </Field>
                  </div>

                  <div className="space-y-1.5">
                    <Field>
                      <FieldLabel htmlFor="region">
                        Region{" "}
                        {isR2 && (
                          <span className="font-normal text-muted-foreground">
                            (optional for R2)
                          </span>
                        )}
                      </FieldLabel>
                      <Input
                        id="region"
                        placeholder={isR2 ? "auto (optional)" : "us-east-1"}
                        value={region}
                        onChange={(e) => setRegion(e.target.value)}
                        aria-invalid={!!errors.region}
                      />
                      {errors.region && (
                        <FieldError errors={[{ message: errors.region }]} />
                      )}
                    </Field>
                  </div>

                  <div className="space-y-1.5">
                    <Field>
                      <FieldLabel htmlFor="accessKey">Access key ID</FieldLabel>
                      <Input
                        id="accessKey"
                        placeholder={
                          isR2
                            ? "R2 Access Key ID"
                            : "AKIAIOSFODNN7EXAMPLE"
                        }
                        value={accessKey}
                        onChange={(e) => setAccessKey(e.target.value)}
                        aria-invalid={!!errors.accessKey}
                      />
                      {isR2 && (
                        <p className="text-xs text-muted-foreground">
                          Use the R2 Access Key ID from Cloudflare R2 API
                          Tokens, not a general Cloudflare API token.
                        </p>
                      )}
                      {errors.accessKey && (
                        <FieldError errors={[{ message: errors.accessKey }]} />
                      )}
                    </Field>
                  </div>

                  <div className="space-y-1.5">
                    <Field>
                      <FieldLabel htmlFor="secretKey">
                        Secret access key
                      </FieldLabel>
                      <Input
                        id="secretKey"
                        type="password"
                        placeholder={
                          isR2
                            ? "R2 Secret Access Key"
                            : "••••••••••••••••••••••"
                        }
                        value={secretKey}
                        onChange={(e) => setSecretKey(e.target.value)}
                        aria-invalid={!!errors.secretKey}
                      />
                      {isR2 && (
                        <p className="text-xs text-muted-foreground">
                          Copy the Secret Access Key shown once when the R2
                          token is created.
                        </p>
                      )}
                      {errors.secretKey && (
                        <FieldError errors={[{ message: errors.secretKey }]} />
                      )}
                    </Field>
                  </div>

                  <div className="space-y-1.5">
                    <Field>
                      <FieldLabel htmlFor="endpointUrl">
                        Endpoint URL{" "}
                        {["r2", "minio", "supabase"].includes(selectedProvider?.id ?? "") ? (
                          <span className="text-destructive">*</span>
                        ) : (
                          <span className="font-normal text-muted-foreground">
                            (optional)
                          </span>
                        )}
                      </FieldLabel>
                      <Input
                        id="endpointUrl"
                        placeholder={
                          isR2
                            ? "https://<account_id>.r2.cloudflarestorage.com"
                          : selectedProvider?.id === "minio"
                              ? "http://localhost:9000"
                              : selectedProvider?.id === "supabase"
                                ? "https://<project_ref>.supabase.co/storage/v1/s3"
                                : "https://s3.amazonaws.com"
                        }
                        value={endpointUrl}
                        onChange={(e) => setEndpointUrl(e.target.value)}
                        aria-invalid={!!errors.endpointUrl}
                      />
                      {isR2 && (
                        <p className="text-xs text-muted-foreground">
                          Enter the account-level endpoint only. Do not include
                          the bucket name or an object path.
                        </p>
                      )}
                      {errors.endpointUrl && (
                        <FieldError errors={[{ message: errors.endpointUrl }]} />
                      )}
                    </Field>
                  </div>

                  <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Shield className="size-3.5" />
                    Your credentials are encrypted with AES-256-GCM before
                    saving.
                  </p>

                  {verifyError && (
                    <p className="text-xs text-destructive">{verifyError}</p>
                  )}

                  <div className="flex items-center justify-between gap-3 pt-2">
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => setStep(1)}
                    >
                      Back
                    </Button>
                    <Button
                      size="lg"
                      onClick={handleVerify}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <LoaderCircle className="size-4 animate-spin" />
                          Verifying…
                        </>
                      ) : (
                        "Verify Connection"
                      )}
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 3: Result */}
              {step === 3 && (
                <div className="mt-10 flex flex-col items-center py-6">
                  {isVerified && (
                    <>
                      <div className="flex size-14 items-center justify-center rounded-full bg-emerald-500/10">
                        <Check className="size-7 text-emerald-500" />
                      </div>
                      <p className="mt-4 text-sm font-medium">
                        Connection verified successfully
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Your bucket is ready to use
                      </p>
                      <div className="mt-2 rounded-lg border bg-card px-4 py-2.5 text-xs">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Server className="size-3.5" />
                          <span className="font-medium text-foreground">
                            {bucketName}
                          </span>
                          {region && (
                            <>
                              <span className="text-muted-foreground/50">
                                ·
                              </span>
                              <span>{region}</span>
                            </>
                          )}
                        </div>
                      </div>
                      <Button
                        size="lg"
                        className="mt-8 w-full max-w-xs"
                        onClick={handleGoToDashboard}
                      >
                        Go to Dashboard
                      </Button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {selectedProvider && (
          <ProviderGuideDialog
            open={guideOpen}
            onOpenChange={setGuideOpen}
            providerKey={selectedProvider.id}
            bucketName={bucketName || undefined}
          />
        )}
      </div>
    </AuthGuard>
  );
}
