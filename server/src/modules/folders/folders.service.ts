import { randomUUID } from "node:crypto";
import type { PrismaClient } from "@/generated/prisma/client";
import { AppError } from "@/core/errors";
import { ProviderService } from "@/modules/provider/provider.service";
import { FoldersRepository } from "./folders.repository";
import type {
  CreateFolderDto,
  RenameFolderDto,
  MoveFolderDto,
} from "./folders.interface";

const NAME_RE = /^[^/\0]{1,255}$/;

export class FolderService {
  private providerService: ProviderService;
  private repository: FoldersRepository;

  constructor(private prisma: PrismaClient) {
    this.providerService = new ProviderService(prisma);
    this.repository = new FoldersRepository(prisma);
  }

  async createFolder(
    workspaceId: string,
    userId: string,
    dto: CreateFolderDto,
  ) {
    if (!NAME_RE.test(dto.name)) {
      throw new AppError(
        "Folder name must be 1–255 chars and must not contain / or null bytes",
        400,
        "INVALID_NAME",
      );
    }

    let path: string;

    if (dto.parentId) {
      const parent = await this.repository.findById(dto.parentId);
      if (!parent || parent.workspaceId !== workspaceId) {
        throw new AppError("Parent folder not found", 404, "NOT_FOUND");
      }
      path = parent.path + dto.name + "/";
    } else {
      path = dto.name + "/";
    }

    const existing = await this.repository.findByPath(workspaceId, path);
    if (existing) {
      throw new AppError(
        "A folder with this name already exists",
        409,
        "CONFLICT",
      );
    }

    // Write an empty directory marker to S3
    const storage = await this.providerService
      .getDecryptedProvider(workspaceId)
      .catch(() => null);
    if (storage) {
      await storage.putObject(path, Buffer.alloc(0), "application/x-directory");
    }

    const folder = await this.repository.create({
      id: randomUUID(),
      workspaceId,
      name: dto.name,
      path,
      parentId: dto.parentId ?? null,
      source: "bringbucket",
    });

    await this.prisma.activityLog.create({
      data: {
        id: randomUUID(),
        workspaceId,
        userId,
        action: "folder_created",
        details: JSON.stringify({ folderId: folder.id, name: folder.name }),
      },
    });

    return folder;
  }

  async renameFolder(
    workspaceId: string,
    folderId: string,
    userId: string,
    name: string,
  ) {
    if (!NAME_RE.test(name)) {
      throw new AppError(
        "Folder name must be 1–255 chars and must not contain / or null bytes",
        400,
        "INVALID_NAME",
      );
    }

    const folder = await this.repository.findById(folderId);
    if (!folder || folder.workspaceId !== workspaceId) {
      throw new AppError("Folder not found", 404, "NOT_FOUND");
    }

    const oldPath = folder.path;
    const parentPath = oldPath.slice(
      0,
      oldPath.lastIndexOf("/", oldPath.length - 2) + 1,
    );
    const newPath = parentPath + name + "/";

    if (oldPath !== newPath) {
      const conflict = await this.repository.findByPath(workspaceId, newPath);
      if (conflict) {
        throw new AppError(
          "A folder with this name already exists",
          409,
          "CONFLICT",
        );
      }
    }

    await this.repository.executeRaw`
      UPDATE folders
      SET name = ${name},
          path = ${newPath},
          "updatedAt" = NOW()
      WHERE id = ${folderId}::uuid
        AND "workspaceId" = ${workspaceId}::uuid
    `;

    if (oldPath !== newPath) {
      await this.repository.executeRaw`
        WITH RECURSIVE sub AS (
          SELECT id, path
          FROM   folders
          WHERE  "parentId" = ${folderId}::uuid
            AND  "workspaceId" = ${workspaceId}::uuid
          UNION ALL
          SELECT f.id, f.path
          FROM   folders f
          JOIN   sub ON f."parentId" = sub.id
          WHERE  f."workspaceId" = ${workspaceId}::uuid
        )
        UPDATE folders
        SET    path       = replace(folders.path, ${oldPath}, ${newPath}),
               "updatedAt" = NOW()
        FROM   sub
        WHERE  folders.id = sub.id
      `;
    }

    await this.prisma.activityLog.create({
      data: {
        id: randomUUID(),
        workspaceId,
        userId,
        action: "folder_renamed",
        details: JSON.stringify({ folderId, oldPath, newPath }),
      },
    });

    return this.repository.findById(folderId);
  }

