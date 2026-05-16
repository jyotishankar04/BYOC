import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import app from "@/app";

// Disable rate limiters so individual tests don't hit the 5/15min cap
vi.mock("@/config/rate-limiters", () => ({
  authLimiter: (_req: unknown, _res: unknown, next: () => void) => next(),
  shareLinkPasswordLimiter: (_req: unknown, _res: unknown, next: () => void) => next(),
  uploadLimiter: (_req: unknown, _res: unknown, next: () => void) => next(),
}));

// Override prisma mock with share-link repository methods
vi.mock("@/config/db.config", () => ({
  default: {
    $connect: vi.fn(),
    $disconnect: vi.fn(),
    $queryRaw: vi.fn().mockResolvedValue([]),
    shareLink: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
      create: vi.fn(),
      count: vi.fn(),
    },
    file: {
      findFirst: vi.fn(),
      findUnique: vi.fn(),
    },
    folder: { findFirst: vi.fn() },
    workspace: { findUnique: vi.fn() },
    workspaceSecurity: { findUnique: vi.fn() },
    workspaceMember: { findUnique: vi.fn(), count: vi.fn() },
    shareLinkVisit: { create: vi.fn() },
  },
}));

const makeActiveLink = (overrides = {}) => ({
  id: "link-1",
  slug: "abc123",
  status: "Active",
  accessType: "Public",
  expiresAt: null,
  passwordHash: null,
  allowDownload: false,
  workspaceId: "ws-1",
  file: null,
  folder: null,
  ...overrides,
});

describe("GET /s/:slug (public share link access)", () => {
  beforeEach(async () => {
    const { default: prisma } = await import("@/config/db.config");
    vi.mocked(prisma.shareLink.findUnique).mockReset();
    vi.mocked(prisma.shareLink.update).mockResolvedValue({} as never);
  });

  it("returns 404 when link does not exist", async () => {
    const { default: prisma } = await import("@/config/db.config");
    vi.mocked(prisma.shareLink.findUnique).mockResolvedValue(null);

    const res = await request(app).get("/s/nonexistent");
    expect(res.status).toBe(404);
  });

  it("returns 410 when link status is Disabled", async () => {
    const { default: prisma } = await import("@/config/db.config");
    vi.mocked(prisma.shareLink.findUnique).mockResolvedValue(
      makeActiveLink({ status: "Disabled" }) as never,
    );

    const res = await request(app).get("/s/abc123");
    expect(res.status).toBe(410);
  });

  it("returns 410 when link status is Expired", async () => {
    const { default: prisma } = await import("@/config/db.config");
    vi.mocked(prisma.shareLink.findUnique).mockResolvedValue(
      makeActiveLink({ status: "Expired" }) as never,
    );

    const res = await request(app).get("/s/abc123");
    expect(res.status).toBe(410);
  });

  it("returns 410 when Active link has passed its expiresAt date", async () => {
    const { default: prisma } = await import("@/config/db.config");
    vi.mocked(prisma.shareLink.findUnique).mockResolvedValue(
      makeActiveLink({ expiresAt: new Date("2020-01-01") }) as never,
    );

    const res = await request(app).get("/s/abc123");
    expect(res.status).toBe(410);
  });

  it("returns 401 PASSWORD_REQUIRED when PasswordProtected link has no password header", async () => {
    const { default: prisma } = await import("@/config/db.config");
    vi.mocked(prisma.shareLink.findUnique).mockResolvedValue(
      makeActiveLink({
        accessType: "PasswordProtected",
        passwordHash: "$2b$10$hashed",
      }) as never,
    );

    const res = await request(app).get("/s/abc123");
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe("PASSWORD_REQUIRED");
  });

  it("returns 401 INVALID_PASSWORD when wrong password is supplied", async () => {
    const { default: prisma } = await import("@/config/db.config");
    vi.mocked(prisma.shareLink.findUnique).mockResolvedValue(
      makeActiveLink({
        accessType: "PasswordProtected",
        passwordHash: "$2b$10$abcdefghijklmnopqrstuuDummyHashThatWillNotMatchWrongPass",
      }) as never,
    );

    const res = await request(app)
      .get("/s/abc123")
      .set("x-share-password", "wrong-password");

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe("INVALID_PASSWORD");
  });

  it("returns 401 AUTH_REQUIRED when Private link is accessed unauthenticated", async () => {
    const { default: prisma } = await import("@/config/db.config");
    vi.mocked(prisma.shareLink.findUnique).mockResolvedValue(
      makeActiveLink({ accessType: "Private" }) as never,
    );

    const res = await request(app).get("/s/abc123");
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe("AUTH_REQUIRED");
  });
});
