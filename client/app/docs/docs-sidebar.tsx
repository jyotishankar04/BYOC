'use client'

import { useState, useEffect } from 'react'

const sections = [
  { id: 'overview', label: 'Overview' },
  { id: 'getting-started', label: 'Getting Started' },
  {
    id: 'connecting-providers',
    label: 'Connecting Providers',
    children: [
      { id: 'aws-s3', label: 'AWS S3' },
      { id: 'cloudflare-r2', label: 'Cloudflare R2' },
      { id: 'minio', label: 'MinIO' },
      { id: 'supabase-storage', label: 'Supabase Storage' },
    ],
  },
  { id: 'file-manager', label: 'File Manager' },
  { id: 'sharing-links', label: 'Sharing & Links' },
  { id: 'security', label: 'Security Model' },
]

const ALL_IDS = [
  'overview',
  'getting-started',
  'connecting-providers',
  'aws-s3',
  'cloudflare-r2',
  'minio',
  'supabase-storage',
  'file-manager',
  'sharing-links',
  'security',
]

export function DocsSidebar() {
  const [active, setActive] = useState('overview')

  useEffect(() => {
    const observers: IntersectionObserver[] = []
    ALL_IDS.forEach((id) => {
      const el = document.getElementById(id)
      if (!el) return
      const ob = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActive(id)
        },
        { rootMargin: '-8% 0px -80% 0px' },
      )
      ob.observe(el)
      observers.push(ob)
    })
    return () => observers.forEach((o) => o.disconnect())
  }, [])

  return (
    <nav aria-label="Documentation navigation" className="sticky top-24 space-y-0.5 text-sm">
      {sections.map((section) => (
        <div key={section.id}>
          <a
            href={`#${section.id}`}
            className={`block rounded-lg px-3 py-1.5 transition-colors ${
              active === section.id
                ? 'bg-primary/10 text-primary font-medium'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
            }`}
          >
            {section.label}
          </a>
          {section.children?.map((child) => (
            <a
              key={child.id}
              href={`#${child.id}`}
              className={`block rounded-lg px-3 py-1.5 pl-6 transition-colors text-xs ${
                active === child.id
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }`}
            >
              {child.label}
            </a>
          ))}
        </div>
      ))}
    </nav>
  )
}
