import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Shared File — BringBucket',
  description: 'Access a shared file or folder via BringBucket secure sharing.',
}

export default function PublicShareLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
