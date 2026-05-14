import Link from 'next/link'
import { HugeiconsIcon } from '@hugeicons/react'
import { LockIcon, ArrowRight02Icon, EyeIcon } from '@hugeicons/core-free-icons'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

export const metadata = {
  title: 'About — BringBucket',
}

const values = [
  {
    icon: LockIcon,
    title: 'Privacy first',
    description:
      'Your files never touch our servers. Credentials are encrypted, sessions are scoped, and you can audit or revoke access at any time.',
  },
  {
    icon: ArrowRight02Icon,
    title: 'No lock-in',
    description:
      'Disconnect your storage provider anytime. Your files stay exactly where they are — in your own cloud bucket, owned by you.',
  },
  {
    icon: EyeIcon,
    title: 'Radical transparency',
    description:
      'Transparent pricing, open billing estimates, and honest about what data we collect. No hidden charges, no surprise fees.',
  },
]

const team = [
  {
    name: 'Alex Chen',
    initials: 'AC',
    role: 'Founder & CEO',
    bio: 'Former infrastructure engineer. Obsessed with developer tooling and data privacy.',
  },
  {
    name: 'Sara Kim',
    initials: 'SK',
    role: 'Engineering',
    bio: 'Full-stack engineer. Previously worked on cloud storage systems at a Fortune 500.',
  },
  {
    name: 'Marcus Rivera',
    initials: 'MR',
    role: 'Design',
    bio: 'Product designer focused on making complex technical interfaces feel intuitive.',
  },
]

export default function AboutPage() {
  return (
    <>
      {/* Section 1 — Hero */}
      <section className="mx-auto max-w-6xl px-6 py-20 md:py-28">
        <span className="rounded-full border px-3 py-1 text-sm text-muted-foreground">
          About BringBucket
        </span>

        <h1 className="mt-6 max-w-2xl font-semibold text-4xl tracking-tight lg:text-5xl">
          Built for people who own their data
        </h1>

        <p className="mt-6 max-w-2xl text-muted-foreground leading-relaxed">
          Most file storage tools make a tradeoff you didn&apos;t agree to: give us
          your data, and we&apos;ll make it easy to manage. BringBucket flips that
          model. You bring your own S3-compatible cloud storage — AWS S3,
          Cloudflare R2, MinIO, or Supabase — and we provide the interface.
        </p>

        <p className="mt-4 max-w-2xl text-muted-foreground leading-relaxed">
          We started BringBucket because we wanted the simplicity of tools like
          Dropbox, but without handing our data to a third party. If you have an
          AWS account or a Cloudflare account, you already have the storage. You
          just need a clean dashboard to manage it.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/auth/signup">Start for free</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="#values">Learn more</Link>
          </Button>
        </div>
      </section>

      {/* Section 2 — Values */}
      <section id="values" className="mx-auto max-w-6xl px-6 py-16 border-t">
        <span className="rounded-full border px-3 py-1 text-sm text-muted-foreground">
          Our values
        </span>

        <h2 className="mt-6 font-semibold text-3xl tracking-tight">
          What we believe
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
          {values.map(({ icon, title, description }) => (
            <div key={title} className="rounded-xl border bg-card p-6">
              <div className="size-10 rounded-lg bg-primary/5 text-primary flex items-center justify-center p-2.5">
                <HugeiconsIcon icon={icon} className="size-full" strokeWidth={1.5} />
              </div>
              <h3 className="mt-4 font-semibold text-base">{title}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                {description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Section 3 — Team */}
      <section className="mx-auto max-w-6xl px-6 py-16 border-t">
        <span className="rounded-full border px-3 py-1 text-sm text-muted-foreground">
          The team
        </span>

        <h2 className="mt-6 font-semibold text-3xl tracking-tight">
          Small team, big vision
        </h2>

        <p className="mt-3 text-muted-foreground max-w-xl">
          We&apos;re a small team of engineers and designers who care deeply about
          data ownership and developer tooling.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-10">
          {team.map(({ name, initials, role, bio }) => (
            <div
              key={name}
              className="rounded-xl border bg-card p-6 flex flex-col items-center text-center gap-3"
            >
              <Avatar className="size-16">
                <AvatarFallback className="bg-primary/10 text-primary font-semibold text-lg">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold">{name}</p>
                <p className="text-sm text-muted-foreground">{role}</p>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{bio}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  )
}
