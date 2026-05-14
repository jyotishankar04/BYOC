"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight01Icon, LockKeyIcon } from "@hugeicons/core-free-icons";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export function UpgradeTooltip({
  disabled,
  message,
  children,
  ctaLabel = "Upgrade",
  ctaHref = "/app/billing",
  className,
}: {
  disabled: boolean;
  message: string;
  children: ReactNode;
  ctaLabel?: string;
  ctaHref?: string;
  className?: string;
}) {
  if (!disabled) {
    return <>{children}</>;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            tabIndex={0}
            className={cn("inline-flex cursor-not-allowed", className)}
          >
            {children}
          </span>
        </TooltipTrigger>
        <TooltipContent sideOffset={8} className="max-w-64 rounded-xl px-3 py-2 text-left">
          <div className="flex items-start gap-2">
            <HugeiconsIcon icon={LockKeyIcon} className="mt-0.5 size-3.5 shrink-0" strokeWidth={1.8} />
            <div className="space-y-1">
              <p>{message}</p>
              <Link
                href={ctaHref}
                className="inline-flex items-center gap-1 text-[11px] font-medium text-blue-400 underline underline-offset-2"
              >
                {ctaLabel}
                <HugeiconsIcon icon={ArrowRight01Icon} className="size-3" strokeWidth={1.8} />
              </Link>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
