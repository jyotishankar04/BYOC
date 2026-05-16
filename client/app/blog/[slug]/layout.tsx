import type { Metadata } from 'next'

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Blog Post — BringBucket',
    description: 'Read the latest insights and updates from the BringBucket team.',
    openGraph: { type: 'article' },
  }
}

export default function BlogPostLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
