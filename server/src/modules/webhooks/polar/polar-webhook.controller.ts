import type { SubscriptionStatus } from "@/generated/prisma/client";
import type { Subscription } from "@polar-sh/sdk/models/components/subscription.js";
import { validateEvent } from "@polar-sh/sdk/webhooks";
import { BillingRepository } from "@/modules/billing/billing.repository";
import prisma from "@/config/db.config";
import env from "@/config/env";
import logger from "@/core/logger";
import { EmailQueueService } from "@/core/mail/mail.queue";
import { cache } from "@/shared/cache/cache.service";

const repo = new BillingRepository(prisma);

const PRODUCT_ID_TO_PLAN: Record<string, "Pro" | "Team"> = {};
if (env.POLAR_PRO_PRODUCT_ID) PRODUCT_ID_TO_PLAN[env.POLAR_PRO_PRODUCT_ID] = "Pro";
if (env.POLAR_TEAM_PRODUCT_ID) PRODUCT_ID_TO_PLAN[env.POLAR_TEAM_PRODUCT_ID] = "Team";
if (env.POLAR_PRO_6M_PRODUCT_ID) PRODUCT_ID_TO_PLAN[env.POLAR_PRO_6M_PRODUCT_ID] = "Pro";
if (env.POLAR_TEAM_6M_PRODUCT_ID) PRODUCT_ID_TO_PLAN[env.POLAR_TEAM_6M_PRODUCT_ID] = "Team";

function mapPolarStatus(polarStatus: string): SubscriptionStatus {
  switch (polarStatus) {
    case "active": return "Active";
    case "canceled": return "Canceled";
    case "past_due": return "PastDue";
    case "incomplete": return "Incomplete";
    case "incomplete_expired": return "Expired";
    case "trialing": return "Trialing";
    case "unpaid": return "PastDue";
    default: return "Incomplete";
  }
}

function resolvePlan(data: Subscription): "Pro" | "Team" | null {
  const fromProduct = PRODUCT_ID_TO_PLAN[data.productId];
  if (fromProduct) return fromProduct;

  const fromMetadata = data.metadata?.plan;
  if (fromMetadata === "Pro" || fromMetadata === "Team") return fromMetadata;

  const productName = data.product?.name;
  if (productName?.toLowerCase().includes("pro")) return "Pro";
  if (productName?.toLowerCase().includes("team")) return "Team";

  return null;
}

function resolveUserId(data: Subscription): string | null {
  const fromMetadata = data.metadata?.userId;
  if (fromMetadata && typeof fromMetadata === "string") return fromMetadata;
  return null;
}

export async function handleSubscriptionActive(payload: { data: Subscription }): Promise<void> {
  const { data } = payload;
  await upsertSubscription(data, "Active");

  const userId = resolveUserId(data);
  const plan = resolvePlan(data);
  if (userId && plan) {
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { email: true, name: true } });
    if (user) {
      EmailQueueService.enqueue({
        type: "subscription_activated",
        to: user.email,
        name: user.name,
        plan,
        dashboardUrl: `${env.FRONTEND_URL}/app/billing`,
      });
    }
  }
}

export async function handleSubscriptionCreated(payload: { data: Subscription }): Promise<void> {
  const { data } = payload;
  const mapped = mapPolarStatus(data.status);
  await upsertSubscription(data, mapped);

  if (data.trialEnd) {
    const userId = resolveUserId(data);
    const plan = resolvePlan(data);
    if (userId && plan) {
      const user = await prisma.user.findUnique({ where: { id: userId }, select: { email: true, name: true } });
      if (user) {
        EmailQueueService.enqueue({
          type: "subscription_trial_started",
          to: user.email,
          name: user.name,
          plan,
          trialEnd: new Date(data.trialEnd).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
          dashboardUrl: `${env.FRONTEND_URL}/app/billing`,
        });
      }
    }
  }
}

export async function handleSubscriptionUpdated(payload: { data: Subscription }): Promise<void> {
  const { data } = payload;
  const mapped = mapPolarStatus(data.status);
  await upsertSubscription(data, mapped);
}

