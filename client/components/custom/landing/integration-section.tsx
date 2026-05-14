import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Plus, Clock } from 'lucide-react'
import * as React from 'react'

const providers = [
  {
    name: 'AWS S3',
    description: 'Scalable, reliable object storage from Amazon Web Services.',
    url: 'https://aws.amazon.com',
    available: true,
  },
  {
    name: 'Cloudflare R2',
    description: 'S3-compatible object storage with zero egress fees.',
    url: 'https://cloudflare.com',
    available: true,
  },
  {
    name: 'Google Cloud Storage',
    description: 'Scalable object storage with global availability on GCP.',
    url: 'https://cloud.google.com',
    available: false,
  },
  {
    name: 'Backblaze B2',
    description: 'Affordable S3-compatible cloud storage at $0.006/GB.',
    url: 'https://backblaze.com',
    available: false,
  },
  {
    name: 'DigitalOcean Spaces',
    description: 'Simple, S3-compatible object storage from DigitalOcean.',
    url: 'https://digitalocean.com',
    available: false,
  },
] as const

export default function IntegrationsSection() {
  return (
    <section id="integrations">
      <div className="bg-muted/40 dark:bg-background py-24 md:py-32">
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
                  available={provider.available}
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
            <Button variant="outline" size="lg" asChild>
              <Link href="/auth/signup">Get Started Free</Link>
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
  available,
}: {
  url: string
  name: string
  description: string
  available: boolean
}) => {
  return (
    <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3 border-b border-dashed py-3 last:border-b-0">
      <div className="bg-muted border-foreground/5 flex size-12 items-center justify-center rounded-lg border">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`https://www.google.com/s2/favicons?domain=${encodeURIComponent(url)}&sz=64`}
          alt=""
          className={`size-6 rounded ${!available ? 'opacity-40 grayscale' : ''}`}
        />
      </div>
      <div className="space-y-0.5">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-medium">{name}</h3>
          {!available && (
            <span className="rounded-full border px-1.5 py-0.5 text-[10px] text-muted-foreground">
              Soon
            </span>
          )}
        </div>
        <p className="text-muted-foreground line-clamp-1 text-sm">
          {description}
        </p>
      </div>
      {available ? (
        <Link href="/auth/signup">
          <Button variant="outline" size="icon" aria-label={`Connect ${name}`}>
            <Plus className="size-4" />
          </Button>
        </Link>
      ) : (
        <Button variant="ghost" size="icon" disabled aria-label={`${name} coming soon`}>
          <Clock className="size-4 text-muted-foreground" />
        </Button>
      )}
    </div>
  )
}
