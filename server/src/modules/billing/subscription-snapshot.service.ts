import type {
  PrismaClient,
  Subscription,
  SubscriptionStatus,
  WorkspacePlan,
} from "@/generated/prisma/client";
import {
  MemberStatus,
  ShareLinkStatus,
  WorkspacePlan as Plan,
} from "@/generated/prisma/client";
import {
  getFeatureAccess,
  getPlanLimits,
  type PlanFeatureAccess,
  type PlanLimits,
} from "./subscription-access";
import { cache } from "@/shared/cache/cache.service";

export interface WorkspaceUsageSnapshot {
  workspaceId: string;
  workspaceName: string;
  plan: WorkspacePlan;
  membersCount: number;
  pendingInvitesCount: number;
  activeLinksCount: number;
  storageBytesUsed: number;
  providerConnected: boolean;
}

export interface UserUsage {
  workspacesOwned: number;
  activeLinksTotal: number;
  workspaceCountByPlan: Record<WorkspacePlan, number>;
}

export interface UserSnapshot {
  plan: WorkspacePlan;
  status: SubscriptionStatus | null;
  limits: PlanLimits;
  featureAccess: PlanFeatureAccess;
  usage: UserUsage;
  remaining: {
    workspacesOwned: number | null;
  };
  checks: {
    canCreateWorkspace: boolean;
  };
  workspaces: WorkspaceUsageSnapshot[];
  currentPeriodEnd: Date | null;
  trialEndsAt: Date | null;
}

export interface WorkspaceQuotaUsage {
  membersCount: number;
  pendingInvitesCount: number;
  activeLinksCount: number;
  storageBytesUsed: number;
  workspacesOwned: number;
}

export interface WorkspaceSnapshot {
  workspaceId: string;
  plan: WorkspacePlan;
  status: SubscriptionStatus | null;
  limits: PlanLimits;
  featureAccess: PlanFeatureAccess;
  usage: WorkspaceQuotaUsage;
  currentPeriodEnd: Date | null;
  trialEndsAt: Date | null;
}

function effectivePlan(
  fallback: WorkspacePlan,
  subscription: Subscription | null,
): { plan: WorkspacePlan; status: SubscriptionStatus | null } {
  if (!subscription) return { plan: fallback, status: null };
  const active =
    subscription.status === "Active" || subscription.status === "Trialing";
  return {
    plan: active ? subscription.plan : Plan.Free,
    status: subscription.status,
  };
}

export class SubscriptionSnapshotService {
  constructor(private prisma: PrismaClient) {}

  async getUserSnapshot(userId: string): Promise<UserSnapshot> {
    const [user, subscription, memberships, ownedWorkspaces] = await Promise.all([
      this.prisma.user.findUnique({
        where: { id: userId },
        select: { plan: true },
      }),
      this.prisma.subscription.findUnique({ where: { userId } }),
      this.prisma.workspaceMember.findMany({
        where: { userId, status: MemberStatus.Active },
        select: {
          workspace: {
            select: { id: true, name: true, plan: true, ownerId: true },
          },
        },
      }),
      this.prisma.workspace.findMany({
        where: { ownerId: userId },
        select: { id: true, plan: true },
      }),
    ]);

    const fallback = user?.plan ?? Plan.Free;
    const { plan, status } = effectivePlan(fallback, subscription);
    const limits = getPlanLimits(plan);
    const featureAccess = getFeatureAccess(plan);

    const workspaces = await Promise.all(
      memberships.map(async ({ workspace }) => {
        const [membersCount, pendingInvitesCount, activeLinksCount, storageAgg, provider] =
          await Promise.all([
            this.prisma.workspaceMember.count({
              where: { workspaceId: workspace.id, status: MemberStatus.Active },
            }),
            this.prisma.workspaceMember.count({
              where: { workspaceId: workspace.id, status: MemberStatus.Pending },
            }),
            this.prisma.shareLink.count({
              where: { workspaceId: workspace.id, status: ShareLinkStatus.Active },
            }),
            this.prisma.file.aggregate({
              where: { workspaceId: workspace.id, status: "uploaded" },
              _sum: { size: true },
            }),
            this.prisma.storageProvider.findUnique({
              where: { workspaceId: workspace.id },
              select: { id: true, status: true },
            }),
          ]);

        return {
          workspaceId: workspace.id,
          workspaceName: workspace.name,
          plan: workspace.plan,
          membersCount,
          pendingInvitesCount,
          activeLinksCount,
          storageBytesUsed: storageAgg._sum.size ?? 0,
          providerConnected: Boolean(provider && provider.status !== "Invalid"),
        };
      }),
    );

    const workspaceCountByPlan: Record<WorkspacePlan, number> = {
      Free: 0,
      Pro: 0,
      Team: 0,
    };
    for (const w of ownedWorkspaces) {
      workspaceCountByPlan[w.plan] = (workspaceCountByPlan[w.plan] ?? 0) + 1;
    }

    const workspacesOwned = ownedWorkspaces.length;
    const activeLinksTotal = workspaces.reduce(
      (sum, w) => sum + w.activeLinksCount,
      0,
    );

    const remainingWorkspaces =
      limits.maxWorkspaces === null
        ? null
        : Math.max(0, limits.maxWorkspaces - workspacesOwned);
    const canCreateWorkspace =
      limits.maxWorkspaces === null || workspacesOwned < limits.maxWorkspaces;

    return {
      plan,
      status,
      limits,
      featureAccess,
      usage: {
        workspacesOwned,
        activeLinksTotal,
        workspaceCountByPlan,
      },
      remaining: {
        workspacesOwned: remainingWorkspaces,
      },
      checks: {
        canCreateWorkspace,
      },
      workspaces,
      currentPeriodEnd: subscription?.currentPeriodEnd ?? null,
      trialEndsAt: subscription?.trialEndsAt ?? null,
    };
  }

