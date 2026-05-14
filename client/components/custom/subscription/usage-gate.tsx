"use client";

import type { ReactNode } from "react";
import { UpgradeTooltip } from "./upgrade-tooltip";

interface UsageGateProps {
  allowed: boolean;
  message: string;
  children: ReactNode;
  ctaHref?: string;
  ctaLabel?: string;
  className?: string;
}

export function UsageGate({
  allowed,
  message,
  children,
  ctaHref,
  ctaLabel,
  className,
}: UsageGateProps) {
  return (
    <UpgradeTooltip
      disabled={!allowed}
      message={message}
      ctaHref={ctaHref}
      ctaLabel={ctaLabel}
      className={className}
    >
      {children}
    </UpgradeTooltip>
  );
}
