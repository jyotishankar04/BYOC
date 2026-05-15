import type { Request, Response, NextFunction } from "express";
import { requireAuth } from "@/modules/auth/auth.middleware";
import prisma from "@/config/db.config";

export const requireAdmin = [
  requireAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.userId! },
        select: { isAdmin: true },
      });
      if (!user?.isAdmin) {
        return res.status(403).json({ error: { code: "FORBIDDEN", message: "Admin access required" } });
      }
      next();
    } catch (err) {
      next(err);
    }
  },
];
