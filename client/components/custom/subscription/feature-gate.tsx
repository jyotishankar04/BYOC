"use client";

import type { ReactNode } from "react";
import { LockedState } from "./locked-state";
import { UpgradeTooltip } from "./upgrade-tooltip";

interface FeatureGateProps {
  enabled: boolean;
  message: string;
  children: ReactNode;
  mode?: "tooltip" | "section";
  title?: string;
  description?: string;
  ctaHref?: string;
  ctaLabel?: string;
  className?: string;
}

export function FeatureGate({
  enabled,
  message,
  children,
  mode = "tooltip",
  title = "Upgrade required",
  description,
  ctaHref,
  ctaLabel,
  className,
}: FeatureGateProps) {
  if (enabled) {
    return <>{children}</>;
  }

  if (mode === "section") {
    return (
      <LockedState
        title={title}
        description={description ?? message}
        ctaHref={ctaHref}
        ctaLabel={ctaLabel}
      />
    );
  }

  return (
    <UpgradeTooltip
      disabled
      message={message}
      ctaHref={ctaHref}
      ctaLabel={ctaLabel}
      className={className}
    >
      {children}
    </UpgradeTooltip>
  );
}
