"use client"

import { useState } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  CreditCardIcon,
  CheckmarkCircle01Icon,
  InformationCircleIcon,
  HardDriveIcon,
  CloudServerIcon,
  ArrowUpIcon,
  Download01Icon,
  Crown02Icon,
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
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

// ─── Data ─────────────────────────────────────────────────────────────────────

const PLANS = [
  {
    id: "free",
    name: "Free",
    price: "$0",
    period: "forever",
    description: "For individuals getting started.",
    current: true,
    color: "border-primary",
    headerBg: "bg-primary/5",
    features: [
      "1 workspace",
      "Unlimited files (your storage)",
      "5 active share links",
      "Basic analytics",
      "Email support",
    ],
    cta: "Current plan",
    ctaDisabled: true,
  },
  {
    id: "pro",
    name: "Pro",
    price: "$8",
    period: "per month",
    description: "For power users and freelancers.",
    current: false,
    color: "border-transparent",
    headerBg: "bg-blue-500/5",
    features: [
      "3 workspaces",
      "Unlimited files (your storage)",
      "Unlimited share links",
      "Advanced analytics",
      "Custom link domains",
      "Priority email support",
    ],
    cta: "Upgrade to Pro",
    ctaDisabled: false,
  },
  {
    id: "team",
    name: "Team",
    price: "$24",
    period: "per month",
    description: "For teams collaborating on shared storage.",
    current: false,
    color: "border-transparent",
    headerBg: "bg-violet-500/5",
    features: [
      "Unlimited workspaces",
      "Unlimited files (your storage)",
      "Unlimited share links",
      "Team member management",
      "Role-based permissions",
      "Audit logs",
      "Slack + webhook integrations",
      "Priority phone & email support",
    ],
    cta: "Upgrade to Team",
    ctaDisabled: false,
  },
]

const USAGE = [
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
    costLabel: "~$0.023/GB · S3 Standard",
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
    costLabel: "~$0.09/GB · first 10 TB",
    iconColor: "text-amber-600",
    iconBg: "bg-amber-500/10",
    icon: HardDriveIcon,
    showBar: true,
  },
]

