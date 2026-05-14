import { Badge } from '@/components/ui/badge'

export const metadata = {
  title: 'Changelog — BringBucket',
}

const entries = [
  {
    version: 'v0.6.0',
    date: 'May 2025',
    title: 'Provider onboarding redesign',
    changes: [
      'Redesigned provider selection with 3-column grid, feature badges per provider, improved selection states',
      'Added "Why connect your own storage?" info card',
      'Coming soon providers now show with reduced opacity and Soon badge',
    ],
  },
  {
    version: 'v0.5.2',
    date: 'Apr 2025',
    title: 'Private file sharing',
    changes: [
      'Generate scoped pre-signed URLs for any file with configurable expiration (1h–30d)',
      'Password-protect share links',
      'Track link visits with analytics',
      'Disable or revoke links instantly',
    ],
  },
  {
    version: 'v0.5.0',
    date: 'Mar 2025',
    title: 'Usage analytics dashboard',
    changes: [
      'New /analytics page with storage breakdown by file type',
      'Estimated monthly cost calculator based on your provider\'s pricing',
      'Bandwidth usage tracking',
      '30-day historical charts',
    ],
  },
  {
    version: 'v0.4.1',
    date: 'Feb 2025',
    title: 'MinIO and Supabase support',
    changes: [
      'Connect self-hosted MinIO instances',
      'Connect Supabase Storage via S3-compatible API',
      'Both require Pro plan',
      'Added provider-specific setup guides with step-by-step instructions',
    ],
  },
  {
    version: 'v0.3.0',
    date: 'Jan 2025',
    title: 'Dark mode and theme system',
    changes: [
      'Full dark mode support using next-themes',
      'System-aware theme detection',
      'All UI components adapted for light and dark',
      'Theme-aware logo and icons',
    ],
  },
  {
    version: 'v0.2.0',
    date: 'Dec 2024',
    title: 'Initial public launch',
    changes: [
      'First public release of BringBucket',
      'AWS S3 and Cloudflare R2 support',
      'Basic file manager with folder navigation',
      'Storage usage overview',
      'Workspace invitations',
    ],
  },
]

export default function ChangelogPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-20 md:py-28">
      <span className="rounded-full border px-3 py-1 text-sm text-muted-foreground">
        Changelog
      </span>

      <h1 className="mt-6 font-semibold text-4xl tracking-tight">
        What&apos;s new
      </h1>

      <p className="mt-3 text-muted-foreground">
        Product updates and improvements to BringBucket.
      </p>

      <ol className="relative mt-16 ml-3 border-l border-border space-y-12">
        {entries.map(({ version, date, title, changes }) => (
          <li key={version} className="relative pl-8">
            <span className="absolute -left-[9px] top-1.5 size-4 rounded-full border-2 border-primary bg-background" />

            <div className="flex items-center gap-3">
              <Badge variant="outline" className="font-mono text-xs">
                {version}
              </Badge>
              <span className="text-xs text-muted-foreground">{date}</span>
            </div>

            <h3 className="mt-2 font-semibold text-lg">{title}</h3>

            <ul className="mt-2 space-y-1 text-sm text-muted-foreground list-disc pl-4">
              {changes.map((change) => (
                <li key={change}>{change}</li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
    </div>
  )
}
