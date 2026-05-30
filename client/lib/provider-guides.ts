export interface GuideStep {
  title: string;
  description: string;
  code?: string;
  link?: { url: string; label: string };
}

export interface ProviderGuide {
  providerName: string;
  intro: string;
  steps: GuideStep[];
}

const isProd = process.env.NODE_ENV === "production";

const corsOrigins = isProd
  ? `["https://bringbucket.qwikish.com"]`
  : `[
      "https://bringbucket.qwikish.com",
      "http://localhost:3000"
    ]`;

const corsSnippet = `[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
    "AllowedOrigins": ${corsOrigins},
    "ExposeHeaders": ["ETag", "Content-Length", "Content-Type"]
  }
]`;

const AWS_S3_GUIDE: ProviderGuide = {
  providerName: "AWS S3",
  intro:
    "Follow these steps in the AWS Console to get your bucket and credentials ready.",
  steps: [
    {
      title: "Create an S3 bucket",
      description:
        "Go to AWS Console → S3 → Create bucket. Give it a globally unique name and choose a region. Keep Block Public Access enabled (your files stay private — our server mediates access).",
      link: {
        url: "https://docs.aws.amazon.com/AmazonS3/latest/userguide/create-bucket-overview.html",
        label: "AWS S3 docs",
      },
    },
    {
      title: "Note your region",
      description:
        "The region code is shown when creating the bucket (e.g. us-east-1, eu-west-1, ap-south-1). Enter this in the Region field.",
      link: {
        url: "https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/using-regions-availability-zones.html",
        label: "AWS regions list",
      },
    },
    {
      title: "Create an IAM user",
      description:
        "Go to IAM → Users → Create user. Give it a name (e.g. bringbucket-uploader). Do NOT check 'Provide user access to the AWS Management Console' — this user only needs programmatic access.",
      link: {
        url: "https://docs.aws.amazon.com/IAM/latest/UserGuide/id_users_create.html",
        label: "IAM docs",
      },
    },
    {
      title: "Attach S3 permissions",
      description:
        "In the IAM user → Permissions → Add permissions → Create inline policy. Paste the policy below (replace YOUR-BUCKET-NAME with your actual bucket name). This grants the minimum required S3 permissions for uploads, downloads, and multipart uploads.",
      code: `{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "BucketAccess",
      "Effect": "Allow",
      "Action": [
        "s3:ListBucket",
        "s3:GetBucketLocation",
        "s3:ListBucketMultipartUploads"
      ],
      "Resource": "arn:aws:s3:::YOUR-BUCKET-NAME"
    },
    {
      "Sid": "ObjectAccess",
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject",
        "s3:DeleteObject",
        "s3:AbortMultipartUpload",
        "s3:ListMultipartUploadParts"
      ],
      "Resource": "arn:aws:s3:::YOUR-BUCKET-NAME/*"
    }
  ]
}`,
      link: {
        url: "https://docs.aws.amazon.com/IAM/latest/UserGuide/access_policies_create.html",
        label: "IAM policy docs",
      },
    },
    {
      title: "Generate access keys",
      description:
        "In the IAM user → Security credentials → Create access key. Choose 'Application running outside AWS'. Copy the Access Key ID and Secret Access Key — you'll paste them in the form.",
      link: {
        url: "https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_access-keys.html",
        label: "Access keys docs",
      },
    },
    {
      title: "Configure CORS (required for uploads)",
      description:
        "Go to S3 → your bucket → Permissions → Cross-origin resource sharing (CORS). Paste the configuration below. This allows the browser to upload files directly to S3.",
      code: corsSnippet,
      link: {
        url: "https://docs.aws.amazon.com/AmazonS3/latest/userguide/cors.html",
        label: "CORS docs",
      },
    },
  ],
};

