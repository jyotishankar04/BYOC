import {
  S3Client,
  ListBucketsCommand,
  CreateMultipartUploadCommand,
  UploadPartCommand,
  CompleteMultipartUploadCommand,
  AbortMultipartUploadCommand,
  GetObjectCommand,
  PutObjectCommand,
  HeadObjectCommand,
  CopyObjectCommand,
  DeleteObjectCommand,
  DeleteObjectsCommand,
  ListObjectsV2Command,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import type {
  IStorageProvider,
  ListObjectsResult,
  ObjectMeta,
  Part,
} from "../storage.interface";

export interface R2Config {
  bucket: string;
  accountId?: string;
  endpointUrl?: string;
  accessKeyId: string;
  secretAccessKey: string;
  region?: string;
}

export class R2Provider implements IStorageProvider {
  private client: S3Client;
  private bucket: string;

  constructor(config: R2Config) {
    this.bucket = config.bucket;

    let endpoint = config.endpointUrl;
    if (!endpoint && config.accountId) {
      endpoint = `https://${config.accountId}.r2.cloudflarestorage.com`;
    }

    if (!endpoint) {
      throw new Error(
        "Cloudflare R2 requires an endpointUrl (e.g. https://<account_id>.r2.cloudflarestorage.com)",
      );
    }

    const normalizedEndpoint = this.normalizeEndpoint(endpoint);

    this.client = new S3Client({
      region: config.region || "auto",
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
      endpoint: normalizedEndpoint,
      // Cloudflare's AWS SDK v3 example uses the account-level endpoint and
      // virtual-hosted bucket URLs for API calls and presigned URLs.
      forcePathStyle: false,
      // Prevent SDK from injecting CRC32/checksum params into presigned URLs
      requestChecksumCalculation: "WHEN_REQUIRED",
      responseChecksumValidation: "WHEN_REQUIRED",
    });
  }

  private normalizeEndpoint(endpoint: string): string {
    const parsed = new URL(endpoint);
    // R2 expects the account-level API endpoint, not a bucket/object URL.
    return parsed.origin;
  }

  async verifyConnection(): Promise<{ ok: boolean; error?: string }> {
    try {
      await this.client.send(new ListBucketsCommand({}));
    } catch (err: unknown) {
      const e = err as Error & { $metadata?: { httpStatusCode?: number } };
      const http = e.$metadata?.httpStatusCode;

      if (http === 401) {
        return {
          ok: false,
          error:
            "Authentication failed — use the R2 Access Key ID and Secret Access Key from Cloudflare R2 API Tokens",
        };
      }
      if (http === 403) {
        return {
          ok: false,
          error:
            "Access denied — verify this R2 token is active and has permission to use the S3 API",
        };
      }
      if (http === 301) {
        return {
          ok: false,
          error:
            "Redirect received — your endpoint URL may be incorrect. Use https://<account_id>.r2.cloudflarestorage.com",
        };
      }

      const status = http ? ` (HTTP ${http})` : "";
      return { ok: false, error: `${e.name}: ${e.message}${status}` };
    }

    try {
      await this.client.send(
        new ListObjectsV2Command({
          Bucket: this.bucket,
          MaxKeys: 1,
        }),
      );
      return { ok: true };
    } catch (err: unknown) {
      const e = err as Error & { $metadata?: { httpStatusCode?: number } };
      const http = e.$metadata?.httpStatusCode;

      if (http === 404) {
        return {
          ok: false,
          error: `Bucket "${this.bucket}" not found — verify the bucket name and endpoint URL`,
        };
      }
      if (http === 403) {
        return {
          ok: false,
          error:
            "Access denied — verify your R2 token includes Object Read & Write access for this bucket",
        };
      }

      const status = http ? ` (HTTP ${http})` : "";
      return { ok: false, error: `${e.name}: ${e.message}${status}` };
    }
  }

  async initiateMultipartUpload(
    key: string,
    contentType: string,
  ): Promise<string> {
    const res = await this.client.send(
      new CreateMultipartUploadCommand({
        Bucket: this.bucket,
        Key: key,
        ContentType: contentType,
      }),
    );
    return res.UploadId!;
  }

  async generateUploadPartUrl(
    key: string,
    uploadId: string,
    partNumber: number,
    expiresIn = 3600,
  ): Promise<string> {
    return getSignedUrl(
      this.client,
      new UploadPartCommand({
        Bucket: this.bucket,
        Key: key,
        UploadId: uploadId,
        PartNumber: partNumber,
      }),
      { expiresIn },
    );
  }

  async completeMultipartUpload(
    key: string,
    uploadId: string,
    parts: Part[],
  ): Promise<void> {
    await this.client.send(
      new CompleteMultipartUploadCommand({
        Bucket: this.bucket,
        Key: key,
        UploadId: uploadId,
        MultipartUpload: {
          Parts: parts.map((p) => ({ PartNumber: p.partNumber, ETag: p.etag })),
        },
      }),
    );
  }

  async abortMultipartUpload(key: string, uploadId: string): Promise<void> {
    await this.client.send(
      new AbortMultipartUploadCommand({
        Bucket: this.bucket,
        Key: key,
        UploadId: uploadId,
      }),
    );
  }

  async generateGetPresignedUrl(
    key: string,
    expirySeconds: number,
    disposition?: string,
  ): Promise<string> {
    return getSignedUrl(
      this.client,
      new GetObjectCommand({
        Bucket: this.bucket,
        Key: key,
        ...(disposition ? { ResponseContentDisposition: disposition } : {}),
      }),
      { expiresIn: expirySeconds },
    );
  }

  async generatePutPresignedUrl(
    key: string,
    contentType: string,
    expirySeconds: number,
  ): Promise<string> {
    return getSignedUrl(
      this.client,
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        ContentType: contentType,
      }),
      { expiresIn: expirySeconds },
    );
  }

  async getObject(key: string): Promise<Buffer> {
    const res = await this.client.send(
      new GetObjectCommand({ Bucket: this.bucket, Key: key }),
    );
    return Buffer.from(await res.Body!.transformToByteArray());
  }

  async putObject(
    key: string,
    body: Buffer,
    contentType: string,
  ): Promise<void> {
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: body,
        ContentType: contentType,
      }),
    );
  }

  async headObject(key: string): Promise<ObjectMeta> {
    const res = await this.client.send(
      new HeadObjectCommand({ Bucket: this.bucket, Key: key }),
    );
    return {
      size: res.ContentLength ?? 0,
      contentType: res.ContentType ?? "application/octet-stream",
      lastModified: res.LastModified ?? new Date(),
    };
  }

  async copyObject(sourceKey: string, destKey: string): Promise<void> {
    await this.client.send(
      new CopyObjectCommand({
        Bucket: this.bucket,
        Key: destKey,
        CopySource: `${this.bucket}/${sourceKey}`,
      }),
    );
  }

  async deleteObject(key: string): Promise<void> {
    await this.client.send(
      new DeleteObjectCommand({ Bucket: this.bucket, Key: key }),
    );
  }

  async deleteObjects(keys: string[]): Promise<void> {
    if (keys.length === 0) return;
    await this.client.send(
      new DeleteObjectsCommand({
        Bucket: this.bucket,
        Delete: {
          Objects: keys.map((k) => ({ Key: k })),
          Quiet: true,
        },
      }),
    );
  }

  async listObjects(
    prefix = "",
    continuationToken?: string,
    maxKeys = 1000,
  ): Promise<ListObjectsResult> {
    const res = await this.client.send(
      new ListObjectsV2Command({
        Bucket: this.bucket,
        Prefix: prefix,
        MaxKeys: maxKeys,
        ContinuationToken: continuationToken,
      }),
    );
    return {
      objects: (res.Contents ?? []).map((obj) => ({
        key: obj.Key!,
        size: obj.Size ?? 0,
        lastModified: obj.LastModified ?? new Date(),
      })),
      nextContinuationToken: res.NextContinuationToken,
      isTruncated: res.IsTruncated ?? false,
    };
  }
}
