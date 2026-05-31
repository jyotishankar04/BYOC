"use client";

import { useMemo } from "react";
import { getPlanLimits } from "./billing-constraints";
import { useUserProfile, type UserSubscriptionSnapshot, type WorkspacePlan } from "./user-settings";
import { useWorkspace } from "./workspace-context";
import { useAppConfig } from "./admin";

export type FeatureAccessKey =
  | "passwordProtectedLinks"
  | "customDomains"
  | "advancedAnalytics"
  | "apiAccess"
  | "teamManagement"
  | "auditLogs"
  | "integrations";

export function remainingQuota(limit: number | null, used: number): number | null {
  if (limit === null) return null;
  return Math.max(limit - used, 0);
}

export function reachedLimit(limit: number | null, used: number): boolean {
  if (limit === null) return false;
  return used >= limit;
}

export function canAccessFeature(
  snapshot: UserSubscriptionSnapshot | undefined,
  feature: FeatureAccessKey,
): boolean {
  return Boolean(snapshot?.featureAccess?.[feature]);
}

export function canUseProvider(
  snapshot: UserSubscriptionSnapshot | undefined,
  providerType: string,
): boolean {
  return Boolean(snapshot?.limits.allowedProviders.includes(providerType));
}

export function useSubscriptionSnapshot() {
  const { data: user, isLoading, isFetching } = useUserProfile();
  const { currentWorkspace } = useWorkspace();
  const { data: appConfig } = useAppConfig();
  const betaMode = appConfig?.betaMode ?? true;

  const workspaceUsage = useMemo(() => {
    if (!currentWorkspace || !user?.subscription?.workspaces) return null;
    return (
      user.subscription.workspaces.find(
        (workspace) => workspace.workspaceId === currentWorkspace.id,
      ) ?? null
    );
  }, [currentWorkspace, user]);

  const workspacePlan = workspaceUsage?.plan ?? currentWorkspace?.plan ?? user?.subscription?.plan;

  // Always derive limits and feature access from the betaMode-aware plan so that
  // every consumer — regardless of whether it reads `subscription.featureAccess`,
  // `subscription.limits`, or the dedicated `workspaceFeatureAccess` fields —
  // sees a single consistent view.
  const workspaceLimits = useMemo(
    () => (workspacePlan ? getPlanLimits(workspacePlan, betaMode) : user?.subscription?.limits ?? null),
    [user, workspacePlan, betaMode],
  );

  const workspaceFeatureAccess = useMemo(() => {
    if (!workspaceLimits) return null;
    return {
      passwordProtectedLinks: workspaceLimits.passwordProtectedLinks,
      customDomains: workspaceLimits.customDomains,
      advancedAnalytics: workspaceLimits.advancedAnalytics,
      apiAccess: workspaceLimits.apiAccess,
      teamManagement: workspaceLimits.teamManagement,
      auditLogs: workspaceLimits.auditLogs,
      integrations: workspaceLimits.integrations,
    };
  }, [workspaceLimits]);

  const workspaceRemaining = useMemo(() => {
    if (!workspaceUsage || !workspaceLimits) return null;
    return {
      teamMembers: remainingQuota(
        workspaceLimits.maxTeamMembers,
        workspaceUsage.membersCount + workspaceUsage.pendingInvitesCount,
      ),
      activeShareLinks: remainingQuota(
        workspaceLimits.maxActiveShareLinks,
        workspaceUsage.activeLinksCount,
      ),
      storageBytes: remainingQuota(
        workspaceLimits.maxStorageBytes,
        workspaceUsage.storageBytesUsed ?? 0,
      ),
    };
  }, [workspaceLimits, workspaceUsage]);

  // canCreateWorkspace derives from the betaMode-aware limit so that
  // beta users (Team plan → unlimited workspaces) are never blocked.
  const canCreateWorkspace = useMemo(() => {
    if (!workspaceLimits) return Boolean(user?.subscription?.checks.canCreateWorkspace);
    if (workspaceLimits.maxWorkspaces === null) return true;
    return (user?.subscription?.usage.workspacesOwned ?? 0) < workspaceLimits.maxWorkspaces;
  }, [user, workspaceLimits]);

  const checks = useMemo(() => ({
    canCreateWorkspace,
    canInviteMembers: Boolean(
      workspaceUsage && workspaceLimits
        ? !reachedLimit(
            workspaceLimits.maxTeamMembers,
            workspaceUsage.membersCount + workspaceUsage.pendingInvitesCount,
          )
        : false,
    ),
    canCreateShareLinks: Boolean(
      workspaceUsage && workspaceLimits
        ? !reachedLimit(
            workspaceLimits.maxActiveShareLinks,
            workspaceUsage.activeLinksCount,
          )
        : false,
    ),
    storageExceeded: Boolean(
      workspaceUsage && workspaceLimits
        ? reachedLimit(
            workspaceLimits.maxStorageBytes,
            workspaceUsage.storageBytesUsed ?? 0,
          )
        : false,
    ),
  }), [canCreateWorkspace, workspaceLimits, workspaceUsage]);

  // Merge computed limits/featureAccess back into the subscription object so
  // all `subscription?.featureAccess.X` and `subscription?.limits.X` reads
  // are automatically betaMode-aware without touching individual consumers.
  const subscription = useMemo(() => {
    if (!user?.subscription) return user?.subscription;
    return {
      ...user.subscription,
      limits: workspaceLimits ?? user.subscription.limits,
      featureAccess: workspaceFeatureAccess ?? user.subscription.featureAccess,
      checks: { ...user.subscription.checks, canCreateWorkspace },
    };
  }, [user, workspaceLimits, workspaceFeatureAccess, canCreateWorkspace]);

  return {
    subscription,
    workspacePlan,
    workspaceLimits,
    workspaceFeatureAccess,
    workspaceUsage,
    workspaceRemaining,
    checks,
    loading: isLoading || isFetching,
  };
}

export function planDisplayName(plan: WorkspacePlan | undefined) {
  return plan ?? "Free";
}

export function featureUpgradeMessage(feature: FeatureAccessKey): string {
  switch (feature) {
    case "advancedAnalytics":
      return "Upgrade to Pro to unlock advanced analytics";
    case "passwordProtectedLinks":
      return "Upgrade to Pro to create password-protected links";
    case "teamManagement":
      return "Team plan required";
    case "auditLogs":
      return "Team plan required to enable audit logs";
    case "integrations":
      return "Available on the Team plan";
    case "customDomains":
      return "Custom domains are available on the Team plan";
    case "apiAccess":
      return "API access is not available on your current plan";
    default:
      return "Upgrade your plan to unlock this feature";
  }
}
