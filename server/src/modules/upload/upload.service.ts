import { randomUUID } from "node:crypto";
import {
  FileKind,
  FileStatus,
  UploadSessionStatus,
  type PrismaClient,
} from "@/generated/prisma/client";
import { AppError } from "@/core/errors";
import { ProviderService } from "@/modules/provider/provider.service";
import { broadcast } from "@/modules/events/events.service";
import { UploadRepository } from "./upload.repository";
import { SubscriptionSnapshotService } from "@/modules/billing/subscription-snapshot.service";
import { assertQuotaAvailable, buildQuotaSummary } from "@/modules/billing/subscription-access";
import { appSettings } from "@/config/app-settings";
import { extractVideoMeta } from "@/shared/video-meta";
import { cache } from "@/shared/cache/cache.service";
import type {
  PresignDto,
  InitiateDto,
  CompleteDto,
} from "./upload.interface";

const SMALL_FILE_MAX = 5 * 1024 * 1024; // 5 MB
const CHUNK_SIZE = 10 * 1024 * 1024; // 10 MB
const PRESIGN_EXPIRY = 15 * 60; // 15 min
const PART_EXPIRY = 60 * 60; // 1 hr
const SESSION_TTL_MS = 24 * 60 * 60 * 1000; // 24 hr
const MAX_SESSIONS = 10;

function sanitizeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9._\-]/g, "_").slice(0, 200);
}

function buildStoragePath(
  folderPath: string | null | undefined,
  fileName: string,
): string {
  const sanitized = sanitizeFilename(fileName);
  if (folderPath) {
    return `${folderPath}${sanitized}`;
  }
  return sanitized;
}

function inferKind(mimeType: string): FileKind {
  if (mimeType.startsWith("image/")) return FileKind.image;
  if (mimeType.startsWith("video/")) return FileKind.video;
  if (mimeType.startsWith("audio/")) return FileKind.audio;
  if (
    mimeType.startsWith("text/") ||
    mimeType === "application/pdf" ||
    mimeType.includes("document") ||
    mimeType.includes("spreadsheet") ||
    mimeType.includes("presentation")
  )
    return FileKind.document;
  if (
    [
      "application/zip",
      "application/x-tar",
      "application/gzip",
      "application/x-bzip2",
      "application/x-7z-compressed",
      "application/x-rar-compressed",
    ].includes(mimeType)
  )
    return FileKind.archive;
  return FileKind.other;
}

export class UploadService {
  private providerService: ProviderService;
  private repository: UploadRepository;

  constructor(private prisma: PrismaClient) {
    this.providerService = new ProviderService(prisma);
    this.repository = new UploadRepository(prisma);
  }

  async presignSmallFile(
    workspaceId: string,
    userId: string,
    dto: PresignDto,
  ) {
    const snapshot = await new SubscriptionSnapshotService(
      this.prisma,
    ).getWorkspaceSnapshot(workspaceId);
    const sizeQuota = buildQuotaSummary(snapshot.limits.maxUploadFileSize, dto.size);
    assertQuotaAvailable(
      sizeQuota,
      "File size exceeds the limit for this workspace plan",
      "UPLOAD_SIZE_LIMIT_REACHED",
    );
    const storageQuota = buildQuotaSummary(
      snapshot.limits.maxStorageBytes,
      snapshot.usage.storageBytesUsed + dto.size,
    );
    assertQuotaAvailable(
      storageQuota,
      "Storage quota exceeded for this workspace",
      "STORAGE_QUOTA_EXCEEDED",
    );

    if (dto.size >= SMALL_FILE_MAX) {
      throw new AppError(
        "Use /upload/initiate for files 5 MB or larger",
        422,
        "FILE_TOO_LARGE",
      );
    }

    const { allowedFileTypes } = appSettings.getConfig();
    if (allowedFileTypes.length > 0) {
      const allowed = allowedFileTypes.some((pattern) => {
        if (pattern.endsWith("/*")) {
          return dto.mimeType.startsWith(pattern.slice(0, -1));
        }
        return dto.mimeType === pattern;
      });
      if (!allowed) {
        throw new AppError(
          `File type "${dto.mimeType}" is not allowed on this platform`,
          415,
          "FILE_TYPE_NOT_ALLOWED",
        );
      }
    }

    const folderRecord = dto.folderId
      ? await this.repository.findFolderById(dto.folderId)
      : null;

    if (dto.folderId && (!folderRecord || folderRecord.workspaceId !== workspaceId)) {
      throw new AppError("Folder not found", 404, "NOT_FOUND");
    }

    const storage = await this.providerService.getDecryptedProvider(workspaceId);
    const storagePath = buildStoragePath(folderRecord?.path ?? null, dto.name);
    const expiresAt = new Date(Date.now() + PRESIGN_EXPIRY * 1000);

    const presignedPutUrl = await storage.generatePutPresignedUrl(
      storagePath,
      dto.mimeType,
      PRESIGN_EXPIRY,
    );

    const file = await this.repository.createFile({
      id: randomUUID(),
      workspaceId,
      folderId: dto.folderId ?? null,
      name: dto.name,
      extension: dto.name.includes(".") ? dto.name.split(".").pop()! : null,
      storagePath,
      size: dto.size,
      mimeType: dto.mimeType,
      kind: inferKind(dto.mimeType),
      status: FileStatus.uploading,
      source: "bringbucket",
      uploadedById: userId,
    });

    return { fileId: file.id, presignedPutUrl, expiresAt };
  }

