import type { PrismaClient, File, UploadSession } from "@/generated/prisma/client";
import { UploadSessionStatus } from "@/generated/prisma/client";

export class UploadRepository {
  constructor(private prisma: PrismaClient) {}

  async createFile(data: any): Promise<File> {
    const include = {
      uploadedBy: { select: { id: true, name: true, email: true, image: true } },
      folder: { select: { id: true, name: true } },
    };

    try {
      return await this.prisma.file.create({ data, include });
    } catch (err: any) {
      // P2002 = unique constraint violation — a record with this (workspaceId, storagePath)
      // already exists (e.g. soft-deleted). Re-activate it with the new upload's data.
      if (err?.code !== "P2002") throw err;
      const { workspaceId, storagePath, id: _newId, ...fields } = data;
      return this.prisma.file.update({
        where: { workspaceId_storagePath: { workspaceId, storagePath } },
        data: { ...fields, durationSeconds: null, width: null, height: null, thumbnailPath: null },
        include,
      });
    }
  }

  async findFileById(id: string): Promise<File | null> {
    return this.prisma.file.findUnique({
      where: { id },
    });
  }

  async updateFile(id: string, data: any): Promise<File> {
    return this.prisma.file.update({
      where: { id },
      data,
      include: {
        uploadedBy: { select: { id: true, name: true, email: true, image: true } },
        folder: { select: { id: true, name: true } },
      },
    });
  }

  async deleteFile(id: string): Promise<void> {
    await this.prisma.file.delete({
      where: { id },
    });
  }

  async createUploadSession(data: any): Promise<UploadSession> {
    return this.prisma.uploadSession.create({
      data,
    });
  }

  async findUploadSessionById(id: string): Promise<UploadSession | null> {
    return this.prisma.uploadSession.findUnique({
      where: { id },
      include: { file: true },
    });
  }

  async updateUploadSession(id: string, data: any): Promise<UploadSession> {
    return this.prisma.uploadSession.update({
      where: { id },
      data,
    });
  }

  async countActiveUploadSessions(workspaceId: string): Promise<number> {
    return this.prisma.uploadSession.count({
      where: {
        workspaceId,
        status: {
          in: [UploadSessionStatus.pending, UploadSessionStatus.uploading],
        },
      },
    });
  }

  async findFolderById(id: string) {
    return this.prisma.folder.findUnique({
      where: { id },
      select: { workspaceId: true, path: true },
    });
  }

  async findWorkspaceMembers(workspaceId: string, roles: string[], excludeUserId: string) {
    return this.prisma.workspaceMember.findMany({
      where: {
        workspaceId,
        role: { in: roles as any },
        userId: { not: excludeUserId },
      },
    });
  }
}