export async function handleSubscriptionCanceled(payload: { data: Subscription }): Promise<void> {
  const { data } = payload;
  const mapped = mapPolarStatus(data.status);
  await upsertSubscription(data, mapped);

  const userId = resolveUserId(data);
  const plan = resolvePlan(data);
  if (userId && plan) {
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { email: true, name: true } });
    if (user) {
      const periodEnd = data.currentPeriodEnd
        ? new Date(data.currentPeriodEnd).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
        : "the end of your billing period";
      EmailQueueService.enqueue({
        type: "subscription_canceled",
        to: user.email,
        name: user.name,
        plan,
        periodEnd,
      });
    }
  }
}

export async function handleSubscriptionPastDue(payload: { data: Subscription }): Promise<void> {
  const { data } = payload;
  await upsertSubscription(data, "PastDue");

  const userId = resolveUserId(data);
  if (userId) {
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { email: true, name: true } });
    if (user) {
      EmailQueueService.enqueue({
        type: "subscription_past_due",
        to: user.email,
        name: user.name,
        billingUrl: `${env.FRONTEND_URL}/app/billing`,
      });
    }
  }
}

export async function handlePolarWebhookPayload(
  payload: ReturnType<typeof validateEvent>,
): Promise<void> {
  if (payload.type !== "subscription.past_due") {
    return;
  }

  await handleSubscriptionPastDue({ data: payload.data });
}

export async function handleSubscriptionRevoked(payload: { data: Subscription }): Promise<void> {
  const { data } = payload;
  const userId = resolveUserId(data);
  if (!userId) {
    logger.warn({ polarSubscriptionId: data.id }, "Polar webhook: revoked — no userId in metadata, skipping");
    return;
  }

  await repo.upsert(userId, {
    polarCustomerId: data.customerId,
    polarSubscriptionId: data.id,
    status: "Expired",
    plan: "Free",
    currentPeriodEnd: data.endedAt ?? data.currentPeriodEnd,
  });
  await repo.updateUserPlan(userId, "Free");
  await repo.syncWorkspacePlans(userId, "Free");
  await cache.delPattern("billing:snapshot:*");
  await cache.del(`user:profile:${userId}`);

  const user = await prisma.user.findUnique({ where: { id: userId }, select: { email: true, name: true } });
  if (user) {
    const plan = resolvePlan(data) ?? "Pro";
    EmailQueueService.enqueue({
      type: "subscription_canceled",
      to: user.email,
      name: user.name,
      plan,
      periodEnd: "now",
    });
  }

  logger.info({ userId, polarSubscriptionId: data.id }, "Polar webhook: subscription revoked, reverted to Free");
}

export async function handleSubscriptionUncanceled(payload: { data: Subscription }): Promise<void> {
  const { data } = payload;
  await upsertSubscription(data, "Active");
}

async function upsertSubscription(data: Subscription, status: SubscriptionStatus): Promise<void> {
  const userId = resolveUserId(data);
  if (!userId) {
    logger.warn({ polarSubscriptionId: data.id }, "Polar webhook: no userId in metadata, skipping");
    return;
  }

  const plan = resolvePlan(data);
  if (!plan) {
    logger.warn({ polarSubscriptionId: data.id, productId: data.productId }, "Polar webhook: unknown plan, skipping");
    return;
  }

  await repo.upsert(userId, {
    polarCustomerId: data.customerId,
    polarSubscriptionId: data.id,
    status,
    plan,
    currentPeriodStart: data.currentPeriodStart,
    currentPeriodEnd: data.currentPeriodEnd,
    trialEndsAt: data.trialEnd,
  });

  await repo.updateUserPlan(userId, plan);
  await repo.syncWorkspacePlans(userId, plan);
  await cache.delPattern("billing:snapshot:*");
  await cache.del(`user:profile:${userId}`);
  logger.info({ userId, polarSubscriptionId: data.id, status, plan }, "Polar webhook: subscription upserted");
}
