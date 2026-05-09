import { KeyRound, Lock, RefreshCw, UserCheck } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export const securityFeatures = [
  {
    title: 'Encrypted credentials',
    description:
      'Cloud access keys are encrypted before saving and never exposed directly.',
    icon: Lock,
  },
  {
    title: 'Private access',
    description:
      'Files stay inside your own cloud bucket with controlled, scoped access.',
    icon: KeyRound,
  },
  {
    title: 'No vendor lock-in',
    description:
      'Disconnect or move to another supported provider anytime — no migration tax.',
    icon: RefreshCw,
  },
  {
    title: 'User-owned storage',
    description:
      'BYOC manages the interface; the storage stays fully owned by you.',
    icon: UserCheck,
  },
]

const SecurityFeatures = () => {
  return (
    <div className="mx-auto flex max-w-7xl flex-col px-6 py-20">
      <h2 className="text-pretty text-center font-medium text-4xl tracking-[-0.04em] sm:text-[2.75rem]">
        Your storage, your keys, your rules
      </h2>
      <p className="-tracking[0.01em] mt-3 text-pretty text-center text-muted-foreground text-md">
        BYOC is the management layer — you own the bucket and the data inside it.
      </p>
      <div className="mt-16 grid grid-cols-1 gap-1 rounded-xl border bg-muted/40 p-1 sm:mt-20 sm:grid-cols-2 lg:grid-cols-4">
        {securityFeatures.map((feature, index) => (
          <div
            className="relative overflow-hidden rounded-lg border bg-card px-5 py-7"
            key={feature.title}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/5 text-primary dark:bg-primary/10">
              <feature.icon className="size-5" />
            </div>
            <h3 className="mt-5 font-medium text-lg tracking-[-0.005em]">
              {feature.title}
            </h3>
            <p className="mt-2 text-foreground/80">{feature.description}</p>
            <Badge
              className="absolute top-0 right-0 rounded-none border-t-0 border-r-0 bg-muted/30 font-mono dark:border-foreground/15 dark:bg-background"
              variant="outline"
            >
              {(index + 1).toString().padStart(2, '0')}
            </Badge>
          </div>
        ))}
      </div>
    </div>
  )
}

export default SecurityFeatures