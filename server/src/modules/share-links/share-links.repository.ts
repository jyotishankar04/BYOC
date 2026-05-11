import type { PrismaClient, ShareAccessType, ShareLinkStatus } from "@/generated/prisma/client";

export interface CreateShareLinkData {
  fileId?: string;
  folderId?: string;
  workspaceId: string;
  userId: string;
  slug: string;
  accessType: ShareAccessType;
  passwordHash?: string;
  expiresAt?: Date | null;
  allowDownload?: boolean;
}

export interface ShareLinkResult {
  id: string;
  slug: string;
  accessType: ShareAccessType;
  expiresAt: Date | null;
  url: string;
}

export interface ShareLinkListQuery {
  status?: ShareLinkStatus;
  accessType?: ShareAccessType;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: "createdAt" | "visits" | "expiresAt";
  sortOrder?: "asc" | "desc";
}

export class ShareLinksRepository {
  constructor(private prisma: PrismaClient) {}

  async findFileById(fileId: string, workspaceId: string) {
    return this.prisma.file.findFirst({
      where: { id: fileId, workspaceId },
      include: {
        uploadedBy: {
          select: { id: true, name: true, email: true },
        },
      },
    });
  }

  async findFolderById(folderId: string, workspaceId: string) {
    return this.prisma.folder.findFirst({
      where: { id: folderId, workspaceId },
    });
  }

  async findWorkspaceSecurity(workspaceId: string) {
    return this.prisma.workspaceSecurity.findUnique({
      where: { workspaceId },
    });
  }

  async findWorkspacePlan(workspaceId: string) {
    return this.prisma.workspace.findUnique({
      where: { id: workspaceId },
      select: { plan: true },
    });
  }

  async getActiveLinkCount(workspaceId: string) {
    return this.prisma.shareLink.count({
      where: { workspaceId, status: "Active" },
    });
  }

  async createShareLink(data: CreateShareLinkData) {
    return this.prisma.shareLink.create({
      data: {
        id: undefined, // Let UUID generate
        workspaceId: data.workspaceId,
        userId: data.userId,
        fileId: data.fileId,
        folderId: data.folderId,
        slug: data.slug,
        accessType: data.accessType,
        passwordHash: data.passwordHash,
        expiresAt: data.expiresAt,
        allowDownload: data.allowDownload ?? true,
        status: "Active",
      },
    });
  }

  async findBySlug(slug: string) {
    return this.prisma.shareLink.findUnique({
      where: { slug },
      include: {
        file: {
          include: {
            workspace: {
              include: {
                storageProvider: true,
              },
            },
          },
        },
        folder: {
          include: {
            workspace: {
              include: {
                storageProvider: true,
              },
            },
          },
        },
      },
    });
  }

  async findFolderFiles(folderId: string, folderPath: string, workspaceId: string) {
    return this.prisma.file.findMany({
      where: {
        workspaceId,
        status: "uploaded",
        folder: {
          path: {
            startsWith: folderPath,
          },
        },
      },
      include: {
        folder: {
          select: { id: true, name: true, path: true },
        },
      },
      orderBy: [{ storagePath: "asc" }],
    });
  }

  async recordVisit(shareLinkId: string, data: { ipAddress?: string; userAgent?: string }) {
    return this.prisma.$transaction([
      this.prisma.shareLink.update({
        where: { id: shareLinkId },
        data: { visits: { increment: 1 } },
      }),
      this.prisma.shareLinkVisit.create({
        data: {
          shareLinkId,
          ipAddress: data.ipAddress,
          userAgent: data.userAgent,
        },
      }),
    ]);
  }

  async findShareLinkWithFile(shareLinkId: string, workspaceId: string) {
    return this.prisma.shareLink.findFirst({
      where: { id: shareLinkId, workspaceId },
      include: {
        file: {
          select: { name: true, uploadedById: true },
        },
        folder: {
          select: { name: true },
        },
      },
    });
  }

  async updateStatus(shareLinkId: string, status: ShareLinkStatus) {
    return this.prisma.shareLink.update({
      where: { id: shareLinkId },
      data: { status },
    });
  }

  async listShareLinks(workspaceId: string, query: ShareLinkListQuery) {
    const {
      status,
      accessType,
      search,
      page = 1,
      limit = 20,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = query;

    const skip = (page - 1) * limit;

    const where: any = {
      workspaceId,
    };

    if (status) where.status = status;
    if (accessType) where.accessType = accessType;
    if (search) {
      where.OR = [
        {
          file: {
            name: { contains: search, mode: "insensitive" },
          },
        },
        {
          folder: {
            name: { contains: search, mode: "insensitive" },
          },
        },
      ];
    }

    const [links, total, stats] = await Promise.all([
      this.prisma.shareLink.findMany({
      where,
      include: {
        file: {
          select: { id: true, name: true, size: true, mimeType: true },
        },
        folder: {
          select: { id: true, name: true, path: true },
        },
      },
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
      }),
      this.prisma.shareLink.count({ where }),
      this.prisma.shareLink.groupBy({
        by: ["status", "accessType"],
        where: { workspaceId },
        _count: true,
      }),
    ]);

    return { links, total, stats };
  }

  async findById(id: string, workspaceId: string) {
    return this.prisma.shareLink.findFirst({
      where: { id, workspaceId },
      include: {
        file: {
          select: { id: true, name: true, size: true, mimeType: true },
        },
        folder: {
          select: { id: true, name: true, path: true },
        },
        visitRecords: {
          orderBy: { visitedAt: "desc" },
          take: 20,
        },
      },
    });
  }

  async updateShareLink(id: string, workspaceId: string, data: any) {
    return this.prisma.shareLink.update({
      where: { id, workspaceId },
      data,
    });
  }

  async deleteShareLink(id: string, workspaceId: string) {
    return this.prisma.shareLink.delete({
      where: { id, workspaceId },
    });
  }
}
