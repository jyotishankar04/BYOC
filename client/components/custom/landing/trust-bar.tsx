import React from 'react'
import { HugeiconsIcon } from '@hugeicons/react'
import { UserGroup02Icon, CloudServerIcon, Shield01Icon, MoneyExchangeIcon } from '@hugeicons/core-free-icons'

const stats = [
  { icon: UserGroup02Icon, text: '500+ teams connected' },
  { icon: CloudServerIcon, text: 'S3-compatible API' },
  { icon: Shield01Icon, text: 'AES-256-GCM encrypted' },
  { icon: MoneyExchangeIcon, text: 'Zero egress on Cloudflare R2' },
]

export default function TrustBar() {
  return (
    <div className="border-y bg-muted/30">
      <div className="mx-auto max-w-6xl px-6 py-4">
        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
          {stats.map((stat, i) => (
            <React.Fragment key={stat.text}>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <HugeiconsIcon icon={stat.icon} className="size-4 text-primary/70" strokeWidth={1.5} />
                <span>{stat.text}</span>
              </div>
              {i < stats.length - 1 && (
                <span className="hidden text-border sm:block">·</span>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  )
}
