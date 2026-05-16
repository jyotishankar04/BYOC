import { describe, it, expect, vi, beforeEach } from "vitest";
import { WorkspacePlan, MemberStatus, ShareLinkStatus } from "@/generated/prisma/client";
import { SubscriptionSnapshotService } from "./subscription-snapshot.service";

// Keep betaMode off so plan limits are plan-specific
vi.mock("@/config/app-settings", () => ({
  appSettings: {
    getBetaModeSync: vi.fn().mockReturnValue(false),
  },
}));

// Make cache.wrap always call fn (no actual caching in unit tests)
vi.mock("@/shared/cache/cache.service", () => ({
  cache: {
    wrap: vi.fn().mockImplementation((_key: string, _ttl: number, fn: () => unknown) => fn()),
    del: vi.fn().mockResolvedValue(undefined),
  },
}));

function makePrisma(overrides: Record<string, unknown> = {}) {
  return {
    workspace: { findUnique: vi.fn(), count: vi.fn() },
    subscription: { findUnique: vi.fn() },
    workspaceMember: { count: vi.fn(), findMany: vi.fn() },
    shareLink: { count: vi.fn() },
    file: { aggregate: vi.fn().mockResolvedValue({ _sum: { size: 0 } }) },
    storageProvider: { findUnique: vi.fn() },
    user: { findUnique: vi.fn() },
    ...overrides,
  };
}

describe("SubscriptionSnapshotService.getWorkspaceSnapshot", () => {
  let prisma: ReturnType<typeof makePrisma>;

  beforeEach(() => {
    prisma = makePrisma();
  });

  it("returns Free defaults when workspace does not exist", async () => {
    prisma.workspace.findUnique.mockResolvedValue(null);
    const svc = new SubscriptionSnapshotService(prisma as never);
    const snap = await svc.getWorkspaceSnapshot("nonexistent-id");

    expect(snap.plan).toBe(WorkspacePlan.Free);
    expect(snap.status).toBeNull();
    expect(snap.usage.membersCount).toBe(0);
    expect(snap.usage.storageBytesUsed).toBe(0);
  });

  it("returns Pro plan when subscription is Active on Pro", async () => {
    prisma.workspace.findUnique.mockResolvedValue({
      id: "ws-1", ownerId: "user-1", plan: WorkspacePlan.Free,
    });
    prisma.subscription.findUnique.mockResolvedValue({
      status: "Active",
      plan: WorkspacePlan.Pro,
      currentPeriodEnd: new Date("2026-12-31"),
      trialEndsAt: null,
    });
    prisma.workspaceMember.count
      .mockResolvedValueOnce(3)  // active members
      .mockResolvedValueOnce(1); // pending invites
    prisma.shareLink.count.mockResolvedValue(2);
    prisma.file.aggregate.mockResolvedValue({ _sum: { size: 1024 * 1024 } });
    prisma.workspace.count.mockResolvedValue(1);

    const svc = new SubscriptionSnapshotService(prisma as never);
    const snap = await svc.getWorkspaceSnapshot("ws-1");

    expect(snap.plan).toBe(WorkspacePlan.Pro);
    expect(snap.status).toBe("Active");
    expect(snap.usage.membersCount).toBe(3);
    expect(snap.usage.pendingInvitesCount).toBe(1);
    expect(snap.usage.activeLinksCount).toBe(2);
    expect(snap.usage.storageBytesUsed).toBe(1024 * 1024);
    expect(snap.featureAccess.passwordProtectedLinks).toBe(true);
    expect(snap.limits.maxActiveShareLinks).toBeNull();
  });

  it("downgrades to Free when subscription is Canceled", async () => {
    prisma.workspace.findUnique.mockResolvedValue({
      id: "ws-1", ownerId: "user-1", plan: WorkspacePlan.Pro,
    });
    prisma.subscription.findUnique.mockResolvedValue({
      status: "Canceled",
      plan: WorkspacePlan.Pro,
      currentPeriodEnd: new Date("2025-01-01"),
      trialEndsAt: null,
    });
    prisma.workspaceMember.count.mockResolvedValue(1);
    prisma.shareLink.count.mockResolvedValue(0);
    prisma.file.aggregate.mockResolvedValue({ _sum: { size: 0 } });
    prisma.workspace.count.mockResolvedValue(1);

    const svc = new SubscriptionSnapshotService(prisma as never);
    const snap = await svc.getWorkspaceSnapshot("ws-1");

    expect(snap.plan).toBe(WorkspacePlan.Free);
    expect(snap.status).toBe("Canceled");
    expect(snap.featureAccess.passwordProtectedLinks).toBe(false);
    expect(snap.limits.maxActiveShareLinks).toBe(5);
  });

  it("keeps plan active when subscription is Trialing", async () => {
    prisma.workspace.findUnique.mockResolvedValue({
      id: "ws-1", ownerId: "user-1", plan: WorkspacePlan.Free,
    });
    prisma.subscription.findUnique.mockResolvedValue({
      status: "Trialing",
      plan: WorkspacePlan.Team,
      currentPeriodEnd: null,
      trialEndsAt: new Date("2026-06-01"),
    });
    prisma.workspaceMember.count.mockResolvedValue(5);
    prisma.shareLink.count.mockResolvedValue(10);
    prisma.file.aggregate.mockResolvedValue({ _sum: { size: 0 } });
    prisma.workspace.count.mockResolvedValue(1);

    const svc = new SubscriptionSnapshotService(prisma as never);
    const snap = await svc.getWorkspaceSnapshot("ws-1");

    expect(snap.plan).toBe(WorkspacePlan.Team);
    expect(snap.status).toBe("Trialing");
    expect(snap.featureAccess.teamManagement).toBe(true);
    expect(snap.limits.maxWorkspaces).toBeNull();
    expect(snap.trialEndsAt).toEqual(new Date("2026-06-01"));
  });

  it("falls back to workspace.plan when no subscription exists", async () => {
    prisma.workspace.findUnique.mockResolvedValue({
      id: "ws-1", ownerId: "user-1", plan: WorkspacePlan.Pro,
    });
    prisma.subscription.findUnique.mockResolvedValue(null);
    prisma.workspaceMember.count.mockResolvedValue(0);
    prisma.shareLink.count.mockResolvedValue(0);
    prisma.file.aggregate.mockResolvedValue({ _sum: { size: 0 } });
    prisma.workspace.count.mockResolvedValue(1);

    const svc = new SubscriptionSnapshotService(prisma as never);
    const snap = await svc.getWorkspaceSnapshot("ws-1");

    // No subscription → effectivePlan uses workspace.plan directly
    expect(snap.plan).toBe(WorkspacePlan.Pro);
    expect(snap.status).toBeNull();
  });

  it("workspacesOwned reflects count of owned workspaces", async () => {
    prisma.workspace.findUnique.mockResolvedValue({
      id: "ws-1", ownerId: "user-1", plan: WorkspacePlan.Pro,
    });
    prisma.subscription.findUnique.mockResolvedValue({
      status: "Active", plan: WorkspacePlan.Pro,
      currentPeriodEnd: null, trialEndsAt: null,
    });
    prisma.workspaceMember.count.mockResolvedValue(2);
    prisma.shareLink.count.mockResolvedValue(0);
    prisma.file.aggregate.mockResolvedValue({ _sum: { size: 0 } });
    prisma.workspace.count.mockResolvedValue(3);

    const svc = new SubscriptionSnapshotService(prisma as never);
    const snap = await svc.getWorkspaceSnapshot("ws-1");

    expect(snap.usage.workspacesOwned).toBe(3);
  });
});