  async confirmSmallFile(
    workspaceId: string,
    userId: string,
    fileId: string,
  ) {
    const file = await this.repository.findFileById(fileId);

    if (!file || file.workspaceId !== workspaceId || file.uploadedById !== userId) {
      throw new AppError("File not found", 404, "NOT_FOUND");
    }
    if (file.status !== FileStatus.uploading) {
      throw new AppError("File is not pending confirmation", 409, "INVALID_STATE");
    }

    const storage = await this.providerService.getDecryptedProvider(workspaceId);
    const meta = await storage.headObject(file.storagePath).catch(() => null);

    if (!meta) {
      await this.repository.deleteFile(fileId);
      throw new AppError(
        "File not found in storage — upload may not have completed",
        404,
        "STORAGE_NOT_FOUND",
      );
    }

    const confirmed = await this.repository.updateFile(fileId, {
      status: FileStatus.uploaded,
      size: meta.size,
    });

    if (confirmed.kind === FileKind.video) {
      setImmediate(async () => {
        try {
          const previewUrl = await storage.generateGetPresignedUrl(confirmed.storagePath, 300);
          const videoMeta = await extractVideoMeta(previewUrl);
          if (videoMeta) {
            await this.repository.updateFile(confirmed.id, videoMeta);
          }
        } catch { /* non-fatal */ }
      });
    }

    broadcast(workspaceId, {
      type: "file.uploaded",
      payload: confirmed,
    });

    await Promise.all([
      cache.delPattern(`files:list:${workspaceId}:*`),
      cache.del(`billing:snapshot:${workspaceId}`),
    ]);

    await this.prisma.activityLog.create({
      data: {
        id: randomUUID(),
        workspaceId,
        userId,
        action: "file_uploaded",
        details: JSON.stringify({
          fileId: confirmed.id,
          name: confirmed.name,
          size: meta.size,
        }),
      },
    });

    return confirmed;
  }

