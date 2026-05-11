import { Router, type Request, type Response, type NextFunction } from "express";
import prisma from "@/config/db.config";
import { requireAuth } from "@/modules/auth/auth.middleware";
import { requireWorkspaceMember } from "@/shared/middleware/workspace.middleware";
import { ActivityService } from "./activity.service";
import { z } from "zod";

const activityRouter = Router({ mergeParams: true });
const activityService = new ActivityService(prisma);

// Validation schema
const listQuerySchema = z.object({
  fileId: z.string().optional(),
  userId: z.string().optional(),
  action: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
});

activityRouter.use(requireAuth);

// GET /api/v1/workspaces/:workspaceId/activity
activityRouter.get("/", requireWorkspaceMember, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const requestingUserId = req.userId!;
    const workspaceId = req.params.workspaceId as string;
    const query = listQuerySchema.parse(req.query);

    const result = await activityService.listActivity(workspaceId, requestingUserId, {
      fileId: query.fileId,
      userId: query.userId,
      action: query.action,
      page: query.page,
      limit: query.limit,
    });

    res.json(result);
  } catch (err) {
    next(err);
  }
});

export default activityRouter;
