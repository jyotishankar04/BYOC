"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  CloudUploadIcon,
  Cancel01Icon,
  CheckmarkCircle01Icon,
  AlertCircleIcon,
  Video01Icon,
  Image01Icon,
  LegalDocument01Icon,
  ZipIcon,
  FileUploadIcon,
} from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { fileKeys } from "@/lib/files";
import {
  useUploadStore,
  type UploadItem,
  type FileKind,
} from "@/stores/upload-store";

const KIND_ICON: Record<FileKind, typeof CloudUploadIcon> = {
  Video: Video01Icon,
  Image: Image01Icon,
  Document: LegalDocument01Icon,
  Archive: ZipIcon,
  Other: FileUploadIcon,
};

const KIND_COLOR: Record<FileKind, string> = {
  Video: "text-blue-500",
  Image: "text-violet-500",
  Document: "text-amber-500",
  Archive: "text-slate-500",
  Other: "text-muted-foreground",
};

function getOverallProgress(uploads: UploadItem[]) {
  const active = uploads.filter((u) => u.status === "uploading");
  if (active.length === 0) return 0;
  const totalProgress = active.reduce((sum, u) => sum + u.progress, 0);
  return Math.round(totalProgress / active.length);
}

function UploadRow({
  item,
  onDismiss,
}: {
  item: UploadItem;
  onDismiss: (id: string) => void;
}) {
  const isDone = item.status === "done";
  const isError = item.status === "error";

  return (
    <div className="flex items-start gap-2.5 border-b px-3 py-2.5 last:border-0">
      <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-muted mt-0.5">
        <HugeiconsIcon
          icon={KIND_ICON[item.kind]}
          className={cn("size-3.5", KIND_COLOR[item.kind])}
          strokeWidth={1.5}
        />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-xs font-medium">{item.fileName}</p>
          <span className="shrink-0 text-[10px] tabular-nums text-muted-foreground">
            {item.formattedSize}
          </span>
        </div>
        <div className="mt-1">
          <Progress
            value={item.progress}
            className={cn(
              "h-1",
              isDone && "[&>[data-slot=progress-indicator]]:bg-emerald-500",
              isError && "[&>[data-slot=progress-indicator]]:bg-destructive",
            )}
          />
          <div className="mt-0.5 flex items-center justify-between">
            <p className="text-[10px] tabular-nums text-muted-foreground">
              {isDone
                ? "Done"
                : isError
                  ? (item.error ?? "Failed")
                  : `${Math.round(item.progress)}%`}
            </p>
          </div>
        </div>
      </div>
      {isDone ? (
        <HugeiconsIcon
          icon={CheckmarkCircle01Icon}
          className="size-4 shrink-0 text-emerald-500 mt-0.5"
          strokeWidth={1.5}
        />
      ) : isError ? (
        <HugeiconsIcon
          icon={AlertCircleIcon}
          className="size-4 shrink-0 text-destructive mt-0.5"
          strokeWidth={1.5}
        />
      ) : (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDismiss(item.id);
          }}
          className="rounded p-0.5 text-muted-foreground/50 hover:text-foreground transition-colors shrink-0 mt-0.5"
        >
          <HugeiconsIcon
            icon={Cancel01Icon}
            className="size-3"
            strokeWidth={1.5}
          />
        </button>
      )}
    </div>
  );
}

export function FloatingUploadBar() {
  const [open, setOpen] = useState(false);
  const qc = useQueryClient();

  const uploads = useUploadStore((s) => s.uploads);
  const clearCompleted = useUploadStore((s) => s.clearCompleted);
  const dismissUpload = useUploadStore((s) => s.dismissUpload);

  const doneWsKey = useUploadStore((s) =>
    [
      ...new Set(
        s.uploads.filter((u) => u.status === "done").map((u) => u.workspaceId),
      ),
    ]
      .sort()
      .join(","),
  );

  const activeCount = useMemo(
    () => uploads.filter((u) => u.status === "uploading").length,
    [uploads],
  );
  const hasCompleted = useMemo(
    () => uploads.some((u) => u.status === "done" || u.status === "error"),
    [uploads],
  );
  const overallPct = useMemo(() => getOverallProgress(uploads), [uploads]);

  // Auto-open popover when new uploads are added
  const prevLenRef = useRef(uploads.length);
  useEffect(() => {
    if (uploads.length > prevLenRef.current) {
      setOpen(true);
    }
    prevLenRef.current = uploads.length;
  }, [uploads.length]);

  // Invalidate file list when any upload completes
  useEffect(() => {
    if (!doneWsKey) return;
    for (const wsId of doneWsKey.split(",")) {
      qc.invalidateQueries({ queryKey: fileKeys.all(wsId) });
    }
  }, [doneWsKey, qc]);

  if (uploads.length === 0) return null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className={cn(
            "fixed bottom-4 right-4 z-50 flex cursor-pointer items-center gap-2 rounded-full border bg-background px-3.5 py-2 shadow-lg transition-all duration-200 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]",
            "select-none",
          )}
        >
          <div className="flex size-5 items-center justify-center">
            {activeCount > 0 ? (
              <HugeiconsIcon
                icon={CloudUploadIcon}
                className="size-3.5 text-primary"
                strokeWidth={1.5}
              />
            ) : uploads.every((u) => u.status === "done") ? (
              <HugeiconsIcon
                icon={CheckmarkCircle01Icon}
                className="size-4 text-emerald-500"
                strokeWidth={1.5}
              />
            ) : (
              <HugeiconsIcon
                icon={AlertCircleIcon}
                className="size-4 text-destructive"
                strokeWidth={1.5}
              />
            )}
          </div>
          <span className="text-xs font-medium">
            {activeCount > 0
              ? `Uploading ${activeCount} file${activeCount !== 1 ? "s" : ""}`
              : uploads.every((u) => u.status === "done")
                ? "Uploads complete"
                : "Upload failed"}
          </span>
          {activeCount > 0 && (
            <span className="text-xs tabular-nums text-muted-foreground font-medium">
              {overallPct}%
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent
        side="top"
        align="end"
        sideOffset={8}
        className="w-80 p-0"
      >
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h4 className="text-sm font-semibold">Uploads</h4>
          <button
            onClick={() => setOpen(false)}
            className="rounded p-1 text-muted-foreground hover:text-foreground transition-colors"
          >
            <HugeiconsIcon
              icon={Cancel01Icon}
              className="size-3.5"
              strokeWidth={1.5}
            />
          </button>
        </div>
        <div className="max-h-80 overflow-y-auto">
          {uploads.map((item) => (
            <UploadRow key={item.id} item={item} onDismiss={dismissUpload} />
          ))}
        </div>
        {hasCompleted && (
          <div className="border-t px-3 py-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => clearCompleted()}
              className="h-8 w-full text-xs"
            >
              Clear completed
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
