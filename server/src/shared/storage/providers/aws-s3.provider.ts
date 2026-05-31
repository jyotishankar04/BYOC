import {
  S3Client,
  HeadBucketCommand,
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

export interface S3Config {
  bucket: string;
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
  endpointUrl?: string;
}

export class AwsS3Provider implements IStorageProvider {
  private client: S3Client;
  private bucket: string;

  constructor(config: S3Config) {
    this.bucket = config.bucket;
    this.client = new S3Client({
      region: config.region,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
      ...(config.endpointUrl ? { endpoint: config.endpointUrl } : {}),
      // Prevent SDK from injecting CRC32/checksum params into presigned URLs.
      // Browser XHR won't send those headers, causing S3 to return 403.
      requestChecksumCalculation: "WHEN_REQUIRED",
      responseChecksumValidation: "WHEN_REQUIRED",
    });
  }

  async verifyConnection(): Promise<{ ok: boolean; error?: string }> {
    try {
      await this.client.send(new HeadBucketCommand({ Bucket: this.bucket }));
      return { ok: true };
    } catch (err: unknown) {
      const e = err as Error & {
        $metadata?: { httpStatusCode?: number };
        BucketRegion?: string;
      };
      const status = e.$metadata?.httpStatusCode;

      if (status === 301 || e.name === "PermanentRedirect") {
        const regionHint = e.BucketRegion
          ? ` Try region "${e.BucketRegion}".`
          : " Verify the bucket's AWS region.";
        return {
          ok: false,
          error: `Bucket "${this.bucket}" is in a different region.${regionHint}`,
        };
      }

      if (status === 400 && e.name === "AuthorizationHeaderMalformed") {
        const regionHint = e.BucketRegion
          ? ` Try region "${e.BucketRegion}".`
          : " Verify the bucket's AWS region.";
        return {
          ok: false,
          error: `AWS rejected the request signature for this region.${regionHint}`,
        };
      }

      if (status === 403) {
        return {
          ok: false,
          error:
            "Access denied — verify the AWS access key has permission to access this bucket",
        };
      }

      if (status === 404) {
        return {
          ok: false,
          error: `Bucket "${this.bucket}" not found — verify the bucket name`,
        };
      }

      const details = status ? ` (HTTP ${status})` : "";
      return { ok: false, error: `${e.name}: ${e.message}${details}` };
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
