import { Router } from "express";
import { ShareLinksController } from "./share-links.controller";
import prisma from "@/config/db.config";
import { requireAuth, tryAuth } from "@/modules/auth/auth.middleware";
import {
  requireWorkspaceMember,
  requirePermission,
} from "@/shared/middleware/workspace.middleware";
import { requireFeature } from "@/shared/middleware/feature-flags.middleware";

const shareLinksRouter = Router({ mergeParams: true });
const shareLinksController = new ShareLinksController(prisma);

// POST /api/v1/workspaces/:workspaceId/share-links
shareLinksRouter.post(
  "/",
  requireAuth,
  requireWorkspaceMember,
  requireFeature("shareLinks"),
  requirePermission("canShareFiles"),
  shareLinksController.createShareLink,
);

// GET /api/v1/workspaces/:workspaceId/share-links
shareLinksRouter.get(
  "/",
  requireAuth,
  requireWorkspaceMember,
  requireFeature("shareLinks"),
  shareLinksController.listShareLinks,
);

// GET /api/v1/workspaces/:workspaceId/share-links/:id
shareLinksRouter.get(
  "/:id",
  requireAuth,
  requireWorkspaceMember,
  requireFeature("shareLinks"),
  shareLinksController.getShareLink,
);

// PATCH /api/v1/workspaces/:workspaceId/share-links/:id
shareLinksRouter.patch(
  "/:id",
  requireAuth,
  requireWorkspaceMember,
  requireFeature("shareLinks"),
  shareLinksController.updateShareLink,
);

// DELETE /api/v1/workspaces/:workspaceId/share-links/:id
shareLinksRouter.delete(
  "/:id",
  requireAuth,
  requireWorkspaceMember,
  requireFeature("shareLinks"),
  shareLinksController.deleteShareLink,
);

// Public route (optional auth for private links)
export const publicShareRouter = Router();
publicShareRouter.get("/:slug", tryAuth, shareLinksController.accessPublicLink);

export default shareLinksRouter;
