import type { PrismaClient, StorageProvider } from "@/generated/prisma/client";

export class ProviderRepository {
  constructor(private prisma: PrismaClient) {}

  async findUnique(workspaceId: string): Promise<StorageProvider | null> {
    return this.prisma.storageProvider.findUnique({
      where: { workspaceId },
    });
  }

  async upsert(workspaceId: string, data: any): Promise<StorageProvider> {
    return this.prisma.storageProvider.upsert({
      where: { workspaceId },
      create: { workspaceId, ...data },
      update: data,
    });
  }

  async update(workspaceId: string, data: any): Promise<StorageProvider> {
    return this.prisma.storageProvider.update({
      where: { workspaceId },
      data,
    });
  }
}
