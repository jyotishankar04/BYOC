export interface Part {
  partNumber: number;
  etag: string;
}

export interface ObjectMeta {
  size: number;
  contentType: string;
  lastModified: Date;
}

export interface StorageObject {
  key: string;
  size: number;
  lastModified: Date;
}

export interface ListObjectsResult {
  objects: StorageObject[];
  nextContinuationToken?: string;
  isTruncated: boolean;
}

export interface IStorageProvider {
  verifyConnection(): Promise<{ ok: boolean; error?: string }>;

  // Multipart upload
  initiateMultipartUpload(key: string, contentType: string): Promise<string>;
  generateUploadPartUrl(
    key: string,
    uploadId: string,
    partNumber: number,
    expiresIn?: number,
  ): Promise<string>;
  completeMultipartUpload(
    key: string,
    uploadId: string,
    parts: Part[],
  ): Promise<void>;
  abortMultipartUpload(key: string, uploadId: string): Promise<void>;

  // Presigned URLs
  generateGetPresignedUrl(
    key: string,
    expirySeconds: number,
    disposition?: string,
  ): Promise<string>;
  generatePutPresignedUrl(
    key: string,
    contentType: string,
    expirySeconds: number,
  ): Promise<string>;

  // Object ops
  putObject(key: string, body: Buffer, contentType: string): Promise<void>;
  headObject(key: string): Promise<ObjectMeta>;
  copyObject(sourceKey: string, destKey: string): Promise<void>;
  deleteObject(key: string): Promise<void>;
  deleteObjects(keys: string[]): Promise<void>;
  listObjects(prefix: string, continuationToken?: string, maxKeys?: number): Promise<ListObjectsResult>;
}
