import { Box, CircleCheck, Gem, Users, type LucideIcon } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { PlanCtaButton } from '@/components/custom/pricing/plan-cta-button'

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
  return (
    <section id="pricing" className="mx-auto max-w-6xl px-6 py-20">
      <h2 className="text-balance text-center font-medium text-4xl tracking-[-0.04em] sm:text-[2.75rem]">
        Plans &amp; Pricing
      </h2>
      <p className="mt-2 text-balance text-center text-md text-muted-foreground tracking-[-0.01em] sm:mt-4">
        Start free. Upgrade when you need more.
      </p>
      <div className="mt-12 grid grid-cols-1 gap-1 rounded-xl border bg-muted/40 p-1 sm:mt-16 sm:grid-cols-2 md:mt-15 md:grid-cols-3">
        {pricingPlans.map((plan) => (
          <PlanCard key={plan.name} plan={plan} />
        ))}
      </div>
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