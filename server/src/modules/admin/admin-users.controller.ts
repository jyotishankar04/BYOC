import type { Request, Response, NextFunction } from "express";
import { z } from "zod";
import prisma from "@/config/db.config";
import { NotFoundError } from "@/core/errors";

const updateUserSchema = z.object({
  isAdmin: z.boolean().optional(),
  name: z.string().min(1).optional(),
  plan: z.enum(["Free", "Pro", "Team"]).optional(),
});

export class AdminUsersController {
  list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const page = Math.max(1, Number(req.query.page) || 1);
      const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
      const search = String(req.query.search || "").trim();
      const skip = (page - 1) * limit;

      const where = search
        ? { OR: [{ name: { contains: search, mode: "insensitive" as const } }, { email: { contains: search, mode: "insensitive" as const } }] }
        : {};

      const [users, total] = await Promise.all([
        prisma.user.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: "desc" },
          select: {
            id: true, name: true, email: true, avatar: true,
            plan: true, isAdmin: true, onboarded: true,
            createdAt: true, updatedAt: true,
            _count: { select: { workspaces: true, shareLinks: true, files: true } },
            subscription: { select: { status: true, plan: true } },
          },
        }),
        prisma.user.count({ where }),
      ]);

      res.json({ users, total, page, limit, totalPages: Math.ceil(total / limit) });
    } catch (err) {
      next(err);
    }
  };

  getOne = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.params.userId as string },
        include: {
          subscription: true,
          _count: { select: { workspaces: true, shareLinks: true, files: true, activityLogs: true } },
          workspaces: { select: { id: true, name: true, plan: true, createdAt: true } },
        },
      });
      if (!user) throw new NotFoundError("User");
      res.json({ user });
    } catch (err) {
      next(err);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = updateUserSchema.parse(req.body);
      const user = await prisma.user.update({
        where: { id: req.params.userId as string },
        data,
        select: { id: true, name: true, email: true, isAdmin: true, plan: true },
      });
      res.json({ user });
    } catch (err) {
      next(err);
    }
  };

  remove = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await prisma.user.delete({ where: { id: req.params.userId as string } });
      res.json({ success: true });
    } catch (err) {
      next(err);
    }
  };
}
