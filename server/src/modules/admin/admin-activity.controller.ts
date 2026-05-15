import type { Request, Response, NextFunction } from "express";
import prisma from "@/config/db.config";

export class AdminActivityController {
  list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const page = Math.max(1, Number(req.query.page) || 1);
      const limit = 30;
      const skip = (page - 1) * limit;

      const [logs, total] = await Promise.all([
        prisma.activityLog.findMany({
          orderBy: { createdAt: "desc" },
          skip,
          take: limit,
          include: {
            user: { select: { id: true, name: true, email: true } },
          },
        }),
        prisma.activityLog.count(),
      ]);

      const mapped = logs.map((log) => {
        let metadata: unknown = null;
        if (log.details) {
          try { metadata = JSON.parse(log.details); } catch { metadata = { details: log.details }; }
        }
        return { id: log.id, action: log.action, metadata, createdAt: log.createdAt, user: log.user };
      });

      res.json({ logs: mapped, total, page, totalPages: Math.ceil(total / limit) });
    } catch (err) {
      next(err);
    }
  };
}
