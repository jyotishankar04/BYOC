import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Data Processing Agreement — BringBucket',
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="font-semibold text-lg">{title}</h2>
      <div className="mt-3 space-y-3 text-sm text-muted-foreground leading-relaxed">{children}</div>
    </section>
  )
}

const subProcessors = [
  {
    name: 'AWS / Amazon Web Services',
    purpose: 'Cloud SDK infrastructure',
    location: 'USA',
  },
  {
    name: 'Cloudflare Inc.',
    purpose: 'CDN & DDoS protection',
    location: 'USA',
  },
  {
    name: 'Stripe Inc.',
    purpose: 'Payment processing',
    location: 'USA',
  },
  {
    name: 'Resend Inc.',
    purpose: 'Transactional email',
    location: 'USA',
  },
]

export default function DpaPage() {
  return (
    <div>
      <h1 className="font-semibold text-3xl tracking-tight">Data Processing Agreement</h1>
      <p className="mt-2 text-sm text-muted-foreground">Effective date: May 1, 2025</p>

      <Section title="Overview">
        <p>
          This Data Processing Agreement ("DPA") forms part of the BringBucket Terms of Service
          between BringBucket, Inc. ("BringBucket") and the individual or legal entity accessing the
          Service ("Customer"), and governs the processing of personal data in connection with the
          BringBucket file management service.
        </p>
        <p>
          For the purposes of applicable data protection law, including the EU General Data
          Protection Regulation (GDPR) and the UK GDPR where applicable:
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <span className="font-medium text-foreground">Customer</span> is the{' '}
            <span className="font-medium text-foreground">Data Controller</span> — the entity that
            determines the purposes and means of processing personal data.
          </li>
          <li>
            <span className="font-medium text-foreground">BringBucket</span> is the{' '}
            <span className="font-medium text-foreground">Data Processor</span> — the entity that
            processes personal data on behalf of, and under the instructions of, the Controller.
          </li>
        </ul>
        <p>
          This DPA supplements the Terms of Service and Privacy Policy. In the event of any
          conflict between this DPA and those documents with respect to data processing, this DPA
          shall prevail.
        </p>
      </Section>

      <Section title="Scope of Processing">
        <p>
          BringBucket processes personal data only as necessary to provide the Service. The details
          of processing are as follows:
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <span className="font-medium text-foreground">Categories of data subjects</span> —
            Registered users of the Customer's BringBucket workspace.
          </li>
          <li>
            <span className="font-medium text-foreground">Types of personal data processed</span> —
            Account identifiers (name, email address), usage logs (feature interactions, timestamps,
            IP addresses), and encrypted storage credentials (cloud access keys and secrets,
            stored exclusively in encrypted form).
          </li>
          <li>
            <span className="font-medium text-foreground">Purpose of processing</span> — Providing
            and operating the BringBucket file management interface, including authentication,
            workspace management, storage operations, billing, and customer support.
          </li>
          <li>
            <span className="font-medium text-foreground">Duration of processing</span> — For the
            term of the Customer's active service agreement with BringBucket, plus any post-
            termination retention period required by applicable law or as described in the Privacy
            Policy (maximum 90 days following account deletion).
          </li>
        </ul>
      </Section>

      <Section title="Processor Obligations">
        <p>
          BringBucket agrees to the following obligations as Data Processor:
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            Process personal data only on the Customer's documented instructions, including with
            regard to transfers of personal data to a third country or an international organization,
            unless required to do so by applicable law.
          </li>
          <li>
            Ensure that all persons authorized to process the personal data have committed themselves
            to confidentiality obligations or are under an appropriate statutory obligation of
            confidentiality.
          </li>
          <li>
            Implement and maintain appropriate technical and organizational security measures to
            protect personal data against accidental or unlawful destruction, loss, alteration,
            unauthorized disclosure, or access.
          </li>
          <li>
            Assist the Customer, to the extent reasonably practicable, in fulfilling the Customer's
            obligation to respond to requests from data subjects exercising their rights under
            applicable data protection law.
          </li>
          <li>
            Notify the Customer without undue delay upon becoming aware of a personal data breach
            affecting data processed under this DPA.
          </li>
          <li>
            Make available to the Customer all information reasonably necessary to demonstrate
            compliance with the obligations in this DPA, and allow for audits and inspections.
          </li>
          <li>
            At the choice of the Customer, delete or return all personal data to the Customer after
            the end of the provision of services relating to processing, and delete existing copies
            unless applicable law requires storage.
          </li>
        </ul>
      </Section>

      <Section title="Sub-processors">
        <p>
          The Customer provides general authorization for BringBucket to engage sub-processors in
          connection with the Service. BringBucket will inform the Customer of any intended changes
          concerning the addition or replacement of sub-processors, giving the Customer opportunity
          to object. Current authorized sub-processors:
        </p>
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {subProcessors.map(sp => (
            <div key={sp.name} className="rounded-xl border bg-card p-4">
              <p className="font-medium text-sm text-foreground">{sp.name}</p>
              <p className="mt-1 text-xs text-muted-foreground">{sp.purpose}</p>
              <span className="mt-2 inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground ring-1 ring-inset ring-border">
                {sp.location}
              </span>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Data Transfers">
        <p>
          All current BringBucket sub-processors are based in the United States. Transfers of
          personal data from the European Economic Area (EEA), the United Kingdom, or Switzerland to
          these sub-processors are made pursuant to the Standard Contractual Clauses (SCCs) approved
          by the European Commission, or the equivalent mechanism applicable under UK data protection
          law.
        </p>
        <p>
          BringBucket will not transfer personal data to any new sub-processor in a third country
          without ensuring an adequate data transfer mechanism is in place, and will update this DPA
          accordingly.
        </p>
      </Section>

      <Section title="Security Measures">
        <p>
          BringBucket maintains the following technical and organizational measures to protect
          personal data:
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <span className="font-medium text-foreground">Encryption at rest</span> — All storage
            credentials and sensitive personal data are encrypted using AES-256-GCM. Encryption keys
            are stored separately from encrypted data.
          </li>
          <li>
            <span className="font-medium text-foreground">Encryption in transit</span> — All data
            transmitted between clients and BringBucket servers, and between BringBucket and
            sub-processors, is protected using TLS 1.2 or higher.
          </li>
          <li>
            <span className="font-medium text-foreground">Access controls</span> — Access to
            production systems is restricted to authorized personnel, requires multi-factor
            authentication, and follows the principle of least privilege.
          </li>
          <li>
            <span className="font-medium text-foreground">Security reviews</span> — BringBucket
            conducts regular internal security reviews and vulnerability assessments.
          </li>
          <li>
            <span className="font-medium text-foreground">Logging and monitoring</span> — Production
            systems are subject to continuous monitoring. Access logs are retained for 30 days.
          </li>
        </ul>
      </Section>

      <Section title="Requesting a DPA">
        <p>
          This DPA is incorporated by reference into the BringBucket Terms of Service and applies
          automatically to all customers. If your organization requires a separately countersigned
          DPA for enterprise procurement, vendor management, or compliance purposes, please contact
          us:
        </p>
        <p>
          <a
            href="mailto:legal@bringbucket.com"
            className="underline underline-offset-4 hover:text-foreground transition-colors"
          >
            legal@bringbucket.com
          </a>
        </p>
        <p>
          We will work with you to provide a countersigned copy in a format suitable for your
          procurement or compliance requirements. Typical turnaround for standard DPA requests is 3–5
          business days.
        </p>
      </Section>
    </div>
  )
}
