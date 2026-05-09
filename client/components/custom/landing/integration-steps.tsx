import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { KeyRound, ShieldCheck, FolderOpen } from 'lucide-react'
import { ReactNode } from 'react'

const steps = [
  {
    step: '01',
    icon: KeyRound,
    title: 'Add credentials',
    description:
      'Enter your access key, secret, bucket name, region, and endpoint URL.',
  },
  {
    step: '02',
    icon: ShieldCheck,
    title: 'Verify securely',
    description:
      'We test bucket access, then encrypt and store your credentials at rest.',
  },
  {
    step: '03',
    icon: FolderOpen,
    title: 'Start managing',
    description:
      'Upload, preview, organize files, and monitor storage usage in real time.',
  },
] as const

export default function StepsSection() {
  return (
    <section className="bg-zinc-50 py-16 md:py-32 dark:bg-transparent">
      <div className="@container mx-auto max-w-5xl px-6">
        <div className="text-center">
          <span className="text-muted-foreground font-mono text-xs tracking-[0.2em] uppercase">
            How it works
          </span>
          <h2 className="mt-4 text-balance text-4xl font-semibold lg:text-5xl">
            Connect in three steps
          </h2>
          <p className="text-muted-foreground mt-4">
            Up and running with any S3-compatible provider in minutes — no
            migration, no lock-in.
          </p>
        </div>

        <div className="@min-4xl:max-w-full @min-4xl:grid-cols-3 mx-auto mt-8 grid max-w-sm gap-6 *:text-center md:mt-16">
          {steps.map((s) => {
            const Icon = s.icon
            return (
              <Card key={s.step} className="group shadow-zinc-950/5">
                <CardHeader className="pb-3">
                  <CardDecorator>
                    <Icon className="size-6" aria-hidden />
                  </CardDecorator>

                  <span className="text-muted-foreground/80 mt-6 block font-mono text-[10px] font-semibold uppercase tracking-[0.2em]">
                    Step {s.step}
                  </span>
                  <h3 className="mt-1 font-medium">{s.title}</h3>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{s.description}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}

const CardDecorator = ({ children }: { children: ReactNode }) => (
  <div className="mask-radial-from-40% mask-radial-to-60% relative mx-auto size-36 duration-200 [--color-border:color-mix(in_oklab,var(--color-zinc-950)10%,transparent)] group-hover:[--color-border:color-mix(in_oklab,var(--color-zinc-950)20%,transparent)] dark:[--color-border:color-mix(in_oklab,var(--color-white)15%,transparent)] dark:group-hover:[--color-border:color-mix(in_oklab,var(--color-white)20%,transparent)]">
    <div
      aria-hidden
      className="absolute inset-0 bg-[linear-gradient(to_right,var(--color-border)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-border)_1px,transparent_1px)] bg-[size:24px_24px] dark:opacity-50"
    />
    <div className="bg-background absolute inset-0 m-auto flex size-12 items-center justify-center border-l border-t">
      {children}
    </div>
  </div>
)