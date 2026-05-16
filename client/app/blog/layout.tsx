import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Blog — BringBucket',
  description: 'Insights, updates, and guides from the BringBucket team. Learn about cloud storage, file management, and BYOC best practices.',
  openGraph: {
    title: 'BringBucket Blog',
    description: 'Insights, updates, and guides from the BringBucket team.',
    type: 'website',
  },
}

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
