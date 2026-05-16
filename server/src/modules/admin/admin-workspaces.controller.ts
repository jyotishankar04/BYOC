import type { Request, Response, NextFunction } from "express";
import prisma from "@/config/db.config";
import { NotFoundError } from "@/core/errors";

export class AdminWorkspacesController {
  list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const page = Math.max(1, Number(req.query.page) || 1);
      const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
      const search = String(req.query.search || "").trim();
      const skip = (page - 1) * limit;

      const where = search
        ? { name: { contains: search, mode: "insensitive" as const } }
        : {};

      const [workspaces, total] = await Promise.all([
        prisma.workspace.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: "desc" },
          include: {
            owner: { select: { id: true, name: true, email: true } },
            _count: { select: { members: true, files: true, shareLinks: true } },
            storageProvider: { select: { providerType: true, status: true } },
          },
        }),
        prisma.workspace.count({ where }),
      ]);

      res.json({ workspaces, total, page, limit, totalPages: Math.ceil(total / limit) });
    } catch (err) {
      next(err);
    }
  };

  getOne = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const workspace = await prisma.workspace.findUnique({
        where: { id: req.params.workspaceId as string },
        include: {
          owner: { select: { id: true, name: true, email: true } },
          storageProvider: true,
          _count: { select: { members: true, files: true, shareLinks: true, folders: true } },
        },
      });
      if (!workspace) throw new NotFoundError("Workspace");
      res.json({ workspace });
    } catch (err) {
      next(err);
    }
  };

  remove = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await prisma.workspace.delete({ where: { id: req.params.workspaceId as string } });
      res.json({ success: true });
    } catch (err) {
      next(err);
    }
  };
}
