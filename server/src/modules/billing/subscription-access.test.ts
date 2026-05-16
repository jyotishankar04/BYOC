import { describe, it, expect, vi, beforeEach } from "vitest";
import { WorkspacePlan } from "@/generated/prisma/client";
import { AppError } from "@/core/errors";

// Control betaMode so plan limits are predictable
vi.mock("@/config/app-settings", () => ({
  appSettings: {
    getBetaModeSync: vi.fn().mockReturnValue(false),
    getConfig: vi.fn().mockReturnValue({
      betaMode: false,
      providers: {
        S3: "enabled", R2: "enabled", GCS: "coming_soon",
        Azure: "coming_soon", MinIO: "enabled", Supabase: "enabled", Other: "enabled",
      },
      features: { shareLinks: true, analytics: true, passwordProtectedLinks: true },
    }),
  },
}));

import {
  buildQuotaSummary,
  assertQuotaAvailable,
  assertFeatureAccess,
  assertProviderAccess,
  getPlanLimits,
  getFeatureAccess,
} from "./subscription-access";

describe("buildQuotaSummary", () => {
  it("returns unlimited=true and remaining=null when limit is null", () => {
    const result = buildQuotaSummary(null, 50);
    expect(result).toEqual({ limit: null, used: 50, remaining: null, exceeded: false, unlimited: true });
  });

  it("calculates remaining correctly when under limit", () => {
    const result = buildQuotaSummary(10, 3);
    expect(result).toEqual({ limit: 10, used: 3, remaining: 7, exceeded: false, unlimited: false });
  });

  it("marks exceeded=true when used >= limit", () => {
    expect(buildQuotaSummary(5, 5).exceeded).toBe(true);
    expect(buildQuotaSummary(5, 6).exceeded).toBe(true);
    expect(buildQuotaSummary(5, 4).exceeded).toBe(false);
  });

  it("clamps remaining at 0 when over limit", () => {
    const result = buildQuotaSummary(3, 10);
    expect(result.remaining).toBe(0);
  });
});

describe("assertQuotaAvailable", () => {
  it("throws AppError with 402 when quota is exceeded", () => {
    const summary = buildQuotaSummary(3, 3);
    expect(() => assertQuotaAvailable(summary, "Limit reached", "LIMIT")).toThrowError(AppError);
    expect(() => assertQuotaAvailable(summary, "Limit reached", "LIMIT")).toThrow("Limit reached");
  });

  it("attaches the provided code to the error", () => {
    const summary = buildQuotaSummary(1, 5);
    try {
      assertQuotaAvailable(summary, "msg", "MY_CODE");
    } catch (err) {
      expect((err as AppError).code).toBe("MY_CODE");
      expect((err as AppError).statusCode).toBe(402);
    }
  });

  it("does not throw when quota is not exceeded", () => {
    const summary = buildQuotaSummary(10, 5);
    expect(() => assertQuotaAvailable(summary, "msg", "CODE")).not.toThrow();
  });

  it("does not throw for unlimited quota", () => {
    const summary = buildQuotaSummary(null, 99999);
    expect(() => assertQuotaAvailable(summary, "msg", "CODE")).not.toThrow();
  });
});

describe("assertFeatureAccess", () => {
  it("throws when Free plan tries to use passwordProtectedLinks", () => {
    expect(() =>
      assertFeatureAccess(WorkspacePlan.Free, "passwordProtectedLinks", "Upgrade required", "LOCKED"),
    ).toThrowError(AppError);
  });

  it("does not throw when Pro plan uses passwordProtectedLinks", () => {
    expect(() =>
      assertFeatureAccess(WorkspacePlan.Pro, "passwordProtectedLinks", "Upgrade required", "LOCKED"),
    ).not.toThrow();
  });

  it("throws when Pro plan tries to use teamManagement", () => {
    expect(() =>
      assertFeatureAccess(WorkspacePlan.Pro, "teamManagement", "Need Team plan", "LOCKED"),
    ).toThrowError(AppError);
  });

  it("does not throw when Team plan uses teamManagement", () => {
    expect(() =>
      assertFeatureAccess(WorkspacePlan.Team, "teamManagement", "Need Team plan", "LOCKED"),
    ).not.toThrow();
  });

  it("throws when Free plan tries to use auditLogs", () => {
    expect(() =>
      assertFeatureAccess(WorkspacePlan.Free, "auditLogs", "Upgrade", "LOCKED"),
    ).toThrowError(AppError);
  });
});

