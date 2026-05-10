import { z } from "zod";
import { WorkspaceRole } from "@/generated/prisma/client";

export const inviteMemberSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
});

export const inviteByEmailSchema = z.object({
  email: z.string().email("Valid email is required"),
});

export const changeMemberRoleSchema = z.object({
  role: z
    .nativeEnum(WorkspaceRole)
    .refine(
      (r) => r !== WorkspaceRole.Owner,
      "Cannot directly assign the Owner role — use the transfer ownership endpoint",
    ),
});
