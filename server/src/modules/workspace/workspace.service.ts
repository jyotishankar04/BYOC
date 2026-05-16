import { WorkspaceRole } from "@/generated/prisma/client";
import type { PrismaClient } from "@/generated/prisma/client";
import prisma from "@/config/db.config";
import { AppError } from "@/core/errors";
import { SubscriptionSnapshotService } from "@/modules/billing/subscription-snapshot.service";
import { assertFeatureAccess, assertQuotaAvailable, buildQuotaSummary } from "@/modules/billing/subscription-access";
import { cache } from "@/shared/cache/cache.service";
import type {
  CreateWorkspaceDto,
  UpdateWorkspaceDto,
  TransferDto,
  UpdatePermissionsDto,
  UpdateSecurityDto,
} from "./workspace.schema";
import type {
  IWorkspaceService,
  IWorkspaceRepository,
} from "./workspace.interface";
import { WorkspaceRepository } from "./workspace.repository";
import { EmailQueueService } from "@/core/mail/mail.queue";
import { broadcast } from "@/modules/events/events.service";

export class WorkspaceService implements IWorkspaceService {
  constructor(
    private prisma: PrismaClient,
    private workspaceRepository: IWorkspaceRepository,
  ) {}

  async listWorkspaces(
    userId: string,
  ): Promise<Array<Record<string, unknown>>> {
    return this.workspaceRepository.findWorkspacesByUserId(userId);
  }

  async createWorkspace(
    userId: string,
    data: CreateWorkspaceDto,
  ): Promise<Record<string, unknown>> {
    const snapshot = await new SubscriptionSnapshotService(
      this.prisma,
    ).getUserSnapshot(userId);
    const workspaceQuota = buildQuotaSummary(
      snapshot.limits.maxWorkspaces,
      snapshot.usage.workspacesOwned,
    );
    assertQuotaAvailable(
      workspaceQuota,
      "Workspace limit reached for your plan",
      "WORKSPACE_LIMIT_REACHED",
    );

    const slugTaken = await this.workspaceRepository.checkSlugExists(data.slug);
    if (slugTaken)
      throw new AppError("Slug is already taken", 409, "SLUG_CONFLICT");

    return this.prisma.$transaction(async (tx) => {
      return tx.workspace.create({
        data: {
          ...data,
          owner: { connect: { id: userId } },
          members: { create: { userId, role: WorkspaceRole.Owner } },
          permissions: { create: {} },
          security: { create: {} },
        },
        include: { permissions: true, security: true },
      });
    });
  }

  async getWorkspace(workspaceId: string): Promise<Record<string, unknown>> {
    const workspace = await cache.wrap(`workspace:id:${workspaceId}`, 300, () =>
      this.workspaceRepository.findWorkspaceById(workspaceId),
    );
    if (!workspace) throw new AppError("Workspace not found", 404, "NOT_FOUND");
    return workspace;
  }

  async updateWorkspace(
    workspaceId: string,
    data: UpdateWorkspaceDto,
  ): Promise<Record<string, unknown>> {
    if (data.slug) {
      const slugTaken = await this.workspaceRepository.checkSlugExists(
        data.slug,
        workspaceId,
      );
      if (slugTaken)
        throw new AppError("Slug is already taken", 409, "SLUG_CONFLICT");
    }

    const result = await this.workspaceRepository.updateWorkspace(
      workspaceId,
      data as Record<string, unknown>,
    );
    await cache.del(`workspace:id:${workspaceId}`);
    return result;
  }

  async deleteWorkspace(workspaceId: string, userId: string): Promise<void> {
    const member = await this.workspaceRepository.findMembership(
      workspaceId,
      userId,
    );
    if (!member || member.role !== WorkspaceRole.Owner) {
      throw new AppError(
        "Only the workspace owner can delete it",
        403,
        "FORBIDDEN",
      );
    }

    await this.workspaceRepository.deleteWorkspace(workspaceId);
    await cache.del(`workspace:id:${workspaceId}`);
  }

