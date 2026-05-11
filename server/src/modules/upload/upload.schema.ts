import { z } from "zod";

const SMALL_FILE_MAX = 5 * 1024 * 1024;

export const presignSchema = z.object({
  name: z.string().min(1).max(500),
  mimeType: z.string().min(1).max(200),
  size: z.number().int().positive().max(SMALL_FILE_MAX - 1),
  folderId: z.string().uuid().optional(),
});

export const initiateSchema = z.object({
  files: z
    .array(
      z.object({
        name: z.string().min(1).max(500),
        mimeType: z.string().min(1).max(200),
        size: z.number().int().min(SMALL_FILE_MAX),
        folderId: z.string().uuid().optional(),
      }),
    )
    .min(1)
    .max(10),
});

export const progressSchema = z.object({
  completedParts: z.array(
    z.object({
      partNumber: z.number().int().positive(),
      etag: z.string().min(1),
    }),
  ),
});

export const completeSchema = z.object({
  parts: z.array(
    z.object({
      partNumber: z.number().int().positive(),
      etag: z.string().min(1),
    }),
  ),
});

export type PresignDto = z.infer<typeof presignSchema>;
export type InitiateDto = z.infer<typeof initiateSchema>;
export type ProgressDto = z.infer<typeof progressSchema>;
export type CompleteDto = z.infer<typeof completeSchema>;
