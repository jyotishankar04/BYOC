import { describe, it, expect, vi, beforeEach } from "vitest";
import { HealthService } from "./health.service";

vi.mock("@/config/db.config", () => ({
  default: {
    $queryRaw: vi.fn(),
  },
}));

vi.mock("@/config/redis.config", () => ({
  default: {
    ping: vi.fn(),
  },
}));

describe("HealthService", () => {
  let service: HealthService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new HealthService();
  });

  it("check() returns uptime and timestamp", () => {
    const result = service.check();
    expect(result.success).toBe(true);
    expect(typeof result.uptime).toBe("number");
    expect(result.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it("ready() returns success=true when DB and Redis are healthy", async () => {
    const { default: prisma } = await import("@/config/db.config");
    const { default: redis } = await import("@/config/redis.config");
    vi.mocked(prisma.$queryRaw).mockResolvedValue([]);
    vi.mocked(redis.ping).mockResolvedValue("PONG");

    const result = await service.ready();
    expect(result.success).toBe(true);
    expect(result.checks.database).toBe(true);
    expect(result.checks.redis).toBe(true);
  });

  it("ready() returns success=false when DB is down", async () => {
    const { default: prisma } = await import("@/config/db.config");
    const { default: redis } = await import("@/config/redis.config");
    vi.mocked(prisma.$queryRaw).mockRejectedValue(new Error("Connection refused"));
    vi.mocked(redis.ping).mockResolvedValue("PONG");

    const result = await service.ready();
    expect(result.success).toBe(false);
    expect(result.checks.database).toBe(false);
    expect(result.checks.redis).toBe(true);
  });

  it("ready() returns success=false when Redis is down", async () => {
    const { default: prisma } = await import("@/config/db.config");
    const { default: redis } = await import("@/config/redis.config");
    vi.mocked(prisma.$queryRaw).mockResolvedValue([]);
    vi.mocked(redis.ping).mockRejectedValue(new Error("ECONNREFUSED"));

    const result = await service.ready();
    expect(result.success).toBe(false);
    expect(result.checks.database).toBe(true);
    expect(result.checks.redis).toBe(false);
  });
});