  async initiateMultipart(
    workspaceId: string,
    userId: string,
    files: InitiateDto["files"],
  ) {
    const snapshot = await new SubscriptionSnapshotService(
      this.prisma,
    ).getWorkspaceSnapshot(workspaceId);
    const totalNewBytes = files.reduce((sum, f) => sum + f.size, 0);
    for (const file of files) {
      const sizeQuota = buildQuotaSummary(
        snapshot.limits.maxUploadFileSize,
        file.size,
      );
      assertQuotaAvailable(
        sizeQuota,
        "File size exceeds the limit for this workspace plan",
        "UPLOAD_SIZE_LIMIT_REACHED",
      );
    }
    const storageQuota = buildQuotaSummary(
      snapshot.limits.maxStorageBytes,
      snapshot.usage.storageBytesUsed + totalNewBytes,
    );
    assertQuotaAvailable(
      storageQuota,
      "Storage quota exceeded for this workspace",
      "STORAGE_QUOTA_EXCEEDED",
    );

    const activeSessions = await this.repository.countActiveUploadSessions(workspaceId);

    if (activeSessions + files.length > MAX_SESSIONS) {
      throw new AppError(
        `Too many concurrent upload sessions (max ${MAX_SESSIONS})`,
        429,
        "SESSION_LIMIT_EXCEEDED",
      );
    }

    const results = [];

    for (const dto of files) {
      if (dto.folderId) {
        const folder = await this.repository.findFolderById(dto.folderId);
        if (!folder || folder.workspaceId !== workspaceId) {
          throw new AppError("Folder not found", 404, "NOT_FOUND");
        }
      }

      const storage =
        await this.providerService.getDecryptedProvider(workspaceId);
      const folder = dto.folderId
        ? await this.repository.findFolderById(dto.folderId)
        : null;
      const storagePath = buildStoragePath(folder?.path ?? null, dto.name);
      const totalChunks = Math.ceil(dto.size / CHUNK_SIZE);
      const expiresAt = new Date(Date.now() + SESSION_TTL_MS);

      const providerUploadId = await storage.initiateMultipartUpload(
        storagePath,
        dto.mimeType,
      );

      const partUrls = await Promise.all(
        Array.from({ length: totalChunks }, (_, i) =>
          storage
            .generateUploadPartUrl(
              storagePath,
              providerUploadId,
              i + 1,
              PART_EXPIRY,
            )
            .then((url) => ({ partNumber: i + 1, presignedUrl: url })),
        ),
      );

      const session = await this.repository.createUploadSession({
        id: randomUUID(),
        workspaceId,
        uploadedById: userId,
        fileName: dto.name,
        mimeType: dto.mimeType,
        originalSize: dto.size,
        folderId: dto.folderId ?? null,
        providerUploadId,
        storagePath,
        totalChunks,
        completedChunks: [],
        status: UploadSessionStatus.pending,
        expiresAt,
      });

      results.push({
        sessionId: session.id,
        fileName: dto.name,
        parts: partUrls,
        expiresAt,
      });
    }

    return results;
  }

  async getSession(workspaceId: string, sessionId: string) {
    const session = await this.repository.findUploadSessionById(sessionId);
    if (!session || session.workspaceId !== workspaceId) {
      throw new AppError("Upload session not found", 404, "NOT_FOUND");
    }
    return session;
  }

  async updateProgress(
    workspaceId: string,
    sessionId: string,
    userId: string,
    completedParts: Array<{ partNumber: number; etag: string }>,
  ) {
    const session = await this.repository.findUploadSessionById(sessionId);
    if (
      !session ||
      session.workspaceId !== workspaceId ||
      session.uploadedById !== userId
    ) {
      throw new AppError("Upload session not found", 404, "NOT_FOUND");
    }
    if (
      session.status === UploadSessionStatus.completed ||
      session.status === UploadSessionStatus.aborted
    ) {
      throw new AppError("Session is already finished", 409, "INVALID_STATE");
    }

    const existing = session.completedChunks as Array<{
      partNumber: number;
      etag: string;
    }>;
    const merged = new Map(existing.map((p) => [p.partNumber, p]));
    for (const p of completedParts) merged.set(p.partNumber, p);

    await this.repository.updateUploadSession(sessionId, {
      completedChunks: Array.from(merged.values()),
      status: UploadSessionStatus.uploading,
    });
  }

