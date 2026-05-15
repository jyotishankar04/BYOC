"use client"

import { Box, CircleCheck, Gem, Users, Rocket, type LucideIcon } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { PlanCtaButton } from '@/components/custom/pricing/plan-cta-button'
import { useBetaMode } from '@/lib/admin'

interface PricingPlan {
  name: string
  price: string
  description: string
  isRecommended: boolean
  icon: LucideIcon
  features: string[]
}

export const pricingPlans: PricingPlan[] = [
  {
    name: 'Free',
    price: '$0',
    description: 'For personal testing and basic file management.',
    isRecommended: false,
    icon: Box,
    features: [
      'Unlimited file uploads',
      'Connect 1 storage provider',
      'Basic file manager',
      'Basic usage overview',
    ],
  },
  {
    name: 'Pro',
    price: '$9',
    description: 'For individuals who need more control and insights.',
    isRecommended: true,
    icon: Gem,
    features: [
      'Unlimited file uploads',
      'Connect multiple buckets',
      'Advanced file manager',
      'Storage usage analytics',
      'Private file sharing',
      'Cost estimation',
    ],
  },
  {
    name: 'Team',
    price: '$29',
    description: 'For startups and small teams managing shared storage.',
    isRecommended: false,
    icon: Users,
    features: [
      'Unlimited file uploads',
      'Team workspace',
      'Role-based access',
      'Shared file management',
      'Activity logs',
      'Priority support',
    ],
  },
]

const Pricing = () => {
  const { data: isBeta = true } = useBetaMode()

  return (
    <section id="pricing" className="mx-auto max-w-6xl px-6 py-20">
      <h2 className="text-balance text-center font-medium text-4xl tracking-[-0.04em] sm:text-[2.75rem]">
        Plans &amp; Pricing
      </h2>
      <p className="mt-2 text-balance text-center text-md text-muted-foreground tracking-[-0.01em] sm:mt-4">
        Start free. Upgrade when you need more.
      </p>

      {isBeta ? (
        /* Beta notice */
        <div className="mx-auto mt-12 max-w-xl sm:mt-16">
          <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-primary/5 via-background to-primary/5 p-8 text-center sm:p-10">
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.04)_1px,transparent_1px)] bg-[size:40px_40px]" />
            <div className="relative">
              <Badge className="mb-4 gap-1.5 border-primary/30 bg-primary/10 text-primary">
                <Rocket className="size-3" />
                Beta Access
              </Badge>
              <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-xl bg-primary/10">
                <Gem className="size-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold tracking-tight">
                Everyone gets Pro — free during beta
              </h3>
              <p className="mx-auto mt-3 max-w-sm text-sm text-muted-foreground">
                Pricing will be introduced in a future release. For now, all users have full Pro access with no restrictions — no credit card needed.
              </p>
              <p className="mt-6 text-xs text-muted-foreground/60">
                You&apos;ll be notified before any pricing changes take effect.
              </p>
            </div>
          </div>
        </div>
      ) : (
        /* Pricing cards */
        <div className="mt-12 grid grid-cols-1 gap-1 rounded-xl border bg-muted/40 p-1 sm:mt-16 sm:grid-cols-2 md:mt-15 md:grid-cols-3">
          {pricingPlans.map((plan) => (
            <PlanCard key={plan.name} plan={plan} />
          ))}
        </div>
      )}

      <p className="mt-6 text-center text-sm text-muted-foreground">
        All plans connect to your own storage bucket. You pay your cloud provider directly — we never touch your data.
      </p>
    </section>
  )
}

const PlanCard = ({ plan }: { plan: PricingPlan }) => {
  return (
    <div className="shadow/5 relative rounded-lg border bg-background">
      {plan.isRecommended && (
        <Badge className="absolute top-3 right-3">Most Popular</Badge>
      )}
      <div className="rounded-t-lg border-b border-dashed p-6">
        <plan.icon className="mb-5 text-primary" />
        <h3 className="font-medium text-2xl tracking-tight">{plan.name}</h3>
        <p className="my-2 text-muted-foreground">{plan.description}</p>
      </div>
      <div className="px-6 pt-5 pb-10">
        <div className="mt-4 flex items-end gap-1">
          <p className="font-semibold text-4xl tracking-tight">{plan.price}</p>
          {plan.price !== '$0' && (
            <span className="mb-1 text-muted-foreground text-sm">/month</span>
          )}
        </div>
        <p className="mt-1 text-muted-foreground text-sm">
          {plan.price === '$0' ? 'Free forever' : 'Billed monthly'}
        </p>
        <PlanCtaButton
          plan={plan.name.toLowerCase() as 'free' | 'pro' | 'team'}
          variant={plan.isRecommended ? 'default' : 'outline'}
          size="lg"
          className="my-6 w-full"
        />
        <ul className="mt-4 space-y-2">
          {plan.features.map((feature) => (
            <li className="flex items-center gap-2" key={feature}>
              <CircleCheck className="size-4 shrink-0 text-primary" />
              {feature}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default Pricing