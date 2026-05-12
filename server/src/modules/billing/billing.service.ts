import { Polar } from "@polar-sh/sdk";
import type {
  PrismaClient,
  Subscription,
} from "@/generated/prisma/client";
import prisma from "@/config/db.config";
import env from "@/config/env";
import logger from "@/core/logger";
import {
  AppError,
  NotFoundError,
  ValidationError,
} from "@/core/errors";
import {
  BillingRepository,
} from "./billing.repository";
import type {
  BillingPlan,
  CheckoutSessionInput,
  CheckoutSessionResult,
  CustomerPortalResult,
  IBillingRepository,
  IBillingService,
} from "./billing.interface";

const plans: BillingPlan[] = [
  {
    id: "pro-monthly",
    productId: env.POLAR_PRO_PRODUCT_ID,
    name: "Pro",
    tier: "Pro",
    interval: "month",
    amount: 8,
    currency: "USD",
    description: "Pro plan, billed monthly",
  },
  {
    id: "pro-6month",
    productId: env.POLAR_PRO_6M_PRODUCT_ID,
    name: "Pro 6 Month",
    tier: "Pro",
    interval: "6month",
    amount: 40,
    currency: "USD",
    description: "Pro plan, billed every 6 months",
  },
  {
    id: "team-monthly",
    productId: env.POLAR_TEAM_PRODUCT_ID,
    name: "Team",
    tier: "Team",
    interval: "month",
    amount: 24,
    currency: "USD",
    description: "Team plan, billed monthly",
  },
  {
    id: "team-6month",
    productId: env.POLAR_TEAM_6M_PRODUCT_ID,
    name: "Team 6 Month",
    tier: "Team",
    interval: "6month",
    amount: 120,
    currency: "USD",
    description: "Team plan, billed every 6 months",
  },
];

export class BillingService implements IBillingService {
  private polar: Polar;

  constructor(
    private prisma: PrismaClient,
    private repo: IBillingRepository,
  ) {
    if (!env.POLAR_ACCESS_TOKEN) {
      logger.warn("POLAR_ACCESS_TOKEN is not set — billing service will fail at runtime");
    }
    this.polar = new Polar({
      accessToken: env.POLAR_ACCESS_TOKEN,
      server: env.POLAR_SERVER,
    });
  }

  listPlans(): BillingPlan[] {
    return plans.filter((plan) => plan.productId && plan.productId.length > 0);
  }

  async getUserSubscription(userId: string): Promise<Subscription | null> {
    return this.repo.findByUserId(userId);
  }

  async createCheckoutSession(
    input: CheckoutSessionInput,
  ): Promise<CheckoutSessionResult> {
    const plan = plans.find((p) => p.productId === input.productId);
    if (!plan) {
      throw new ValidationError("Unknown product");
    }

    const checkout = await this.polar.checkouts.create({
      products: [input.productId],
      successUrl: env.POLAR_SUCCESS_URL,
      customerEmail: input.userEmail,
      customerName: input.userName,
      externalCustomerId: input.userId,
      metadata: {
        userId: input.userId,
        plan: plan.tier,
      },
    });

    return { url: checkout.url, checkoutId: checkout.id };
  }

  async getCustomerPortalUrl(userId: string): Promise<CustomerPortalResult> {
    const subscription = await this.repo.findByUserId(userId);
    if (!subscription?.polarCustomerId) {
      throw new NotFoundError("Polar customer");
    }

    const session = await this.polar.customerSessions.create({
      customerId: subscription.polarCustomerId,
    });

    return { url: session.customerPortalUrl };
  }

  async cancelSubscription(
    userId: string,
    revokeImmediately = false,
  ): Promise<Subscription> {
    const subscription = await this.repo.findByUserId(userId);
    if (!subscription?.polarSubscriptionId) {
      throw new NotFoundError("Active subscription");
    }

    try {
      if (revokeImmediately) {
        await this.polar.subscriptions.revoke({
          id: subscription.polarSubscriptionId,
        });
      } else {
        await this.polar.subscriptions.update({
          id: subscription.polarSubscriptionId,
          subscriptionUpdate: { cancelAtPeriodEnd: true },
        });
      }
    } catch (err) {
      logger.error({ err, userId }, "Polar cancel failed");
      throw new AppError("Failed to cancel subscription with Polar", 502);
    }

    return subscription;
  }
}

export const billingRepository = new BillingRepository(prisma);
export const billingService = new BillingService(prisma, billingRepository);
