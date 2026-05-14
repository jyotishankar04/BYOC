export interface ComparisonFeature {
  label: string
  bringbucket: boolean | string
  competitor: boolean | string
}

export interface Competitor {
  slug: string
  name: string
  tagline: string
  features: ComparisonFeature[]
}

export const competitors: Competitor[] = [
  {
    slug: 'dropbox',
    name: 'Dropbox',
    tagline: 'How BringBucket compares to Dropbox',
    features: [
      { label: 'Bring your own storage', bringbucket: true, competitor: false },
      { label: 'File size limit', bringbucket: 'Unlimited (provider limit)', competitor: '2 GB (free), 100 GB (paid)' },
      { label: 'S3-compatible API', bringbucket: true, competitor: false },
      { label: 'Zero egress fees', bringbucket: 'On Cloudflare R2', competitor: false },
      { label: 'AES-256 encryption', bringbucket: true, competitor: true },
      { label: 'Team workspaces', bringbucket: true, competitor: true },
      { label: 'Data ownership', bringbucket: 'Your cloud account', competitor: 'Dropbox servers' },
      { label: 'Pricing model', bringbucket: 'Pay your provider + interface fee', competitor: 'Per-seat, per-GB' },
      { label: 'Lock-in risk', bringbucket: 'None — disconnect anytime', competitor: 'High — data on their servers' },
      { label: 'API access', bringbucket: true, competitor: 'Business plan only' },
    ],
  },
  {
    slug: 'google-drive',
    name: 'Google Drive',
    tagline: 'How BringBucket compares to Google Drive',
    features: [
      { label: 'Bring your own storage', bringbucket: true, competitor: false },
      { label: 'S3-compatible API', bringbucket: true, competitor: false },
      { label: 'Storage cap (free)', bringbucket: 'None from us', competitor: '15 GB shared' },
      { label: 'Zero egress fees', bringbucket: 'On Cloudflare R2', competitor: false },
      { label: 'End-to-end encryption', bringbucket: true, competitor: false },
      { label: 'Team workspaces', bringbucket: true, competitor: 'Google Workspace only' },
      { label: 'Data ownership', bringbucket: 'Your cloud account', competitor: 'Google servers' },
      { label: 'Pricing model', bringbucket: 'Pay your provider + interface fee', competitor: 'Per-seat Google Workspace' },
      { label: 'API access', bringbucket: true, competitor: true },
      { label: 'Offline access', bringbucket: false, competitor: true },
    ],
  },
  {
    slug: 'box',
    name: 'Box',
    tagline: 'How BringBucket compares to Box',
    features: [
      { label: 'Bring your own storage', bringbucket: true, competitor: false },
      { label: 'S3-compatible API', bringbucket: true, competitor: false },
      { label: 'File size limit (free)', bringbucket: 'None from us', competitor: '250 MB' },
      { label: 'Zero egress fees', bringbucket: 'On Cloudflare R2', competitor: false },
      { label: 'AES-256 encryption', bringbucket: true, competitor: true },
      { label: 'RBAC / permissions', bringbucket: true, competitor: true },
      { label: 'Data ownership', bringbucket: 'Your cloud account', competitor: 'Box servers' },
      { label: 'Pricing model', bringbucket: 'Pay your provider + interface fee', competitor: 'Per-seat, enterprise tiers' },
      { label: 'Lock-in risk', bringbucket: 'None — disconnect anytime', competitor: 'High — contract-based' },
      { label: 'API access', bringbucket: true, competitor: true },
    ],
  },
  {
    slug: 'pcloud',
    name: 'pCloud',
    tagline: 'How BringBucket compares to pCloud',
    features: [
      { label: 'Bring your own storage', bringbucket: true, competitor: false },
      { label: 'S3-compatible API', bringbucket: true, competitor: false },
      { label: 'Zero egress fees', bringbucket: 'On Cloudflare R2', competitor: false },
      { label: 'AES-256 encryption', bringbucket: true, competitor: 'Client-side only (paid add-on)' },
      { label: 'Team workspaces', bringbucket: true, competitor: 'Business plan only' },
      { label: 'Data ownership', bringbucket: 'Your cloud account', competitor: 'pCloud servers' },
      { label: 'Pricing model', bringbucket: 'Pay your provider + interface fee', competitor: 'Lifetime or annual plans' },
      { label: 'Storage cap', bringbucket: 'None from us', competitor: '10 GB free, paid tiers' },
      { label: 'Lock-in risk', bringbucket: 'None — disconnect anytime', competitor: 'Medium' },
      { label: 'API access', bringbucket: true, competitor: 'Limited' },
    ],
  },
  {
    slug: 'notion',
    name: 'Notion Files',
    tagline: 'How BringBucket compares to Notion file storage',
    features: [
      { label: 'Bring your own storage', bringbucket: true, competitor: false },
      { label: 'Dedicated file manager', bringbucket: true, competitor: false },
      { label: 'S3-compatible API', bringbucket: true, competitor: false },
      { label: 'Zero egress fees', bringbucket: 'On Cloudflare R2', competitor: false },
      { label: 'File size limit', bringbucket: 'None from us', competitor: '5 MB (free), 100 MB (paid)' },
      { label: 'Data ownership', bringbucket: 'Your cloud account', competitor: 'Notion servers' },
      { label: 'Storage analytics', bringbucket: true, competitor: false },
      { label: 'Role-based access', bringbucket: true, competitor: true },
      { label: 'Pricing model', bringbucket: 'Pay your provider + interface fee', competitor: 'Per-seat workspace' },
      { label: 'API access', bringbucket: true, competitor: 'Limited (via Notion API)' },
    ],
  },
]
