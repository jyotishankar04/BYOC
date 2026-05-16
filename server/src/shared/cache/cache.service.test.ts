import { describe, it, expect, vi, beforeEach } from "vitest";
import type { RedisClientType } from "redis";
import { CacheService } from "./cache.service";

function makeMockClient() {
  return {
    get: vi.fn(),
    set: vi.fn().mockResolvedValue("OK"),
    del: vi.fn().mockResolvedValue(1),
    scan: vi.fn(),
    on: vi.fn(),
  } as unknown as RedisClientType;
}

describe("CacheService.get", () => {
  it("returns null on cache miss", async () => {
    const client = makeMockClient();
    vi.mocked(client.get).mockResolvedValue(null);
    const svc = new CacheService(client);
    expect(await svc.get("missing")).toBeNull();
  });

  it("deserializes JSON on cache hit", async () => {
    const client = makeMockClient();
    vi.mocked(client.get).mockResolvedValue(JSON.stringify({ id: 1, name: "test" }));
    const svc = new CacheService(client);
    expect(await svc.get("key")).toEqual({ id: 1, name: "test" });
  });

  it("returns null when client throws (disconnected)", async () => {
    const client = makeMockClient();
    vi.mocked(client.get).mockRejectedValue(new Error("ECONNREFUSED"));
    const svc = new CacheService(client);
    expect(await svc.get("key")).toBeNull();
  });
});

describe("CacheService.set", () => {
  it("serializes value and passes EX TTL to client", async () => {
    const client = makeMockClient();
    const svc = new CacheService(client);
    await svc.set("key", { x: 1 }, 300);
    expect(client.set).toHaveBeenCalledWith("key", JSON.stringify({ x: 1 }), { EX: 300 });
  });

  it("does not throw when client throws", async () => {
    const client = makeMockClient();
    vi.mocked(client.set).mockRejectedValue(new Error("ECONNREFUSED"));
    const svc = new CacheService(client);
    await expect(svc.set("key", "val", 60)).resolves.toBeUndefined();
  });
});

describe("CacheService.del", () => {
  it("calls client.del with all provided keys", async () => {
    const client = makeMockClient();
    const svc = new CacheService(client);
    await svc.del("a", "b", "c");
    expect(client.del).toHaveBeenCalledWith(["a", "b", "c"]);
  });

  it("skips client call when no keys provided", async () => {
    const client = makeMockClient();
    const svc = new CacheService(client);
    await svc.del();
    expect(client.del).not.toHaveBeenCalled();
  });
});

describe("CacheService.delPattern", () => {
  it("scans with MATCH pattern and deletes found keys", async () => {
    const client = makeMockClient();
    (client as unknown as { scan: ReturnType<typeof vi.fn> }).scan
      .mockResolvedValueOnce({ cursor: "5", keys: ["blog:list:1", "blog:list:2"] })
      .mockResolvedValueOnce({ cursor: "0", keys: ["blog:list:3"] });
    const svc = new CacheService(client);
    await svc.delPattern("blog:list:*");
    expect(client.del).toHaveBeenCalledWith(["blog:list:1", "blog:list:2", "blog:list:3"]);
  });

  it("does not call del when no keys match", async () => {
    const client = makeMockClient();
    (client as unknown as { scan: ReturnType<typeof vi.fn> }).scan
      .mockResolvedValue({ cursor: "0", keys: [] });
    const svc = new CacheService(client);
    await svc.delPattern("nonexistent:*");
    expect(client.del).not.toHaveBeenCalled();
  });
});

describe("CacheService.wrap", () => {
  it("calls fn on cache miss and stores the result", async () => {
    const client = makeMockClient();
    vi.mocked(client.get).mockResolvedValue(null);
    const svc = new CacheService(client);
    const fn = vi.fn().mockResolvedValue({ data: "fresh" });

    const result = await svc.wrap("key", 60, fn);

    expect(fn).toHaveBeenCalledOnce();
    expect(result).toEqual({ data: "fresh" });
    // set is called in a void, give it a tick
    await new Promise((r) => setTimeout(r, 0));
    expect(client.set).toHaveBeenCalledWith("key", JSON.stringify({ data: "fresh" }), { EX: 60 });
  });

  it("returns cached value without calling fn on hit", async () => {
    const client = makeMockClient();
    vi.mocked(client.get).mockResolvedValue(JSON.stringify({ data: "cached" }));
    const svc = new CacheService(client);
    const fn = vi.fn();

    const result = await svc.wrap("key", 60, fn);

    expect(fn).not.toHaveBeenCalled();
    expect(result).toEqual({ data: "cached" });
  });

  it("still calls fn and returns result when cache client is unavailable", async () => {
    const client = makeMockClient();
    vi.mocked(client.get).mockRejectedValue(new Error("ECONNREFUSED"));
    const svc = new CacheService(client);
    const fn = vi.fn().mockResolvedValue("fallback");

    const result = await svc.wrap("key", 60, fn);

    expect(fn).toHaveBeenCalledOnce();
    expect(result).toBe("fallback");
  });
});
