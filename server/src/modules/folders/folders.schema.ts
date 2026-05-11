import { z } from "zod";

export const createFolderSchema = z.object({
  name: z.string().min(1).max(255),
  parentId: z.string().uuid().optional(),
});

export const renameFolderSchema = z.object({
  name: z.string().min(1).max(255),
});

export const moveFolderSchema = z.object({
  targetParentId: z.string().uuid().nullable(),
});

export type CreateFolderDto = z.infer<typeof createFolderSchema>;
export type RenameFolderDto = z.infer<typeof renameFolderSchema>;
export type MoveFolderDto = z.infer<typeof moveFolderSchema>;