const R2_GUIDE: ProviderGuide = {
  providerName: "Cloudflare R2",
  intro:
    "Follow these steps in the Cloudflare Dashboard to get your R2 bucket and credentials ready.",
  steps: [
    {
      title: "Create an R2 bucket",
      description:
        "Go to Cloudflare Dashboard → R2 → Create bucket. Give it a name and choose a location hint if desired. Leave default settings.",
      link: {
        url: "https://developers.cloudflare.com/r2/buckets/create-buckets/",
        label: "R2 docs",
      },
    },
    {
      title: "Get your Account ID",
      description:
        "Go to Cloudflare Dashboard → Overview. Copy the Account ID shown on the right side. You'll use this in the endpoint URL.",
      link: {
        url: "https://developers.cloudflare.com/fundamentals/setup/find-account-and-zone-ids/",
        label: "Account ID docs",
      },
    },
    {
      title: "Create an API token",
      description:
        "Go to Cloudflare Dashboard → R2 → Manage API Tokens. Create an R2 token with Object Read & Write access. Scope it to the specific bucket if you want tighter access.",
      link: {
        url: "https://developers.cloudflare.com/r2/api/tokens/",
        label: "R2 tokens docs",
      },
    },
    {
      title: "Copy your credentials",
      description:
        "After the token is created, copy the R2 Access Key ID and Secret Access Key shown in the success screen. Paste those exact values into BringBucket. Do not use a general Cloudflare API token value.",
    },
    {
      title: "Endpoint URL",
      description:
        "Use the account-level S3 endpoint: https://<account_id>.r2.cloudflarestorage.com. If your bucket uses an EU jurisdiction endpoint, use https://<account_id>.eu.r2.cloudflarestorage.com instead. Keep the bucket name separate, and leave Region blank unless you explicitly want to send auto.",
      link: {
        url: "https://developers.cloudflare.com/r2/examples/aws/aws-sdk-js-v3/",
        label: "R2 AWS SDK v3 docs",
      },
    },
    {
      title: "Configure CORS (required for uploads)",
      description:
        "Go to Cloudflare Dashboard → R2 → your bucket → Settings → CORS Policy. Paste the configuration below.",
      code: corsSnippet,
      link: {
        url: "https://developers.cloudflare.com/r2/buckets/cors/",
        label: "R2 CORS docs",
      },
    },
  ],
};

const MINIO_GUIDE: ProviderGuide = {
  providerName: "MinIO",
  intro: "Follow these steps to set up your MinIO server and get credentials.",
  steps: [
    {
      title: "Install & run MinIO",
      description: "Run MinIO via Docker (recommended):",
      code: `docker run -p 9000:9000 -p 9001:9001 \\
  -e MINIO_ROOT_USER=admin \\
  -e MINIO_ROOT_PASSWORD=changeme \\
  quay.io/minio/minio server /data --console-address ":9001"`,
      link: {
        url: "https://min.io/docs/minio/container/index.html",
        label: "MinIO install docs",
      },
    },
    {
      title: "Create a bucket",
      description:
        "Go to MinIO Console (http://localhost:9001) → Buckets → Create Bucket. Give it a name. Or use the CLI:",
      code: "mc mb myminio/your-bucket-name",
      link: {
        url: "https://min.io/docs/minio/linux/administration/buckets/create-bucket.html",
        label: "Bucket docs",
      },
    },
    {
      title: "Create access keys",
      description:
        "In MinIO Console → Access Keys → Create access key. Copy the Access Key and Secret Key. If you're using the Docker setup above, the default credentials are admin / changeme — but create a dedicated key for production.",
      link: {
        url: "https://min.io/docs/minio/linux/administration/identity-access-management/minio-user-management.html",
        label: "Access keys docs",
      },
    },
    {
      title: "Get your endpoint URL",
      description:
        "If running locally, the endpoint is http://localhost:9000. If hosted on a server, use your server's address: http://your-server-ip:9000. Enter this in the Endpoint URL field.",
    },
    {
      title: "Configure CORS (required for uploads)",
      description:
        "In MinIO Console → your bucket → Anonymous → Add Access Rule, or use the mc CLI to set a CORS policy on your bucket.",
      code: corsSnippet,
      link: {
        url: "https://min.io/docs/minio/linux/administration/object-management/object-access-management.html",
        label: "MinIO access docs",
      },
    },
  ],
};