  async getWorkspaceSnapshot(workspaceId: string): Promise<WorkspaceSnapshot> {
    return cache.wrap(`billing:snapshot:${workspaceId}`, 300, () => this._fetchWorkspaceSnapshot(workspaceId));
  }

  async invalidateWorkspaceSnapshot(workspaceId: string): Promise<void> {
    await cache.del(`billing:snapshot:${workspaceId}`);
  }

  private async _fetchWorkspaceSnapshot(workspaceId: string): Promise<WorkspaceSnapshot> {
    const workspace = await this.prisma.workspace.findUnique({
      where: { id: workspaceId },
      select: { id: true, ownerId: true, plan: true },
    });

    if (!workspace) {
      const limits = getPlanLimits(Plan.Free);
      return {
        workspaceId,
        plan: Plan.Free,
        status: null,
        limits,
        featureAccess: getFeatureAccess(Plan.Free),
        usage: {
          membersCount: 0,
          pendingInvitesCount: 0,
          activeLinksCount: 0,
          storageBytesUsed: 0,
          workspacesOwned: 0,
        },
        currentPeriodEnd: null,
        trialEndsAt: null,
      };
    }

    const [
      subscription,
      membersCount,
      pendingInvitesCount,
      activeLinksCount,
      storageAgg,
      workspacesOwned,
    ] = await Promise.all([
      this.prisma.subscription.findUnique({ where: { userId: workspace.ownerId } }),
      this.prisma.workspaceMember.count({
        where: { workspaceId, status: MemberStatus.Active },
      }),
      this.prisma.workspaceMember.count({
        where: { workspaceId, status: MemberStatus.Pending },
      }),
      this.prisma.shareLink.count({
        where: { workspaceId, status: ShareLinkStatus.Active },
      }),
      this.prisma.file.aggregate({
        where: { workspaceId, status: "uploaded" },
        _sum: { size: true },
      }),
      this.prisma.workspace.count({ where: { ownerId: workspace.ownerId } }),
    ]);

    const { plan, status } = effectivePlan(workspace.plan, subscription);
    const limits = getPlanLimits(plan);

    return {
      workspaceId,
      plan,
      status,
      limits,
      featureAccess: getFeatureAccess(plan),
      usage: {
        membersCount,
        pendingInvitesCount,
        activeLinksCount,
        storageBytesUsed: storageAgg._sum.size ?? 0,
        workspacesOwned,
      },
      currentPeriodEnd: subscription?.currentPeriodEnd ?? null,
      trialEndsAt: subscription?.trialEndsAt ?? null,
    };
  }
}
