'use client'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowRight, Rocket } from 'lucide-react'

const CTASection = () => {
  return (
    <section className="relative overflow-hidden px-6 py-24 sm:py-32">
      {/* Background layers */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_100%,rgba(59,130,246,0.10),transparent)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.025)_1px,transparent_1px)] bg-[size:64px_64px]" />
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      </div>

      <div className="mx-auto max-w-3xl text-center">
        <span className="inline-flex items-center rounded-full border bg-background/80 px-3 py-1 text-xs text-muted-foreground shadow-sm">
          No credit card required
        </span>

        <h2 className="mt-6 text-balance font-semibold text-4xl tracking-tight sm:text-5xl lg:text-6xl">
          Your storage,{' '}
          <span className="text-primary">your way.</span>
        </h2>

        <p className="mx-auto mt-6 max-w-xl text-pretty text-lg text-muted-foreground">
          Connect your first bucket in minutes — no migration, no vendor lock-in, no surprises. Start free, upgrade when you&apos;re ready.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button size="lg" asChild>
            <Link href="/auth/signup">
              <Rocket className="size-4" />
              Get Started Free
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="#pricing">
              View Pricing
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>

        <p className="mt-6 text-xs text-muted-foreground/70">
          Free plan available &nbsp;·&nbsp; No storage fees from us &nbsp;·&nbsp; Cancel anytime
        </p>
      </div>
    </section>
  )
}

export default CTASection
