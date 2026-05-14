"use client";

import { useState, useRef, useCallback } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  CloudUploadIcon,
  Video01Icon,
  Image01Icon,
  LegalDocument01Icon,
  ZipIcon,
  Cancel01Icon,
  CloudServerIcon,
  FileUploadIcon,
  AlertCircleIcon,
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
import { useUploadStore } from "@/stores/upload-store";
import { useWorkspace } from "@/lib/workspace-context";

type FileKind = "Video" | "Image" | "Document" | "Archive" | "Other";

interface LocalFile {
  id: string;
  name: string;
  size: string;
  kind: FileKind;
  rawFile: File;
}

const KIND_META: Record<
  FileKind,
  {
    icon: typeof CloudUploadIcon;
    color: string;
    bg: string;
  }
> = {
  Video: { icon: Video01Icon, color: "text-blue-500", bg: "bg-blue-500/10" },
  Image: {
    icon: Image01Icon,
    color: "text-violet-500",
    bg: "bg-violet-500/10",
  },
  Document: {
    icon: LegalDocument01Icon,
    color: "text-amber-500",
    bg: "bg-amber-500/10",
  },
  Archive: { icon: ZipIcon, color: "text-slate-500", bg: "bg-slate-500/10" },
  Other: {
    icon: FileUploadIcon,
    color: "text-muted-foreground",
    bg: "bg-muted",
  },
};

function formatBytes(bytes: number): string {
  if (bytes >= 1e9) return `${(bytes / 1e9).toFixed(1)} GB`;
  if (bytes >= 1e6) return `${(bytes / 1e6).toFixed(1)} MB`;
  if (bytes >= 1e3) return `${Math.round(bytes / 1e3)} KB`;
  return `${bytes} B`;
}

function detectKind(file: File): FileKind {
  const t = file.type;
  const n = file.name.toLowerCase();
  if (t.startsWith("video/")) return "Video";
  if (t.startsWith("image/")) return "Image";
  if (
    t.includes("pdf") ||
    t.includes("document") ||
    t.includes("sheet") ||
    t.includes("presentation") ||
    n.endsWith(".docx") ||
    n.endsWith(".xlsx") ||
    n.endsWith(".pptx")
  )
    return "Document";
  if (
    t.includes("zip") ||
    t.includes("tar") ||
    t.includes("rar") ||
    n.endsWith(".7z") ||
    n.endsWith(".gz")
  )
    return "Archive";
  return "Other";
}

function FileRow({
  file,
  onRemove,
}: {
  file: LocalFile;
  onRemove?: (id: string) => void;
}) {
  const meta = KIND_META[file.kind];

  return (
    <div className="overflow-hidden rounded-lg border bg-card">
      <div className="flex items-center gap-2.5 px-3 py-2.5">
        <div
          className={cn(
            "flex size-8 shrink-0 items-center justify-center rounded-md",
            meta.bg,
          )}
        >
          <HugeiconsIcon
            icon={meta.icon}
            className={cn("size-4", meta.color)}
            strokeWidth={1.5}
          />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-medium">{file.name}</p>
          <p className="text-[11px] text-muted-foreground">
            {file.kind} · {file.size}
          </p>
        </div>
        {onRemove ? (
          <button
            onClick={() => onRemove(file.id)}
            className="flex size-6 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <HugeiconsIcon
              icon={Cancel01Icon}
              className="size-3.5"
              strokeWidth={2}
            />
          </button>
        ) : null}
      </div>
    </div>
  );
}

export interface UploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  folderId?: string;
  onUploadComplete?: () => void;
}

