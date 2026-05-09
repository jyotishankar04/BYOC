import { Bird, GitBranch } from 'lucide-react'
import Link from 'next/link'
import { Separator } from '@/components/ui/separator'

const footerSections = [
  {
    title: 'Product',
    links: [
      { title: 'Features', href: '#' },
      { title: 'Integrations', href: '#' },
      { title: 'Pricing', href: '#' },
      { title: 'Changelog', href: '#' },
    ],
  },
  {
    title: 'Use Cases',
    links: [
      { title: 'Personal cloud', href: '#' },
      { title: 'Student storage', href: '#' },
      { title: 'Startups', href: '#' },
      { title: 'Developers', href: '#' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { title: 'Documentation', href: '#' },
      { title: 'Blog', href: '#' },
      { title: 'Support', href: '#' },
      { title: 'Status', href: '#' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { title: 'Privacy', href: '#' },
      { title: 'Terms', href: '#' },
      { title: 'Cookies', href: '#' },
    ],
  },
]

const Footer = () => {
  return (
    <footer className="border-t">
      <div className="mx-auto max-w-(--breakpoint-xl)">
        <div className="grid grid-cols-2 gap-x-8 gap-y-10 px-6 py-12 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 xl:px-0">
          {/* Brand */}
          <div className="col-span-full xl:col-span-3">
            <Link href="/" className="text-xl font-semibold tracking-tight">
              BYOC
            </Link>
            <p className="mt-4 max-w-xs text-muted-foreground">
              The management layer for your own cloud storage. Your bucket, your
              data, your rules.
            </p>
          </div>

          {footerSections.map(({ title, links }) => (
            <div key={title}>
              <h6 className="font-medium">{title}</h6>
              <ul className="mt-6 space-y-4">
                {links.map(({ title, href }) => (
                  <li key={title}>
                    <Link
                      className="text-muted-foreground hover:text-foreground transition-colors"
                      href={href}
                    >
                      {title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <Separator />

        <div className="flex flex-col-reverse items-center justify-between gap-x-2 gap-y-5 px-6 py-8 sm:flex-row xl:px-0">
          <span className="text-muted-foreground text-sm">
            &copy; {new Date().getFullYear()}{' '}
            <Link href="/" className="hover:text-foreground transition-colors">
              BYOC
            </Link>
            . All rights reserved.
          </span>
        </div>
      </div>
    </footer>
  )
}

export default Footer