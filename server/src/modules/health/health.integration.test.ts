import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import app from "@/app";

// Prisma and ioredis are mocked globally in src/test/setup.ts.
// Override $queryRaw/ping per-test for the failure scenarios.

describe("GET /health", () => {
  it("returns 200 with success, uptime, and timestamp", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(typeof res.body.uptime).toBe("number");
    expect(res.body.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });
});

describe("GET /health/ready", () => {
  it("returns 200 when DB and Redis are healthy", async () => {
    const { default: prisma } = await import("@/config/db.config");
    const { default: redis } = await import("@/config/redis.config");
    vi.mocked(prisma.$queryRaw).mockResolvedValue([]);
    vi.mocked(redis.ping).mockResolvedValue("PONG");

    const res = await request(app).get("/health/ready");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.checks.database).toBe(true);
    expect(res.body.checks.redis).toBe(true);
  });

  it("returns 503 when DB is down", async () => {
    const { default: prisma } = await import("@/config/db.config");
    const { default: redis } = await import("@/config/redis.config");
    vi.mocked(prisma.$queryRaw).mockRejectedValue(new Error("Connection refused"));
    vi.mocked(redis.ping).mockResolvedValue("PONG");

    const res = await request(app).get("/health/ready");
    expect(res.status).toBe(503);
    expect(res.body.success).toBe(false);
    expect(res.body.checks.database).toBe(false);
    expect(res.body.checks.redis).toBe(true);
  });

  it("returns 503 when Redis is down", async () => {
    const { default: prisma } = await import("@/config/db.config");
    const { default: redis } = await import("@/config/redis.config");
    vi.mocked(prisma.$queryRaw).mockResolvedValue([]);
    vi.mocked(redis.ping).mockRejectedValue(new Error("ECONNREFUSED"));

    const res = await request(app).get("/health/ready");
    expect(res.status).toBe(503);
    expect(res.body.success).toBe(false);
    expect(res.body.checks.redis).toBe(false);
  });
});
