"use client";

import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { LockKeyIcon } from "@hugeicons/core-free-icons";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useBetaMode } from "@/lib/admin";

export function LockedState({
  title,
  description,
  ctaHref = "/app/billing",
  ctaLabel = "Upgrade",
}: {
  title: string;
  description: string;
  ctaHref?: string;
  ctaLabel?: string;
}) {
  const { data: isBeta = true } = useBetaMode();

  return (
    <Card className="border-dashed border-amber-500/40 bg-amber-500/5">
      <CardContent className="flex flex-col items-start gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600">
            <HugeiconsIcon icon={LockKeyIcon} className="size-4" strokeWidth={1.8} />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-semibold">{title}</p>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        </div>
        {isBeta ? (
          <Button size="sm" variant="outline" className="gap-1.5" disabled>
            Coming soon
          </Button>
        ) : (
          <Button size="sm" variant="outline" className="gap-1.5" asChild>
            <Link href={ctaHref}>{ctaLabel}</Link>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
