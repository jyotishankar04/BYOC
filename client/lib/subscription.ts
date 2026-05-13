"use client";

import { useMemo } from "react";
import { getPlanLimits } from "./billing-constraints";
import { useUserProfile, type UserSubscriptionSnapshot, type WorkspacePlan } from "./user-settings";
import { useWorkspace } from "./workspace-context";

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

  const workspaceUsage = useMemo(() => {
    if (!currentWorkspace || !user?.subscription?.workspaces) return null;
    return (
      user.subscription.workspaces.find(
        (workspace) => workspace.workspaceId === currentWorkspace.id,
      ) ?? null
    );
  }, [currentWorkspace, user]);

  const workspacePlan = workspaceUsage?.plan ?? currentWorkspace?.plan ?? user?.subscription?.plan;
  const workspaceLimits = useMemo(
    () => (workspacePlan ? getPlanLimits(workspacePlan) : user?.subscription?.limits ?? null),
    [user, workspacePlan],
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
    };
  }, [workspaceLimits, workspaceUsage]);

  const checks = useMemo(() => {
    const snapshot = user?.subscription;

    return {
      canCreateWorkspace: Boolean(snapshot?.checks.canCreateWorkspace),
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
    };
  }, [user, workspaceLimits, workspaceUsage]);

  return {
    subscription: user?.subscription,
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
