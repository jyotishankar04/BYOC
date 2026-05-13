"use client";

import { create } from "zustand";
import { uploadFile } from "@/lib/upload";

export type UploadStatus = "uploading" | "done" | "error";
export type FileKind = "Video" | "Image" | "Document" | "Archive" | "Other";

export interface UploadItem {
  id: string;
  fileName: string;
  fileSize: number;
  formattedSize: string;
  kind: FileKind;
  progress: number;
  status: UploadStatus;
  error?: string;
  workspaceId: string;
  folderId?: string;
  onComplete?: () => void;
  abortController: AbortController;
  rawFile: File;
}

interface AddUploadInput {
  file: File;
  workspaceId: string;
  folderId?: string;
  onComplete?: () => void;
}

interface UploadStore {
  uploads: UploadItem[];
  addUploads: (items: AddUploadInput[]) => void;
  cancelUpload: (id: string) => void;
  dismissUpload: (id: string) => void;
  clearCompleted: () => void;
}

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

export const useUploadStore = create<UploadStore>((set, get) => ({
  uploads: [],

  addUploads: (items) => {
    const now = Date.now();
    const newUploads: UploadItem[] = items.map(
      ({ file, workspaceId, folderId, onComplete }, i) => {
        const controller = new AbortController();
        return {
          id: `${now}-${i}-${Math.random().toString(36).slice(2, 8)}`,
          fileName: file.name,
          fileSize: file.size,
          formattedSize: formatBytes(file.size),
          kind: detectKind(file),
          progress: 0,
          status: "uploading" as const,
          workspaceId,
          folderId,
          onComplete,
          abortController: controller,
          rawFile: file,
        };
      },
    );

    set((state) => ({ uploads: [...state.uploads, ...newUploads] }));

    for (const item of newUploads) {
      const run = async () => {
        try {
          await uploadFile(
            item.workspaceId,
            item.rawFile,
            item.folderId,
            (pct) => {
              set((state) => ({
                uploads: state.uploads.map((u) =>
                  u.id === item.id ? { ...u, progress: pct } : u,
                ),
              }));
            },
            item.abortController.signal,
          );
          set((state) => ({
            uploads: state.uploads.map((u) =>
              u.id === item.id
                ? { ...u, progress: 100, status: "done" as const }
                : u,
            ),
          }));
          item.onComplete?.();
        } catch (err) {
          if (item.abortController.signal.aborted) {
            set((state) => ({
              uploads: state.uploads.filter((u) => u.id !== item.id),
            }));
            return;
          }
          const msg = err instanceof Error ? err.message : "Upload failed";
          set((state) => ({
            uploads: state.uploads.map((u) =>
              u.id === item.id
                ? { ...u, status: "error" as const, error: msg }
                : u,
            ),
          }));
        }
      };
      run();
    }
  },

  cancelUpload: (id) => {
    const upload = get().uploads.find((u) => u.id === id);
    if (upload) upload.abortController.abort();
  },

  dismissUpload: (id) => {
    const upload = get().uploads.find((u) => u.id === id);
    if (upload && upload.status === "uploading") {
      upload.abortController.abort();
    }
    set((state) => ({ uploads: state.uploads.filter((u) => u.id !== id) }));
  },

  clearCompleted: () => {
    set((state) => ({
      uploads: state.uploads.filter(
        (u) => u.status !== "done" && u.status !== "error",
      ),
    }));
  },
}));
