export interface PricingTier {
  label: string;
  pricePerGb: number;
  maxGb: number | null;
}

export interface ProviderPricing {
  id: string;
  name: string;
  storageTiers: PricingTier[];
  dataTransferPerGb: number;
  putCostPerThousand: number;
  getCostPerThousand: number;
  dataTransferLabel: string;
}

export const PROVIDER_PRICING: Record<string, ProviderPricing> = {
  AWS_S3: {
    id: "AWS_S3",
    name: "AWS S3 Standard",
    storageTiers: [
      { label: "First 50 TB/month", pricePerGb: 0.023, maxGb: 50 * 1024 },
      { label: "Next 450 TB/month", pricePerGb: 0.022, maxGb: 500 * 1024 },
      { label: "Over 500 TB/month", pricePerGb: 0.021, maxGb: null },
    ],
    dataTransferPerGb: 0.09,
    putCostPerThousand: 0.005,
    getCostPerThousand: 0.0004,
    dataTransferLabel: "$0.09/GB · first 10 TB/month",
  },
  CLOUDFLARE_R2: {
    id: "CLOUDFLARE_R2",
    name: "Cloudflare R2",
    storageTiers: [
      { label: "All storage", pricePerGb: 0.015, maxGb: null },
    ],
    dataTransferPerGb: 0,
    putCostPerThousand: 0.0045,
    getCostPerThousand: 0.00036,
    dataTransferLabel: "Free (no egress fees)",
  },
}

export function guessProviderId(providerName: string): string {
  const name = providerName.toLowerCase()
  if (name.includes("cloudflare") || name.includes("r2")) return "CLOUDFLARE_R2"
  if (name.includes("aws") || name.includes("s3")) return "AWS_S3"
  if (name.includes("minio")) return "AWS_S3"
  if (name.includes("supabase")) return "AWS_S3"
  return "AWS_S3"
}

export function computeStorageCost(gb: number, pricing: ProviderPricing): number {
  let remaining = gb
  let total = 0
  for (const tier of pricing.storageTiers) {
    if (remaining <= 0) break
    const tierGb = tier.maxGb !== null ? Math.min(remaining, tier.maxGb) : remaining
    total += tierGb * tier.pricePerGb
    remaining -= tierGb
  }
  return total
}

export interface CostBreakdown {
  storage: { gb: number; cost: number; pricePerGb: string };
  dataTransfer: { gb: number; cost: number; pricePerGb: string };
  putRequests: { count: number; cost: number; pricePerThousand: string };
  getRequests: { count: number; cost: number; pricePerThousand: string };
  total: number;
}

export function computeCosts(
  storageGb: number,
  transferGb: number,
  putRequests: number,
  getRequests: number,
  pricing: ProviderPricing,
): CostBreakdown {
  const storageCost = computeStorageCost(storageGb, pricing)
  const transferCost = transferGb * pricing.dataTransferPerGb
  const putCost = (putRequests / 1000) * pricing.putCostPerThousand
  const getCost = (getRequests / 1000) * pricing.getCostPerThousand

  return {
    storage: { gb: storageGb, cost: storageCost, pricePerGb: `$${pricing.storageTiers[0]!.pricePerGb.toFixed(3)}/GB` },
    dataTransfer: { gb: transferGb, cost: transferCost, pricePerGb: pricing.dataTransferLabel },
    putRequests: { count: putRequests, cost: putCost, pricePerThousand: `$${pricing.putCostPerThousand.toFixed(4)}/1K` },
    getRequests: { count: getRequests, cost: getCost, pricePerThousand: `$${pricing.getCostPerThousand.toFixed(4)}/1K` },
    total: storageCost + transferCost + putCost + getCost,
  }
}

export function formatCurrency(amount: number): string {
  if (amount < 0.01) return `$${amount.toFixed(4)}`
  if (amount < 1) return `$${amount.toFixed(3)}`
  return `$${amount.toFixed(2)}`
}

// ─── Provider display metadata for integrations page ──────────────────────────

export interface ProviderDisplayInfo {
  id: string;
  name: string;
  shortName: string;
  description: string;
  logoColor: string;
  logoBg: string;
  initials: string;
}

export const PROVIDER_DISPLAY: Record<string, ProviderDisplayInfo> = {
  S3: {
    id: "aws-s3",
    name: "Amazon S3",
    shortName: "S3",
    description: "Industry-standard object storage with 99.999999999% durability and global availability.",
    logoColor: "text-amber-600",
    logoBg: "bg-amber-500/10",
    initials: "S3",
  },
  R2: {
    id: "r2",
    name: "Cloudflare R2",
    shortName: "R2",
    description: "Zero egress-fee object storage compatible with the S3 API — ideal for cost savings.",
    logoColor: "text-orange-600",
    logoBg: "bg-orange-500/10",
    initials: "R2",
  },
  MinIO: {
    id: "minio",
    name: "MinIO",
    shortName: "MinIO",
    description: "High-performance, self-hosted S3-compatible object storage for private cloud.",
    logoColor: "text-red-600",
    logoBg: "bg-red-500/10",
    initials: "M",
  },
  Supabase: {
    id: "supabase",
    name: "Supabase Storage",
    shortName: "Supabase",
    description: "Built-in S3-compatible storage for Supabase projects with PostgreSQL integration.",
    logoColor: "text-emerald-600",
    logoBg: "bg-emerald-500/10",
    initials: "SB",
  },
  Other: {
    id: "other",
    name: "S3-Compatible",
    shortName: "S3",
    description: "Any generic S3-compatible object storage provider with a custom endpoint.",
    logoColor: "text-slate-600",
    logoBg: "bg-slate-500/10",
    initials: "S3",
  },
}

export function getProviderDisplay(providerType: string): ProviderDisplayInfo {
  return PROVIDER_DISPLAY[providerType] ?? PROVIDER_DISPLAY.Other
}
