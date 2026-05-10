import { z } from "zod";
import { StorageProviderType } from "@/generated/prisma/client";

const ENDPOINT_REQUIRED: readonly string[] = [
  StorageProviderType.R2,
  StorageProviderType.MinIO,
  StorageProviderType.Supabase,
  StorageProviderType.Other,
] as const;

function isValidR2Endpoint(endpointUrl: string | undefined): boolean {
  if (!endpointUrl) return false;

  try {
    const parsed = new URL(endpointUrl);
    const hasNoPath = parsed.pathname === "/" || parsed.pathname === "";
    return (
      parsed.protocol === "https:" &&
      parsed.hostname.endsWith(".r2.cloudflarestorage.com") &&
      hasNoPath
    );
  } catch {
    return false;
  }
}

const providerFields = {
  providerType: z.nativeEnum(StorageProviderType),
  bucket: z.string().min(1).max(255),
  region: z.string().max(100).optional(),
  accessKeyId: z.string().min(1),
  secretAccessKey: z.string().min(1),
  endpointUrl: z.string().url().optional(),
  // GCS specific
  projectId: z.string().optional(),
  clientEmail: z.string().email().optional(),
  privateKey: z.string().optional(),
  // Azure specific
  accountName: z.string().optional(),
  accountKey: z.string().optional(),
};

export const connectProviderSchema = z
  .object(providerFields)
  .refine(
    (data) => {
      if ((ENDPOINT_REQUIRED as readonly string[]).includes(data.providerType)) {
        return !!data.endpointUrl;
      }
      return true;
    },
    {
      message: "Endpoint URL is required for this provider",
      path: ["endpointUrl"],
    },
  )
  .refine(
    (data) =>
      data.providerType !== StorageProviderType.R2 ||
      isValidR2Endpoint(data.endpointUrl),
    {
      message:
        "R2 endpoint must be the account-level S3 API URL, e.g. https://<account_id>.r2.cloudflarestorage.com",
      path: ["endpointUrl"],
    },
  );

export const updateProviderSchema = z
  .object(providerFields)
  .partial()
  .refine(
    (d) =>
      d.accessKeyId === undefined ||
      (d.accessKeyId !== undefined && d.secretAccessKey !== undefined),
    { message: "secretAccessKey required when updating accessKeyId" },
  )
  .refine(
    (data) => {
      if (!data.providerType) return true;
      if ((ENDPOINT_REQUIRED as readonly string[]).includes(data.providerType)) {
        return !!data.endpointUrl;
      }
      return true;
    },
    {
      message: "Endpoint URL is required for this provider",
      path: ["endpointUrl"],
    },
  )
  .refine(
    (data) =>
      data.providerType !== StorageProviderType.R2 ||
      data.endpointUrl === undefined ||
      isValidR2Endpoint(data.endpointUrl),
    {
      message:
        "R2 endpoint must be the account-level S3 API URL, e.g. https://<account_id>.r2.cloudflarestorage.com",
      path: ["endpointUrl"],
    },
  );

export type ConnectProviderDto = z.infer<typeof connectProviderSchema>;
export type UpdateProviderDto = z.infer<typeof updateProviderSchema>;
