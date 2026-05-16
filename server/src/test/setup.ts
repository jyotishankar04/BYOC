import { vi } from "vitest";

// Mock ioredis with a proper class so `new Redis()` works
vi.mock("ioredis", () => ({
  default: class Redis {
    get = vi.fn().mockResolvedValue(null);
    set = vi.fn().mockResolvedValue("OK");
    del = vi.fn().mockResolvedValue(1);
    ping = vi.fn().mockResolvedValue("PONG");
    quit = vi.fn().mockResolvedValue("OK");
    on = vi.fn().mockReturnThis();
  },
}));

// Mock redis v5 cache client (no real connection in tests)
vi.mock("@/config/cache.config", () => ({
  default: {
    get: vi.fn().mockResolvedValue(null),
    set: vi.fn().mockResolvedValue("OK"),
    del: vi.fn().mockResolvedValue(1),
    scan: vi.fn().mockResolvedValue({ cursor: "0", keys: [] }),
    connect: vi.fn().mockResolvedValue(undefined),
    quit: vi.fn().mockResolvedValue(undefined),
    on: vi.fn(),
  },
}));

// Mock prisma so unit tests don't need a real DB
vi.mock("@/config/db.config", () => ({
  default: {
    $connect: vi.fn(),
    $disconnect: vi.fn(),
    $queryRaw: vi.fn().mockResolvedValue([{ "?column?": 1 }]),
  },
}));
