import type { PrismaClient, Folder } from "@/generated/prisma/client";

export class FoldersRepository {
  constructor(private prisma: PrismaClient) {}

  async findById(id: string): Promise<Folder | null> {
    return this.prisma.folder.findUnique({
      where: { id },
    });
  }

  async findByPath(workspaceId: string, path: string): Promise<Folder | null> {
    return this.prisma.folder.findUnique({
      where: { workspaceId_path: { workspaceId, path } },
    });
  }

  async create(data: any): Promise<Folder> {
    return this.prisma.folder.create({
      data,
    });
  }

  async update(id: string, data: any): Promise<Folder> {
    return this.prisma.folder.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.folder.delete({
      where: { id },
    });
  }

  async list(workspaceId: string, parentId?: string | null): Promise<Folder[]> {
    return this.prisma.folder.findMany({
      where: {
        workspaceId,
        parentId: parentId ?? null,
      },
      orderBy: { name: "asc" },
    });
  }

  async executeRaw(query: TemplateStringsArray, ...args: any[]) {
    return this.prisma.$executeRaw(query, ...args);
  }

  async queryRaw<T>(query: TemplateStringsArray, ...args: any[]): Promise<T> {
    return this.prisma.$queryRaw(query, ...args) as Promise<T>;
  }

  async softDeleteFilesByPaths(storagePaths: string[]) {
    return this.prisma.file.updateMany({
      where: { storagePath: { in: storagePaths } },
      data: { status: "deleted" },
    });
  }
}
