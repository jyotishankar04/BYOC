import type { PrismaClient } from "@/generated/prisma/client";
import prisma from "@/config/db.config";
import type { IAuthRepository } from "./auth.interface";

export class AuthRepository implements IAuthRepository {
  constructor(private prisma: PrismaClient) {}

  async findUserById(id: string): Promise<Record<string, unknown> | null> {
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

  async findApiKeysByUserId(
    userId: string,
  ): Promise<Array<Record<string, unknown>>> {
    return this.prisma.apiKey.findMany({
      where: { userId, revokedAt: null },
      select: {
        id: true,
        name: true,
        keyPrefix: true,
        createdAt: true,
        lastUsedAt: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async createApiKey(data: {
    userId: string;
    name: string | null;
    keyPrefix: string;
    keyHash: string;
  }): Promise<Record<string, unknown>> {
    return this.prisma.apiKey.create({ data: data as any });
  }

  async findApiKeyByIdAndUser(
    keyId: string,
    userId: string,
  ): Promise<Record<string, unknown> | null> {
    return this.prisma.apiKey.findFirst({
      where: { id: keyId, userId },
    });
  }

  async revokeApiKey(keyId: string): Promise<void> {
    await this.prisma.apiKey.update({
      where: { id: keyId },
      data: { revokedAt: new Date() },
    });
  }

  async updateApiKeyLastUsed(keyId: string): Promise<void> {
    await this.prisma.apiKey.update({
      where: { id: keyId },
      data: { lastUsedAt: new Date() },
    });
  }

  async findApiKeyByHash(
    keyHash: string,
  ): Promise<Record<string, unknown> | null> {
    return this.prisma.apiKey.findUnique({
      where: { keyHash },
      select: { id: true, userId: true, revokedAt: true },
    });
  }
}

export const authRepository = new AuthRepository(prisma);