  async completeSession(
    workspaceId: string,
    sessionId: string,
    userId: string,
    parts: CompleteDto["parts"],
  ) {
    const session = await this.repository.findUploadSessionById(sessionId);
    if (
      !session ||
      session.workspaceId !== workspaceId ||
      session.uploadedById !== userId
    ) {
      throw new AppError("Upload session not found", 404, "NOT_FOUND");
    }
    if (session.status === UploadSessionStatus.completed) {
      throw new AppError("Session already completed", 409, "ALREADY_COMPLETED");
    }
    if (session.status === UploadSessionStatus.aborted) {
      throw new AppError("Session was aborted", 409, "ABORTED");
    }

    if (parts.length !== session.totalChunks) {
      throw new AppError(
        `Expected ${session.totalChunks} parts, received ${parts.length}`,
        422,
        "INCOMPLETE_PARTS",
      );
    }

    const storage =
      await this.providerService.getDecryptedProvider(workspaceId);

    await storage.completeMultipartUpload(
      session.storagePath,
      session.providerUploadId,
      parts.map((p) => ({ partNumber: p.partNumber, etag: p.etag })),
    );

    const meta = await storage.headObject(session.storagePath);

    const file = await this.repository.createFile({
      id: randomUUID(),
      workspaceId,
      folderId: session.folderId,
      name: session.fileName,
      extension: session.fileName.includes(".") ? session.fileName.split(".").pop()! : null,
      storagePath: session.storagePath,
      size: meta.size,
      mimeType: session.mimeType,
      kind: inferKind(session.mimeType),
      status: FileStatus.uploaded,
      source: "bringbucket",
      uploadedById: userId,
    });

    await this.repository.updateUploadSession(sessionId, {
      fileId: file.id,
      status: UploadSessionStatus.completed,
      completedChunks: parts,
    });

    if (file.kind === FileKind.video) {
      setImmediate(async () => {
        try {
          const previewUrl = await storage.generateGetPresignedUrl(file.storagePath, 300);
          const videoMeta = await extractVideoMeta(previewUrl);
          if (videoMeta) {
            await this.repository.updateFile(file.id, videoMeta);
          }
        } catch { /* non-fatal */ }
      });
    }

    broadcast(workspaceId, {
      type: "file.uploaded",
      payload: file,
    });

    await Promise.all([
      cache.delPattern(`files:list:${workspaceId}:*`),
      cache.del(`billing:snapshot:${workspaceId}`),
    ]);

    await this.prisma.activityLog.create({
      data: {
        id: randomUUID(),
        workspaceId,
        userId,
        action: "file_uploaded",
        details: JSON.stringify({
          fileId: file.id,
          name: file.name,
          size: meta.size,
        }),
      },
    });

    // Notify workspace owners/admins asynchronously
    setImmediate(async () => {
      try {
        const members = await this.repository.findWorkspaceMembers(
          workspaceId,
          ["Owner", "Admin"],
          userId,
        );
        if (members.length > 0) {
          await this.prisma.notification.createMany({
            data: members.map((m) => ({
              id: randomUUID(),
              workspaceId,
              userId: m.userId,
              type: "FILE_UPLOADED" as const,
              title: "New file uploaded",
              message: `${file.name} was uploaded to your workspace`,
            })),
          });

          for (const member of members) {
            broadcast(workspaceId, {
              type: "notification.new",
              payload: {
                workspaceId,
                userId: member.userId,
                type: "FILE_UPLOADED",
                title: "New file uploaded",
                message: `${file.name} was uploaded to your workspace`,
              },
            });
          }
        }
      } catch {
        // non-critical
      }
    });

    return file;
  }

  async abortSession(workspaceId: string, sessionId: string, userId: string) {
    const session = await this.repository.findUploadSessionById(sessionId);
    if (
      !session ||
      session.workspaceId !== workspaceId ||
      session.uploadedById !== userId
    ) {
      throw new AppError("Upload session not found", 404, "NOT_FOUND");
    }
    if (session.status === UploadSessionStatus.completed) {
      throw new AppError(
        "Cannot abort a completed upload",
        409,
        "ALREADY_COMPLETED",
      );
    }

    const storage = await this.providerService
      .getDecryptedProvider(workspaceId)
      .catch(() => null);

    if (storage) {
      await storage
        .abortMultipartUpload(session.storagePath, session.providerUploadId)
        .catch(() => {});
    }

    await this.repository.updateUploadSession(sessionId, {
      status: UploadSessionStatus.aborted,
    });
  }

  async refreshUrls(workspaceId: string, sessionId: string, userId: string) {
    const session = await this.repository.findUploadSessionById(sessionId);
    if (
      !session ||
      session.workspaceId !== workspaceId ||
      session.uploadedById !== userId
    ) {
      throw new AppError("Upload session not found", 404, "NOT_FOUND");
    }
    if (
      session.status === UploadSessionStatus.completed ||
      session.status === UploadSessionStatus.aborted
    ) {
      throw new AppError("Session is finished", 409, "INVALID_STATE");
    }

    const completed = new Set(
      (session.completedChunks as Array<{ partNumber: number }>).map(
        (p) => p.partNumber,
      ),
    );

    const incompleteParts = Array.from(
      { length: session.totalChunks },
      (_, i) => i + 1,
    ).filter((n) => !completed.has(n));

    const storage =
      await this.providerService.getDecryptedProvider(workspaceId);

    const parts = await Promise.all(
      incompleteParts.map((partNumber) =>
        storage
          .generateUploadPartUrl(
            session.storagePath,
            session.providerUploadId,
            partNumber,
            PART_EXPIRY,
          )
          .then((url) => ({ partNumber, presignedUrl: url })),
      ),
    );

    return { parts };
  }
}
