import { Avatar, AvatarFallback } from '@/components/ui/avatar'

const testimonials = [
  {
    quote:
      "We replaced Dropbox Business for our team of 8 and cut our storage bill by 60%. The Cloudflare R2 zero-egress was the tipping point — we were paying hundreds monthly just to serve files.",
    name: 'James T.',
    role: 'Lead Engineer',
    company: 'Fintech startup',
    initials: 'JT',
    color: 'bg-blue-500/10 text-blue-600',
  },
  {
    quote:
      "As a developer, I already had an S3 bucket for assets. BringBucket gave me a proper file manager without building one myself. Setup took under 3 minutes.",
    name: 'Priya R.',
    role: 'Indie developer',
    company: 'Side projects',
    initials: 'PR',
    color: 'bg-purple-500/10 text-purple-600',
  },
  {
    quote:
      "The BYOC model is exactly what we needed for compliance. Our files never leave our own AWS account, which makes our security team happy and keeps us in control of our data.",
    name: 'Daniel M.',
    role: 'CTO',
    company: 'HealthTech SaaS',
    initials: 'DM',
    color: 'bg-emerald-500/10 text-emerald-600',
  },
]

export default function TestimonialsSection() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-20 md:py-28">
      <div className="text-center">
        <span className="rounded-full border px-3 py-1 text-sm text-muted-foreground">
          Testimonials
        </span>
        <h2 className="mt-6 font-semibold text-4xl tracking-tight">
          Trusted by teams who own their data
        </h2>
      </div>
      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {testimonials.map((t) => (
          <div key={t.name} className="flex flex-col gap-5 rounded-xl border bg-card p-6">
            <span className="text-4xl leading-none font-serif text-primary/20">&ldquo;</span>
            <p className="flex-1 text-sm text-muted-foreground leading-relaxed -mt-3">
              {t.quote}
            </p>
            <div className="flex items-center gap-3 border-t pt-4">
              <Avatar className="size-9">
                <AvatarFallback className={`text-xs font-semibold ${t.color}`}>
                  {t.initials}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium">{t.name}</p>
                <p className="text-xs text-muted-foreground">
                  {t.role} · {t.company}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