export function UploadDialog({
  open,
  onOpenChange,
  folderId,
  onUploadComplete,
}: UploadDialogProps) {
  const isMobile = useIsMobile();
  const { currentWorkspace } = useWorkspace();
  const addUploads = useUploadStore((s) => s.addUploads);

  const workspaceId = currentWorkspace?.id;
  const providerName = currentWorkspace?.storage?.name;
  const providerBucket = currentWorkspace?.storage?.bucket;

  const [files, setFiles] = useState<LocalFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  const addFiles = useCallback((list: FileList | File[]) => {
    const items: LocalFile[] = Array.from(list).map((f) => ({
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      name: f.name,
      size: formatBytes(f.size),
      kind: detectKind(f),
      rawFile: f,
    }));
    setFiles((prev) => [...prev, ...items]);
  }, []);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node))
      setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      addFiles(e.dataTransfer.files);
    },
    [addFiles],
  );

  const handleBrowse = useCallback(() => inputRef.current?.click(), []);

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files?.length) {
        addFiles(e.target.files);
        e.target.value = "";
      }
    },
    [addFiles],
  );

  const removeFile = useCallback(
    (id: string) => setFiles((prev) => prev.filter((f) => f.id !== id)),
    [],
  );

  const [submitting, setSubmitting] = useState(false);

  const startUpload = useCallback(() => {
    if (!workspaceId || files.length === 0) return;

    setSubmitting(true);
    addUploads(
      files.map((f) => ({
        file: f.rawFile,
        workspaceId,
        folderId,
        onComplete: onUploadComplete,
      })),
    );

    setFiles([]);
    setIsDragging(false);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
    onOpenChange(false);
    setTimeout(() => setSubmitting(false), 300);
  }, [files, workspaceId, folderId, addUploads, onOpenChange, onUploadComplete]);

  const handleOpenChange = useCallback(
    (next: boolean) => {
      if (!next) {
        setTimeout(() => {
          setFiles([]);
          setIsDragging(false);
        }, 200);
      }
      onOpenChange(next);
    },
    [onOpenChange],
  );

  const body = (
    <>
      <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5">
        <input
          ref={inputRef}
          type="file"
          multiple
          className="sr-only"
          onChange={handleFileInput}
        />

        <div
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={handleBrowse}
          className={cn(
            "flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed py-10 transition-all duration-150",
            isDragging
              ? "scale-[1.01] border-primary bg-primary/5"
              : "border-border/60 bg-muted/30 hover:border-primary/40 hover:bg-muted/50",
          )}
        >
          <div
            className={cn(
              "flex size-12 items-center justify-center rounded-xl transition-colors",
              isDragging ? "bg-primary/10" : "bg-muted",
            )}
          >
            <HugeiconsIcon
              icon={CloudUploadIcon}
              className={cn(
                "size-6 transition-colors",
                isDragging ? "text-primary" : "text-muted-foreground",
              )}
              strokeWidth={1.5}
            />
          </div>
          <div className="text-center">
            <p
              className={cn(
                "text-sm font-medium",
                isDragging ? "text-primary" : "text-foreground",
              )}
            >
              {isDragging ? "Drop files here" : "Drag & drop files here"}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              or browse files from your device
            </p>
          </div>
        </div>

        {files.length > 0 && (
          <div>
            <p className="mb-2.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              Selected files ({files.length})
            </p>
            <div className="space-y-2">
              {files.map((f) => (
                <FileRow key={f.id} file={f} onRemove={removeFile} />
              ))}
            </div>
          </div>
        )}

        <Separator />

        {providerName && (
          <div className="rounded-lg border bg-muted/30 px-4 py-3">
            <div className="flex items-center gap-2.5">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-amber-500/10">
                <HugeiconsIcon
                  icon={CloudServerIcon}
                  className="size-4 text-amber-600"
                  strokeWidth={1.5}
                />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium">
                  Uploading to {providerName}
                </p>
                {providerBucket && (
                  <p className="truncate text-[11px] text-muted-foreground">
                    {providerBucket}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {providerName && (
          <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50/60 dark:border-amber-900/40 dark:bg-amber-950/20 px-3 py-2.5">
            <HugeiconsIcon
              icon={AlertCircleIcon}
              className="size-3.5 mt-0.5 shrink-0 text-amber-600"
              strokeWidth={1.5}
            />
            <p className="text-[11px] text-amber-700 dark:text-amber-300">
              Make sure your bucket has a{" "}
              <span className="font-medium">CORS policy</span> that allows PUT
              requests from this origin — see{" "}
              <span className="font-medium">Workspace Settings → Storage</span>.
            </p>
          </div>
        )}
      </div>

      <div className="shrink-0 flex items-center justify-between gap-3 border-t px-5 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleOpenChange(false)}
        >
          Cancel
        </Button>
        <Button size="sm" disabled={files.length === 0 || submitting} onClick={startUpload}>
          {submitting ? (
            <span className="size-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
          ) : (
            <HugeiconsIcon
              icon={CloudUploadIcon}
              className="size-3.5"
              strokeWidth={1.5}
            />
          )}
          {submitting ? "Starting..." : `Upload ${files.length > 0 ? `${files.length} file${files.length > 1 ? "s" : ""}` : "Files"}`}
        </Button>
      </div>
    </>
  );

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={handleOpenChange}>
        <SheetContent
          side="bottom"
          showCloseButton={false}
          className="flex max-h-[92vh] flex-col overflow-hidden rounded-t-xl p-0"
        >
          <SheetHeader className="shrink-0 border-b px-5 pb-4 pt-5 text-left">
            <SheetTitle className="text-base">Upload Files</SheetTitle>
            <p className="text-xs text-muted-foreground">
              Upload files directly to your connected cloud storage.
            </p>
          </SheetHeader>
          <div className="flex min-h-0 flex-1 flex-col">{body}</div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="flex max-h-[90vh] max-w-lg flex-col gap-0 overflow-hidden p-0"
      >
        <div className="shrink-0 border-b px-5 pb-4 pt-5">
          <DialogTitle className="text-base">Upload Files</DialogTitle>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Upload files directly to your connected cloud storage.
          </p>
        </div>
        <div className="flex min-h-0 flex-1 flex-col">{body}</div>
      </DialogContent>
    </Dialog>
  );
}
