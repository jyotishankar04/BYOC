import type { PrismaClient, File, Folder, User } from "@/generated/prisma/client";
import { FileKind, FileStatus, ShareLinkStatus } from "@/generated/prisma/client";
import type { ListFilesQuery } from "./files.interface";

function buildKindWhere(kind: ListFilesQuery["kind"]) {
  if (kind === "media") {
    return { in: [FileKind.image, FileKind.video] };
  }

  if (kind !== undefined) {
    return kind;
  }

  return undefined;
}

export class FilesRepository {
  constructor(private prisma: PrismaClient) {}

  async findMany(
    workspaceId: string,
    query: ListFilesQuery,
  ): Promise<(File & { uploadedBy: Partial<User> })[]> {
    const { folderId, kind, includeNested, search, sortBy, sortDir, page, limit } = query;
    const skip = (page - 1) * limit;
    const kindWhere = buildKindWhere(kind);
    const folderWhere =
      folderId !== undefined
        ? folderId
        : includeNested
          ? undefined
          : null;

    const where = {
      workspaceId,
      status: FileStatus.uploaded,
      ...(folderWhere !== undefined && { folderId: folderWhere }),
      ...(kindWhere !== undefined && { kind: kindWhere }),
      ...(search !== undefined && {
        name: { contains: search, mode: "insensitive" as const },
      }),
    };

    return this.prisma.file.findMany({
      where,
      orderBy: { [sortBy]: sortDir },
      skip,
      take: limit,
      include: {
        uploadedBy: {
          select: { id: true, name: true, email: true, image: true },
        },
      },
    });
  }

  async count(workspaceId: string, query: ListFilesQuery) {
    const { folderId, kind, includeNested, search } = query;
    const kindWhere = buildKindWhere(kind);
    const folderWhere =
      folderId !== undefined
        ? folderId
        : includeNested
          ? undefined
          : null;
    const where = {
      workspaceId,
      status: FileStatus.uploaded,
      ...(folderWhere !== undefined && { folderId: folderWhere }),
      ...(kindWhere !== undefined && { kind: kindWhere }),
      ...(search !== undefined && {
        name: { contains: search, mode: "insensitive" as const },
      }),
    };
    return this.prisma.file.count({ where });
  }

  async findFolders(workspaceId: string, parentId?: string | null) {
    return this.prisma.folder.findMany({
      where: {
        workspaceId,
        parentId: parentId !== undefined ? parentId : null,
      },
      orderBy: { name: "asc" },
    });
  }

  async findFolderById(folderId: string, workspaceId?: string) {
    return this.prisma.folder.findFirst({
      where: { id: folderId, ...(workspaceId ? { workspaceId } : {}) },
      select: { id: true, name: true, path: true, parentId: true, workspaceId: true },
    });
  }

  async findById(workspaceId: string, fileId: string) {
    return this.prisma.file.findFirst({
      where: { id: fileId, workspaceId, status: { not: FileStatus.deleted } },
      include: {
        uploadedBy: {
          select: { id: true, name: true, email: true, image: true },
        },
        folder: { select: { id: true, name: true, path: true } },
      },
    });
  }

  async update(fileId: string, data: Partial<File>) {
    return this.prisma.file.update({
      where: { id: fileId },
      data,
    });
  }

  async deleteFileSoftly(fileId: string) {
    return this.prisma.$transaction([
      this.prisma.file.update({
        where: { id: fileId },
        data: { status: FileStatus.deleted },
      }),
      this.prisma.shareLink.updateMany({
        where: { fileId: fileId, status: ShareLinkStatus.Active },
        data: { status: ShareLinkStatus.Disabled },
      }),
    ]);
  }
}
