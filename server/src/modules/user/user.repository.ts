import { MemberStatus, type PrismaClient } from "@/generated/prisma/client";
import type { IUserRepository } from "./user.interface";

export class UserRepository implements IUserRepository {
  constructor(private prisma: PrismaClient) {}

  async findById(id: string): Promise<Record<string, unknown> | null> {
    return this.prisma.user.findUnique({
      where: { id },
      include: {
        memberships: {
          include: { workspace: true },
        },
        preferences: true,
      },
    });
  }

  async findByEmail(email: string): Promise<Record<string, unknown> | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async update(
    id: string,
    data: Record<string, unknown>,
  ): Promise<Record<string, unknown>> {
    return this.prisma.user.update({ where: { id }, data });
  }

  async findPreferences(
    userId: string,
  ): Promise<Record<string, unknown> | null> {
    return this.prisma.userPreferences.findUnique({ where: { userId } });
  }

  async upsertPreferences(
    userId: string,
    data: Record<string, unknown>,
  ): Promise<Record<string, unknown>> {
    return this.prisma.userPreferences.upsert({
      where: { userId },
      create: { userId, ...data },
      update: data,
    });
  }

  async listMyInvites(userId: string): Promise<Record<string, unknown>[]> {
    return this.prisma.workspaceMember.findMany({
      where: { userId, status: MemberStatus.Pending },
      select: {
        id: true,
        workspaceId: true,
        userId: true,
        role: true,
        joinedAt: true,
        workspace: { select: { id: true, name: true, color: true } },
        invitedBy: { select: { id: true, name: true, email: true } },
      },
      orderBy: { joinedAt: "desc" },
    }) as unknown as Record<string, unknown>[];
  }

  async listAccounts(userId: string): Promise<Record<string, unknown>[]> {
    return this.prisma.account.findMany({
      where: { userId },
      select: {
        id: true,
        providerId: true,
        accountId: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: "asc" },
    }) as unknown as Record<string, unknown>[];
  }

  async listSessions(userId: string): Promise<Record<string, unknown>[]> {
    return this.prisma.session.findMany({
      where: { userId },
      select: {
        id: true,
        token: true,
        expiresAt: true,
        createdAt: true,
        updatedAt: true,
        ipAddress: true,
        userAgent: true,
      },
      orderBy: { updatedAt: "desc" },
    }) as unknown as Record<string, unknown>[];
  }

  async findSessionById(
    userId: string,
    sessionId: string,
  ): Promise<Record<string, unknown> | null> {
    return this.prisma.session.findFirst({
      where: { id: sessionId, userId },
      select: {
        id: true,
        token: true,
        expiresAt: true,
        createdAt: true,
        updatedAt: true,
        ipAddress: true,
        userAgent: true,
      },
    }) as unknown as Record<string, unknown> | null;
  }

  async deleteSession(sessionId: string): Promise<void> {
    await this.prisma.session.delete({
      where: { id: sessionId },
    });
  }

  async deleteSessionsExcept(userId: string, sessionId: string): Promise<void> {
    await this.prisma.session.deleteMany({
      where: {
        userId,
        id: { not: sessionId },
      },
    });
  }
}
