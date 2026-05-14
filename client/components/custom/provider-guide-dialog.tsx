"use client";

import { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Copy01Icon,
  Link01Icon,
  InformationCircleIcon,
} from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { getProviderGuide, type GuideStep } from "@/lib/provider-guides";

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
        "flex items-center gap-1 rounded px-1.5 py-1 text-[10px] transition-colors",
        copied
          ? "text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/20"
          : "text-muted-foreground hover:text-foreground hover:bg-muted",
      )}
    >
      <HugeiconsIcon icon={Copy01Icon} className="size-3" strokeWidth={2} />
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}

function StepBlock({ step, index }: { step: GuideStep; index: number }) {
  return (
    <div className="space-y-2">
      <div className="flex items-start gap-3">
        <div className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-semibold text-primary mt-0.5">
          {index + 1}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold">{step.title}</p>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            {step.description}
          </p>
        </div>
      </div>

      {step.code && (
        <div className="ml-8">
          <div className="relative rounded-md border bg-muted/50">
            <pre className="overflow-x-auto p-3 text-[11px] font-mono leading-relaxed text-foreground/80">
              {step.code}
            </pre>
            <div className="absolute right-1.5 top-1.5">
              <CopyButton text={step.code} />
            </div>
          </div>
        </div>
      )}

      {step.link && (
        <a
          href={step.link.url}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-8 inline-flex items-center gap-1 text-[11px] font-medium text-primary hover:text-primary/80 transition-colors"
        >
          <HugeiconsIcon
            icon={Link01Icon}
            className="size-3"
            strokeWidth={1.5}
          />
          {step.link.label}
        </a>
      )}
    </div>
  );
}

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

  const resolvedSteps = bucketName
    ? guide?.steps.map((step) => ({
        ...step,
        code: step.code?.replace(/YOUR-BUCKET-NAME/g, bucketName),
        description: step.description.replace(
          /YOUR-BUCKET-NAME/g,
          bucketName,
        ),
      }))
    : guide?.steps;

  const body = guide ? (
    <>
      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
        <div className="flex items-start gap-2 rounded-lg border border-primary/20 bg-primary/5 px-3 py-2.5">
          <HugeiconsIcon
            icon={InformationCircleIcon}
            className="size-3.5 mt-0.5 shrink-0 text-primary"
            strokeWidth={1.5}
          />
          <p className="text-xs text-muted-foreground">{guide.intro}</p>
        </div>

        <div className="space-y-4">
          {(resolvedSteps ?? []).map((step, i) => (
            <StepBlock key={i} step={step} index={i} />
          ))}
        </div>

        <Separator />

        <p className="text-[11px] text-muted-foreground text-center">
          After completing these steps, paste your credentials in the form and
          click Verify / Connect.
        </p>
      </div>
      <div className="shrink-0 border-t px-5 py-4">
        <Button className="w-full" onClick={() => onOpenChange(false)}>
          Got it
        </Button>
      </div>
    </>
  ) : (
    <div className="flex-1 flex items-center justify-center px-5 py-10">
      <p className="text-xs text-muted-foreground">
        No guide available for this provider.
      </p>
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
          <SheetHeader className="shrink-0 border-b px-5 pb-4 pt-5 text-left">
            <SheetTitle className="text-base">
              How to set up {guide?.providerName ?? "your provider"}
            </SheetTitle>
          </SheetHeader>
          <div className="flex min-h-0 flex-1 flex-col">{body}</div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="flex max-h-[90vh] max-w-lg flex-col gap-0 overflow-hidden p-0"
      >
        <div className="shrink-0 border-b px-5 pb-4 pt-5">
          <DialogTitle className="text-base">
            How to set up {guide?.providerName ?? "your provider"}
          </DialogTitle>
        </div>
        <div className="flex min-h-0 flex-1 flex-col">{body}</div>
      </DialogContent>
    </Dialog>
  );
}