describe("getPlanLimits", () => {
  it("Free plan: limits maxWorkspaces=1, maxTeamMembers=3, maxActiveShareLinks=5", () => {
    const limits = getPlanLimits(WorkspacePlan.Free);
    expect(limits.maxWorkspaces).toBe(1);
    expect(limits.maxTeamMembers).toBe(3);
    expect(limits.maxActiveShareLinks).toBe(5);
    expect(limits.allowedProviders).toEqual(expect.arrayContaining(["S3", "R2"]));
    expect(limits.allowedProviders).not.toContain("GCS");
  });

  it("Pro plan: maxWorkspaces=3, unlimited links, passwordProtectedLinks=true", () => {
    const limits = getPlanLimits(WorkspacePlan.Pro);
    expect(limits.maxWorkspaces).toBe(3);
    expect(limits.maxActiveShareLinks).toBeNull();
    expect(limits.passwordProtectedLinks).toBe(true);
  });

  it("Team plan: all unlimited, teamManagement=true, auditLogs=true", () => {
    const limits = getPlanLimits(WorkspacePlan.Team);
    expect(limits.maxWorkspaces).toBeNull();
    expect(limits.maxTeamMembers).toBeNull();
    expect(limits.teamManagement).toBe(true);
    expect(limits.auditLogs).toBe(true);
  });
});

describe("getFeatureAccess", () => {
  it("Free plan has no premium features", () => {
    const access = getFeatureAccess(WorkspacePlan.Free);
    expect(access.passwordProtectedLinks).toBe(false);
    expect(access.teamManagement).toBe(false);
    expect(access.auditLogs).toBe(false);
    expect(access.advancedAnalytics).toBe(false);
  });

  it("Pro plan unlocks passwordProtectedLinks and advancedAnalytics", () => {
    const access = getFeatureAccess(WorkspacePlan.Pro);
    expect(access.passwordProtectedLinks).toBe(true);
    expect(access.advancedAnalytics).toBe(true);
    expect(access.teamManagement).toBe(false);
  });

  it("Team plan unlocks teamManagement, auditLogs, and integrations", () => {
    const access = getFeatureAccess(WorkspacePlan.Team);
    expect(access.teamManagement).toBe(true);
    expect(access.auditLogs).toBe(true);
    expect(access.integrations).toBe(true);
  });
});

describe("assertProviderAccess", () => {
  it("throws PROVIDER_DISABLED when provider is hidden in app settings", async () => {
    const { appSettings } = await import("@/config/app-settings");
    vi.mocked(appSettings.getConfig).mockReturnValueOnce({
      betaMode: false,
      maintenanceMode: false,
      signupsEnabled: true,
      allowedFileTypes: [],
      providers: { S3: "hidden", R2: "enabled", GCS: "coming_soon", Azure: "coming_soon", MinIO: "enabled", Supabase: "enabled", Other: "enabled" },
      features: { shareLinks: true, analytics: true, passwordProtectedLinks: true },
    });
    expect(() => assertProviderAccess(WorkspacePlan.Pro, "S3")).toThrow("not available on this platform");
  });

  it("throws PROVIDER_NOT_ALLOWED when provider not in plan's allowedProviders", () => {
    expect(() => assertProviderAccess(WorkspacePlan.Free, "GCS")).toThrow("not available on the Free plan");
  });

  it("does not throw when provider is enabled and on the plan", () => {
    expect(() => assertProviderAccess(WorkspacePlan.Free, "S3")).not.toThrow();
    expect(() => assertProviderAccess(WorkspacePlan.Pro, "GCS")).not.toThrow();
  });
});
