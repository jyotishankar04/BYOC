import { 
  BlobServiceClient, 
  StorageSharedKeyCredential,
  generateBlobSASQueryParameters,
  BlobSASPermissions,
  SASProtocol
} from "@azure/storage-blob";
import type {
  IStorageProvider,
  ListObjectsResult,
  ObjectMeta,
  Part,
} from "../storage.interface";

export interface AzureConfig {
  containerName: string;
  accountName: string;
  accountKey: string;
}

export class AzureBlobStorageProvider implements IStorageProvider {
  private client: BlobServiceClient;
  private containerName: string;
  private accountName: string;
  private accountKey: string;

  constructor(config: AzureConfig) {
    this.containerName = config.containerName;
    this.accountName = config.accountName;
    this.accountKey = config.accountKey;

    const credential = new StorageSharedKeyCredential(
      config.accountName,
      config.accountKey
    );
    this.client = new BlobServiceClient(
      `https://${config.accountName}.blob.core.windows.net`,
      credential
    );
  }

  async verifyConnection(): Promise<{ ok: boolean; error?: string }> {
    try {
      await this.client.getContainerClient(this.containerName).exists();
      return { ok: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Connection failed";
      return { ok: false, error: msg };
    }
  }

  async initiateMultipartUpload(): Promise<string> {
    throw new Error("Multipart upload not yet implemented for Azure");
  }

  async generateUploadPartUrl(): Promise<string> {
    throw new Error("Multipart upload not yet implemented for Azure");
  }

  async completeMultipartUpload(): Promise<void> {
    throw new Error("Multipart upload not yet implemented for Azure");
  }

  async abortMultipartUpload(): Promise<void> {
    throw new Error("Multipart upload not yet implemented for Azure");
  }

  async generateGetPresignedUrl(
    key: string,
    expirySeconds: number,
  ): Promise<string> {
    const expiresOn = new Date(new Date().valueOf() + expirySeconds * 1000);
    const sasToken = generateBlobSASQueryParameters({
      containerName: this.containerName,
      blobName: key,
      permissions: BlobSASPermissions.parse("r"),
      expiresOn,
      protocol: SASProtocol.Https
    }, new StorageSharedKeyCredential(this.accountName, this.accountKey)).toString();

    return `https://${this.accountName}.blob.core.windows.net/${this.containerName}/${key}?${sasToken}`;
  }

  async generatePutPresignedUrl(
    key: string,
    contentType: string,
    expirySeconds: number,
  ): Promise<string> {
    const expiresOn = new Date(new Date().valueOf() + expirySeconds * 1000);
    const sasToken = generateBlobSASQueryParameters({
      containerName: this.containerName,
      blobName: key,
      permissions: BlobSASPermissions.parse("cw"), // Create and Write
      expiresOn,
      protocol: SASProtocol.Https,
      contentType
    }, new StorageSharedKeyCredential(this.accountName, this.accountKey)).toString();

    return `https://${this.accountName}.blob.core.windows.net/${this.containerName}/${key}?${sasToken}`;
  }

  async getObject(key: string): Promise<Buffer> {
    const containerClient = this.client.getContainerClient(this.containerName);
    const blockBlobClient = containerClient.getBlockBlobClient(key);
    const response = await blockBlobClient.downloadToBuffer();
    return response;
  }

  async putObject(
    key: string,
    body: Buffer,
    contentType: string,
  ): Promise<void> {
    const containerClient = this.client.getContainerClient(this.containerName);
    const blockBlobClient = containerClient.getBlockBlobClient(key);
    await blockBlobClient.upload(body, body.length, {
      blobHTTPHeaders: { blobContentType: contentType }
    });
  }

  async headObject(key: string): Promise<ObjectMeta> {
    const containerClient = this.client.getContainerClient(this.containerName);
    const blockBlobClient = containerClient.getBlockBlobClient(key);
    const props = await blockBlobClient.getProperties();
    return {
      size: props.contentLength ?? 0,
      contentType: props.contentType ?? "application/octet-stream",
      lastModified: props.lastModified ?? new Date(),
    };
  }

  async copyObject(sourceKey: string, destKey: string): Promise<void> {
    const containerClient = this.client.getContainerClient(this.containerName);
    const sourceBlob = containerClient.getBlockBlobClient(sourceKey);
    const destBlob = containerClient.getBlockBlobClient(destKey);
    await destBlob.syncCopyFromURL(sourceBlob.url);
  }

  async deleteObject(key: string): Promise<void> {
    const containerClient = this.client.getContainerClient(this.containerName);
    const blockBlobClient = containerClient.getBlockBlobClient(key);
    await blockBlobClient.delete();
  }

  async deleteObjects(keys: string[]): Promise<void> {
    await Promise.all(keys.map((k) => this.deleteObject(k)));
  }

  async listObjects(
    prefix = "",
    continuationToken?: string,
    maxKeys = 1000,
  ): Promise<ListObjectsResult> {
    const containerClient = this.client.getContainerClient(this.containerName);
    const iter = containerClient.listBlobsFlat({ prefix }).byPage({
      maxPageSize: maxKeys,
      continuationToken
    });

    const response = await iter.next();
    const page = response.value;

    return {
      objects: (page.segment.blobItems || []).map((b: any) => ({
        key: b.name,
        size: b.properties.contentLength ?? 0,
        lastModified: b.properties.lastModified ?? new Date(),
      })),
      nextContinuationToken: page.continuationToken,
      isTruncated: !!page.continuationToken,
    };
  }
}
