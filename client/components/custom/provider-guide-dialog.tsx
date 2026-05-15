"use client";

import { useState } from "react";
import { ExternalLink, Copy, Check, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { getProviderGuide, type GuideStep } from "@/lib/provider-guides";

// ─── Provider accent colours ──────────────────────────────────────────────────

const PROVIDER_STYLE: Record<string, { initials: string; color: string; bgColor: string; gradientFrom: string }> = {
  aws:      { initials: "S3",  color: "text-amber-600",   bgColor: "bg-amber-500/10",   gradientFrom: "from-amber-500/10" },
  r2:       { initials: "R2",  color: "text-orange-600",  bgColor: "bg-orange-500/10",  gradientFrom: "from-orange-500/10" },
  gcs:      { initials: "GCS", color: "text-blue-600",    bgColor: "bg-blue-500/10",    gradientFrom: "from-blue-500/10" },
  azure:    { initials: "AZ",  color: "text-sky-600",     bgColor: "bg-sky-500/10",     gradientFrom: "from-sky-500/10" },
  minio:    { initials: "MI",  color: "text-red-600",     bgColor: "bg-red-500/10",     gradientFrom: "from-red-500/10" },
  supabase: { initials: "SB",  color: "text-emerald-600", bgColor: "bg-emerald-500/10", gradientFrom: "from-emerald-500/10" },
  other:    { initials: "S3+", color: "text-violet-600",  bgColor: "bg-violet-500/10",  gradientFrom: "from-violet-500/10" },
};

// ─── Copy button ──────────────────────────────────────────────────────────────

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <button
      onClick={copy}
      className={cn(
        "flex items-center gap-1 rounded px-2 py-1 text-[10px] font-medium transition-colors",
        copied
          ? "text-emerald-400 bg-emerald-500/10"
          : "text-zinc-400 hover:text-zinc-200 hover:bg-white/10",
      )}
    >
      {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}

// ─── Step block ───────────────────────────────────────────────────────────────

function StepBlock({
  step,
  index,
  total,
}: {
  step: GuideStep;
  index: number;
  total: number;
}) {
  const isLast = index === total - 1;

  return (
    <div className="flex gap-4">
      {/* Timeline column */}
      <div className="flex flex-col items-center">
        <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
          {index + 1}
        </div>
        {!isLast && <div className="mt-1 w-px flex-1 bg-border" />}
      </div>

      {/* Content */}
      <div className={cn("min-w-0 flex-1", !isLast && "pb-6")}>
        <p className="text-sm font-semibold leading-tight">{step.title}</p>
        <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
          {step.description}
        </p>

        {step.code && (
          <div className="mt-3 overflow-hidden rounded-lg border border-zinc-700/60 bg-zinc-900">
            {/* Terminal header */}
            <div className="flex items-center justify-between border-b border-zinc-700/60 px-3 py-2">
              <div className="flex gap-1.5">
                <span className="size-2.5 rounded-full bg-zinc-600" />
                <span className="size-2.5 rounded-full bg-zinc-600" />
                <span className="size-2.5 rounded-full bg-zinc-600" />
              </div>
              <CopyButton text={step.code} />
            </div>
            <pre className="overflow-x-auto px-4 py-3 text-[11px] font-mono leading-relaxed text-zinc-300">
              {step.code}
            </pre>
          </div>
        )}

        {step.link && (
          <a
            href={step.link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2.5 inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/50 px-2.5 py-1 text-[11px] font-medium text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors"
          >
            <ExternalLink className="size-3 shrink-0" />
            {step.link.label}
          </a>
        )}
      </div>
    </div>
  );
}

// ─── Dialog content body ──────────────────────────────────────────────────────

function GuideBody({
  guide,
  resolvedSteps,
  onClose,
}: {
  guide: ReturnType<typeof getProviderGuide>;
  resolvedSteps: GuideStep[] | undefined;
  onClose: () => void;
}) {
  if (!guide) {
    return (
      <div className="flex flex-1 items-center justify-center px-5 py-10">
        <p className="text-xs text-muted-foreground">No guide available for this provider.</p>
      </div>
    );
  }

  return (
    <>
      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
        {/* Intro callout */}
        <div className="flex items-start gap-2.5 rounded-lg border border-primary/20 bg-primary/5 px-3.5 py-3">
          <Info className="mt-0.5 size-3.5 shrink-0 text-primary" />
          <p className="text-xs leading-relaxed text-muted-foreground">{guide.intro}</p>
        </div>

        {/* Steps */}
        <div className="pt-1">
          {(resolvedSteps ?? []).map((step, i) => (
            <StepBlock key={i} step={step} index={i} total={resolvedSteps?.length ?? 0} />
          ))}
        </div>

        {/* Footer note */}
        <p className="rounded-lg bg-muted/50 px-4 py-3 text-center text-[11px] text-muted-foreground">
          After completing these steps, paste your credentials in the form and click{" "}
          <span className="font-medium text-foreground">Verify Connection</span>.
        </p>
      </div>

      <div className="shrink-0 border-t px-5 py-4">
        <Button className="w-full" onClick={onClose}>
          Done
        </Button>
      </div>
    </>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

export interface ProviderGuideDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  providerKey: string;
  bucketName?: string;
}

export function ProviderGuideDialog({
  open,
  onOpenChange,
  providerKey,
  bucketName,
}: ProviderGuideDialogProps) {
  const isMobile = useIsMobile();
  const guide = getProviderGuide(providerKey);
  const style = PROVIDER_STYLE[providerKey] ?? PROVIDER_STYLE.other;

  const resolvedSteps = bucketName
    ? guide?.steps.map((step) => ({
        ...step,
        code: step.code?.replace(/YOUR-BUCKET-NAME/g, bucketName),
        description: step.description.replace(/YOUR-BUCKET-NAME/g, bucketName),
      }))
    : guide?.steps;

  const Header = () => (
    <div className={cn("shrink-0 border-b bg-linear-to-b to-transparent px-5 pb-5 pt-5", style.gradientFrom)}>
      <div className="flex items-center gap-3">
        <div className={cn("flex size-9 items-center justify-center rounded-lg text-xs font-bold", style.bgColor, style.color)}>
          {style.initials}
        </div>
        <div>
          <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
            Setup guide
          </p>
          <p className="text-sm font-semibold">
            {guide?.providerName ?? "Your provider"}
          </p>
        </div>
        {resolvedSteps && (
          <span className="ml-auto rounded-full bg-muted px-2.5 py-1 text-[10px] font-medium text-muted-foreground">
            {resolvedSteps.length} steps
          </span>
        )}
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side="bottom"
          showCloseButton={false}
          className="flex max-h-[92vh] flex-col overflow-hidden rounded-t-xl p-0"
        >
          <SheetHeader className="p-0">
            <SheetTitle className="sr-only">
              {guide?.providerName ?? "Provider"} setup guide
            </SheetTitle>
            <Header />
          </SheetHeader>
          <div className="flex min-h-0 flex-1 flex-col">
            <GuideBody
              guide={guide}
              resolvedSteps={resolvedSteps}
              onClose={() => onOpenChange(false)}
            />
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="flex max-h-[90vh] max-w-2xl w-full flex-col gap-0 overflow-hidden p-0"
      >
        <DialogTitle className="sr-only">
          {guide?.providerName ?? "Provider"} setup guide
        </DialogTitle>
        <Header />
        <div className="flex min-h-0 flex-1 flex-col">
          <GuideBody
            guide={guide}
            resolvedSteps={resolvedSteps}
            onClose={() => onOpenChange(false)}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
