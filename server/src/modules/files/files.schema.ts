import { z } from "zod";
import { FileKind } from "@/generated/prisma/client";

export const listFilesQuerySchema = z.object({
  folderId: z.string().uuid().optional(),
  kind: z.union([z.nativeEnum(FileKind), z.literal("media")]).optional(),
  includeNested: z.coerce.boolean().default(false),
  search: z.string().max(200).optional(),
  sortBy: z.enum(["name", "size", "createdAt", "updatedAt"]).default("createdAt"),
  sortDir: z.enum(["asc", "desc"]).default("desc"),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(200).default(50),
});

export const renameFileSchema = z.object({
  name: z
    .string()
    .min(1)
    .max(255)
    .refine((n) => !n.includes("/") && !n.includes("\0"), {
      message: "Name must not contain / or null bytes",
    }),
});

export const moveFileSchema = z.object({
  folderId: z.string().uuid().nullable(),
});
