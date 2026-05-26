import {
  FileStatus,
  NotificationType,
  type PrismaClient,
} from "@/generated/prisma/client";
import { AppError } from "@/core/errors";
import { ProviderService } from "@/modules/provider/provider.service";
import { broadcast } from "@/modules/events/events.service";
import { FilesRepository } from "./files.repository";
import type {
  ListFilesQuery,
  RenameFileDto,
  MoveFileDto,
  ListFilesResult,
} from "./files.interface";

function sanitizeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9._\-]/g, "_").slice(0, 200);
}

function buildStoragePath(folderPath: string | null | undefined, fileName: string): string {
  const sanitized = sanitizeFilename(fileName);
  if (folderPath) {
    return `${folderPath}${sanitized}`;
  }
  return sanitized;
}

export class FilesService {
  private providerService: ProviderService;
  private repository: FilesRepository;

  constructor(private prisma: PrismaClient) {
    this.providerService = new ProviderService(prisma);
    this.repository = new FilesRepository(prisma);
  }

  async listFiles(workspaceId: string, query: ListFilesQuery): Promise<ListFilesResult> {
    const { folderId, page, limit } = query;

    const [files, total, folders] = await Promise.all([
      this.repository.findMany(workspaceId, query),
      this.repository.count(workspaceId, query),
      this.repository.findFolders(workspaceId, folderId),
    ]);

    // Walk up the folder hierarchy to build breadcrumbs
    const breadcrumbs: { id: string; name: string }[] = [];
    if (folderId) {
      let currentId: string | null = folderId;
      while (currentId) {
        const folder = await this.repository.findFolderById(currentId, workspaceId);
        if (!folder) break;
        breadcrumbs.unshift({ id: folder.id, name: folder.name });
        currentId = folder.parentId;
      }
    }

    return { files, folders, breadcrumbs, total, page, limit };
  }

  async getFile(workspaceId: string, fileId: string) {
    const file = await this.repository.findById(workspaceId, fileId);
    if (!file) throw new AppError("File not found", 404, "NOT_FOUND");
    return file;
  }

  async renameFile(workspaceId: string, fileId: string, dto: RenameFileDto) {
    const file = await this.getFile(workspaceId, fileId);
    const extension = dto.name.includes(".")
      ? dto.name.split(".").pop()!
      : null;

    // Compute the new storage path
    const folderPath = file.folder?.path ?? null;
    const oldStoragePath = file.storagePath;
    const newStoragePath = buildStoragePath(folderPath, dto.name);

    // Copy the object to the new key, then delete the old one
    if (oldStoragePath !== newStoragePath) {
      try {
        const storage = await this.providerService.getDecryptedProvider(workspaceId);
        await storage.copyObject(oldStoragePath, newStoragePath);
        await storage.deleteObject(oldStoragePath).catch(() => {});
      } catch {
        // If storage fails (no provider configured, etc.), proceed with DB update only
      }
    }

    const updated = await this.repository.update(file.id, {
      name: dto.name,
      extension,
      storagePath: newStoragePath,
    });

    broadcast(workspaceId, {
      type: "file.renamed",
      payload: { fileId: updated.id, name: updated.name },
    });

    return updated;
  }

  async moveFile(workspaceId: string, fileId: string, dto: MoveFileDto) {
    const file = await this.getFile(workspaceId, fileId);

    let folderPath: string | null = null;
    if (dto.folderId !== null) {
      const folder = await this.repository.findFolderById(dto.folderId, workspaceId);
      if (!folder)
        throw new AppError("Folder not found", 404, "FOLDER_NOT_FOUND");
      folderPath = folder.path;
    }

    // Compute new storage path based on the target folder
    const oldStoragePath = file.storagePath;
    const newStoragePath = buildStoragePath(folderPath, file.name);

    // Move the object in storage if the path changed
    if (oldStoragePath !== newStoragePath) {
      try {
        const storage = await this.providerService.getDecryptedProvider(workspaceId);
        await storage.copyObject(oldStoragePath, newStoragePath);
        await storage.deleteObject(oldStoragePath).catch(() => {});
      } catch {
        // If storage fails, proceed with DB update only
      }
    }

    return this.repository.update(file.id, {
      folderId: dto.folderId,
      storagePath: newStoragePath,
    });
  }

