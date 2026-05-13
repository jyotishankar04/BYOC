export type WorkspacePlan = "Free" | "Pro" | "Team";

export interface PlanLimits {
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

export const PLAN_LIMITS: Record<WorkspacePlan, PlanLimits> = {
  Free: {
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
  Pro: {
    maxWorkspaces: 3,
    maxTeamMembers: 20,
    maxActiveShareLinks: null,
    maxUploadFileSize: null,
    activityLogRetentionDays: 30,
    allowedProviders: ["S3", "R2", "GCS", "Azure", "MinIO", "Supabase", "Other"],
    passwordProtectedLinks: true,
    customDomains: false,
    advancedAnalytics: true,
    apiAccess: false,
    teamManagement: false,
    auditLogs: false,
    integrations: false,
  },
  Team: {
    maxWorkspaces: null,
    maxTeamMembers: null,
    maxActiveShareLinks: null,
    maxUploadFileSize: null,
    activityLogRetentionDays: 90,
    allowedProviders: ["S3", "R2", "GCS", "Azure", "MinIO", "Supabase", "Other"],
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
  return PLAN_LIMITS[plan];
}

export function formatPlanLimit(plan: WorkspacePlan, key: keyof PlanLimits): string {
  const limits = PLAN_LIMITS[plan];
  const value = limits[key];
  if (value === null) return "Unlimited";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "number") {
    if (key === "maxUploadFileSize") {
      const gb = value / (1024 * 1024 * 1024);
      return gb >= 1 ? `${gb} GB` : `${value / (1024 * 1024)} MB`;
    }
    if (key === "activityLogRetentionDays") {
      return `${value} days`;
    }
    return String(value);
  }
  if (Array.isArray(value)) {
    return value.length <= 2 ? value.join(", ") : `${value.length} providers`;
  }
  return String(value);
}
