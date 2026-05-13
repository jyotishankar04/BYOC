"use client";

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const value = bytes / Math.pow(k, i);
  return `${value < 10 ? value.toFixed(1) : Math.round(value)} ${units[i]}`;
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
}

export function formatDateFull(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function getAspectRatio(mimeType: string | null): "square" | "landscape" | "portrait" | "wide" {
  if (!mimeType) return "square";
  if (mimeType.startsWith("video/")) return "landscape";
  return "landscape";
}

export function getStorageFolderLabel(storagePath: string): string {
  const normalized = storagePath.replace(/^\/+/, "");
  const lastSlash = normalized.lastIndexOf("/");

  if (lastSlash <= 0) return "Root";

  return normalized
    .slice(0, lastSlash)
    .split("/")
    .filter(Boolean)
    .join(" / ");
}

export function getMediaType(kind: string, mimeType: string | null): "Image" | "Video" {
  if (kind === "video" || mimeType?.startsWith("video/")) return "Video";
  return "Image";
}

export function getDocType(mimeType: string | null, extension: string | null): "PDF" | "Word" | "Excel" | "Slides" | "Text" {
  const ext = extension?.toLowerCase() || "";
  if (ext === "pdf" || mimeType === "application/pdf") return "PDF";
  if (["doc", "docx"].includes(ext) || mimeType?.includes("word")) return "Word";
  if (["xls", "xlsx"].includes(ext) || mimeType?.includes("spreadsheet")) return "Excel";
  if (["ppt", "pptx"].includes(ext) || mimeType?.includes("presentation")) return "Slides";
  return "Text";
}

export function getResolution(mimeType: string | null): "4K" | "1080p" | "720p" | "480p" | null {
  return null;
}

export function hasShareLink(status: string): "Shared" | "Private" {
  return status === "Shared" ? "Shared" : "Private";
}
