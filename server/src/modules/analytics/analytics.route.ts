import { Router } from "express";
import prisma from "@/config/db.config";
import { requireAuth } from "@/modules/auth/auth.middleware";
import {
  requireWorkspaceMember,
} from "@/shared/middleware/workspace.middleware";
import { AnalyticsController } from "./analytics.controller";

const analyticsRouter = Router({ mergeParams: true });
const analyticsController = new AnalyticsController(prisma);

// GET /api/v1/workspaces/:workspaceId/dashboard
analyticsRouter.get(
  "/dashboard",
  requireAuth,
  requireWorkspaceMember,
  analyticsController.getDashboard,
);

// GET /api/v1/workspaces/:workspaceId/analytics?days=30
analyticsRouter.get(
  "/analytics",
  requireAuth,
  requireWorkspaceMember,
  analyticsController.getAnalytics,
);

export default analyticsRouter;