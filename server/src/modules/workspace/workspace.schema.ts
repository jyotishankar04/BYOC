import { z } from "zod";
import { WorkspaceType, PermissionRole } from "@/generated/prisma/client";

export const createWorkspaceSchema = z.object({
  name: z.string().min(3).max(100),
  slug: z
    .string()
    .min(3)
    .max(50)
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens"),
  type: z.nativeEnum(WorkspaceType),
});

export const updateWorkspaceSchema = createWorkspaceSchema.partial();

export const transferSchema = z.object({
  newOwnerId: z.string().min(1),
});

export const updatePermissionsSchema = z.object({
  canUpload: z.nativeEnum(PermissionRole).optional(),
  canCreateFolders: z.nativeEnum(PermissionRole).optional(),
  canShareFiles: z.nativeEnum(PermissionRole).optional(),
  canDeleteFiles: z.nativeEnum(PermissionRole).optional(),
  canManageBilling: z.nativeEnum(PermissionRole).optional(),
});

export const updateSecuritySchema = z.object({
  requirePasswordForPublicLinks: z.boolean().optional(),
  disablePublicSharing: z.boolean().optional(),
  allowPrivateInviteSharing: z.boolean().optional(),
  enableActivityLogs: z.boolean().optional(),
});

export type CreateWorkspaceDto = z.infer<typeof createWorkspaceSchema>;
export type UpdateWorkspaceDto = z.infer<typeof updateWorkspaceSchema>;
export type TransferDto = z.infer<typeof transferSchema>;
export type UpdatePermissionsDto = z.infer<typeof updatePermissionsSchema>;
export type UpdateSecurityDto = z.infer<typeof updateSecuritySchema>;
