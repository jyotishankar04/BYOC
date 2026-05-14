import type { Metadata } from 'next'
import { securityFeatures } from '@/components/custom/landing/security-section'

export const metadata: Metadata = {
  title: 'Security — BringBucket',
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="font-semibold text-lg">{title}</h2>
      <div className="mt-3 space-y-3 text-sm text-muted-foreground leading-relaxed">{children}</div>
    </section>
  )
}

export default function SecurityPage() {
  return (
    <div>
      <h1 className="font-semibold text-3xl tracking-tight">Security</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        How BringBucket protects your data and credentials.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6">
        {securityFeatures.map(f => (
          <div key={f.title} className="rounded-xl border bg-card p-5">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/5 text-primary">
              <f.icon className="size-5" />
            </div>
            <h3 className="mt-3 font-semibold text-sm">{f.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{f.description}</p>
          </div>
        ))}
      </div>

      <Section title="Credential Encryption">
        <p>
          Your cloud access keys and secrets are encrypted using{' '}
          <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">AES-256-GCM</code>{' '}
          before being written to the database. This is an authenticated encryption algorithm that
          provides both confidentiality and integrity guarantees — meaning that if the ciphertext is
          tampered with, decryption will fail rather than silently returning corrupted data.
        </p>
        <p>
          Encryption keys are stored separately from the credential data they protect, following
          the principle of key separation. This means that a compromise of the database alone would
          not expose plaintext credentials.
        </p>
        <p>
          Credentials are never logged, never included in API responses, and are decrypted only
          transiently in memory to fulfill the specific storage operation you requested. Once the
          operation completes, the plaintext key material is discarded.
        </p>
      </Section>

      <Section title="Encryption in Transit">
        <p>
          All communication between your browser and BringBucket's servers is encrypted using TLS
          (Transport Layer Security) version 1.2 or higher. We enforce HTTP Strict Transport
          Security (HSTS) to ensure your browser always connects over a secure channel, and we
          reject all insecure HTTP connections.
        </p>
        <p>
          Similarly, all API calls made by BringBucket on your behalf to your cloud storage
          provider use TLS-encrypted connections. We do not transmit your cloud credentials or your
          file data over unencrypted channels under any circumstances.
        </p>
      </Section>

      <Section title="Infrastructure">
        <p>
          BringBucket runs on enterprise-grade cloud infrastructure with automated backups,
          geographic redundancy, and continuous uptime monitoring. Our hosting environment is
          designed for high availability with graceful failover in the event of component failure.
        </p>
        <p>
          Access to production systems is restricted exclusively to authorized personnel. All
          production access requires multi-factor authentication (MFA), and sessions are logged and
          auditable. We apply the principle of least privilege — each team member and service
          account is granted only the minimum permissions necessary to perform their role.
        </p>
        <p>
          Dependency and container images are regularly updated to patch known vulnerabilities.
          Security patches for critical CVEs are applied on an expedited basis.
        </p>
      </Section>

      <Section title="Access Controls">
        <p>
          Each BringBucket workspace has granular role-based access control (RBAC) to ensure the
          right people have the right level of access:
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <span className="font-medium text-foreground">Owner</span> — Full control over the
            workspace, including billing, provider configuration, and member management.
          </li>
          <li>
            <span className="font-medium text-foreground">Admin</span> — Can manage members and
            configure providers, but cannot change billing details or delete the workspace.
          </li>
          <li>
            <span className="font-medium text-foreground">Member</span> — Can browse, upload, and
            download files within assigned storage buckets.
          </li>
          <li>
            <span className="font-medium text-foreground">Viewer</span> — Read-only access;
            can browse and download files but cannot make changes.
          </li>
        </ul>
        <p>
          File sharing uses scoped, pre-signed URLs generated directly by your cloud provider. These
          URLs are time-limited and expire after the duration you configure, ensuring that shared
          links do not provide indefinite access.
        </p>
      </Section>

      <Section title="Responsible Disclosure">
        <p>
          BringBucket takes the security of our platform and our users' data seriously. If you
          discover a security vulnerability, we encourage responsible disclosure:
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            Email your findings to{' '}
            <a
              href="mailto:security@bringbucket.com"
              className="underline underline-offset-4 hover:text-foreground transition-colors"
            >
              security@bringbucket.com
            </a>
            . Please provide enough detail to reproduce and assess the issue.
          </li>
          <li>
            We will acknowledge receipt of your report within 48 hours and keep you informed of our
            progress.
          </li>
          <li>
            We aim to resolve critical and high-severity issues within 72 hours of confirmation.
          </li>
          <li>
            We do not take legal action against researchers who report vulnerabilities in good faith
            and adhere to responsible disclosure practices.
          </li>
        </ul>
        <p>
          We ask that you do not publicly disclose the vulnerability until we have had a reasonable
          opportunity to investigate and remediate it, and that you do not access, modify, or delete
          any user data during your research.
        </p>
      </Section>
    </div>
  )
}
