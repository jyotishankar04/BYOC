"use client"

import { useState } from "react"
import { useQuery, useMutation } from "@tanstack/react-query"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  CreditCardIcon,
  CheckmarkCircle01Icon,
  InformationCircleIcon,
  HardDriveIcon,
  CloudServerIcon,
  ArrowUpIcon,
  Crown02Icon,
  Cancel01Icon,
  LinkSquare01Icon,
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
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import api from "@/lib/axios"
import { useSubscriptionSnapshot } from "@/lib/subscription"
import { toast } from "sonner"

// ─── Types ────────────────────────────────────────────────────────────────────

interface BillingPlan {
  id: string
  productId: string
  name: string
  tier: "Pro" | "Team"
  interval: "month" | "6month"
  amount: number
  currency: string
  description: string
}

// ─── Static display data ──────────────────────────────────────────────────────

const PLAN_FEATURES: Record<string, string[]> = {
  Free: [
    "1 workspace",
    "Unlimited files (your storage)",
    "5 active share links",
    "Basic analytics",
    "S3 & R2 providers",
    "Email support",
  ],
  Pro: [
    "3 workspaces",
    "Unlimited files (your storage)",
    "Unlimited share links",
    "Advanced analytics",
    "Password-protected links",
    "All storage providers",
    "Priority email support",
  ],
  Team: [
    "Unlimited workspaces",
    "Unlimited files (your storage)",
    "Unlimited share links",
    "Team member management",
    "Role-based permissions",
    "Audit logs",
    "Custom domains",
    "Slack + webhook integrations",
    "Priority support",
  ],
}

const USAGE_ESTIMATES = [
  {
    label: "BYOC Platform",
    sub: "Your current plan — all platform features",
    used: 0,
    limit: 0,
    unit: "",
    cost: "$0.00",
    costLabel: "Free forever",
    iconColor: "text-primary",
    iconBg: "bg-primary/10",
    icon: CreditCardIcon,
    showBar: false,
  },
  {
    label: "AWS S3 Storage",
    sub: "byoc-user-storage · ap-south-1",
    used: 128.4,
    limit: 500,
    unit: "GB",
    cost: "$2.95",
    costLabel: "~$0.023/GB - S3 Standard",
    iconColor: "text-amber-600",
    iconBg: "bg-amber-500/10",
    icon: CloudServerIcon,
    showBar: true,
  },
  {
    label: "AWS Data Transfer",
    sub: "Egress charges from S3 (downloads/shares)",
    used: 18.2,
    limit: 100,
    unit: "GB",
    cost: "$1.87",
    costLabel: "~$0.09/GB - first 10 TB",
    iconColor: "text-amber-600",
    iconBg: "bg-amber-500/10",
    icon: HardDriveIcon,
    showBar: true,
  },
]

// ─── Hooks ────────────────────────────────────────────────────────────────────

function useBillingPlans() {
  return useQuery({
    queryKey: ["billing", "plans"],
    queryFn: async () => {
      const res = await api.get<{ plans: BillingPlan[] }>("/api/v1/billing/plans")
      return res.data.plans
    },
  })
}

function useCheckout() {
  return useMutation({
    mutationFn: async (productId: string) => {
      const res = await api.post<{ url: string; checkoutId: string }>(
        "/api/v1/billing/checkout",
        { productId },
      )
      return res.data
    },
    onSuccess: ({ url }) => {
      window.location.href = url
    },
    onError: (err: Error) => {
      toast.error(err.message ?? "Failed to start checkout")
    },
  })
}

function usePortal() {
  return useMutation({
    mutationFn: async () => {
      const res = await api.get<{ url: string }>("/api/v1/billing/portal")
      return res.data
    },
    onSuccess: ({ url }) => {
      window.open(url, "_blank", "noopener")
    },
    onError: (err: Error) => {
      toast.error(err.message ?? "Failed to open billing portal")
    },
  })
}

