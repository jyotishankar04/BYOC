import { Storage } from "@google-cloud/storage";
import type {
  IStorageProvider,
  ListObjectsResult,
  ObjectMeta,
  Part,
} from "../storage.interface";

export interface GCSConfig {
  bucket: string;
  projectId: string;
  clientEmail: string;
  privateKey: string;
}

export class GoogleCloudStorageProvider implements IStorageProvider {
  private storage: Storage;
  private bucketName: string;

  constructor(config: GCSConfig) {
    this.bucketName = config.bucket;
    this.storage = new Storage({
      projectId: config.projectId,
      credentials: {
        client_email: config.clientEmail,
        private_key: config.privateKey.replace(/\\n/g, "\n"),
      },
    });
  }

  async verifyConnection(): Promise<{ ok: boolean; error?: string }> {
    try {
      await this.storage.bucket(this.bucketName).exists();
      return { ok: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Connection failed";
      return { ok: false, error: msg };
    }
  }

  // GCS handles multipart differently, usually via resumable uploads.
  // For IStorageProvider compatibility, we might need to implement a bridge.
  // Placeholder implementation:
  async initiateMultipartUpload(): Promise<string> {
    throw new Error("Multipart upload not yet implemented for GCS");
  }

  async generateUploadPartUrl(): Promise<string> {
    throw new Error("Multipart upload not yet implemented for GCS");
  }

  async completeMultipartUpload(): Promise<void> {
    throw new Error("Multipart upload not yet implemented for GCS");
  }

  async abortMultipartUpload(): Promise<void> {
    throw new Error("Multipart upload not yet implemented for GCS");
  }

  async generateGetPresignedUrl(
    key: string,
    expirySeconds: number,
  ): Promise<string> {
    const [url] = await this.storage
      .bucket(this.bucketName)
      .file(key)
      .getSignedUrl({
        version: "v4",
        action: "read",
        expires: Date.now() + expirySeconds * 1000,
      });
    return url;
  }

  async generatePutPresignedUrl(
    key: string,
    contentType: string,
    expirySeconds: number,
  ): Promise<string> {
    const [url] = await this.storage
      .bucket(this.bucketName)
      .file(key)
      .getSignedUrl({
        version: "v4",
        action: "write",
        contentType,
        expires: Date.now() + expirySeconds * 1000,
      });
    return url;
  }

  async getObject(key: string): Promise<Buffer> {
    const [contents] = await this.storage.bucket(this.bucketName).file(key).download();
    return contents;
  }

  async putObject(
    key: string,
    body: Buffer,
    contentType: string,
  ): Promise<void> {
    await this.storage.bucket(this.bucketName).file(key).save(body, {
      contentType,
      resumable: false,
    });
  }

  async headObject(key: string): Promise<ObjectMeta> {
    const [metadata] = await this.storage
      .bucket(this.bucketName)
      .file(key)
      .getMetadata();
    return {
      size: Number(metadata.size),
      contentType: metadata.contentType ?? "application/octet-stream",
      lastModified: new Date(metadata.updated ?? ""),
    };
  }

  async copyObject(sourceKey: string, destKey: string): Promise<void> {
    await this.storage.bucket(this.bucketName).file(sourceKey).copy(this.bucketName + "/" + destKey);
  }

  async deleteObject(key: string): Promise<void> {
    await this.storage.bucket(this.bucketName).file(key).delete();
  }

  async deleteObjects(keys: string[]): Promise<void> {
    await Promise.all(keys.map((k) => this.deleteObject(k)));
  }

  async listObjects(
    prefix = "",
    continuationToken?: string,
    maxKeys = 1000,
  ): Promise<ListObjectsResult> {
    const [files, query] = await this.storage.bucket(this.bucketName).getFiles({
      prefix,
      maxResults: maxKeys,
      pageToken: continuationToken,
    });

    return {
      objects: files.map((f) => ({
        key: f.name,
        size: Number(f.metadata.size),
        lastModified: new Date(f.metadata.updated ?? ""),
      })),
      nextContinuationToken: query?.pageToken,
      isTruncated: !!query?.pageToken,
    };
  }
}
