import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import app from "@/app";

// Override the global prisma mock to include blog model methods
vi.mock("@/config/db.config", () => ({
  default: {
    $connect: vi.fn(),
    $disconnect: vi.fn(),
    $queryRaw: vi.fn().mockResolvedValue([]),
    blog: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      count: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

const mockAuthor = { id: "author-1", name: "Alice", avatar: null };

const mockBlog = {
  id: "blog-1",
  title: "Hello World",
  slug: "hello-world",
  excerpt: "An intro post",
  coverImage: null,
  tags: ["news", "product"],
  publishedAt: new Date("2026-01-01T00:00:00Z"),
  createdAt: new Date("2026-01-01T00:00:00Z"),
  published: true,
  content: "Full content here",
  author: mockAuthor,
};

describe("GET /api/v1/blogs (public list)", () => {
  beforeEach(async () => {
    const { default: prisma } = await import("@/config/db.config");
    vi.mocked(prisma.blog.findMany).mockResolvedValue([mockBlog] as never);
    vi.mocked(prisma.blog.count).mockResolvedValue(1);
  });

  it("returns 200 with paginated blog list", async () => {
    const res = await request(app).get("/api/v1/blogs");
    expect(res.status).toBe(200);
    expect(res.body.blogs).toHaveLength(1);
    expect(res.body.total).toBe(1);
    expect(res.body.blogs[0].slug).toBe("hello-world");
  });

  it("respects page and limit query params", async () => {
    const { default: prisma } = await import("@/config/db.config");
    vi.mocked(prisma.blog.findMany).mockResolvedValue([] as never);
    vi.mocked(prisma.blog.count).mockResolvedValue(0);

    const res = await request(app).get("/api/v1/blogs?page=2&limit=5");
    expect(res.status).toBe(200);
    expect(res.body.page).toBe(2);
    expect(res.body.limit).toBe(5);
  });

  it("filters by tag when ?tag= is provided", async () => {
    const { default: prisma } = await import("@/config/db.config");
    vi.mocked(prisma.blog.findMany).mockResolvedValue([mockBlog] as never);
    vi.mocked(prisma.blog.count).mockResolvedValue(1);

    const res = await request(app).get("/api/v1/blogs?tag=news");
    expect(res.status).toBe(200);
    expect(prisma.blog.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ tags: { has: "news" } }) }),
    );
  });

  it("returns empty list when no blogs exist", async () => {
    const { default: prisma } = await import("@/config/db.config");
    vi.mocked(prisma.blog.findMany).mockResolvedValue([] as never);
    vi.mocked(prisma.blog.count).mockResolvedValue(0);

    const res = await request(app).get("/api/v1/blogs");
    expect(res.status).toBe(200);
    expect(res.body.blogs).toHaveLength(0);
    expect(res.body.totalPages).toBe(0);
  });
});

describe("GET /api/v1/blogs/tags", () => {
  it("returns deduplicated sorted tag list", async () => {
    const { default: prisma } = await import("@/config/db.config");
    vi.mocked(prisma.blog.findMany).mockResolvedValue([
      { tags: ["product", "news"] },
      { tags: ["news", "release"] },
    ] as never);

    const res = await request(app).get("/api/v1/blogs/tags");
    expect(res.status).toBe(200);
    expect(res.body.tags).toEqual(["news", "product", "release"]);
  });

  it("returns empty array when no blogs published", async () => {
    const { default: prisma } = await import("@/config/db.config");
    vi.mocked(prisma.blog.findMany).mockResolvedValue([] as never);

    const res = await request(app).get("/api/v1/blogs/tags");
    expect(res.status).toBe(200);
    expect(res.body.tags).toEqual([]);
  });
});

describe("GET /api/v1/blogs/:slug", () => {
  it("returns 200 with blog when found and published", async () => {
    const { default: prisma } = await import("@/config/db.config");
    vi.mocked(prisma.blog.findUnique).mockResolvedValue(mockBlog as never);

    const res = await request(app).get("/api/v1/blogs/hello-world");
    expect(res.status).toBe(200);
    expect(res.body.blog.title).toBe("Hello World");
    expect(res.body.blog.slug).toBe("hello-world");
  });

  it("returns 404 when blog is not found", async () => {
    const { default: prisma } = await import("@/config/db.config");
    vi.mocked(prisma.blog.findUnique).mockResolvedValue(null);

    const res = await request(app).get("/api/v1/blogs/does-not-exist");
    expect(res.status).toBe(404);
  });

  it("returns 404 when blog exists but is unpublished", async () => {
    const { default: prisma } = await import("@/config/db.config");
    vi.mocked(prisma.blog.findUnique).mockResolvedValue({ ...mockBlog, published: false } as never);

    const res = await request(app).get("/api/v1/blogs/hello-world");
    expect(res.status).toBe(404);
  });
});
