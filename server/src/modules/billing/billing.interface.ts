import type {
  Subscription,
  SubscriptionStatus,
  WorkspacePlan,
} from "@/generated/prisma/client";

export type BillingPlanTier = "Pro" | "Team";
export type BillingInterval = "month" | "6month";

export interface BillingPlan {
  id: string;
  productId: string;
  name: string;
  tier: BillingPlanTier;
  interval: BillingInterval;
  amount: number;
  currency: string;
  description: string;
}

export interface SubscriptionUpsertInput {
  polarCustomerId: string | null;
  polarSubscriptionId: string | null;
  status: SubscriptionStatus;
  plan: WorkspacePlan;
  currentPeriodStart?: Date | null;
  currentPeriodEnd?: Date | null;
  trialEndsAt?: Date | null;
}

export interface CheckoutSessionInput {
  userId: string;
  userEmail: string;
  userName: string;
  productId: string;
}

export interface CheckoutSessionResult {
  url: string;
  checkoutId: string;
}

export interface CustomerPortalResult {
  url: string;
}

export interface IBillingRepository {
  upsert(userId: string, data: SubscriptionUpsertInput): Promise<Subscription>;
  findByUserId(userId: string): Promise<Subscription | null>;
  findByPolarSubscriptionId(polarSubscriptionId: string): Promise<Subscription | null>;
  updateUserPlan(userId: string, plan: WorkspacePlan): Promise<void>;
  syncWorkspacePlans(userId: string, plan: WorkspacePlan): Promise<void>;
}

export interface IBillingService {
  listPlans(): BillingPlan[];
  getUserSubscription(userId: string): Promise<Subscription | null>;
  createCheckoutSession(input: CheckoutSessionInput): Promise<CheckoutSessionResult>;
  getCustomerPortalUrl(userId: string): Promise<CustomerPortalResult>;
  cancelSubscription(userId: string, revokeImmediately?: boolean): Promise<Subscription>;
}
