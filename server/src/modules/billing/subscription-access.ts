import { WorkspacePlan } from "@/generated/prisma/client";
import { AppError } from "@/core/errors";
import { appSettings } from "@/config/app-settings";

export type FeatureKey =
  | "passwordProtectedLinks"
  | "customDomains"
  | "advancedAnalytics"
  | "apiAccess"
  | "teamManagement"
  | "auditLogs"
  | "integrations";

export interface PlanLimits {
  /** null means unlimited */
  maxWorkspaces: number | null;
  maxTeamMembers: number | null;
  maxActiveShareLinks: number | null;
  maxUploadFileSize: number | null;
  activityLogRetentionDays: number;
  allowedProviders: string[];
  passwordProtectedLinks: boolean;
  customDomains: boolean;
  advancedAnalytics: boolean;
  apiAccess: boolean;
  teamManagement: boolean;
  auditLogs: boolean;
  integrations: boolean;
}

export type PlanFeatureAccess = Pick<PlanLimits, FeatureKey>;

const ALL_PROVIDERS = ["S3", "R2", "GCS", "Azure", "MinIO", "Supabase", "Other"];

export const PLAN_LIMITS: Record<WorkspacePlan, PlanLimits> = {
  [WorkspacePlan.Free]: {
    maxWorkspaces: 1,
    maxTeamMembers: 3,
    maxActiveShareLinks: 5,
    maxUploadFileSize: null,
    activityLogRetentionDays: 7,
    allowedProviders: ["S3", "R2"],
    passwordProtectedLinks: false,
    customDomains: false,
    advancedAnalytics: false,
    apiAccess: false,
    teamManagement: false,
    auditLogs: false,
    integrations: false,
  },
  [WorkspacePlan.Pro]: {
    maxWorkspaces: 3,
    maxTeamMembers: 20,
    maxActiveShareLinks: null,
    maxUploadFileSize: null,
    activityLogRetentionDays: 30,
    allowedProviders: ALL_PROVIDERS,
    passwordProtectedLinks: true,
    customDomains: false,
    advancedAnalytics: true,
    apiAccess: false,
    teamManagement: false,
    auditLogs: false,
    integrations: false,
  },
  [WorkspacePlan.Team]: {
    maxWorkspaces: null,
    maxTeamMembers: null,
    maxActiveShareLinks: null,
    maxUploadFileSize: null,
    activityLogRetentionDays: 90,
    allowedProviders: ALL_PROVIDERS,
    passwordProtectedLinks: true,
    customDomains: true,
    advancedAnalytics: true,
    apiAccess: false,
    teamManagement: true,
    auditLogs: true,
    integrations: true,
  },
};

export function getPlanLimits(plan: WorkspacePlan): PlanLimits {
  return PLAN_LIMITS[appSettings.getBetaModeSync() ? WorkspacePlan.Pro : plan];
}

export function getFeatureAccess(plan: WorkspacePlan): PlanFeatureAccess {
  const limits = PLAN_LIMITS[appSettings.getBetaModeSync() ? WorkspacePlan.Pro : plan];
  return {
    passwordProtectedLinks: limits.passwordProtectedLinks,
    customDomains: limits.customDomains,
    advancedAnalytics: limits.advancedAnalytics,
    apiAccess: limits.apiAccess,
    teamManagement: limits.teamManagement,
    auditLogs: limits.auditLogs,
    integrations: limits.integrations,
  };
}

export interface QuotaSummary {
  limit: number | null;
  used: number;
  remaining: number | null;
  exceeded: boolean;
  unlimited: boolean;
}

export function buildQuotaSummary(
  limit: number | null,
  used: number,
): QuotaSummary {
  const unlimited = limit === null;
  return {
    limit,
    used,
    remaining: unlimited ? null : Math.max(0, (limit ?? 0) - used),
    exceeded: unlimited ? false : used >= (limit ?? 0),
    unlimited,
  };
}

export function assertQuotaAvailable(
  summary: QuotaSummary,
  message: string,
  code: string,
): void {
  if (summary.exceeded) {
    throw new AppError(message, 402, code);
  }
}

export function assertFeatureAccess(
  plan: WorkspacePlan,
  feature: FeatureKey,
  message: string,
  code: string,
): void {
  if (!getPlanLimits(plan)[feature]) {
    throw new AppError(message, 402, code);
  }
}

export function assertProviderAccess(
  plan: WorkspacePlan,
  providerType: string,
): void {
  const providerState = appSettings.getConfig().providers[providerType as import("@/config/app-settings").ProviderKey];
  if (providerState === "hidden") {
    throw new AppError(
      `${providerType} storage is not available on this platform`,
      403,
      "PROVIDER_DISABLED",
    );
  }
  if (!getPlanLimits(plan).allowedProviders.includes(providerType)) {
    throw new AppError(
      `${providerType} storage is not available on the ${plan} plan`,
      402,
      "PROVIDER_NOT_ALLOWED",
    );
  }
}
