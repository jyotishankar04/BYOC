import { Router } from "express";
import {
  requireWorkspaceMember,
  requirePermission,
} from "@/shared/middleware/workspace.middleware";
import prisma from "@/config/db.config";
import { FilesController } from "./files.controller";

const filesRouter = Router({ mergeParams: true });
const filesController = new FilesController(prisma);

// GET /workspaces/:workspaceId/files
filesRouter.get("/", requireWorkspaceMember, filesController.listFiles);

// GET /workspaces/:workspaceId/files/:fileId
filesRouter.get("/:fileId", requireWorkspaceMember, filesController.getFile);

// GET /workspaces/:workspaceId/files/:fileId/preview-url
filesRouter.get(
  "/:fileId/preview-url",
  requireWorkspaceMember,
  filesController.getPreviewUrl,
);

// GET /workspaces/:workspaceId/files/:fileId/download-url
filesRouter.get(
  "/:fileId/download-url",
  requireWorkspaceMember,
  filesController.getDownloadUrl,
);

// PATCH /workspaces/:workspaceId/files/:fileId/rename
filesRouter.patch(
  "/:fileId/rename",
  requireWorkspaceMember,
  filesController.renameFile,
);

// PATCH /workspaces/:workspaceId/files/:fileId/move
filesRouter.patch(
  "/:fileId/move",
  requireWorkspaceMember,
  filesController.moveFile,
);

// DELETE /workspaces/:workspaceId/files/:fileId
filesRouter.delete(
  "/:fileId",
  requireWorkspaceMember,
  requirePermission("canDeleteFiles"),
  filesController.deleteFile,
);

export default filesRouter;
