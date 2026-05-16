import { Router } from "express";
import prisma from "@/config/db.config";
import { requireAuth } from "@/modules/auth/auth.middleware";
import {
  requireWorkspaceMember,
  requirePermission,
} from "@/shared/middleware/workspace.middleware";
import { FoldersController } from "./folders.controller";

const foldersRouter = Router({ mergeParams: true });
const foldersController = new FoldersController(prisma);

foldersRouter.use(requireAuth, requireWorkspaceMember);

// GET /workspaces/:workspaceId/folders?parentId=<uuid>
foldersRouter.get("/", foldersController.listFolders);

// POST /workspaces/:workspaceId/folders
foldersRouter.post(
  "/",
  requirePermission("canCreateFolders"),
  foldersController.createFolder,
);

// PATCH /workspaces/:workspaceId/folders/:folderId
foldersRouter.patch(
  "/:folderId",
  requirePermission("canCreateFolders"),
  foldersController.renameFolder,
);

// DELETE /workspaces/:workspaceId/folders/:folderId
foldersRouter.delete(
  "/:folderId",
  requirePermission("canDeleteFiles"),
  foldersController.deleteFolder,
);

// PATCH /workspaces/:workspaceId/folders/:folderId/move
foldersRouter.patch(
  "/:folderId/move",
  requirePermission("canCreateFolders"),
  foldersController.moveFolder,
);

export default foldersRouter;
