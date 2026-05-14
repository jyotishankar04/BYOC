import type { Metadata } from 'next'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  CloudUploadIcon,
  Analytics01Icon,
  UserGroupIcon,
  MessageQuestionIcon,
  CheckmarkCircle01Icon,
} from '@hugeicons/core-free-icons'
import Link from 'next/link'
import { PlanCtaButton } from '@/components/custom/pricing/plan-cta-button'

export const metadata: Metadata = {
  title: 'Pricing — BringBucket',
  description:
    'Simple, transparent pricing. Connect your own cloud storage and pay only for the features you need.',
}

type Cell = boolean | string

interface Row {
  feature: string
  free: Cell
  pro: Cell
  team: Cell
}

// Source of truth: PLAN_FEATURES in app/app/(app)/billing/page.tsx
const storageRows: Row[] = [
  { feature: 'Files (your storage)',       free: 'Unlimited', pro: 'Unlimited',      team: 'Unlimited'  },
  { feature: 'Storage providers',          free: 'S3 & R2',   pro: 'All providers',  team: 'All providers' },
  { feature: 'Workspaces',                 free: '1',         pro: '3',              team: 'Unlimited'  },
  { feature: 'Share links',                free: '5 active',  pro: 'Unlimited',      team: 'Unlimited'  },
  { feature: 'Password-protected links',   free: false,       pro: true,             team: true         },
]

const analyticsRows: Row[] = [
  { feature: 'Analytics', free: 'Basic', pro: 'Advanced', team: 'Advanced' },
]

const teamRows: Row[] = [
  { feature: 'Team member management',      free: false, pro: false, team: true },
  { feature: 'Role-based permissions',      free: false, pro: false, team: true },
  { feature: 'Audit logs',                  free: false, pro: false, team: true },
  { feature: 'Custom domains',              free: false, pro: false, team: true },
  { feature: 'Slack + webhook integrations',free: false, pro: false, team: true },
]

const supportRows: Row[] = [
  { feature: 'Support level', free: 'Email', pro: 'Priority email', team: 'Priority' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function Checkmark() {
  return (
    <HugeiconsIcon icon={CheckmarkCircle01Icon} className="size-4 text-primary" strokeWidth={1.5} />
  )
}

function CellValue({ value }: { value: Cell }) {
  if (value === true) return <Checkmark />
  if (value === false)
    return <span className="text-muted-foreground/40 text-base leading-none select-none">—</span>
  return <span className="text-sm">{value}</span>
}

type IconType = typeof CloudUploadIcon

function SectionHeader({ icon, label }: { icon: IconType; label: string }) {
  return (
    <tr className="*:pb-3 *:pt-8">
      <td className="flex items-center gap-2 font-medium text-sm">
        <HugeiconsIcon icon={icon} className="size-4 text-muted-foreground" strokeWidth={1.5} />
        <span>{label}</span>
      </td>
      <td />
      <td className="bg-muted border-none px-4" />
      <td />
    </tr>
  )
}

function DataRows({ rows }: { rows: Row[] }) {
  return (
    <>
      {rows.map((row) => (
        <tr key={row.feature} className="*:border-b *:py-3">
          <td className="text-sm text-muted-foreground">{row.feature}</td>
          <td>
            <CellValue value={row.free} />
          </td>
          <td className="bg-muted border-none px-4">
            <div className="-mb-3 border-b py-3">
              <CellValue value={row.pro} />
            </div>
          </td>
          <td>
            <CellValue value={row.team} />
          </td>
        </tr>
      ))}
    </>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PricingPage() {
  return (
    <section className="py-16 md:py-28">
      <div className="mx-auto max-w-5xl px-6">
        {/* Page header */}
        <div className="mb-14 text-center">
          <span className="rounded-full border px-3 py-1 text-xs font-medium text-muted-foreground">
            Pricing
          </span>
          <h1 className="mt-5 text-4xl font-semibold tracking-tight">
            Simple, transparent pricing
          </h1>
          <p className="mt-3 text-muted-foreground max-w-lg mx-auto text-sm">
            All plans connect to your own storage bucket. You pay your cloud provider
            directly — we never touch your data.
          </p>
        </div>

        {/* Comparison table */}
        <div className="w-full overflow-auto lg:overflow-visible">
          <table className="w-[200vw] border-separate border-spacing-x-3 md:w-full dark:[--color-muted:var(--color-zinc-900)]">
            <thead className="bg-background sticky top-0">
              <tr className="*:py-4 *:text-left *:font-medium">
                <th className="lg:w-2/5" />

                {/* Free */}
                <th className="space-y-3">
                  <div>
                    <span className="block text-base">Free</span>
                    <span className="text-muted-foreground text-sm font-normal">$0 / forever</span>
                  </div>
                  <PlanCtaButton plan="free" variant="outline" />
                </th>

                {/* Pro — highlighted */}
                <th className="bg-muted rounded-t-(--radius) space-y-3 px-4">
                  <div>
                    <span className="block text-base">Pro</span>
                    <span className="text-muted-foreground text-sm font-normal">$9 / month</span>
                  </div>
                  <PlanCtaButton plan="pro" />
                </th>

                {/* Team */}
                <th className="space-y-3">
                  <div>
                    <span className="block text-base">Team</span>
                    <span className="text-muted-foreground text-sm font-normal">$29 / month</span>
                  </div>
                  <PlanCtaButton plan="team" variant="outline" />
                </th>
              </tr>
            </thead>

            <tbody>
              <SectionHeader icon={CloudUploadIcon} label="Storage & Files" />
              <DataRows rows={storageRows} />

              <SectionHeader icon={Analytics01Icon} label="Analytics" />
              <DataRows rows={analyticsRows} />

              <SectionHeader icon={UserGroupIcon} label="Team" />
              <DataRows rows={teamRows} />

              <SectionHeader icon={MessageQuestionIcon} label="Support" />
              <DataRows rows={supportRows} />

              {/* Bottom cap for Pro column */}
              <tr className="*:py-6">
                <td />
                <td />
                <td className="bg-muted rounded-b-(--radius) border-none px-4" />
                <td />
              </tr>
            </tbody>
          </table>
        </div>

        {/* Footer note */}
        <p className="mt-8 text-center text-xs text-muted-foreground">
          All prices in USD, billed monthly. Storage and bandwidth costs are billed directly by
          your cloud provider — BringBucket never charges for data.
          <br />
          Need a custom plan?{' '}
          <Link href="/contact" className="text-primary underline underline-offset-2">
            Talk to us
          </Link>
          .
        </p>
      </div>
    </section>
  )
}
