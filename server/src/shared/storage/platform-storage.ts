import { AppError } from "@/core/errors";
import env from "@/config/env";
import { getProvider } from "./storage.factory";
import type { IStorageProvider } from "./storage.interface";

export function getPlatformStorage(): IStorageProvider {
  if (!env.PLATFORM_S3_ACCESS_KEY_ID || !env.PLATFORM_S3_BUCKET) {
    throw new AppError(
      "Platform storage is not configured. Ask an admin to set PLATFORM_S3_* env vars.",
      503,
      "PLATFORM_STORAGE_NOT_CONFIGURED",
    );
  }
  return getProvider(
    env.PLATFORM_S3_PROVIDER,
    {
      accessKeyId: env.PLATFORM_S3_ACCESS_KEY_ID,
      secretAccessKey: env.PLATFORM_S3_SECRET_ACCESS_KEY,
      endpointUrl: env.PLATFORM_S3_ENDPOINT || undefined,
    },
    env.PLATFORM_S3_BUCKET,
    env.PLATFORM_S3_REGION,
  );
}

export function buildStoredValue(key: string): string {
  return env.PLATFORM_S3_PUBLIC_URL
    ? `${env.PLATFORM_S3_PUBLIC_URL.replace(/\/$/, "")}/${key}`
    : key;
}

export async function resolveStorageUrl(storedValue: string | null | undefined): Promise<string | null> {
  if (!storedValue) return null;
  if (storedValue.startsWith("http")) return storedValue;
  try {
    const storage = getPlatformStorage();
    return await storage.generateGetPresignedUrl(storedValue, 3600);
  } catch {
    return null;
  }
}

export function mimeToExt(mimeType: string): string {
  const map: Record<string, string> = {
    "image/jpeg": ".jpg",
    "image/jpg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/gif": ".gif",
    "image/avif": ".avif",
  };
  return map[mimeType] ?? ".jpg";
}

export const ALLOWED_IMAGE_MIME = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
]);

export const PRESIGN_TTL_SECONDS = 300; // 5 minutes for the upload window
