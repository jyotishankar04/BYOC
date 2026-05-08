import type { WorkspacePermission, WorkspaceRole } from '@/generated/prisma/client';

declare global {
  namespace Express {
    interface Request {
      userId?: string;
      userEmail?: string;
      sessionId?: string;
      sessionToken?: string;
      workspaceId?: string;
      membership?: {
        role: WorkspaceRole;
        permissions: WorkspacePermission;
      };
    }
  }
}
