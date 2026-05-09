import type { Request, Response, NextFunction } from 'express';
import { WorkspaceRole, PermissionRole, MemberStatus, type WorkspacePermission } from '@/generated/prisma/client';
import prisma from '@/config/db.config';
import { AppError } from '@/core/errors';

const ROLE_WEIGHT: Record<WorkspaceRole, number> = {
  [WorkspaceRole.Owner]: 4,
  [WorkspaceRole.Admin]: 3,
  [WorkspaceRole.Member]: 2,
  [WorkspaceRole.Viewer]: 1,
};

const PERMISSION_ROLE_WEIGHT: Record<PermissionRole, number> = {
  [PermissionRole.Owner]: 4,
  [PermissionRole.Admin]: 3,
  [PermissionRole.Member]: 2,
  [PermissionRole.Viewer]: 1,
};

// Keys on WorkspacePermission whose value type is PermissionRole
type PermissionAction = {
  [K in keyof WorkspacePermission]: WorkspacePermission[K] extends PermissionRole ? K : never;
}[keyof WorkspacePermission];

export const requireWorkspaceMember = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const workspaceId = req.params['workspaceId'] as string;
    if (!workspaceId || !req.userId) {
      return next(new AppError('Forbidden', 403, 'FORBIDDEN'));
    }

    const member = await prisma.workspaceMember.findUnique({
      where: { workspaceId_userId: { workspaceId, userId: req.userId } },
    });
    if (!member) return next(new AppError('Forbidden', 403, 'FORBIDDEN'));
    if (member.status !== MemberStatus.Active) {
      return next(new AppError('Invitation pending acceptance', 403, 'INVITATION_PENDING'));
    }

    const permissions = await prisma.workspacePermission.findUnique({
      where: { workspaceId },
    });
    if (!permissions) {
      return next(new AppError('Workspace configuration error', 500, 'INTERNAL_ERROR'));
    }

    req.workspaceId = workspaceId;
    req.membership = { role: member.role, permissions };
    return next();
  } catch (err) {
    return next(err);
  }
};

export const requireRole = (minimumRole: WorkspaceRole) =>
  (req: Request, _res: Response, next: NextFunction) => {
    if (!req.membership) return next(new AppError('Forbidden', 403, 'FORBIDDEN'));
    if (ROLE_WEIGHT[req.membership.role] < ROLE_WEIGHT[minimumRole]) {
      return next(new AppError('Insufficient role', 403, 'INSUFFICIENT_ROLE'));
    }
    return next();
  };

export const requirePermission = (action: PermissionAction) =>
  (req: Request, _res: Response, next: NextFunction) => {
    if (!req.membership) return next(new AppError('Forbidden', 403, 'FORBIDDEN'));
    const requiredPermRole = req.membership.permissions[action] as PermissionRole;
    if (ROLE_WEIGHT[req.membership.role] < PERMISSION_ROLE_WEIGHT[requiredPermRole]) {
      return next(new AppError('Permission denied', 403, 'PERMISSION_DENIED'));
    }
    return next();
  };