function useCancel() {
  return useMutation({
    mutationFn: async () => {
      await api.post("/api/v1/billing/cancel", { revokeImmediately: false })
    },
    onSuccess: () => {
      toast.success("Subscription will cancel at the end of the billing period")
    },
    onError: (err: Error) => {
      toast.error(err.message ?? "Failed to cancel subscription")
    },
  })
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function PlanCard({
  tier,
  isCurrent,
  plans,
  interval,
  onCheckout,
  mutating,
}: {
  tier: string
  isCurrent: boolean
  plans: BillingPlan[]
  interval: "month" | "6month"
  onCheckout: (productId: string) => void
  mutating: boolean
}) {
  const plan = plans.find((p) => p.tier === tier && p.interval === interval)
  const features = PLAN_FEATURES[tier] ?? []
  const priceDisplay = plan ? `$${plan.amount}` : "---"
  const periodDisplay = interval === "6month" ? "every 6 months" : "per month"
  const monthlyEquiv =
    plan && interval === "6month" ? `$${(plan.amount / 6).toFixed(2)}/mo` : null
  const headerBg = tier === "Pro" ? "bg-blue-500/5" : "bg-violet-500/5"

  return (
    <Card
      className={cn(
        "relative overflow-hidden transition-shadow hover:shadow-md",
        isCurrent && "ring-1 ring-primary",
      )}
    >
      {isCurrent && (
        <div className="absolute right-3 top-3">
          <Badge className="bg-primary/10 text-primary text-[10px]">Current</Badge>
        </div>
      )}
      <CardHeader className={cn("pb-3", headerBg)}>
        <CardTitle className="text-base font-bold">{tier}</CardTitle>
        <CardDescription className="text-[11px]">
          {tier === "Pro"
            ? "For power users and freelancers."
            : "For teams collaborating on shared storage."}
        </CardDescription>
        <div className="flex items-end gap-1 pt-1">
          <span className="text-2xl font-bold tracking-tight">{priceDisplay}</span>
          <span className="pb-0.5 text-xs text-muted-foreground">/{periodDisplay}</span>
        </div>
        {monthlyEquiv && (
          <p className="text-[11px] text-emerald-600 font-medium">{monthlyEquiv} · save ~17%</p>
        )}
      </CardHeader>
      <CardContent className="pt-4">
        <ul className="space-y-2">
          {features.map((f) => (
            <li key={f} className="flex items-start gap-2 text-xs">
              <HugeiconsIcon
                icon={CheckmarkCircle01Icon}
                className="mt-0.5 size-3.5 shrink-0 text-emerald-500"
                strokeWidth={2}
              />
              <span>{f}</span>
            </li>
          ))}
        </ul>
        <Button
          size="sm"
          variant={isCurrent ? "outline" : "default"}
          className="mt-5 w-full h-8 text-xs"
          disabled={isCurrent || mutating || !plan}
          onClick={() => plan && onCheckout(plan.productId)}
        >
          {isCurrent ? "Current plan" : plan ? `Upgrade to ${tier}` : "Coming soon"}
        </Button>
      </CardContent>
    </Card>
  )
}

function CancelDialog({
  onConfirm,
  onClose,
  loading,
}: {
  onConfirm: () => void
  onClose: () => void
  loading: boolean
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <Card className="w-full max-w-sm mx-4" onClick={(e) => e.stopPropagation()}>
        <CardHeader>
          <CardTitle className="text-base">Cancel subscription?</CardTitle>
          <CardDescription className="text-xs">
            Your plan will remain active until the end of the current billing period. You
            will not be charged again.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={onClose}
            disabled={loading}
          >
            Keep plan
          </Button>
          <Button
            variant="destructive"
            size="sm"
            className="flex-1"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? "Canceling..." : "Yes, cancel"}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function BillingPage() {
  const [billingInterval, setBillingInterval] = useState<"month" | "6month">("month")
  const [showCancel, setShowCancel] = useState(false)

  const { subscription, loading: subLoading } = useSubscriptionSnapshot()
  const { data: paidPlans = [], isLoading: plansLoading } = useBillingPlans()
  const checkout = useCheckout()
  const portal = usePortal()
  const cancel = useCancel()

  const currentPlan = subscription?.plan ?? "Free"
  const isPaid = currentPlan !== "Free"
  const status = subscription?.status
  const isCanceling = status === "Canceled" || status === "Incomplete_expired"

  const periodEnd =
    subscription && (subscription as unknown as Record<string, unknown>).currentPeriodEnd
      ? new Date(
          (subscription as unknown as Record<string, unknown>).currentPeriodEnd as string,
        ).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      : null

  const mutating = checkout.isPending || portal.isPending

  const handleCheckout = (productId: string) => {
    checkout.mutate(productId)
  }

  const handleCancel = () => {
    cancel.mutate(undefined, {
      onSuccess: () => setShowCancel(false),
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Billing</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Manage your plan and review estimated cloud storage costs.
        </p>
      </div>

      {/* Storage cost notice */}
      <div className="flex items-start gap-3 rounded-lg border border-blue-500/20 bg-blue-500/5 p-4">
        <HugeiconsIcon
          icon={InformationCircleIcon}
          className="mt-0.5 size-4 shrink-0 text-blue-500"
          strokeWidth={1.5}
        />
        <div>
          <p className="text-xs font-medium text-blue-700 dark:text-blue-400">
            BYOC does not charge for storage
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Storage and bandwidth costs are billed directly by your cloud provider (AWS, GCS, Azure,
            etc.). The figures below are{" "}
            <span className="font-medium text-foreground">estimates</span> based on standard pricing
            — check your provider dashboard for actual charges.
          </p>
        </div>
      </div>

      {/* Current plan card */}
      <Card className={cn(isPaid ? "border-primary/40" : "")}>
        <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10">
              <HugeiconsIcon icon={Crown02Icon} className="size-5 text-primary" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-sm font-semibold">{currentPlan} Plan</p>
              <p className="text-xs text-muted-foreground">
                {currentPlan === "Free"
                  ? "1 workspace · 5 share links · basic analytics"
                  : currentPlan === "Pro"
                    ? "3 workspaces · unlimited links · advanced analytics"
                    : "Unlimited workspaces · team management · audit logs"}
              </p>
              {periodEnd && (
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  {isCanceling ? "Ends" : "Renews"} {periodEnd}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            {status ? (
              <Badge
                className={cn(
                  "text-xs",
                  status === "Active" || status === "Trialing"
                    ? "bg-emerald-500/10 text-emerald-600"
                    : "bg-amber-500/10 text-amber-600",
                )}
              >
                {status}
              </Badge>
            ) : (
              <Badge className="bg-emerald-500/10 text-emerald-600 text-xs">Active</Badge>
            )}
            {isPaid ? (
              <Button
                size="sm"
                variant="outline"
                className="h-8 gap-1.5 text-xs"
                disabled={portal.isPending}
                onClick={() => portal.mutate()}
              >
                <HugeiconsIcon icon={LinkSquare01Icon} className="size-3" strokeWidth={2} />
                {portal.isPending ? "Opening..." : "Manage billing"}
              </Button>
            ) : (
              <Button
                size="sm"
                variant="outline"
                className="h-8 gap-1.5 text-xs"
                onClick={() =>
                  document
                    .getElementById("plans-section")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
              >
                <HugeiconsIcon icon={ArrowUpIcon} className="size-3" strokeWidth={2} />
                Upgrade plan
              </Button>
            )}
            {isPaid && !isCanceling && (
              <Button
                size="sm"
                variant="ghost"
                className="h-8 gap-1.5 text-xs text-destructive hover:text-destructive"
                onClick={() => setShowCancel(true)}
              >
                <HugeiconsIcon icon={Cancel01Icon} className="size-3" strokeWidth={2} />
                Cancel
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Plans */}
      <section id="plans-section" className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">Plans</h2>
          <div className="flex items-center rounded-lg border p-0.5 text-xs">
            <button
              className={cn(
                "rounded-md px-3 py-1 transition-colors",
                billingInterval === "month"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
              onClick={() => setBillingInterval("month")}
            >
              Monthly
            </button>
            <button
              className={cn(
                "rounded-md px-3 py-1 transition-colors",
                billingInterval === "6month"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
              onClick={() => setBillingInterval("6month")}
            >
              6 Month
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {/* Free card */}
          <Card
            className={cn(
              "relative overflow-hidden transition-shadow hover:shadow-md",
              currentPlan === "Free" && "ring-1 ring-primary",
            )}
          >
            {currentPlan === "Free" && (
              <div className="absolute right-3 top-3">
                <Badge className="bg-primary/10 text-primary text-[10px]">Current</Badge>
              </div>
            )}
            <CardHeader className="pb-3 bg-primary/5">
              <CardTitle className="text-base font-bold">Free</CardTitle>
              <CardDescription className="text-[11px]">
                For individuals getting started.
              </CardDescription>
              <div className="flex items-end gap-1 pt-1">
                <span className="text-2xl font-bold tracking-tight">$0</span>
                <span className="pb-0.5 text-xs text-muted-foreground">/forever</span>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <ul className="space-y-2">
                {PLAN_FEATURES.Free.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-xs">
                    <HugeiconsIcon
                      icon={CheckmarkCircle01Icon}
                      className="mt-0.5 size-3.5 shrink-0 text-emerald-500"
                      strokeWidth={2}
                    />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Button size="sm" variant="outline" className="mt-5 w-full h-8 text-xs" disabled>
                Current plan
              </Button>
            </CardContent>
          </Card>

          {/* Pro card */}
          {plansLoading ? (
            <Card className="animate-pulse">
              <CardHeader className="pb-3 bg-blue-500/5">
                <div className="h-4 w-12 rounded bg-muted" />
              </CardHeader>
              <CardContent className="pt-4 space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-3 rounded bg-muted" />
                ))}
              </CardContent>
            </Card>
          ) : (
            <PlanCard
              tier="Pro"
              isCurrent={currentPlan === "Pro"}
              plans={paidPlans}
              interval={billingInterval}
              onCheckout={handleCheckout}
              mutating={mutating}
            />
          )}

          {/* Team card */}
          {plansLoading ? (
            <Card className="animate-pulse">
              <CardHeader className="pb-3 bg-violet-500/5">
                <div className="h-4 w-16 rounded bg-muted" />
              </CardHeader>
              <CardContent className="pt-4 space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-3 rounded bg-muted" />
                ))}
              </CardContent>
            </Card>
          ) : (
            <PlanCard
              tier="Team"
              isCurrent={currentPlan === "Team"}
              plans={paidPlans}
              interval={billingInterval}
              onCheckout={handleCheckout}
              mutating={mutating}
            />
          )}
        </div>
      </section>

      {/* Estimated costs */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold">Estimated Monthly Costs</h2>
        <div className="space-y-3">
          {USAGE_ESTIMATES.map((u) => (
            <Card key={u.label}>
              <CardContent className="p-5">
                <div className="flex items-start gap-3">
                  <div
                    className={cn(
                      "flex size-9 shrink-0 items-center justify-center rounded-lg",
                      u.iconBg,
                    )}
                  >
                    <HugeiconsIcon
                      icon={u.icon}
                      className={cn("size-4", u.iconColor)}
                      strokeWidth={1.5}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium">{u.label}</p>
                      <p className="shrink-0 text-sm font-semibold">{u.cost}</p>
                    </div>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">{u.sub}</p>
                    {u.showBar && (
                      <div className="mt-3 space-y-1.5">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-muted-foreground">
                            {u.used} {u.unit} used
                          </span>
                          <span className="text-muted-foreground">
                            {u.limit} {u.unit} limit
                          </span>
                        </div>
                        <Progress value={(u.used / u.limit) * 100} className="h-1.5" />
                        <p className="text-[11px] text-muted-foreground">{u.costLabel}</p>
                      </div>
                    )}
                    {!u.showBar && (
                      <p className="mt-1 text-[11px] text-emerald-600">{u.costLabel}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="border-dashed">
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-sm font-medium">Total estimated this month</p>
              <p className="text-[11px] text-muted-foreground">BYOC ($0.00) + AWS ($4.82)</p>
            </div>
            <p className="text-lg font-bold tracking-tight">$4.82</p>
          </CardContent>
        </Card>
      </section>

      {/* Payment method */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold">Payment Method</h2>
        <Card>
          <CardContent className="flex items-center justify-between p-5">
            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-lg bg-muted">
                <HugeiconsIcon
                  icon={CreditCardIcon}
                  className="size-4 text-muted-foreground"
                  strokeWidth={1.5}
                />
              </div>
              <div>
                {isPaid ? (
                  <>
                    <p className="text-sm font-medium">Managed via Polar</p>
                    <p className="text-xs text-muted-foreground">
                      Update your card in the billing portal
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-sm font-medium">No payment method</p>
                    <p className="text-xs text-muted-foreground">
                      Required only if you upgrade to a paid plan
                    </p>
                  </>
                )}
              </div>
            </div>
            {isPaid && (
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-xs gap-1.5"
                disabled={portal.isPending}
                onClick={() => portal.mutate()}
              >
                <HugeiconsIcon icon={LinkSquare01Icon} className="size-3" strokeWidth={1.5} />
                {portal.isPending ? "Opening..." : "Manage"}
              </Button>
            )}
          </CardContent>
        </Card>
      </section>

      {/* Billing history */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold">Billing History</h2>
        <Card>
          <CardContent className="p-0">
            {isPaid ? (
              <div className="flex flex-col items-center gap-3 py-10 text-center">
                <p className="text-sm text-muted-foreground">
                  View your invoices in the billing portal
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs gap-1.5"
                  disabled={portal.isPending}
                  onClick={() => portal.mutate()}
                >
                  <HugeiconsIcon icon={LinkSquare01Icon} className="size-3" strokeWidth={1.5} />
                  Open billing portal
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <p className="text-sm text-muted-foreground">No invoices yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      {/* Cancel dialog */}
      {showCancel && (
        <CancelDialog
          onConfirm={handleCancel}
          onClose={() => setShowCancel(false)}
          loading={cancel.isPending}
        />
      )}
    </div>
  )
}
