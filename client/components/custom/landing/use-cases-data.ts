import { Cloud, GraduationCap, Rocket, Code2 } from 'lucide-react'

export const useCases = [
  {
    key: 'item-1' as const,
    icon: Cloud,
    title: 'Personal cloud',
    short: 'Your photos, documents, and backups in one place',
    description:
      'Manage personal photos, documents, videos, and backups from one dashboard — your bucket, your rules, your data.',
    image: '/personal-cloud.png',
    alt: 'Personal cloud dashboard with photos and documents',
  },
  {
    key: 'item-2' as const,
    icon: GraduationCap,
    title: 'Student storage',
    short: "Notes, PDFs, and projects that won't disappear at semester end",
    description:
      'Store notes, PDFs, assignments, projects, and study materials securely. No paywall surprises, no expiring trials — just your own bucket.',
    image: '/student-view.png',
    alt: 'Student file dashboard with PDFs and notes',
  },
  {
    key: 'item-3' as const,
    icon: Rocket,
    title: 'Startup file manager',
    short: 'A file UI for your team, on top of cloud you already pay for',
    description:
      'Give small teams a simple file management layer over their own cloud storage. Skip the per-seat SaaS pricing — pay your provider, not a middleman.',
    image: '/startup-files.png',
    alt: 'Team file management dashboard',
  },
  {
    key: 'item-4' as const,
    icon: Code2,
    title: 'Developer asset storage',
    short: 'Project files, exports, and logs in a bucket you control',
    description:
      'Store project files, images, exports, logs, and app assets in your own bucket. Browse, preview, and audit usage without writing a custom dashboard.',
    image: '/developer-assets.png',
    alt: 'Developer asset browser with logs and exports',
  },
]

export type UseCaseKey = (typeof useCases)[number]['key']
