import type { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { ShareLinksService } from "./share-links.service";
import type { PrismaClient } from "@/generated/prisma/client";

const createSchema = z.object({
  fileId: z.string().uuid().optional(),
  folderId: z.string().uuid().optional(),
  accessType: z.enum(["Public", "PasswordProtected", "Private"]).default("Public"),
  password: z.string().optional(),
  expiresAt: z.coerce.date().nullable().optional(),
  allowDownload: z.boolean().default(true),
}).refine(
  (data) => (Boolean(data.fileId) ? 1 : 0) + (Boolean(data.folderId) ? 1 : 0) === 1,
  {
    message: "Exactly one of fileId or folderId is required",
    path: ["fileId"],
  },
);

const updateSchema = z.object({
  accessType: z.enum(["Public", "PasswordProtected", "Private"]).optional(),
  password: z.string().optional(),
  expiresAt: z.coerce.date().nullable().optional(),
  allowDownload: z.boolean().optional(),
  status: z.enum(["Active", "Expired", "Revoked", "Disabled"]).optional(),
});

const listQuerySchema = z.object({
  status: z.enum(["Active", "Expired", "Revoked", "Disabled"]).optional(),
  accessType: z.enum(["Public", "PasswordProtected", "Private"]).optional(),
  search: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  sortBy: z.enum(["createdAt", "visits", "expiresAt"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export class ShareLinksController {
  private shareLinksService: ShareLinksService;

  constructor(prisma: PrismaClient) {
    this.shareLinksService = new ShareLinksService(prisma);
  }

  createShareLink = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.userId!;
      const workspaceId = req.params.workspaceId as string;
      const parsed = createSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(422).json({ error: parsed.error.flatten() });
        return;
      }

      const result = await this.shareLinksService.createShareLink({
        ...parsed.data,
        workspaceId,
        userId,
      });

      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  };

  listShareLinks = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const workspaceId = req.params.workspaceId as string;
      const parsed = listQuerySchema.safeParse(req.query);
      if (!parsed.success) {
        res.status(422).json({ error: parsed.error.flatten() });
        return;
      }

      const result = await this.shareLinksService.listShareLinks(workspaceId, parsed.data);
      res.json(result);
    } catch (err) {
      next(err);
    }
  };

  getShareLink = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const workspaceId = req.params.workspaceId as string;
      const linkId = req.params.id as string;

      const result = await this.shareLinksService.getShareLink(workspaceId, linkId);
      res.json(result);
    } catch (err) {
      next(err);
    }
  };

  updateShareLink = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const workspaceId = req.params.workspaceId as string;
      const linkId = req.params.id as string;
      const parsed = updateSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(422).json({ error: parsed.error.flatten() });
        return;
      }

      const result = await this.shareLinksService.updateShareLink(workspaceId, linkId, parsed.data);
      res.json(result);
    } catch (err) {
      next(err);
    }
  };

  deleteShareLink = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.userId!;
      const workspaceId = req.params.workspaceId as string;
      const linkId = req.params.id as string;

      await this.shareLinksService.deleteShareLink(workspaceId, linkId, userId);
      res.status(204).end();
    } catch (err) {
      next(err);
    }
  };

  accessPublicLink = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const slug = String(req.params.slug ?? "");
      const rawPassword = req.headers["x-share-password"] ?? req.query.password;
      const password: string | undefined = typeof rawPassword === "string" ? rawPassword : undefined;
      const ip: string | undefined = req.ip ?? undefined;
      const userAgent: string | undefined = typeof req.headers["user-agent"] === "string"
        ? req.headers["user-agent"]
        : undefined;

      const result = await this.shareLinksService.accessPublicLink(slug, {
        password,
        ip,
        userAgent,
        userId: req.userId,
      });

      res.json(result);
    } catch (err) {
      next(err);
    }
  };
}
