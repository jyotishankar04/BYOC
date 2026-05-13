"use client";

import api from "./axios";

// ─── Constants ─────────────────────────────────────────────────────────────────

const SMALL_FILE_MAX = 5 * 1024 * 1024;  // 5 MB — use presign below, multipart above
const CHUNK_SIZE     = 10 * 1024 * 1024; // 10 MB per part
const PART_CONCURRENCY = 3;              // max parallel part uploads per file

// ─── API types ─────────────────────────────────────────────────────────────────

interface PresignResponse {
  fileId: string;
  presignedPutUrl: string;
  expiresAt: string;
}

interface SessionPart {
  partNumber: number;
  presignedUrl: string;
}

interface InitiateSession {
  sessionId: string;
  fileId: string;
  fileName: string;
  parts: SessionPart[];
  expiresAt: string;
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

// Upload a single S3 part via XHR so we get progress events
function uploadPart(
  url: string,
  chunk: Blob,
  partNumber: number,
  onLoaded: (n: number) => void,
  signal?: AbortSignal,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", url);
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onLoaded(e.loaded);
    };
    xhr.onload = () => {
      if (xhr.status === 200) {
        const etag = xhr.getResponseHeader("ETag");
        if (etag) resolve(etag.replace(/"/g, ""));
        else reject(new Error(`Part ${partNumber}: no ETag in response`));
      } else {
        reject(new Error(`Part ${partNumber} failed: HTTP ${xhr.status}`));
      }
    };
    xhr.onerror  = () => reject(new Error(`Part ${partNumber}: network error`));
    xhr.onabort  = () => reject(new Error("Aborted"));
    if (signal) {
      signal.addEventListener("abort", () => xhr.abort(), { once: true });
    }
    xhr.send(chunk);
  });
}

// Limit concurrent async tasks to `limit` at a time, preserving order
async function concurrentMap<T, R>(
  items: T[],
  limit: number,
  fn: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let next = 0;

  async function worker() {
    while (next < items.length) {
      const i = next++;
      results[i] = await fn(items[i]!, i);
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, () => worker()),
  );
  return results;
}

// ─── Small-file upload (<5 MB) ─────────────────────────────────────────────────

async function uploadSmallFile(
  workspaceId: string,
  file: File,
  folderId: string | undefined,
  onProgress: (pct: number) => void,
  signal?: AbortSignal,
): Promise<string> {
  // 1. Obtain presigned PUT URL from our server
  const { data: presign } = await api.post<PresignResponse>(
    `/api/v1/workspaces/${workspaceId}/upload/presign`,
    {
      name:     file.name,
      mimeType: file.type || "application/octet-stream",
      size:     file.size,
      ...(folderId && { folderId }),
    },
  );

  // 2. PUT directly to S3 with XHR for progress
  await new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", presign.presignedPutUrl);
    xhr.setRequestHeader("Content-Type", file.type || "application/octet-stream");
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    };
    xhr.onload  = () => xhr.status === 200 ? resolve() : reject(new Error(`Upload failed: ${xhr.status}`));
    xhr.onerror = () => reject(new Error("Network error during upload"));
    xhr.onabort = () => reject(new Error("Aborted"));
    if (signal) signal.addEventListener("abort", () => xhr.abort(), { once: true });
    xhr.send(file);
  });

  onProgress(100);

  // 3. Tell our server to confirm (headObject + mark uploaded)
  const { data } = await api.post<{ file: { id: string } }>(
    `/api/v1/workspaces/${workspaceId}/upload/${presign.fileId}/confirm`,
  );
  return data.file.id;
}

// ─── Large-file upload (≥5 MB, multipart) ─────────────────────────────────────

async function uploadLargeFile(
  workspaceId: string,
  file: File,
  folderId: string | undefined,
  onProgress: (pct: number) => void,
  signal?: AbortSignal,
): Promise<string> {
  // 1. Initiate multipart session
  const { data: initiateData } = await api.post<{ sessions: InitiateSession[] }>(
    `/api/v1/workspaces/${workspaceId}/upload/initiate`,
    {
      files: [
        {
          name:     file.name,
          mimeType: file.type || "application/octet-stream",
          size:     file.size,
          ...(folderId && { folderId }),
        },
      ],
    },
  );

  const session = initiateData.sessions[0]!;
  const { sessionId, parts } = session;

  // 2. Upload all parts in parallel (max PART_CONCURRENCY at a time)
  const partProgress = new Map<number, number>(); // partNumber → bytes loaded so far

  const recompute = () => {
    const loaded = [...partProgress.values()].reduce((a, b) => a + b, 0);
    // Cap at 99% until complete() is called
    onProgress(Math.min(Math.round((loaded / file.size) * 100), 99));
  };

  const completedParts = await concurrentMap(
    parts,
    PART_CONCURRENCY,
    async ({ partNumber, presignedUrl }) => {
      if (signal?.aborted) throw new Error("Aborted");

      const start = (partNumber - 1) * CHUNK_SIZE;
      const end   = Math.min(start + CHUNK_SIZE, file.size);
      const chunk = file.slice(start, end);

      const etag = await uploadPart(
        presignedUrl,
        chunk,
        partNumber,
        (loaded) => {
          partProgress.set(partNumber, loaded);
          recompute();
        },
        signal,
      );

      // Checkpoint: tell server this part is done (non-blocking)
      api
        .patch(`/api/v1/workspaces/${workspaceId}/upload/${sessionId}/progress`, {
          completedParts: [{ partNumber, etag }],
        })
        .catch(() => {});

      return { partNumber, etag };
    },
  );

  // 3. Complete the multipart upload
  const { data: completeData } = await api.post<{ file: { id: string } }>(
    `/api/v1/workspaces/${workspaceId}/upload/${sessionId}/complete`,
    { parts: completedParts },
  );

  onProgress(100);
  return completeData.file.id;
}

// ─── Public API ────────────────────────────────────────────────────────────────

export async function uploadFile(
  workspaceId: string,
  file: File,
  folderId: string | undefined,
  onProgress: (pct: number) => void,
  signal?: AbortSignal,
): Promise<string> {
  if (file.size < SMALL_FILE_MAX) {
    return uploadSmallFile(workspaceId, file, folderId, onProgress, signal);
  }
  return uploadLargeFile(workspaceId, file, folderId, onProgress, signal);
}
