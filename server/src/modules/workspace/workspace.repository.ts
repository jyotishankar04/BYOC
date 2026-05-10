import type { PrismaClient } from "@/generated/prisma/client";
import type { IWorkspaceRepository } from "./workspace.interface";

export class WorkspaceRepository implements IWorkspaceRepository {
  constructor(private prisma: PrismaClient) {}

  async findWorkspacesByUserId(
    userId: string,
  ): Promise<Array<Record<string, unknown>>> {
    return this.prisma.workspace.findMany({
      where: { members: { some: { userId } } },
      include: {
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true, image: true },
            },
          },
        },
        storageProvider: true,
        permissions: true,
        security: true,
      },
      orderBy: { createdAt: "asc" },
    });
  }

  async findWorkspaceById(
    workspaceId: string,
  ): Promise<Record<string, unknown> | null> {
    return this.prisma.workspace.findUnique({
      where: { id: workspaceId },
      include: {
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true, image: true },
            },
          },
        },
        storageProvider: true,
        permissions: true,
        security: true,
      },
    });
  }

  async createWorkspace(
    data: Record<string, unknown>,
  ): Promise<Record<string, unknown>> {
    return this.prisma.workspace.create({ data: data as any });
  }

  async updateWorkspace(
    workspaceId: string,
    data: Record<string, unknown>,
  ): Promise<Record<string, unknown>> {
    return this.prisma.workspace.update({
      where: { id: workspaceId },
      data: data as any,
    });
  }

  async deleteWorkspace(workspaceId: string): Promise<void> {
    await this.prisma.workspace.delete({ where: { id: workspaceId } });
  }

  async checkSlugExists(slug: string, excludeId?: string): Promise<boolean> {
    if (excludeId) {
      const found = await this.prisma.workspace.findFirst({
        where: { slug, id: { not: excludeId } },
      });
      return found !== null;
    }
    const found = await this.prisma.workspace.findUnique({ where: { slug } });
    return found !== null;
  }

  async findMembership(
    workspaceId: string,
    userId: string,
  ): Promise<Record<string, unknown> | null> {
    return this.prisma.workspaceMember.findUnique({
      where: { workspaceId_userId: { workspaceId, userId } },
    });
  }

  async findOwnerPlan(userId: string): Promise<Record<string, unknown>[]> {
    return this.prisma.workspace.findMany({
      where: { ownerId: userId },
      select: { plan: true },
    });
  }

  async updateMembership(
    workspaceId: string,
    userId: string,
    data: Record<string, unknown>,
  ): Promise<Record<string, unknown>> {
    return this.prisma.workspaceMember.update({
      where: { workspaceId_userId: { workspaceId, userId } },
      data: data as any,
    });
  }

  async upsertPermissions(
    workspaceId: string,
    data: Record<string, unknown>,
  ): Promise<Record<string, unknown>> {
    return this.prisma.workspacePermission.upsert({
      where: { workspaceId },
      create: { workspaceId, ...data },
      update: data,
    });
  }

  async updateSecurity(
    workspaceId: string,
    data: Record<string, unknown>,
  ): Promise<Record<string, unknown>> {
    return this.prisma.workspaceSecurity.upsert({
      where: { workspaceId },
      create: { workspaceId, ...data },
      update: data,
    });
  }

  async findActivePublicShareLinks(
    workspaceId: string,
  ): Promise<Array<Record<string, unknown>>> {
    return this.prisma.shareLink.findMany({
      where: {
        workspaceId,
        accessType: "Public",
        status: "Active",
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });
  }

  async disableShareLinks(
    workspaceId: string,
    accessType: string,
  ): Promise<Array<Record<string, unknown>>> {
    const affected = await this.prisma.shareLink.findMany({
      where: {
        workspaceId,
        accessType: accessType as any,
        status: "Active",
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });

    await this.prisma.shareLink.updateMany({
      where: {
        workspaceId,
        accessType: accessType as any,
        status: "Active",
      },
      data: { status: "Disabled" as any },
    });

    return affected;
  }

  async createActivityLog(
    workspaceId: string,
    userId: string,
    action: string,
    details?: string,
  ): Promise<void> {
    await this.prisma.activityLog.create({
      data: { workspaceId, userId, action, details },
    });
  }

  async createNotification(data: {
    workspaceId?: string;
    userId: string;
    type: string;
    title: string;
    message?: string;
    link?: string;
  }): Promise<void> {
    await this.prisma.notification.create({
      data: {
        workspaceId: data.workspaceId ?? null,
        userId: data.userId,
        type: data.type as any,
        title: data.title,
        message: data.message ?? null,
        link: data.link ?? null,
      },
    });
  }

  async findUserById(
    userId: string,
  ): Promise<{ id: string; name: string; email: string } | null> {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true },
    });
  }
}