  async transferOwnership(
    workspaceId: string,
    currentOwnerId: string,
    { newOwnerId }: TransferDto,
  ): Promise<void> {
    const newOwnerMember = await this.workspaceRepository.findMembership(
      workspaceId,
      newOwnerId,
    );
    if (!newOwnerMember) {
      throw new AppError(
        "New owner must be an existing workspace member",
        400,
        "NOT_A_MEMBER",
      );
    }

    await this.prisma.$transaction([
      this.prisma.workspaceMember.update({
        where: { workspaceId_userId: { workspaceId, userId: currentOwnerId } },
        data: { role: WorkspaceRole.Admin },
      }),
      this.prisma.workspaceMember.update({
        where: { workspaceId_userId: { workspaceId, userId: newOwnerId } },
        data: { role: WorkspaceRole.Owner },
      }),
      this.prisma.workspace.update({
        where: { id: workspaceId },
        data: { ownerId: newOwnerId },
      }),
    ]);
  }

  async updatePermissions(
    workspaceId: string,
    userId: string,
    data: UpdatePermissionsDto,
  ): Promise<Record<string, unknown>> {
    const snapshot = await new SubscriptionSnapshotService(
      this.prisma,
    ).getWorkspaceSnapshot(workspaceId);
    assertFeatureAccess(
      snapshot.plan,
      "teamManagement",
      "Team plan required to manage advanced workspace permissions",
      "TEAM_PLAN_REQUIRED",
    );

    const permissions = await this.workspaceRepository.upsertPermissions(
      workspaceId,
      data as Record<string, unknown>,
    );

    const changed = Object.keys(data).join(", ");
    await this.workspaceRepository.createActivityLog(
      workspaceId,
      userId,
      "settings_changed",
      `Updated permissions: ${changed}`,
    );

    return permissions;
  }

  async updateSecurity(
    workspaceId: string,
    userId: string,
    data: UpdateSecurityDto,
  ): Promise<Record<string, unknown>> {
    const snapshot = await new SubscriptionSnapshotService(
      this.prisma,
    ).getWorkspaceSnapshot(workspaceId);

    if (data.enableActivityLogs === true) {
      assertFeatureAccess(
        snapshot.plan,
        "auditLogs",
        "Team plan required to enable audit logs",
        "AUDIT_LOGS_LOCKED",
      );
    }

    if (data.disablePublicSharing === true) {
      const affected = await this.workspaceRepository.disableShareLinks(
        workspaceId,
        "Public",
      );

      const workspace =
        await this.workspaceRepository.findWorkspaceById(workspaceId);
      const workspaceName = (workspace?.name as string) ?? "Workspace";

      for (const link of affected) {
        const linkUser = link.user as {
          id: string;
          name: string;
          email: string;
        };
        const creatorId = linkUser.id;

        await this.workspaceRepository.createNotification({
          workspaceId,
          userId: creatorId,
          type: "LINK_DISABLED",
          title: "Public share links disabled",
          message: `Your public share links in "${workspaceName}" have been disabled because public sharing was turned off.`,
        });

        broadcast(workspaceId, {
          type: "notification.new",
          payload: {
            workspaceId,
            userId: creatorId,
            type: "LINK_DISABLED",
            title: "Public share links disabled",
            message: `Your public share links in "${workspaceName}" have been disabled because public sharing was turned off.`,
          },
        });

        broadcast(workspaceId, {
          type: "link.expired",
          payload: { linkId: String((link as { id?: string }).id ?? "") },
        });

        if (linkUser.email) {
          EmailQueueService.enqueue({
            type: "link_disabled",
            to: linkUser.email,
            userName: linkUser.name,
            workspaceName,
          });
        }
      }
    }

    const security = await this.workspaceRepository.updateSecurity(
      workspaceId,
      data as Record<string, unknown>,
    );

    const changed = Object.keys(data).join(", ");
    await this.workspaceRepository.createActivityLog(
      workspaceId,
      userId,
      "settings_changed",
      `Updated security: ${changed}`,
    );

    return security;
  }
}

export const workspaceService = new WorkspaceService(
  prisma,
  new WorkspaceRepository(prisma),
);
