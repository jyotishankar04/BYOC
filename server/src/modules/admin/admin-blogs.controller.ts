import type { Request, Response, NextFunction } from "express";
import { z } from "zod";
import prisma from "@/config/db.config";
import { NotFoundError, ValidationError } from "@/core/errors";
import { cache } from "@/shared/cache/cache.service";

const blogSchema = z.object({
  title: z.string().min(1).max(200),
  slug: z.string().min(1).max(200).regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens"),
  content: z.string().default(""),
  excerpt: z.string().max(500).optional(),
  coverImage: z.string().url().optional().or(z.literal("")),
  tags: z.array(z.string()).default([]),
  published: z.boolean().default(false),
});

const updateBlogSchema = blogSchema.partial();

function slugify(title: string): string {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export class AdminBlogsController {
  list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const page = Math.max(1, Number(req.query.page) || 1);
      const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
      const search = String(req.query.search || "").trim();
      const skip = (page - 1) * limit;
      const published = req.query.published === "true" ? true : req.query.published === "false" ? false : undefined;

      const where: Record<string, unknown> = {};
      if (search) where.title = { contains: search, mode: "insensitive" };
      if (published !== undefined) where.published = published;

      const [blogs, total] = await Promise.all([
        prisma.blog.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: "desc" },
          include: { author: { select: { id: true, name: true, avatar: true } } },
        }),
        prisma.blog.count({ where }),
      ]);

      res.json({ blogs, total, page, limit, totalPages: Math.ceil(total / limit) });
    } catch (err) {
      next(err);
    }
  };

  getOne = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const blog = await prisma.blog.findUnique({
        where: { id: req.params.blogId as string as string },
        include: { author: { select: { id: true, name: true, avatar: true } } },
      });
      if (!blog) throw new NotFoundError("Blog");
      res.json({ blog });
    } catch (err) {
      next(err);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = blogSchema.parse(req.body);
      const slug = data.slug || slugify(data.title);

      const existing = await prisma.blog.findUnique({ where: { slug } });
      if (existing) throw new ValidationError("Slug already in use");

      const blog = await prisma.blog.create({
        data: {
          ...data,
          slug,
          authorId: req.userId!,
          publishedAt: data.published ? new Date() : null,
          coverImage: data.coverImage || null,
        },
        include: { author: { select: { id: true, name: true, avatar: true } } },
      });

      await Promise.all([
        cache.del("blog:tags"),
        cache.delPattern("blog:list:*"),
      ]);

      res.status(201).json({ blog });
    } catch (err) {
      next(err);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = updateBlogSchema.parse(req.body);

      const existing = await prisma.blog.findUnique({ where: { id: req.params.blogId as string } });
      if (!existing) throw new NotFoundError("Blog");

      if (data.slug && data.slug !== existing.slug) {
        const slugTaken = await prisma.blog.findUnique({ where: { slug: data.slug } });
        if (slugTaken) throw new ValidationError("Slug already in use");
      }

      const publishedAt =
        data.published === true && !existing.publishedAt ? new Date()
        : data.published === false ? null
        : existing.publishedAt;

      const blog = await prisma.blog.update({
        where: { id: req.params.blogId as string as string },
        data: { ...data, publishedAt, coverImage: data.coverImage || null },
        include: { author: { select: { id: true, name: true, avatar: true } } },
      });

      await Promise.all([
        cache.del(`blog:slug:${existing.slug}`, "blog:tags"),
        cache.delPattern("blog:list:*"),
      ]);

      res.json({ blog });
    } catch (err) {
      next(err);
    }
  };

  remove = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const blog = await prisma.blog.findUnique({ where: { id: req.params.blogId as string }, select: { slug: true } });
      await prisma.blog.delete({ where: { id: req.params.blogId as string } });

      if (blog) {
        await Promise.all([
          cache.del(`blog:slug:${blog.slug}`, "blog:tags"),
          cache.delPattern("blog:list:*"),
        ]);
      }

      res.json({ success: true });
    } catch (err) {
      next(err);
    }
  };
}

// ─── Public controller (no auth) ─────────────────────────────────────────────

export class PublicBlogsController {
  list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const page = Math.max(1, Number(req.query.page) || 1);
      const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 9));
      const skip = (page - 1) * limit;
      const tag = (req.query.tag as string | undefined) ?? "";

      const cacheKey = `blog:list:${page}:${limit}:${tag}`;
      const result = await cache.wrap(cacheKey, 300, async () => {
        const where: Record<string, unknown> = { published: true };
        if (tag) where.tags = { has: tag };

        const [blogs, total] = await Promise.all([
          prisma.blog.findMany({
            where,
            skip,
            take: limit,
            orderBy: { publishedAt: "desc" },
            select: {
              id: true, title: true, slug: true, excerpt: true,
              coverImage: true, tags: true, publishedAt: true, createdAt: true,
              author: { select: { id: true, name: true, avatar: true } },
            },
          }),
          prisma.blog.count({ where }),
        ]);

        return { blogs, total, page, limit, totalPages: Math.ceil(total / limit) };
      });

      res.json(result);
    } catch (err) {
      next(err);
    }
  };

  getBySlug = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const slug = req.params.slug as string;
      const blog = await cache.wrap(`blog:slug:${slug}`, 600, () =>
        prisma.blog.findUnique({
          where: { slug },
          include: { author: { select: { id: true, name: true, avatar: true } } },
        }),
      );
      if (!blog || !blog.published) throw new NotFoundError("Blog post");
      res.json({ blog });
    } catch (err) {
      next(err);
    }
  };

  tags = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const tags = await cache.wrap("blog:tags", 3600, async () => {
        const blogs = await prisma.blog.findMany({
          where: { published: true },
          select: { tags: true },
        });
        return [...new Set(blogs.flatMap((b) => b.tags))].sort();
      });
      res.json({ tags });
    } catch (err) {
      next(err);
    }
  };
}