const INVOICES = [
  { id: "INV-0001", date: "May 1, 2026",  amount: "$0.00", status: "Paid",   description: "BYOC Free Plan"  },
  { id: "INV-0000", date: "Apr 1, 2026",  amount: "$0.00", status: "Paid",   description: "BYOC Free Plan"  },
]

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function BillingPage() {
  const [upgradeTarget, setUpgradeTarget] = useState<string | null>(null)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Billing</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Manage your plan and review estimated cloud storage costs.
        </p>
      </div>

      {/* No-charge notice */}
      <div className="flex items-start gap-3 rounded-lg border border-blue-500/20 bg-blue-500/5 p-4">
        <HugeiconsIcon icon={InformationCircleIcon} className="mt-0.5 size-4 shrink-0 text-blue-500" strokeWidth={1.5} />
        <div>
          <p className="text-xs font-medium text-blue-700 dark:text-blue-400">BYOC does not charge for storage</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Storage and bandwidth costs are billed directly by your cloud provider (AWS, GCS, Azure, etc.).
            The figures below are <span className="font-medium text-foreground">estimates</span> based on standard pricing — check your provider dashboard for actual charges.
          </p>
        </div>
      </div>

      {/* Current plan badge */}
      <Card className="border-primary/40">
        <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10">
              <HugeiconsIcon icon={Crown02Icon} className="size-5 text-primary" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-sm font-semibold">Free Plan</p>
              <p className="text-xs text-muted-foreground">1 workspace · 5 share links · basic analytics</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge className="bg-emerald-500/10 text-emerald-600 text-xs">Active</Badge>
            <Button size="sm" variant="outline" className="h-8 gap-1.5 text-xs" onClick={() => setUpgradeTarget("pro")}>
              <HugeiconsIcon icon={ArrowUpIcon} className="size-3" strokeWidth={2} />
              Upgrade plan
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Plans */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold">Plans</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {PLANS.map((plan) => (
            <Card
              key={plan.id}
              className={cn(
                "relative overflow-hidden transition-shadow hover:shadow-md",
                plan.current && "ring-1 ring-primary",
              )}
            >
              {plan.current && (
                <div className="absolute right-3 top-3">
                  <Badge className="bg-primary/10 text-primary text-[10px]">Current</Badge>
                </div>
              )}
              <CardHeader className={cn("pb-3", plan.headerBg)}>
                <CardTitle className="text-base font-bold">{plan.name}</CardTitle>
                <CardDescription className="text-[11px]">{plan.description}</CardDescription>
                <div className="flex items-end gap-1 pt-1">
                  <span className="text-2xl font-bold tracking-tight">{plan.price}</span>
                  <span className="pb-0.5 text-xs text-muted-foreground">/{plan.period}</span>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <ul className="space-y-2">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-xs">
                      <HugeiconsIcon icon={CheckmarkCircle01Icon} className="mt-0.5 size-3.5 shrink-0 text-emerald-500" strokeWidth={2} />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  size="sm"
                  variant={plan.current ? "outline" : "default"}
                  className="mt-5 w-full h-8 text-xs"
                  disabled={plan.ctaDisabled}
                  onClick={() => !plan.ctaDisabled && setUpgradeTarget(plan.id)}
                >
                  {plan.cta}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Estimated costs */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold">Estimated Monthly Costs</h2>
        <div className="space-y-3">
          {USAGE.map((u) => (
            <Card key={u.label}>
              <CardContent className="p-5">
                <div className="flex items-start gap-3">
                  <div className={cn("flex size-9 shrink-0 items-center justify-center rounded-lg", u.iconBg)}>
                    <HugeiconsIcon icon={u.icon} className={cn("size-4", u.iconColor)} strokeWidth={1.5} />
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
                          <span className="text-muted-foreground">{u.used} {u.unit} used</span>
                          <span className="text-muted-foreground">{u.limit} {u.unit} limit</span>
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

        {/* Total */}
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
                <HugeiconsIcon icon={CreditCardIcon} className="size-4 text-muted-foreground" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-sm font-medium">No payment method</p>
                <p className="text-xs text-muted-foreground">Required only if you upgrade to a paid plan</p>
              </div>
            </div>
            <Button size="sm" variant="outline" className="h-7 text-xs">Add card</Button>
          </CardContent>
        </Card>
      </section>

      {/* Billing history */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold">Billing History</h2>
        <Card>
          <CardContent className="p-0">
            {INVOICES.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <p className="text-sm text-muted-foreground">No invoices yet</p>
              </div>
            ) : (
              <div className="divide-y">
                {INVOICES.map((inv, i) => (
                  <div key={inv.id} className="flex items-center justify-between px-5 py-3">
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="text-xs font-medium">{inv.description}</p>
                        <p className="text-[11px] text-muted-foreground">{inv.date} · {inv.id}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge
                        variant="secondary"
                        className="text-[10px] bg-emerald-500/10 text-emerald-600"
                      >
                        {inv.status}
                      </Badge>
                      <span className="text-sm font-medium">{inv.amount}</span>
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0">
                        <HugeiconsIcon icon={Download01Icon} className="size-3.5" strokeWidth={1.5} />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      {/* Upgrade modal placeholder */}
      {upgradeTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
          onClick={() => setUpgradeTarget(null)}
        >
          <Card className="w-full max-w-sm mx-4" onClick={(e) => e.stopPropagation()}>
            <CardHeader>
              <CardTitle className="text-base">
                Upgrade to {PLANS.find((p) => p.id === upgradeTarget)?.name}
              </CardTitle>
              <CardDescription className="text-xs">
                Payment integration coming soon. For now, contact us at hello@byoc.app to upgrade manually.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex gap-2">
              <Button variant="outline" size="sm" className="flex-1" onClick={() => setUpgradeTarget(null)}>
                Cancel
              </Button>
              <Button size="sm" className="flex-1">Contact us</Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
