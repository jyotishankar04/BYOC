import type { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { AnalyticsService } from "./analytics.service";
import type { PrismaClient } from "@/generated/prisma/client";

const analyticsQuerySchema = z.object({
  days: z.coerce.number().int().min(1).max(365).default(30),
});

export class AnalyticsController {
  private analyticsService: AnalyticsService;

  constructor(prisma: PrismaClient) {
    this.analyticsService = new AnalyticsService(prisma);
  }

  getDashboard = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const workspaceId = req.params.workspaceId as string;
      const data = await this.analyticsService.getDashboard(workspaceId);
      res.json(data);
    } catch (err) {
      next(err);
    }
  };

  getAnalytics = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const workspaceId = req.params.workspaceId as string;
      const parsed = analyticsQuerySchema.safeParse(req.query);
      if (!parsed.success) {
        res.status(422).json({ error: parsed.error.flatten() });
        return;
      }
      const data = await this.analyticsService.getAnalytics(workspaceId, parsed.data.days);
      res.json(data);
    } catch (err) {
      next(err);
    }
  };
}