import { notFound } from 'next/navigation'
import Link from 'next/link'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  CheckmarkCircle01Icon,
  Cancel01Icon,
} from '@hugeicons/core-free-icons'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { competitors } from '../data'

interface PageProps {
  params: Promise<{ competitor: string }>
}

export async function generateStaticParams() {
  return competitors.map((c) => ({ competitor: c.slug }))
}

export async function generateMetadata({ params }: PageProps) {
  const { competitor: slug } = await params
  const competitor = competitors.find((c) => c.slug === slug)
  return {
    title: competitor
      ? `BringBucket vs ${competitor.name} — File Management Comparison`
      : 'Comparison — BringBucket',
  }
}

function FeatureCell({ value }: { value: boolean | string }) {
  if (typeof value === 'boolean') {
    return value ? (
      <HugeiconsIcon
        icon={CheckmarkCircle01Icon}
        className="size-4 text-emerald-500"
        strokeWidth={1.5}
      />
    ) : (
      <HugeiconsIcon
        icon={Cancel01Icon}
        className="size-4 text-muted-foreground/50"
        strokeWidth={1.5}
      />
    )
  }
  return <span>{value}</span>
}

export default async function CompetitorPage({ params }: PageProps) {
  const { competitor: slug } = await params
  const competitor = competitors.find((c) => c.slug === slug)

  if (!competitor) {
    notFound()
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-20 md:py-28">
      <span className="rounded-full border px-3 py-1 text-xs text-muted-foreground">
        Comparison
      </span>

      <h1 className="mt-4 font-semibold text-4xl tracking-tight">
        BringBucket vs {competitor.name}
      </h1>

      <p className="mt-3 text-muted-foreground">{competitor.tagline}</p>

      <div className="mt-12 rounded-xl border overflow-hidden">
        {/* Header row */}
        <div className="grid grid-cols-3 bg-muted/40 px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          <span>Feature</span>
          <span>BringBucket</span>
          <span>{competitor.name}</span>
        </div>

        {/* Feature rows */}
        {competitor.features.map((feature) => (
          <div
            key={feature.label}
            className="grid grid-cols-3 px-4 py-3 text-sm border-t items-center even:bg-muted/20"
          >
            <span className="font-medium text-foreground">{feature.label}</span>
            <FeatureCell value={feature.bringbucket} />
            <FeatureCell value={feature.competitor} />
          </div>
        ))}
      </div>

      {/* Bottom CTA */}
      <div className="mt-12 rounded-xl border bg-primary/5 p-8 text-center">
        <h2 className="font-semibold text-2xl tracking-tight">
          Ready to switch to BringBucket?
        </h2>
        <p className="mt-3 text-muted-foreground max-w-md mx-auto">
          Connect your own cloud storage in minutes. No migration, no data
          handed to a third party — just a clean dashboard over storage you
          already control.
        </p>
        <div className="mt-6">
          <Button size="lg" asChild>
            <Link href="/auth/signup">Get Started Free</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
