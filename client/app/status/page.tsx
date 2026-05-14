import type { Metadata } from 'next'
import { HugeiconsIcon } from '@hugeicons/react'
import { CheckmarkCircle02Icon, Alert01Icon, Clock01Icon } from '@hugeicons/core-free-icons'
import { Badge } from '@/components/ui/badge'

export const metadata: Metadata = {
  title: 'System Status — BringBucket',
}

const services = [
  {
    name: 'API',
    uptime: '99.98%',
    bars: { green: 85, amber: 3, red: 2 },
    status: 'Operational' as const,
  },
  {
    name: 'File Upload & Download',
    uptime: '99.95%',
    bars: { green: 84, amber: 4, red: 2 },
    status: 'Operational' as const,
  },
  {
    name: 'Authentication',
    uptime: '100%',
    bars: { green: 90, amber: 0, red: 0 },
    status: 'Operational' as const,
  },
  {
    name: 'Dashboard',
    uptime: '99.97%',
    bars: { green: 86, amber: 3, red: 1 },
    status: 'Operational' as const,
  },
]

const incidents = [
  {
    date: 'Apr 12, 2025',
    title: 'Elevated API latency',
    status: 'Resolved',
    description:
      'Some users experienced increased response times on file list operations for approximately 22 minutes. Root cause: database query optimization issue. Resolved by adding compound index.',
  },
  {
    date: 'Mar 28, 2025',
    title: 'File upload timeout for large files',
    status: 'Resolved',
    description:
      'Multipart uploads over 500 MB timed out for some users. Root cause: proxy timeout misconfiguration. Resolved by increasing timeout limits and improving chunking behavior.',
  },
  {
    date: 'Feb 14, 2025',
    title: 'Authentication service slowdown',
    status: 'Resolved',
    description:
      'OAuth login was intermittently slow for ~8 minutes due to a token validation bottleneck. Resolved by caching validation responses.',
  },
]

export default function StatusPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-20 md:py-28">
      {/* Overall status banner */}
      <div className="flex items-center gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
        <HugeiconsIcon
          icon={CheckmarkCircle02Icon}
          className="size-6 text-emerald-600"
          strokeWidth={1.5}
        />
        <div>
          <p className="font-semibold text-emerald-700 dark:text-emerald-400">
            All systems operational
          </p>
          <p className="text-xs text-emerald-600/80 dark:text-emerald-500/80">
            Last checked{' '}
            {new Date().toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })}
          </p>
        </div>
      </div>

      {/* Services */}
      <div className="mt-10">
        <h2 className="font-semibold text-xl tracking-tight">Service Status</h2>
        <div className="mt-4 rounded-xl border overflow-hidden divide-y">
          {services.map((service) => (
            <div key={service.name} className="px-5 py-4 flex items-center gap-4">
              <span className="font-medium text-sm w-48 shrink-0">{service.name}</span>
              <div className="flex-1 flex items-end gap-0.5">
                {Array.from({ length: service.bars.green }).map((_, i) => (
                  <div
                    key={`g-${i}`}
                    className="h-8 w-1.5 rounded-sm bg-emerald-500 dark:bg-emerald-600"
                  />
                ))}
                {Array.from({ length: service.bars.amber }).map((_, i) => (
                  <div key={`a-${i}`} className="h-8 w-1.5 rounded-sm bg-amber-400" />
                ))}
                {Array.from({ length: service.bars.red }).map((_, i) => (
                  <div key={`r-${i}`} className="h-8 w-1.5 rounded-sm bg-red-400" />
                ))}
              </div>
              <span className="text-xs text-muted-foreground w-12 text-right">
                {service.uptime}
              </span>
              <Badge
                variant="outline"
                className="text-emerald-600 border-emerald-500/30 text-xs"
              >
                {service.status}
              </Badge>
            </div>
          ))}
        </div>
      </div>

      {/* Incident history */}
      <div className="mt-16">
        <h2 className="font-semibold text-xl tracking-tight">Recent Incidents</h2>
        <div className="mt-4 space-y-4">
          {incidents.map((incident) => (
            <div key={incident.title} className="rounded-xl border bg-card p-5">
              <div className="flex items-center justify-between gap-4">
                <span className="font-medium text-sm">{incident.title}</span>
                <div className="flex items-center shrink-0">
                  <Badge
                    variant="outline"
                    className="text-emerald-600 border-emerald-500/30"
                  >
                    Resolved
                  </Badge>
                  <span className="text-xs text-muted-foreground ml-2">{incident.date}</span>
                </div>
              </div>
              <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                {incident.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
