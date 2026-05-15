"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { GoogleLogo } from "@/components/icons";
import { Logo } from "@/components/common/logo";
import { signIn, useSession } from "@/lib/auth-client";
import { toast } from "sonner";
import { useAppConfig } from "@/lib/admin";
import { Shield, Zap, Share2 } from "lucide-react";

const FEATURES = [
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
];

const PROVIDERS = [
  { initials: "S3", color: "bg-amber-500/15 text-amber-400", label: "Amazon S3" },
  { initials: "R2", color: "bg-orange-500/15 text-orange-400", label: "Cloudflare R2" },
  { initials: "GCS", color: "bg-blue-500/15 text-blue-400", label: "Google Cloud" },
  { initials: "AZ", color: "bg-sky-500/15 text-sky-400", label: "Azure" },
  { initials: "MI", color: "bg-red-500/15 text-red-400", label: "MinIO" },
  { initials: "SB", color: "bg-emerald-500/15 text-emerald-400", label: "Supabase" },
];

export default function Login() {
  const [loading, setLoading] = useState(false);
  const { data: session, isPending } = useSession();
  const { data: appConfig } = useAppConfig();
  const router = useRouter();

  useEffect(() => {
    if (!isPending && session?.user) {
      router.replace("/app");
    }
  }, [session, isPending, router]);

  async function handleGoogleSignIn() {
    setLoading(true);
    try {
      await signIn();
    } catch {
      toast.error("Sign in failed. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="grid h-screen w-full lg:grid-cols-2">
      {/* Left — form */}
      <div className="flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <div className="w-full border border-border/70 pb-0 rounded-xl bg-card p-1 shadow-lg/5">
            <div className="border border-border/70 bg-muted/60 px-10 py-14 rounded-lg">
              <Logo variant="icon" className="mx-auto size-12" />
              <h1 className="mt-3 text-center font-medium text-2xl tracking-[-0.015em]">
                Login to BringBucket
              </h1>

              <div className="mt-10">
                <Button
                  className="w-full"
                  size="lg"
                  type="button"
                  disabled={loading}
                  onClick={handleGoogleSignIn}
                >
                  <GoogleLogo className="mr-2 size-4" />
                  {loading ? "Redirecting…" : "Continue with Google"}
                </Button>
                {appConfig && !appConfig.signupsEnabled && (
                  <p className="mt-3 text-center text-xs text-amber-600 dark:text-amber-400">
                    New sign-ups are currently closed. Existing accounts can still log in.
                  </p>
                )}
              </div>
            </div>

            <div className="relative py-5">
              <div
                className="absolute inset-0 z-0"
                style={{
                  backgroundImage: `
                    linear-gradient(45deg, transparent 49%, var(--border) 49%, var(--border) 51%, transparent 51%),
                    linear-gradient(-45deg, transparent 49%, var(--border) 49%, var(--border) 51%, transparent 51%)
                  `,
                  backgroundSize: "40px 40px",
                  WebkitMaskImage:
                    "radial-gradient(ellipse 60% 60% at 50% 50%, #000 10%, transparent 90%)",
                  maskImage:
                    "radial-gradient(ellipse 60% 60% at 50% 50%, #000 10%, transparent 90%)",
                }}
              />
              <p className="relative isolate text-center text-sm">
                New to BringBucket?{" "}
                <Link className="text-muted-foreground underline" href="/auth/signup">
                  Create an account
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right — showcase */}
      <div className="hidden lg:flex flex-col justify-between bg-[oklch(0.16_0.03_277)] text-white p-12 relative overflow-hidden">
        {/* Background pattern */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `radial-gradient(circle, white 1px, transparent 1px)`,
            backgroundSize: "28px 28px",
          }}
        />
        {/* Glow */}
        <div className="absolute -top-32 -right-32 size-96 rounded-full bg-primary/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 size-96 rounded-full bg-primary/10 blur-3xl pointer-events-none" />

        {/* Top — logo + tagline */}
        <div className="relative">
          <div className="flex items-center gap-2 mb-10">
            <Logo variant="icon" className="size-10 brightness-0 invert" />
            <span className="font-semibold text-lg tracking-tight">BringBucket</span>
          </div>
          <h2 className="text-3xl font-bold leading-tight tracking-tight text-white/95">
            Your cloud storage,<br />under your control.
          </h2>
          <p className="mt-3 text-white/50 text-sm leading-relaxed max-w-xs">
            Connect any S3-compatible provider and manage all your files from one place — without giving us your data.
          </p>
        </div>

        {/* Middle — feature list */}
        <div className="relative space-y-6">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex gap-4">
              <div className="mt-0.5 shrink-0 flex size-9 items-center justify-center rounded-lg bg-white/5 border border-white/10">
                <Icon className="size-4 text-primary-foreground opacity-80" />
              </div>
              <div>
                <p className="text-sm font-medium text-white/90">{title}</p>
                <p className="text-xs text-white/45 mt-0.5 leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom — provider chips */}
        <div className="relative">
          <p className="text-xs text-white/35 mb-3 uppercase tracking-widest font-medium">Supported providers</p>
          <div className="flex flex-wrap gap-2">
            {PROVIDERS.map(({ initials, color, label }) => (
              <div
                key={initials}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium ${color} border border-white/5`}
                title={label}
              >
                <span className="font-bold text-[11px]">{initials}</span>
                <span className="opacity-70">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
