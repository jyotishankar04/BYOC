import { z } from "zod";
import {
  listFilesQuerySchema,
  renameFileSchema,
  moveFileSchema,
} from "./files.schema";
import type { File, Folder, User } from "@/generated/prisma/client";

export type ListFilesQuery = z.infer<typeof listFilesQuerySchema>;
export type RenameFileDto = z.infer<typeof renameFileSchema>;
export type MoveFileDto = z.infer<typeof moveFileSchema>;

export interface ListFilesResult {
  files: (File & { uploadedBy: Partial<User> })[];
  folders: Folder[];
  breadcrumbs: { id: string; name: string }[];
  total: number;
  page: number;
  limit: number;
}
