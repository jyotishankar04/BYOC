import { StorageProviderType } from "@/generated/prisma/client";
import type { IStorageProvider } from "./storage.interface";
import { AwsS3Provider } from "./providers/aws-s3.provider";
import { R2Provider } from "./providers/r2.provider";
import { GoogleCloudStorageProvider } from "./providers/gcs.provider";
import { AzureBlobStorageProvider } from "./providers/azure.provider";
import { S3CompatibleProvider } from "./providers/s3-compatible.provider";

export interface DecryptedCreds {
  accessKeyId: string;
  secretAccessKey: string;
  endpointUrl?: string;
  // GCS specific
  projectId?: string;
  clientEmail?: string;
  privateKey?: string;
  // Azure specific
  accountName?: string;
  accountKey?: string;
}

export function getProvider(
  type: string,
  creds: DecryptedCreds,
  bucket: string,
  region?: string,
): IStorageProvider {
  switch (type) {
    case StorageProviderType.S3:
      return new AwsS3Provider({
        bucket,
        region: region || "us-east-1",
        accessKeyId: creds.accessKeyId,
        secretAccessKey: creds.secretAccessKey,
        endpointUrl: creds.endpointUrl,
      });

    case StorageProviderType.R2:
      return new R2Provider({
        bucket,
        region,
        accessKeyId: creds.accessKeyId,
        secretAccessKey: creds.secretAccessKey,
        endpointUrl: creds.endpointUrl,
      });

    case StorageProviderType.GCS:
      return new GoogleCloudStorageProvider({
        bucket,
        projectId: creds.projectId || "",
        clientEmail: creds.clientEmail || "",
        privateKey: creds.privateKey || "",
      });

    case StorageProviderType.Azure:
      return new AzureBlobStorageProvider({
        containerName: bucket,
        accountName: creds.accountName || "",
        accountKey: creds.accountKey || "",
      });

    case StorageProviderType.MinIO:
    case StorageProviderType.Supabase:
    case StorageProviderType.Other:
      return new S3CompatibleProvider({
        bucket,
        region: region || "us-east-1",
        accessKeyId: creds.accessKeyId,
        secretAccessKey: creds.secretAccessKey,
        endpointUrl: creds.endpointUrl || "",
      });

    default:
      throw new Error(`Unsupported provider type: ${type}`);
  }
}
