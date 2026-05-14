"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import { Loading01Icon } from "@hugeicons/core-free-icons";
import { useSession } from "@/lib/auth-client";

interface AuthGuardProps {
  children: React.ReactNode;
  requireOnboarded?: boolean;
}

export function AuthGuard({
  children,
  requireOnboarded = true,
}: AuthGuardProps) {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isPending) return;

    if (!session?.user) {
      const from = encodeURIComponent(pathname);
      router.replace(`/auth/login?from=${from}`);
      return;
    }

    if (requireOnboarded && !session.user.onboarded) {
      router.replace("/onboard");
    }
  }, [isPending, session, router, pathname, requireOnboarded]);

  if (isPending) {
    return (
      <div className="flex h-screen items-center justify-center">
        <HugeiconsIcon
          icon={Loading01Icon}
          className="size-6 animate-spin text-muted-foreground"
          strokeWidth={1.5}
        />
      </div>
    );
  }

  if (!session?.user) return null;

  if (requireOnboarded && !session.user.onboarded) return null;

  return <>{children}</>;
}