const SUPABASE_GUIDE: ProviderGuide = {
  providerName: "Supabase Storage",
  intro:
    "Follow these steps in your Supabase project to get storage credentials.",
  steps: [
    {
      title: "Create a storage bucket",
      description:
        "Go to Supabase Dashboard → your project → Storage → New bucket. Give it a name and make it public or private as needed. For BringBucket, the bucket can be private since our server handles access.",
      link: {
        url: "https://supabase.com/docs/guides/storage/buckets/foundations",
        label: "Supabase Storage docs",
      },
    },
    {
      title: "Get your Project URL",
      description:
        "Go to Project Settings → API. Copy the Project URL (e.g. https://abc123def.supabase.co). This will be part of the endpoint URL.",
      link: {
        url: "https://supabase.com/docs/guides/api",
        label: "Supabase API docs",
      },
    },
    {
      title: "Get your API keys",
      description:
        "On the same API settings page, copy the service_role key. This is your Secret Access Key. The Access Key ID is the same as the Project URL or you can use the anon key for the ID and service_role for the secret.",
      link: {
        url: "https://supabase.com/docs/guides/api/api-keys",
        label: "API keys docs",
      },
    },
    {
      title: "Endpoint URL",
      description:
        "Supabase S3-compatible endpoint URL: https://<project_ref>.supabase.co/storage/v1/s3. Enter this in the Endpoint URL field. Use the Project Reference ID (from the Project URL) in place of <project_ref>.",
    },
    {
      title: "CORS configuration",
      description:
        "If uploading directly from the browser, make sure CORS is configured for your bucket. In the Supabase Dashboard → Storage → your bucket, check that CORS origins are configured correctly.",
      code: isProd
        ? `supabase storage cors add --bucket=your-bucket --origin="https://bringbucket.qwikish.com"`
        : `supabase storage cors add --bucket=your-bucket --origin="https://bringbucket.qwikish.com"\nsupabase storage cors add --bucket=your-bucket --origin="http://localhost:3000"`,
    },
  ],
};

const OTHER_GUIDE: ProviderGuide = {
  providerName: "S3-compatible storage",
  intro:
    "Generic steps for any S3-compatible storage provider (DigitalOcean Spaces, Backblaze B2, Wasabi, etc.).",
  steps: [
    {
      title: "Create a bucket",
      description:
        "Create a bucket on your storage provider's dashboard. Note the bucket name and region if applicable.",
    },
    {
      title: "Get the endpoint URL",
      description:
        "Find your provider's S3-compatible endpoint URL. Common examples: DigitalOcean Spaces uses https://<region>.digitaloceanspaces.com, Backblaze B2 uses https://s3.<region>.backblazeb2.com. Check your provider's documentation.",
    },
    {
      title: "Generate access credentials",
      description:
        "Create an access key and secret key from your provider's dashboard or API settings section. These are typically found under Security → Access Keys or API → Tokens.",
    },
    {
      title: "Configure CORS (if needed)",
      description:
        "If your provider supports CORS configuration, set it up to allow PUT, GET, DELETE, and HEAD methods from your application's origin. Check your provider's documentation for CORS setup instructions.",
      code: corsSnippet,
    },
  ],
};

export const PROVIDER_GUIDES: Record<string, ProviderGuide> = {
  aws: AWS_S3_GUIDE,
  r2: R2_GUIDE,
  minio: MINIO_GUIDE,
  supabase: SUPABASE_GUIDE,
  other: OTHER_GUIDE,
};

export function getProviderGuide(key: string): ProviderGuide | undefined {
  return PROVIDER_GUIDES[key];
}

export function providerTypeToGuideKey(providerType: string): string {
  const map: Record<string, string> = {
    S3: "aws",
    R2: "r2",
    MinIO: "minio",
    Supabase: "supabase",
    Other: "other",
  };
  return map[providerType] ?? "other";
}