  async deleteFolder(workspaceId: string, folderId: string, userId: string) {
    const folder = await this.repository.findById(folderId);
    if (!folder || folder.workspaceId !== workspaceId) {
      throw new AppError("Folder not found", 404, "NOT_FOUND");
    }

    const [affectedFiles, affectedFolders] = await Promise.all([
      this.repository.queryRaw<any[]>`
        WITH RECURSIVE sub AS (
          SELECT id FROM folders
          WHERE  id = ${folderId}::uuid AND "workspaceId" = ${workspaceId}::uuid
          UNION ALL
          SELECT f.id FROM folders f
          JOIN   sub ON f."parentId" = sub.id
          WHERE  f."workspaceId" = ${workspaceId}::uuid
        )
        SELECT fi."storagePath"
        FROM   files fi
        JOIN   sub ON fi."folderId" = sub.id
        WHERE  fi."workspaceId" = ${workspaceId}::uuid
      `,
      this.repository.queryRaw<any[]>`
        WITH RECURSIVE sub AS (
          SELECT id, path FROM folders
          WHERE  id = ${folderId}::uuid AND "workspaceId" = ${workspaceId}::uuid
          UNION ALL
          SELECT f.id, f.path FROM folders f
          JOIN   sub ON f."parentId" = sub.id
          WHERE  f."workspaceId" = ${workspaceId}::uuid
        )
        SELECT path FROM sub
      `,
    ]);

    const fileKeys = (affectedFiles as any[]).map((r) => r.storagePath as string);
    const folderMarkerKeys = (affectedFolders as any[]).map((r) => r.path as string);

    const allS3Keys = [...fileKeys, ...folderMarkerKeys];
    if (allS3Keys.length > 0) {
      try {
        const storage = await this.providerService.getDecryptedProvider(workspaceId);
        await Promise.all(allS3Keys.map((key) => storage.deleteObject(key).catch(() => {})));
      } catch {
        // skip
      }
    }

    if (fileKeys.length > 0) {
      await this.repository.softDeleteFilesByPaths(fileKeys);
    }

    await this.repository.delete(folderId);

    await this.prisma.activityLog.create({
      data: {
        id: randomUUID(),
        workspaceId,
        userId,
        action: "folder_deleted",
        details: JSON.stringify({
          folderId,
          path: folder.path,
          filesDeleted: fileKeys.length,
        }),
      },
    });
  }

  async moveFolder(
    workspaceId: string,
    folderId: string,
    userId: string,
    targetParentId: string | null,
  ) {
    const folder = await this.repository.findById(folderId);
    if (!folder || folder.workspaceId !== workspaceId) {
      throw new AppError("Folder not found", 404, "NOT_FOUND");
    }

    if (targetParentId) {
      const cycle = await this.repository.queryRaw<any[]>`
        WITH RECURSIVE desc AS (
          SELECT id FROM folders
          WHERE  id = ${folderId}::uuid AND "workspaceId" = ${workspaceId}::uuid
          UNION ALL
          SELECT f.id FROM folders f
          JOIN   desc ON f."parentId" = desc.id
          WHERE  f."workspaceId" = ${workspaceId}::uuid
        )
        SELECT id FROM desc WHERE id = ${targetParentId}::uuid
      `;
      if ((cycle as any[]).length > 0) {
        throw new AppError(
          "Cannot move a folder into its own descendant",
          422,
          "CYCLE_DETECTED",
        );
      }
    }

    const oldPath = folder.path;
    let newParentPath = "";

    if (targetParentId) {
      const target = await this.repository.findById(targetParentId);
      if (!target || target.workspaceId !== workspaceId) {
        throw new AppError("Target folder not found", 404, "NOT_FOUND");
      }
      newParentPath = target.path;
    }

    const newPath = newParentPath + folder.name + "/";

    const conflict = await this.repository.findByPath(workspaceId, newPath);
    if (conflict && conflict.id !== folderId) {
      throw new AppError(
        "A folder with this name already exists at the destination",
        409,
        "CONFLICT",
      );
    }

    await this.repository.executeRaw`
      UPDATE folders
      SET "parentId" = ${targetParentId ?? null}::uuid,
          path       = ${newPath},
          "updatedAt" = NOW()
      WHERE id = ${folderId}::uuid AND "workspaceId" = ${workspaceId}::uuid
    `;

    if (oldPath !== newPath) {
      await this.repository.executeRaw`
        WITH RECURSIVE sub AS (
          SELECT id FROM folders
          WHERE  "parentId" = ${folderId}::uuid AND "workspaceId" = ${workspaceId}::uuid
          UNION ALL
          SELECT f.id FROM folders f
          JOIN   sub ON f."parentId" = sub.id
          WHERE  f."workspaceId" = ${workspaceId}::uuid
        )
        UPDATE folders
        SET    path       = replace(folders.path, ${oldPath}, ${newPath}),
               "updatedAt" = NOW()
        FROM   sub
        WHERE  folders.id = sub.id
      `;
    }

    await this.prisma.activityLog.create({
      data: {
        id: randomUUID(),
        workspaceId,
        userId,
        action: "folder_moved",
        details: JSON.stringify({ folderId, oldPath, newPath }),
      },
    });

    return this.repository.findById(folderId);
  }

  async listFolders(workspaceId: string, parentId?: string) {
    return this.repository.list(workspaceId, parentId);
  }
}
