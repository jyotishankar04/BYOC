"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { GoogleLogo } from "@/components/icons";
import { Logo } from "@/components/common/logo";
import { signIn } from "@/lib/auth-client";
import { toast } from "sonner";

export default function Signup() {
  const [loading, setLoading] = useState(false);

  async function handleGoogleSignUp() {
    setLoading(true);
    try {
      await signIn();
    } catch {
      toast.error("Sign up failed. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="grid h-screen w-full p-4 lg:grid-cols-2">
      <div className="m-auto flex w-full max-w-sm flex-col">
        <div className="w-full border border-border/70 pb-0 rounded-xl sm:bg-card sm:p-1 sm:shadow-lg/3">
          <div className="border border-border/70 bg-muted/60 px-10 py-14 rounded-lg sm:shadow-sm/2">
            <Logo className="mx-auto size-9" />
            <h1 className="mt-3 text-center font-medium text-2xl tracking-[-0.015em]">
              Create your account
            </h1>

            <div className="mt-10">
              <Button
                className="w-full"
                size="lg"
                type="button"
                disabled={loading}
                onClick={handleGoogleSignUp}
              >
                <GoogleLogo className="mr-2 size-4" />
                {loading ? "Redirecting…" : "Sign up with Google"}
              </Button>
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
              Already have an account?{" "}
              <Link
                className="text-muted-foreground underline"
                href="/auth/login"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
      <div className="hidden rounded-lg border bg-muted lg:block" />
    </div>
  );
}
