"use client";

import { usePathname } from "next/navigation";
import { useAppConfig } from "@/lib/admin";
import { WrenchIcon } from "lucide-react";

// These paths are never blocked — admins need /admin to turn off maintenance,
// and /auth so they can log in first.
const EXEMPT_PREFIXES = ["/admin", "/auth"];

export function MaintenanceGate({ children }: { children: React.ReactNode }) {
  const { data: appConfig } = useAppConfig();
  const pathname = usePathname();

  const isExempt = EXEMPT_PREFIXES.some((prefix) => pathname.startsWith(prefix));

  if (appConfig?.maintenanceMode && !isExempt) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-amber-500/10">
          <WrenchIcon className="size-7 text-amber-500" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Under Maintenance</h1>
          <p className="mt-2 max-w-sm text-sm text-muted-foreground">
            We&apos;re making some improvements. The platform will be back shortly — thanks for your patience.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
