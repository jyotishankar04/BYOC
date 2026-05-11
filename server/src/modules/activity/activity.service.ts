import type { PrismaClient } from "@/generated/prisma/client";
import { AppError } from "@/core/errors";

interface LogActivityData {
  workspaceId: string;
  userId: string;
  action: string;
  details?: string;
}

interface ListActivityOptions {
  fileId?: string;
  userId?: string;
  action?: string;
  page?: number;
  limit?: number;
}

export class ActivityService {
  constructor(private prisma: PrismaClient) {}

  async logActivity(data: LogActivityData): Promise<void> {
    // Check if activity logs are enabled for this workspace
    const workspaceSecurity = await this.prisma.workspaceSecurity.findUnique({
      where: { workspaceId: data.workspaceId },
      select: { enableActivityLogs: true },
    });

    // Default to enabled if not found
    if (workspaceSecurity?.enableActivityLogs === false) {
      return;
    }

    await this.prisma.activityLog.create({
      data: {
        workspaceId: data.workspaceId,
        userId: data.userId,
        action: data.action,
        details: data.details,
      },
    });
  }

  async listActivity(
    workspaceId: string,
    requestingUserId: string,
    options: ListActivityOptions = {},
  ) {
    const { fileId, userId, action, page = 1, limit = 20 } = options;

    // Check if activity logs are enabled and user has access
    const [workspaceSecurity, membership] = await Promise.all([
      this.prisma.workspaceSecurity.findUnique({
        where: { workspaceId },
        select: { enableActivityLogs: true },
      }),
      this.prisma.workspaceMember.findFirst({
        where: {
          workspaceId,
          userId: requestingUserId,
          status: "Active",
        },
        select: { role: true },
      }),
    ]);

    // Verify workspace access
    if (!membership) {
      throw new AppError(
        "Access denied to this workspace",
        403,
        "FORBIDDEN",
      );
    }

    // Check if activity logs are enabled
    if (workspaceSecurity?.enableActivityLogs === false) {
      throw new AppError(
        "Activity logs are disabled for this workspace",
        403,
        "ACTIVITY_LOGS_DISABLED",
      );
    }

    const where: {
      workspaceId: string;
      fileId?: string;
      userId?: string;
      action?: string;
    } = {
      workspaceId,
    };

    if (fileId) where.fileId = fileId;
    if (userId) where.userId = userId;
    if (action) where.action = action;

    const [logs, total] = await Promise.all([
      this.prisma.activityLog.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
            },
          },
        },
      }),
      this.prisma.activityLog.count({ where }),
    ]);

    return {
      logs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
