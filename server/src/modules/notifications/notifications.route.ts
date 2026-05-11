import { Router, type Request, type Response, type NextFunction } from "express";
import prisma from "@/config/db.config";
import { requireAuth } from "@/modules/auth/auth.middleware";
import { NotificationsService } from "./notifications.service";
import { z } from "zod";

const notificationsRouter = Router();
const notificationsService = new NotificationsService(prisma);

// Validation schemas
const listQuerySchema = z.object({
  filter: z.enum(["all", "unread", "files", "members", "security", "system"]).default("all"),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
});

const filterQuerySchema = z.object({
  filter: z.enum(["all", "files", "members", "security", "system"]).optional(),
});

notificationsRouter.use(requireAuth);

// GET /api/v1/users/me/notifications
notificationsRouter.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId!;
    const query = listQuerySchema.parse(req.query);

    const result = await notificationsService.listNotifications(userId, {
      filter: query.filter,
      page: query.page,
      limit: query.limit,
    });

    res.json(result);
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/users/me/notifications/count
notificationsRouter.get("/count", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId!;
    const count = await notificationsService.getUnreadCount(userId);

    res.json({ count });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/v1/users/me/notifications/:id/read
notificationsRouter.patch("/:id/read", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId!;
    const notificationId = req.params.id as string;

    await notificationsService.markRead(userId, notificationId);

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/v1/users/me/notifications/read-all
notificationsRouter.patch("/read-all", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId!;
    const query = filterQuerySchema.parse(req.query);

    const count = await notificationsService.markAllRead(userId, query.filter);

    res.json({ success: true, count });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/v1/users/me/notifications/:id
notificationsRouter.delete("/:id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId!;
    const notificationId = req.params.id as string;

    await notificationsService.dismiss(userId, notificationId);

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/v1/users/me/notifications
notificationsRouter.delete("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.userId!;
    const query = filterQuerySchema.parse(req.query);

    const count = await notificationsService.dismissAll(userId, query.filter);

    res.json({ success: true, count });
  } catch (err) {
    next(err);
  }
});

export default notificationsRouter;
