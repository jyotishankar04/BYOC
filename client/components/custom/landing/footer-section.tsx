import Link from 'next/link'
import { Separator } from '@/components/ui/separator'
import { Logo } from '@/components/common/logo'

const footerSections = [
  {
    title: 'Product',
    links: [
      { title: 'Features', href: '#features' },
      { title: 'Integrations', href: '#how-it-works' },
      { title: 'Pricing', href: '#pricing' },
      { title: 'Security', href: '#security' },
      { title: 'About', href: '/about' },
      { title: 'Changelog', href: '/changelog' },
    ],
  },
  {
    title: 'Use Cases',
    links: [
      { title: 'Personal cloud', href: '/use-cases/personal-cloud' },
      { title: 'Student storage', href: '/use-cases/student-storage' },
      { title: 'Startups', href: '/use-cases/startup-file-manager' },
      { title: 'Developers', href: '/use-cases/developer-asset-storage' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { title: 'Documentation', href: '/docs' },
      { title: 'Blog', href: '/blog' },
      { title: 'Support', href: '/support' },
      { title: 'Status', href: '/status' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { title: 'Privacy Policy', href: '/legal/privacy' },
      { title: 'Terms of Service', href: '/legal/terms' },
      { title: 'Cookie Policy', href: '/legal/cookies' },
    ],
  },
]

const socialLinks = [
  {
    name: 'GitHub',
    href: '#',
    icon: (
      <svg viewBox="0 0 24 24" className="size-4" fill="currentColor" aria-hidden>
        <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
      </svg>
    ),
  },
  {
    name: 'X (Twitter)',
    href: '#',
    icon: (
      <svg viewBox="0 0 24 24" className="size-4" fill="currentColor" aria-hidden>
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
]

const Footer = () => {
  return (
    <footer className="border-t bg-muted/20 dark:bg-transparent">
      <div className="mx-auto max-w-(--breakpoint-xl)">
        <div className="grid grid-cols-2 gap-x-8 gap-y-10 px-6 py-12 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 xl:px-0">
          {/* Brand */}
          <div className="col-span-full xl:col-span-3">
            <Logo href="/" />
            <p className="mt-4 max-w-xs text-sm text-muted-foreground leading-relaxed">
              The management layer for your own cloud storage. Your bucket, your
              data, your rules.
            </p>
            <div className="mt-5 flex items-center gap-3">
              {socialLinks.map((social) => (
                <Link
                  key={social.name}
                  href={social.href}
                  aria-label={social.name}
                  className="flex size-8 items-center justify-center rounded-md border text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground"
                >
                  {social.icon}
                </Link>
              ))}
            </div>
          </div>

          {footerSections.map(({ title, links }) => (
            <div key={title}>
              <h6 className="text-sm font-semibold">{title}</h6>
              <ul className="mt-4 space-y-3">
                {links.map(({ title, href }) => (
                  <li key={title}>
                    <Link
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
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

        <div className="flex flex-col-reverse items-center justify-between gap-x-2 gap-y-4 px-6 py-6 text-sm sm:flex-row xl:px-0">
          <span className="text-muted-foreground">
            &copy; {new Date().getFullYear()}{' '}
            <Link href="/" className="hover:text-foreground transition-colors font-medium">
              BringBucket
            </Link>
            . All rights reserved.
          </span>
          <span className="text-muted-foreground/60 text-xs">
            Your files stay in your cloud. Always.
          </span>
        </div>
      </div>
    </footer>
  )
}

export default Footer
