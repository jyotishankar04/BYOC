import { Router } from "express";
import prisma from "@/config/db.config";
import { requireAuth } from "@/modules/auth/auth.middleware";
import {
  requireWorkspaceMember,
  requirePermission,
} from "@/shared/middleware/workspace.middleware";
import { UploadController } from "./upload.controller";
import { uploadLimiter } from "@/config/rate-limiters";

const uploadRouter = Router({ mergeParams: true });
const uploadController = new UploadController(prisma);

uploadRouter.use(requireAuth);

// POST /upload/presign
uploadRouter.post(
  "/presign",
  uploadLimiter,
  requireWorkspaceMember,
  requirePermission("canUpload"),
  uploadController.presignSmallFile,
);

// POST /upload/initiate
uploadRouter.post(
  "/initiate",
  uploadLimiter,
  requireWorkspaceMember,
  requirePermission("canUpload"),
  uploadController.initiateMultipart,
);

// POST /upload/:fileId/confirm
uploadRouter.post(
  "/:fileId/confirm",
  requireWorkspaceMember,
  uploadController.confirmSmallFile,
);

// GET /upload/:sessionId
uploadRouter.get("/:sessionId", requireWorkspaceMember, uploadController.getSession);

// PATCH /upload/:sessionId/progress
uploadRouter.patch(
  "/:sessionId/progress",
  requireWorkspaceMember,
  uploadController.updateProgress,
);

// POST /upload/:sessionId/complete
uploadRouter.post(
  "/:sessionId/complete",
  requireWorkspaceMember,
  uploadController.completeSession,
);

// POST /upload/:sessionId/abort
uploadRouter.post(
  "/:sessionId/abort",
  requireWorkspaceMember,
  uploadController.abortSession,
);

// POST /upload/:sessionId/refresh-urls
uploadRouter.post(
  "/:sessionId/refresh-urls",
  requireWorkspaceMember,
  uploadController.refreshUrls,
);

export default uploadRouter;
