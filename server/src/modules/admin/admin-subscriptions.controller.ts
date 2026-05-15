import type { Request, Response, NextFunction } from "express";
import { z } from "zod";
import prisma from "@/config/db.config";
import { NotFoundError } from "@/core/errors";

const updateSubSchema = z.object({
  status: z.enum(["Active", "Canceled", "Trialing", "PastDue", "Incomplete", "Incomplete_expired", "Unpaid", "Paused"]).optional(),
  plan: z.enum(["Free", "Pro", "Team"]).optional(),
});

export class AdminSubscriptionsController {
  list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const page = Math.max(1, Number(req.query.page) || 1);
      const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
      const skip = (page - 1) * limit;
      const status = req.query.status as string | undefined;

      const where = status ? { status: status as never } : {};

      const [subscriptions, total] = await Promise.all([
        prisma.subscription.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: "desc" },
          include: {
            user: { select: { id: true, name: true, email: true, avatar: true } },
          },
        }),
        prisma.subscription.count({ where }),
      ]);

      res.json({ subscriptions, total, page, limit, totalPages: Math.ceil(total / limit) });
    } catch (err) {
      next(err);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = updateSubSchema.parse(req.body);
      const subscription = await prisma.subscription.update({
        where: { id: req.params.subscriptionId },
        data,
      });
      res.json({ subscription });
    } catch (err) {
      next(err);
    }
  };
}