  async deleteFile(workspaceId: string, fileId: string, userId: string) {
    const file = await this.getFile(workspaceId, fileId);

    // Delete from S3 — best-effort
    try {
      const storage = await this.providerService.getDecryptedProvider(workspaceId);
      await storage.deleteObject(file.storagePath);
    } catch {
      // no provider configured or S3 error — skip
    }

    await this.repository.deleteFileSoftly(file.id);

    broadcast(workspaceId, {
      type: "file.deleted",
      payload: { fileId: file.id },
    });

    // Notify the original uploader if it's a different user doing the deletion
    if (file.uploadedById !== userId) {
      const notification = await this.prisma.notification.create({
        data: {
          workspaceId,
          userId: file.uploadedById,
          type: NotificationType.FILE_DELETED,
          title: "File deleted",
          message: `Your file "${file.name}" was deleted.`,
        },
      });

      broadcast(workspaceId, {
        type: "notification.new",
        payload: notification,
      });
    }

    await this.prisma.activityLog.create({
      data: {
        workspaceId,
        userId,
        action: "FILE_DELETE",
        details: `Deleted file: ${file.name}`,
      },
    });
  }

  async getBatchPreviewUrls(workspaceId: string, fileIds: string[]): Promise<{ urls: Record<string, string>; expiresIn: number }> {
    if (fileIds.length === 0) return { urls: {}, expiresIn: 3600 };
    const files = await this.repository.findStoragePathsByIds(workspaceId, fileIds);
    const storage = await this.providerService.getDecryptedProvider(workspaceId);
    const entries = await Promise.all(
      files.map(async (file) => {
        const url = await storage.generateGetPresignedUrl(file.storagePath, 3600);
        return [file.id, url] as [string, string];
      }),
    );
    return { urls: Object.fromEntries(entries), expiresIn: 3600 };
  }

  async getPreviewUrl(workspaceId: string, fileId: string): Promise<string> {
    const file = await this.getFile(workspaceId, fileId);
    const storage =
      await this.providerService.getDecryptedProvider(workspaceId);

    try {
      await storage.headObject(file.storagePath);
    } catch (err: unknown) {
      const isNotFound =
        (err as { name?: string })?.name === "NotFound" ||
        (err as { $metadata?: { httpStatusCode?: number } })?.$metadata
          ?.httpStatusCode === 404;
      if (isNotFound) {
        await this.repository.update(file.id, { status: FileStatus.deleted });
        throw new AppError(
          "File no longer exists in storage",
          404,
          "FILE_NOT_IN_STORAGE",
        );
      }
      throw err;
    }

    return storage.generateGetPresignedUrl(file.storagePath, 3600);
  }

  async getDownloadUrl(workspaceId: string, fileId: string): Promise<string> {
    const file = await this.getFile(workspaceId, fileId);
    const storage =
      await this.providerService.getDecryptedProvider(workspaceId);

    try {
      await storage.headObject(file.storagePath);
    } catch (err: unknown) {
      const isNotFound =
        (err as { name?: string })?.name === "NotFound" ||
        (err as { $metadata?: { httpStatusCode?: number } })?.$metadata
          ?.httpStatusCode === 404;
      if (isNotFound) {
        await this.repository.update(file.id, { status: FileStatus.deleted });
        throw new AppError(
          "File no longer exists in storage",
          404,
          "FILE_NOT_IN_STORAGE",
        );
      }
      throw err;
    }

    const disposition = `attachment; filename="${file.name.replace(/"/g, '\\"')}"`;
    return storage.generateGetPresignedUrl(file.storagePath, 300, disposition);
  }
}
