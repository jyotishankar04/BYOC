import type { Metadata } from 'next'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  InformationCircleIcon,
  Alert01Icon,
  CheckmarkCircle01Icon,
  CloudUploadIcon,
  Folder02Icon,
  Share01Icon,
  Shield01Icon,
  Key01Icon,
} from '@hugeicons/core-free-icons'
import { DocsSidebar } from './docs-sidebar'

export const metadata: Metadata = {
  title: 'Documentation — BringBucket',
  description:
    'Learn how to connect your cloud storage, manage files, share links, and keep your data secure with BringBucket.',
}

function Info({ children }: { children: React.ReactNode }) {
  return (
    <div className="my-4 flex gap-3 rounded-xl border border-blue-500/20 bg-blue-500/8 px-4 py-3 text-sm text-blue-700 dark:text-blue-400">
      <HugeiconsIcon
        icon={InformationCircleIcon}
        className="mt-0.5 size-4 shrink-0"
        strokeWidth={1.5}
      />
      <span>{children}</span>
    </div>
  )
}

function Tip({ children }: { children: React.ReactNode }) {
  return (
    <div className="my-4 flex gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/8 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-400">
      <HugeiconsIcon
        icon={CheckmarkCircle01Icon}
        className="mt-0.5 size-4 shrink-0"
        strokeWidth={1.5}
      />
      <span>{children}</span>
    </div>
  )
}

function Warning({ children }: { children: React.ReactNode }) {
  return (
    <div className="my-4 flex gap-3 rounded-xl border border-amber-500/20 bg-amber-500/8 px-4 py-3 text-sm text-amber-700 dark:text-amber-400">
      <HugeiconsIcon
        icon={Alert01Icon}
        className="mt-0.5 size-4 shrink-0"
        strokeWidth={1.5}
      />
      <span>{children}</span>
    </div>
  )
}

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-semibold">
          {n}
        </div>
        <div className="mt-2 w-px flex-1 bg-border" />
      </div>
      <div className="pb-8 min-w-0">
        <p className="font-semibold mb-1">{title}</p>
        <div className="text-sm text-muted-foreground leading-relaxed">{children}</div>
      </div>
    </div>
  )
}

function CredField({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div className="flex items-start gap-3 rounded-lg border bg-muted/40 px-4 py-3">
      <span className="w-40 shrink-0 text-xs font-medium text-muted-foreground mt-0.5">
        {label}
      </span>
      <span className="font-mono text-xs text-foreground break-all">{value}</span>
      {note && <span className="ml-auto shrink-0 text-xs text-muted-foreground">{note}</span>}
    </div>
  )
}

