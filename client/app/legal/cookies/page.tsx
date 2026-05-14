import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Cookie Policy — BringBucket',
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="font-semibold text-lg">{title}</h2>
      <div className="mt-3 space-y-3 text-sm text-muted-foreground leading-relaxed">{children}</div>
    </section>
  )
}

export default function CookiesPage() {
  return (
    <div>
      <h1 className="font-semibold text-3xl tracking-tight">Cookie Policy</h1>
      <p className="mt-2 text-sm text-muted-foreground">Effective date: May 1, 2025</p>

      <Section title="What Are Cookies">
        <p>
          Cookies are small text files placed on your device by a website when you visit it. They
          are widely used to make websites work properly, improve performance, and provide a better
          user experience. Cookies can be "session cookies" (deleted when you close your browser) or
          "persistent cookies" (which remain on your device for a set duration).
        </p>
        <p>
          Cookies set by the website you are visiting are called "first-party cookies." Cookies set
          by parties other than the website owner are called "third-party cookies." Third-party
          cookies may track your activity across multiple websites. BringBucket uses first-party
          cookies only for core functionality — we do not use advertising or cross-site tracking
          cookies.
        </p>
      </Section>

      <Section title="Cookies We Use">
        <p>
          BringBucket uses only strictly necessary and functional cookies. The following table
          describes each cookie we set:
        </p>
        <div className="mt-3 divide-y rounded-xl border overflow-hidden">
          {/* Header row */}
          <div className="grid grid-cols-3 px-4 py-2.5 bg-muted/50 text-xs font-medium text-foreground">
            <span>Name</span>
            <span>Purpose</span>
            <span>Duration</span>
          </div>
          {/* Data rows */}
          <div className="grid grid-cols-3 px-4 py-3 text-sm">
            <span className="font-mono text-xs font-medium text-foreground">bb_session</span>
            <span>Authentication session — keeps you logged in across page navigations</span>
            <span>30 days</span>
          </div>
          <div className="grid grid-cols-3 px-4 py-3 text-sm">
            <span className="font-mono text-xs font-medium text-foreground">bb_refresh</span>
            <span>Token refresh — used to silently renew your session without requiring re-login</span>
            <span>90 days</span>
          </div>
          <div className="grid grid-cols-3 px-4 py-3 text-sm">
            <span className="font-mono text-xs font-medium text-foreground">__theme</span>
            <span>Dark/light mode preference — remembers your display theme choice</span>
            <span>1 year</span>
          </div>
        </div>
        <p>
          None of these cookies track your activity across other websites or are used for advertising
          purposes.
        </p>
      </Section>

      <Section title="Third-Party Cookies">
        <p>
          Certain features of BringBucket involve third-party services that may set their own
          cookies:
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <span className="font-medium text-foreground">Google (OAuth authentication)</span> —
            When you click "Sign in with Google," Google may set cookies as part of the OAuth 2.0
            redirect flow to manage the authentication handshake. These cookies are subject to
            Google's Cookie Policy and are not used for advertising targeting.
          </li>
          <li>
            <span className="font-medium text-foreground">Stripe (payment session)</span> — If you
            visit the billing or upgrade page, Stripe may set a session cookie to maintain the
            payment flow state. These cookies are used solely for fraud prevention and payment
            processing; Stripe does not use them for cross-site advertising.
          </li>
        </ul>
        <p>
          We do not embed any advertising networks, social media trackers, or third-party analytics
          that use persistent cross-site cookies.
        </p>
      </Section>

      <Section title="Managing Cookies">
        <p>
          You can control or delete cookies through your browser settings. Below are links to
          instructions for the most popular browsers:
        </p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li>
            <span className="font-medium text-foreground">Google Chrome</span> — Settings → Privacy
            and security → Cookies and other site data
          </li>
          <li>
            <span className="font-medium text-foreground">Mozilla Firefox</span> — Settings →
            Privacy & Security → Cookies and Site Data
          </li>
          <li>
            <span className="font-medium text-foreground">Apple Safari</span> — Preferences →
            Privacy → Manage Website Data
          </li>
          <li>
            <span className="font-medium text-foreground">Microsoft Edge</span> — Settings →
            Cookies and site permissions → Cookies and site data
          </li>
        </ul>
        <p>
          Please note: if you block or delete session cookies (
          <span className="font-mono text-xs bg-muted px-1 py-0.5 rounded">bb_session</span> and{' '}
          <span className="font-mono text-xs bg-muted px-1 py-0.5 rounded">bb_refresh</span>),
          BringBucket will not be able to maintain your login state and you will be unable to access
          authenticated features of the Service.
        </p>
        <p>
          Blocking the{' '}
          <span className="font-mono text-xs bg-muted px-1 py-0.5 rounded">__theme</span> cookie
          will have no functional impact beyond resetting your dark/light mode preference on each
          visit.
        </p>
      </Section>

      <Section title="Contact">
        <p>
          If you have questions about our use of cookies or this Cookie Policy, please contact us:
        </p>
        <p>
          <a
            href="mailto:cookies@bringbucket.com"
            className="underline underline-offset-4 hover:text-foreground transition-colors"
          >
            cookies@bringbucket.com
          </a>
        </p>
      </Section>
    </div>
  )
}
