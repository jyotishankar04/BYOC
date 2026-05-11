import type { Folder } from "@/generated/prisma/client";
import type {
  CreateFolderDto,
  RenameFolderDto,
  MoveFolderDto,
} from "./folders.schema";

export type { CreateFolderDto, RenameFolderDto, MoveFolderDto };

export interface IFolderRepository {
  findById(id: string): Promise<Folder | null>;
  findByPath(workspaceId: string, path: string): Promise<Folder | null>;
  create(data: any): Promise<Folder>;
  update(id: string, data: any): Promise<Folder>;
  delete(id: string): Promise<void>;
  list(workspaceId: string, parentId?: string | null): Promise<Folder[]>;
}
