import { vi } from "vitest";

// Mock ioredis so tests don't need a real Redis instance
vi.mock("ioredis", () => {
  const RedisMock = vi.fn().mockImplementation(() => ({
    get: vi.fn().mockResolvedValue(null),
    set: vi.fn().mockResolvedValue("OK"),
    del: vi.fn().mockResolvedValue(1),
    ping: vi.fn().mockResolvedValue("PONG"),
    quit: vi.fn().mockResolvedValue("OK"),
  }));
  return { default: RedisMock };
});

// Mock prisma so unit tests don't need a real DB
vi.mock("@/config/db.config", () => ({
  default: {
    $connect: vi.fn(),
    $disconnect: vi.fn(),
    $queryRaw: vi.fn().mockResolvedValue([{ "?column?": 1 }]),
  },
}));
