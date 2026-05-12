import type {
  PrismaClient,
  Subscription,
  WorkspacePlan,
} from "@/generated/prisma/client";
import type {
  IBillingRepository,
  SubscriptionUpsertInput,
} from "./billing.interface";

export class BillingRepository implements IBillingRepository {
  constructor(private prisma: PrismaClient) {}

  async upsert(
    userId: string,
    data: SubscriptionUpsertInput,
  ): Promise<Subscription> {
    return this.prisma.subscription.upsert({
      where: { userId },
      create: {
        userId,
        polarCustomerId: data.polarCustomerId,
        polarSubscriptionId: data.polarSubscriptionId,
        status: data.status,
        plan: data.plan,
        currentPeriodStart: data.currentPeriodStart ?? null,
        currentPeriodEnd: data.currentPeriodEnd ?? null,
        trialEndsAt: data.trialEndsAt ?? null,
      },
      update: {
        polarCustomerId: data.polarCustomerId,
        polarSubscriptionId: data.polarSubscriptionId,
        status: data.status,
        plan: data.plan,
        currentPeriodStart: data.currentPeriodStart ?? null,
        currentPeriodEnd: data.currentPeriodEnd ?? null,
        trialEndsAt: data.trialEndsAt ?? null,
      },
    });
  }

  async findByUserId(userId: string): Promise<Subscription | null> {
    return this.prisma.subscription.findUnique({ where: { userId } });
  }

  async findByPolarSubscriptionId(
    polarSubscriptionId: string,
  ): Promise<Subscription | null> {
    return this.prisma.subscription.findFirst({
      where: { polarSubscriptionId },
    });
  }

  async updateUserPlan(userId: string, plan: WorkspacePlan): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { plan },
    });
  }

  async syncWorkspacePlans(
    userId: string,
    plan: WorkspacePlan,
  ): Promise<void> {
    await this.prisma.workspace.updateMany({
      where: { ownerId: userId },
      data: { plan },
    });
  }
}
