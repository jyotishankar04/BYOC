import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy — BringBucket',
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="font-semibold text-lg">{title}</h2>
      <div className="mt-3 space-y-3 text-sm text-muted-foreground leading-relaxed">{children}</div>
    </section>
  )
}

export default function PrivacyPage() {
  return (
    <div>
      <h1 className="font-semibold text-3xl tracking-tight">Privacy Policy</h1>
      <p className="mt-2 text-sm text-muted-foreground">Effective date: May 1, 2025</p>

      <Section title="Introduction">
        <p>
          BringBucket is a file management interface that lets you connect and manage your own
          S3-compatible cloud storage from a single dashboard. We believe in minimal data collection:
          we only collect what is strictly necessary to run the service. Crucially, your files always
          remain in your own cloud bucket — BringBucket never copies or stores your file contents on
          our servers.
        </p>
        <p>
          This Privacy Policy explains what personal data we collect, why we collect it, how we use
          it, and the rights you have with respect to your information. Please read it carefully. By
          using BringBucket, you agree to the practices described here.
        </p>
      </Section>

      <Section title="Information We Collect">
        <p>We collect the following categories of information:</p>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <span className="font-medium text-foreground">Account information</span> — Your name and
            email address, provided via Google OAuth at sign-up. We do not store your Google
            password.
          </li>
          <li>
            <span className="font-medium text-foreground">Usage data</span> — Pages visited, features
            used, browser type and version, operating system, and general geographic region (country).
            This data is aggregated and used to improve the product.
          </li>
          <li>
            <span className="font-medium text-foreground">Billing information</span> — Subscription
            tier, billing cycle, and payment status. All payment processing is handled by Stripe; we
            never see or store raw card numbers or full banking details.
          </li>
          <li>
            <span className="font-medium text-foreground">Workspace metadata</span> — The names,
            regions, and endpoints of cloud storage buckets you configure. We store this metadata to
            power the dashboard. We do not access or store the contents of your files.
          </li>
          <li>
            <span className="font-medium text-foreground">Storage credentials</span> — Access keys
            and secrets you provide to connect a storage provider are encrypted at rest using
            AES-256-GCM before being written to our database. They are never logged and are decrypted
            only transiently to perform operations you explicitly request.
          </li>
        </ul>
      </Section>

      <Section title="How We Use Your Information">
        <p>We use the information we collect to:</p>
        <ul className="list-disc pl-5 space-y-2">
          <li>Provide, operate, and improve the BringBucket service.</li>
          <li>Authenticate you and maintain your session securely.</li>
          <li>
            Send transactional emails such as account confirmations, password resets, and important
            service updates. We do not send marketing emails without your explicit consent.
          </li>
          <li>Calculate usage and billing, and process payments via Stripe.</li>
          <li>
            Detect, investigate, and prevent fraudulent transactions, abuse, and other illegal
            activities.
          </li>
          <li>Respond to your support requests and inquiries.</li>
          <li>
            Comply with legal obligations, such as responding to valid law enforcement requests.
          </li>
        </ul>
      </Section>

      <Section title="Third-Party Services">
        <p>
          BringBucket integrates with the following third-party services to deliver its
          functionality. Each operates under its own privacy policy:
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <span className="font-medium text-foreground">Google OAuth</span> — Used for
            authentication. Google receives your consent and issues an identity token; we store only
            your name and email from that token.
          </li>
          <li>
            <span className="font-medium text-foreground">Stripe</span> — Handles billing and
            subscription management. Stripe processes and stores payment card information on their
            PCI-DSS-compliant infrastructure.
          </li>
          <li>
            <span className="font-medium text-foreground">Cloudflare</span> — Provides CDN delivery
            and DDoS protection. Cloudflare may process request metadata (IP address, headers) as
            traffic passes through their network.
          </li>
          <li>
            <span className="font-medium text-foreground">AWS SDK</span> — BringBucket uses the AWS
            SDK to make S3-compatible API calls on your behalf, using only the credentials you
            provide for your own storage account.
          </li>
          <li>
            <span className="font-medium text-foreground">Resend</span> — Used to deliver
            transactional emails (e.g., account verification, notifications). Only your email address
            and the content of the email are shared.
          </li>
        </ul>
        <p>
          We do not sell your personal data to any third party, and we do not share your data with
          advertising networks.
        </p>
      </Section>

      <Section title="Data Retention">
        <p>
          We retain your account data for the duration of your active account plus 90 days following
          account deletion, to allow for recovery and to fulfill any outstanding obligations.
        </p>
        <p>
          Encrypted storage credentials (access keys, secrets) are deleted immediately and
          permanently when you disconnect a provider from your workspace.
        </p>
        <p>
          Application and access logs are retained for 30 days, after which they are automatically
          purged. Aggregated, anonymized analytics may be kept indefinitely.
        </p>
      </Section>

      <Section title="Your Rights">
        <p>
          Depending on your location, you may have the following rights regarding your personal data:
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <span className="font-medium text-foreground">Access</span> — Request a copy of the
            personal data we hold about you.
          </li>
          <li>
            <span className="font-medium text-foreground">Correction</span> — Ask us to correct any
            inaccurate or incomplete information.
          </li>
          <li>
            <span className="font-medium text-foreground">Deletion</span> — Request erasure of your
            personal data ("right to be forgotten"). Note that some data may be retained where
            required by law.
          </li>
          <li>
            <span className="font-medium text-foreground">Portability</span> — Receive your personal
            data in a structured, commonly used format to transfer to another service.
          </li>
          <li>
            <span className="font-medium text-foreground">Opt-out</span> — Opt out of marketing
            communications at any time using the unsubscribe link in any email or by contacting us
            directly.
          </li>
        </ul>
        <p>
          To exercise any of these rights, please contact us at{' '}
          <a href="mailto:privacy@bringbucket.com" className="underline underline-offset-4 hover:text-foreground transition-colors">
            privacy@bringbucket.com
          </a>
          . We will respond within 30 days.
        </p>
      </Section>

      <Section title="Cookies">
        <p>
          We use strictly necessary session cookies to keep you authenticated while you use
          BringBucket. We do not use advertising cookies, cross-site tracking pixels, or third-party
          analytics cookies that profile you across the web.
        </p>
        <p>
          We also store a lightweight preference cookie for your dark/light mode choice. This cookie
          does not identify you personally. For full details, please see our{' '}
          <a href="/legal/cookies" className="underline underline-offset-4 hover:text-foreground transition-colors">
            Cookie Policy
          </a>
          .
        </p>
      </Section>

      <Section title="Children's Privacy">
        <p>
          BringBucket is not intended for use by anyone under the age of 13, and we do not knowingly
          collect personal data from minors. If you believe a child under 13 has provided us with
          personal information, please contact us immediately at{' '}
          <a href="mailto:privacy@bringbucket.com" className="underline underline-offset-4 hover:text-foreground transition-colors">
            privacy@bringbucket.com
          </a>{' '}
          and we will promptly delete that information.
        </p>
      </Section>

      <Section title="Changes to This Policy">
        <p>
          We may update this Privacy Policy from time to time. If we make material changes — changes
          that meaningfully affect how we collect or use your data — we will email registered users
          at least 14 days before those changes take effect.
        </p>
        <p>
          For non-material changes (e.g., clarifications, fixing typos), we will update the effective
          date at the top of this page. Continued use of BringBucket after changes take effect
          constitutes your acceptance of the revised policy.
        </p>
      </Section>

      <Section title="Contact">
        <p>
          If you have any questions, concerns, or requests regarding this Privacy Policy or how we
          handle your data, please contact us:
        </p>
        <p>
          <a href="mailto:privacy@bringbucket.com" className="underline underline-offset-4 hover:text-foreground transition-colors">
            privacy@bringbucket.com
          </a>
          <br />
          BringBucket, Inc.
        </p>
      </Section>
    </div>
  )
}