function SectionHeading({
  id,
  icon,
  title,
  subtitle,
}: {
  id: string
  icon?: typeof CloudUploadIcon
  title: string
  subtitle?: string
}) {
  return (
    <div className="flex items-start gap-4 mb-6">
      {icon && (
        <div className="mt-1 flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/8 text-primary">
          <HugeiconsIcon icon={icon} className="size-5" strokeWidth={1.5} />
        </div>
      )}
      <div>
        <h2 id={id} className="scroll-mt-28 text-xl font-semibold tracking-tight">
          {title}
        </h2>
        {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
      </div>
    </div>
  )
}

function ProviderHeading({ id, name }: { id: string; name: string }) {
  return (
    <h3
      id={id}
      className="scroll-mt-28 mt-10 mb-4 text-base font-semibold border-b pb-2"
    >
      {name}
    </h3>
  )
}

export default function DocsPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      {/* Page header */}
      <div className="mb-12">
        <span className="rounded-full border px-3 py-1 text-xs font-medium text-muted-foreground">
          Documentation
        </span>
        <h1 className="mt-5 text-4xl font-semibold tracking-tight">
          BringBucket User Guide
        </h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Everything you need to connect your cloud storage, manage files, and share links —
          without ever giving us access to your data.
        </p>
      </div>

      {/* Two-column layout */}
      <div className="grid gap-12 lg:grid-cols-[220px_1fr]">
        <aside className="hidden lg:block">
          <DocsSidebar />
        </aside>

        <article className="min-w-0 space-y-16">

          {/* ─── Overview ──────────────────────────────────────── */}
          <section>
            <SectionHeading
              id="overview"
              title="Overview"
              subtitle="What BringBucket is and how the BYOC model works."
            />

            <p className="text-sm text-muted-foreground leading-relaxed">
              BringBucket is a file management dashboard that connects to <strong className="text-foreground">your own</strong> S3-compatible
              cloud storage. Instead of storing your files on our servers, we act as a secure
              UI layer on top of buckets you already own — at AWS, Cloudflare, MinIO, Supabase,
              and more.
            </p>

            <div className="my-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
              {[
                {
                  icon: Shield01Icon,
                  title: 'Your data, your cloud',
                  body: 'Files never touch BringBucket servers. They live in the bucket you connected.',
                },
                {
                  icon: Key01Icon,
                  title: 'Encrypted credentials',
                  body: 'Access keys are encrypted with AES-256-GCM before being stored in our database.',
                },
                {
                  icon: CloudUploadIcon,
                  title: 'Any S3-compatible provider',
                  body: 'Works with AWS S3, Cloudflare R2, MinIO, Supabase Storage, and more.',
                },
              ].map((card) => (
                <div
                  key={card.title}
                  className="rounded-xl border bg-card p-5 flex flex-col gap-2"
                >
                  <div className="flex size-8 items-center justify-center rounded-lg bg-primary/8 text-primary">
                    <HugeiconsIcon icon={card.icon} className="size-4" strokeWidth={1.5} />
                  </div>
                  <p className="text-sm font-medium">{card.title}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{card.body}</p>
                </div>
              ))}
            </div>

            <Info>
              BringBucket requires you to have an existing cloud storage account. We do not
              provide storage ourselves — we provide the interface to manage yours.
            </Info>
          </section>

          {/* ─── Getting Started ────────────────────────────────── */}
          <section>
            <SectionHeading
              id="getting-started"
              title="Getting Started"
              subtitle="From sign-up to managing your first file in under 5 minutes."
            />

            <div>
              <Step n={1} title="Create your account">
                Visit{' '}
                <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">
                  bringbucket.com
                </span>{' '}
                and click <strong>Get Started</strong>. Sign up with your Google account — no
                password or credit card required.
              </Step>

              <Step n={2} title="Go to Onboarding">
                After signing in for the first time you are automatically taken to the{' '}
                <strong>Connect Your Storage</strong> onboarding flow. You can also reach it
                later from <strong>Dashboard &rarr; Add Bucket</strong>.
              </Step>

              <Step n={3} title="Select your cloud provider">
                Choose the provider where your bucket lives: AWS S3, Cloudflare R2, MinIO, or
                Supabase Storage. MinIO and Supabase require a Pro or Team plan.
              </Step>

              <Step n={4} title="Enter your credentials">
                Fill in the connection form with your bucket name, region, endpoint URL, access
                key ID, and secret access key. See the{' '}
                <a href="#connecting-providers" className="text-primary underline underline-offset-2">
                  Connecting Providers
                </a>{' '}
                section for provider-specific instructions.
              </Step>

              <Step n={5} title="Verify the connection">
                Click <strong>Verify Connection</strong>. BringBucket performs a lightweight
                read-check on your bucket to confirm the credentials are valid before saving.
              </Step>

              <Step n={6} title="Start managing files">
                Once verified, you are redirected to the file manager. You can upload files,
                create folders, and share links immediately.
              </Step>
            </div>

            <Tip>
              You can connect multiple buckets — one per provider on the free plan, unlimited on
              Pro. Switch between them using the bucket selector in the left sidebar of the
              dashboard.
            </Tip>
          </section>

          {/* ─── Connecting Providers ───────────────────────────── */}
          <section>
            <SectionHeading
              id="connecting-providers"
              icon={Key01Icon}
              title="Connecting Providers"
              subtitle="Step-by-step credential guides for each supported provider."
            />

            <p className="text-sm text-muted-foreground">
              All providers use the same S3-compatible API. The differences are in where to find
              your credentials and what endpoint URL to use.
            </p>

            {/* AWS S3 */}
            <ProviderHeading id="aws-s3" name="AWS S3" />
            <ol className="space-y-3 text-sm text-muted-foreground leading-relaxed list-decimal list-outside pl-5">
              <li>
                Log in to the{' '}
                <strong className="text-foreground">AWS Management Console</strong> and open the
                S3 service. Create a new bucket or use an existing one. Note the bucket name
                and the <strong className="text-foreground">region</strong> (e.g.{' '}
                <code className="font-mono text-xs bg-muted px-1 py-0.5 rounded">us-east-1</code>
                ).
              </li>
              <li>
                Open <strong className="text-foreground">IAM &rarr; Users</strong> and create a
                new user. On the permissions step, attach the following inline policy (replace{' '}
                <code className="font-mono text-xs bg-muted px-1 py-0.5 rounded">
                  YOUR_BUCKET_NAME
                </code>
                ):
                <pre className="mt-2 overflow-x-auto rounded-lg bg-muted px-4 py-3 text-xs font-mono text-foreground">
{`{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Action": [
      "s3:GetObject",
      "s3:PutObject",
      "s3:DeleteObject",
      "s3:ListBucket"
    ],
    "Resource": [
      "arn:aws:s3:::YOUR_BUCKET_NAME",
      "arn:aws:s3:::YOUR_BUCKET_NAME/*"
    ]
  }]
}`}
                </pre>
              </li>
              <li>
                Under the new IAM user, go to{' '}
                <strong className="text-foreground">Security credentials &rarr; Access keys</strong>{' '}
                and create an access key. Copy both the <strong className="text-foreground">Access Key ID</strong>{' '}
                and the <strong className="text-foreground">Secret Access Key</strong>.
              </li>
              <li>
                In BringBucket, select <strong className="text-foreground">AWS S3</strong> and
                fill in:
              </li>
            </ol>
            <div className="mt-3 space-y-1.5">
              <CredField label="Bucket Name" value="my-bucket-name" />
              <CredField label="Region" value="us-east-1" />
              <CredField
                label="Endpoint"
                value="https://s3.us-east-1.amazonaws.com"
                note="optional"
              />
              <CredField label="Access Key ID" value="AKIAIOSFODNN7EXAMPLE" />
              <CredField label="Secret Access Key" value="wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY" />
            </div>
            <Warning>
              Never share your AWS Secret Access Key. If it is compromised, rotate it immediately
              in IAM and update the credentials in BringBucket.
            </Warning>

            {/* Cloudflare R2 */}
            <ProviderHeading id="cloudflare-r2" name="Cloudflare R2" />
            <ol className="space-y-3 text-sm text-muted-foreground leading-relaxed list-decimal list-outside pl-5">
              <li>
                Log in to the <strong className="text-foreground">Cloudflare dashboard</strong>.
                Open <strong className="text-foreground">R2 Object Storage</strong> from the
                left sidebar, then click <strong className="text-foreground">Create bucket</strong>.
              </li>
              <li>
                On the R2 overview page, copy your{' '}
                <strong className="text-foreground">Account ID</strong> shown in the top right.
                Your endpoint will be:
                <code className="mt-1 block font-mono text-xs bg-muted px-3 py-2 rounded-lg">
                  https://&lt;account-id&gt;.r2.cloudflarestorage.com
                </code>
              </li>
              <li>
                Go to <strong className="text-foreground">Manage R2 API tokens</strong> (link on
                the R2 overview). Create a new token with{' '}
                <strong className="text-foreground">Object Read &amp; Write</strong> permissions,
                scoped to your bucket. Copy the{' '}
                <strong className="text-foreground">Access Key ID</strong> and{' '}
                <strong className="text-foreground">Secret Access Key</strong>.
              </li>
            </ol>
            <div className="mt-3 space-y-1.5">
              <CredField label="Bucket Name" value="my-r2-bucket" />
              <CredField label="Region" value="auto" note="always 'auto' for R2" />
              <CredField
                label="Endpoint"
                value="https://abc123.r2.cloudflarestorage.com"
              />
              <CredField label="Access Key ID" value="your-r2-access-key-id" />
              <CredField label="Secret Access Key" value="your-r2-secret-access-key" />
            </div>
            <Tip>
              Cloudflare R2 charges zero egress fees. It is the most cost-effective option if
              you share or download files frequently.
            </Tip>

            {/* MinIO */}
            <ProviderHeading id="minio" name="MinIO (Self-hosted)" />
            <p className="text-sm text-muted-foreground leading-relaxed mb-3">
              MinIO is a self-hosted S3-compatible server. You need a running MinIO instance
              accessible over the internet (or your private network if BringBucket is
              self-deployed).
            </p>
            <ol className="space-y-3 text-sm text-muted-foreground leading-relaxed list-decimal list-outside pl-5">
              <li>
                Open the <strong className="text-foreground">MinIO Console</strong> (usually at{' '}
                <code className="font-mono text-xs bg-muted px-1 py-0.5 rounded">
                  http://localhost:9001
                </code>
                ) and log in as admin.
              </li>
              <li>
                Go to <strong className="text-foreground">Buckets &rarr; Create Bucket</strong>.
                Give it a name.
              </li>
              <li>
                Go to <strong className="text-foreground">Identity &rarr; Users &rarr; Create User</strong>.
                Assign the <code className="font-mono text-xs bg-muted px-1 py-0.5 rounded">readwrite</code>{' '}
                policy (or a custom policy).
              </li>
              <li>
                Under the user, create a{' '}
                <strong className="text-foreground">Service Account</strong> to get an access key
                and secret.
              </li>
            </ol>
            <div className="mt-3 space-y-1.5">
              <CredField label="Bucket Name" value="my-minio-bucket" />
              <CredField label="Region" value="us-east-1" note="any value works" />
              <CredField label="Endpoint" value="https://minio.yourdomain.com" />
              <CredField label="Access Key ID" value="minio-service-account-key" />
              <CredField label="Secret Access Key" value="minio-service-account-secret" />
            </div>
            <Info>
              MinIO requires a <strong>Pro or Team plan</strong>. Your MinIO server must be
              reachable over HTTPS. Self-signed certificates are not supported.
            </Info>

            {/* Supabase */}
            <ProviderHeading id="supabase-storage" name="Supabase Storage" />
            <ol className="space-y-3 text-sm text-muted-foreground leading-relaxed list-decimal list-outside pl-5">
              <li>
                Open your project in the{' '}
                <strong className="text-foreground">Supabase dashboard</strong>. Go to{' '}
                <strong className="text-foreground">Storage &rarr; Buckets</strong> and create a
                bucket. Set it to <strong className="text-foreground">private</strong> for full
                access control.
              </li>
              <li>
                Go to <strong className="text-foreground">Settings &rarr; API</strong>. Copy
                your <strong className="text-foreground">Project URL</strong> and the{' '}
                <strong className="text-foreground">service_role</strong> secret (under Project
                API keys).
              </li>
              <li>
                Your S3 endpoint is derived from your project URL — replace{' '}
                <code className="font-mono text-xs bg-muted px-1 py-0.5 rounded">
                  https://&lt;ref&gt;.supabase.co
                </code>{' '}
                with{' '}
                <code className="font-mono text-xs bg-muted px-1 py-0.5 rounded">
                  https://&lt;ref&gt;.supabase.co/storage/v1/s3
                </code>
                .
              </li>
            </ol>
            <div className="mt-3 space-y-1.5">
              <CredField label="Bucket Name" value="my-supabase-bucket" />
              <CredField label="Region" value="auto" />
              <CredField
                label="Endpoint"
                value="https://abcdefgh.supabase.co/storage/v1/s3"
              />
              <CredField label="Access Key ID" value="your-supabase-project-ref" />
              <CredField label="Secret Access Key" value="your-service-role-secret" />
            </div>
            <Info>
              Supabase Storage requires a <strong>Pro or Team plan</strong>.
            </Info>
          </section>

          {/* ─── File Manager ───────────────────────────────────── */}
          <section>
            <SectionHeading
              id="file-manager"
              icon={Folder02Icon}
              title="File Manager"
              subtitle="Uploading, organizing, previewing, and deleting files."
            />

            <div className="space-y-6 text-sm text-muted-foreground">
              <div>
                <p className="font-medium text-foreground mb-1">Uploading files</p>
                <p className="leading-relaxed">
                  Click the <strong className="text-foreground">Upload</strong> button in the
                  toolbar, or drag and drop files directly onto the file list area. Multiple
                  files can be selected at once. Progress is shown per-file in a toast
                  notification.
                </p>
              </div>

              <div>
                <p className="font-medium text-foreground mb-1">Creating folders</p>
                <p className="leading-relaxed">
                  Click <strong className="text-foreground">+ New Folder</strong> in the
                  toolbar. Folders are virtual prefixes in your S3 bucket — they do not consume
                  storage on their own.
                </p>
              </div>

              <div>
                <p className="font-medium text-foreground mb-1">Navigating</p>
                <p className="leading-relaxed">
                  Click any folder to open it. The breadcrumb trail at the top shows your
                  current path. Click any segment to jump back to that level.
                </p>
              </div>

              <div>
                <p className="font-medium text-foreground mb-1">Selecting a file</p>
                <p className="leading-relaxed">
                  Click any file row to open the <strong className="text-foreground">File Details</strong>{' '}
                  panel on the right. From there you can preview (for images), download, rename,
                  share, or delete the file.
                </p>
              </div>

              <div>
                <p className="font-medium text-foreground mb-1">Searching</p>
                <p className="leading-relaxed">
                  Use the search bar at the top of the file list to filter files by name within
                  the current folder. Search is case-insensitive and matches partial names.
                </p>
              </div>

              <div>
                <p className="font-medium text-foreground mb-1">Renaming a file or folder</p>
                <p className="leading-relaxed">
                  Select the file, then click <strong className="text-foreground">Rename</strong>{' '}
                  in the Details panel. For S3 providers, renaming copies the object to the new
                  key and deletes the old one — this is a standard S3 operation.
                </p>
              </div>

              <div>
                <p className="font-medium text-foreground mb-1">Deleting</p>
                <p className="leading-relaxed">
                  Select the file, then click <strong className="text-foreground">Delete</strong>{' '}
                  in the Details panel. A confirmation dialog appears. Deletions are permanent
                  and cannot be undone from BringBucket.
                </p>
              </div>
            </div>

            <Warning>
              Deleting a folder deletes all objects under that prefix. There is no recycle bin.
              Make sure your S3 bucket has versioning enabled if you need recovery.
            </Warning>
          </section>

          {/* ─── Sharing & Links ────────────────────────────────── */}
          <section>
            <SectionHeading
              id="sharing-links"
              icon={Share01Icon}
              title="Sharing & Links"
              subtitle="Generate a shareable link for any file in your bucket."
            />

            <div className="space-y-6 text-sm text-muted-foreground">
              <div>
                <p className="font-medium text-foreground mb-1">Creating a share link</p>
                <p className="leading-relaxed">
                  Select any file in the file manager, then click{' '}
                  <strong className="text-foreground">Share</strong> in the File Details panel.
                  Configure the link options and click <strong className="text-foreground">Create Link</strong>.
                  BringBucket generates a short, shareable link:
                </p>
                <code className="mt-2 block font-mono text-xs bg-muted px-3 py-2 rounded-lg text-foreground">
                  https://app.bringbucket.com/s/[token]
                </code>
              </div>

              <div>
                <p className="font-medium text-foreground mb-1">Link options</p>
                <ul className="mt-1 space-y-1.5 leading-relaxed list-disc list-outside pl-4">
                  <li><strong className="text-foreground">Expiry</strong> — set the link to expire after 1 hour, 1 day, 7 days, 30 days, or never.</li>
                  <li><strong className="text-foreground">Password protection</strong> — optionally require a password before the recipient can access the file.</li>
                  <li><strong className="text-foreground">Allow download</strong> — choose whether the recipient can download the file or only preview it.</li>
                </ul>
              </div>

              <div>
                <p className="font-medium text-foreground mb-1">How it works</p>
                <p className="leading-relaxed">
                  When a visitor opens the share link, BringBucket uses your stored credentials
                  to generate a time-limited pre-signed URL directly from your S3 bucket. The
                  file is served from your cloud provider — not from BringBucket&apos;s
                  servers.
                </p>
              </div>

              <div>
                <p className="font-medium text-foreground mb-1">Managing links</p>
                <p className="leading-relaxed">
                  Open the File Details panel and click the share icon to view all active links
                  for a file. You can disable or permanently delete any link at any time. Disabled
                  links return a 404 to visitors immediately.
                </p>
              </div>
            </div>

            <Info>
              Share links are served directly from your cloud provider bucket via pre-signed URLs.
              BringBucket never proxies your file content.
            </Info>
          </section>

          {/* ─── Security ───────────────────────────────────────── */}
          <section>
            <SectionHeading
              id="security"
              icon={Shield01Icon}
              title="Security Model"
              subtitle="How BringBucket handles your credentials and protects your data."
            />

            <div className="space-y-6 text-sm text-muted-foreground">
              <div>
                <p className="font-medium text-foreground mb-1">Credential storage</p>
                <p className="leading-relaxed">
                  Your access key ID and secret access key are encrypted with{' '}
                  <strong className="text-foreground">AES-256-GCM</strong> using a server-side
                  key before being written to our database. The encryption key is never stored
                  alongside the credentials.
                </p>
              </div>

              <div>
                <p className="font-medium text-foreground mb-1">No file access</p>
                <p className="leading-relaxed">
                  BringBucket never stores your files. All uploads and downloads are streamed
                  directly between your browser and your S3 bucket. Our server acts as a
                  credential broker, not a data store.
                </p>
              </div>

              <div>
                <p className="font-medium text-foreground mb-1">Transport security</p>
                <p className="leading-relaxed">
                  All communication between the browser, BringBucket servers, and your cloud
                  provider is encrypted over{' '}
                  <strong className="text-foreground">TLS 1.2+</strong>. We enforce HTTPS on all
                  endpoints and reject plain HTTP connections.
                </p>
              </div>

              <div>
                <p className="font-medium text-foreground mb-1">Least-privilege recommendation</p>
                <p className="leading-relaxed">
                  We recommend creating a dedicated IAM user or service account with{' '}
                  <strong className="text-foreground">only the permissions BringBucket needs</strong>:
                  list, get, put, and delete on a single bucket. Avoid using root or admin
                  credentials.
                </p>
              </div>

              <div>
                <p className="font-medium text-foreground mb-1">Revoking access</p>
                <p className="leading-relaxed">
                  To revoke BringBucket&apos;s access to your bucket, delete or disable the IAM
                  user / API token in your cloud provider&apos;s console. You can also delete
                  the bucket connection from BringBucket&apos;s dashboard, which removes the
                  encrypted credentials from our database.
                </p>
              </div>
            </div>

            <Tip>
              Rotate your access keys periodically (every 90 days is a reasonable baseline).
              After rotating, update the credentials in{' '}
              <strong>Dashboard &rarr; Settings &rarr; Connections</strong>.
            </Tip>

            <div className="mt-8 rounded-xl border bg-card p-5">
              <p className="text-sm font-medium mb-1">Have a security concern?</p>
              <p className="text-sm text-muted-foreground">
                Please email us at{' '}
                <a
                  href="mailto:security@bringbucket.com"
                  className="text-primary underline underline-offset-2"
                >
                  security@bringbucket.com
                </a>{' '}
                or open a ticket on the{' '}
                <a href="/support" className="text-primary underline underline-offset-2">
                  Support page
                </a>
                .
              </p>
            </div>
          </section>

        </article>
      </div>
    </div>
  )
}
