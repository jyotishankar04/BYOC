import { Shield, Zap, Share2 } from "lucide-react";

export const AUTH_FEATURES = [
  {
    icon: Zap,
    title: "Connect any S3-compatible storage",
    desc: "Amazon S3, Cloudflare R2, MinIO, Supabase and more — one dashboard for all of them.",
  },
  {
    icon: Share2,
    title: "Secure, expiring share links",
    desc: "Generate public or password-protected links with optional expiry dates.",
  },
  {
    icon: Shield,
    title: "Your data stays yours",
    desc: "Credentials are AES-256 encrypted at rest. We never read your files.",
  },
] as const;

export const AUTH_PROVIDERS = [
  { initials: "S3", color: "bg-amber-500/15 text-amber-400", label: "Amazon S3" },
  { initials: "R2", color: "bg-orange-500/15 text-orange-400", label: "Cloudflare R2" },
  { initials: "GCS", color: "bg-blue-500/15 text-blue-400", label: "Google Cloud" },
  { initials: "AZ", color: "bg-sky-500/15 text-sky-400", label: "Azure" },
  { initials: "MI", color: "bg-red-500/15 text-red-400", label: "MinIO" },
  { initials: "SB", color: "bg-emerald-500/15 text-emerald-400", label: "Supabase" },
] as const;
