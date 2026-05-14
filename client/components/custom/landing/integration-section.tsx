import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import * as React from 'react'

const providers = [
  {
    name: 'AWS S3',
    description: 'Scalable, reliable object storage from Amazon Web Services.',
    url: 'https://aws.amazon.com',
  },
  {
    name: 'Cloudflare R2',
    description: 'S3-compatible object storage with zero egress fees.',
    url: 'https://cloudflare.com',
  },
  {
    name: 'Google Cloud Storage',
    description: 'Scalable buckets on Google Cloud Platform.',
    url: 'https://cloud.google.com',
  },
] as const

export default function IntegrationsSection() {
  return (
    <section>
      <div className="bg-muted dark:bg-background py-24 md:py-32">
        <div className="mx-auto max-w-5xl px-6">
          {/* Card stack with radial fade mask */}
          <div className="mx-auto max-w-md px-6 [mask-image:radial-gradient(ellipse_100%_100%_at_50%_0%,#000_70%,transparent_100%)]">
            <div className="bg-background dark:bg-muted/50 rounded-xl border px-6 pb-12 pt-3 shadow-xl">
              {providers.map((provider) => (
                <Integration
                  key={provider.name}
                  url={provider.url}
                  name={provider.name}
                  description={provider.description}
                />
              ))}
            </div>
          </div>

          {/* Heading + CTA */}
          <div className="mx-auto mt-6 max-w-lg space-y-6 text-center">
            <h2 className="text-balance text-3xl font-semibold md:text-4xl lg:text-5xl">
              Bring your own storage
            </h2>
            <p className="text-muted-foreground">
              Connect any S3-compatible provider in minutes. Your data stays in
              your bucket — we just make it easier to manage.
            </p>
            <Button variant="outline" size={"lg"} asChild>
              <Link href="/auth/signup">Get Started</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}

const Integration = ({
  url,
  name,
  description,
}: {
  url: string
  name: string
  description: string
}) => {
  return (
    <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3 border-b border-dashed py-3 last:border-b-0">
      <div className="bg-muted border-foreground/5 flex size-12 items-center justify-center rounded-lg border">
        <img
          src={`https://www.google.com/s2/favicons?domain=${encodeURIComponent(url)}&sz=64`}
          alt=""
          className="size-6 rounded"
        />
      </div>
      <div className="space-y-0.5">
        <h3 className="text-sm font-medium">{name}</h3>
        <p className="text-muted-foreground line-clamp-1 text-sm">
          {description}
        </p>
      </div>
      <Link href="/auth/signup">
        <Button variant="outline" size="icon" aria-label={`Add ${name} integration`}>
          <Plus className="size-4" />
        </Button>
      </Link>
    </div>
  )
}