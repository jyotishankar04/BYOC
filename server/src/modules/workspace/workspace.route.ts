import { Router } from "express";
import { requireAuth } from "@/modules/auth/auth.middleware";
import {
  requireWorkspaceMember,
  requireRole,
} from "@/shared/middleware/workspace.middleware";
import { WorkspaceRole } from "@/generated/prisma/client";
import { workspaceService } from "./workspace.service";
import { WorkspaceController } from "./workspace.controller";
import membersRouter from "@/modules/members/members.routes";
import providerRouter from "@/modules/provider/provider.route";
import foldersRouter from "@/modules/folders/folders.route";
import filesRouter from "@/modules/files/files.route";
import uploadRouter from "@/modules/upload/upload.route";
import eventsRouter from "@/modules/events/events.route";

const router = Router();
const workspaceController = new WorkspaceController(workspaceService);

router.use(requireAuth);

router.get("/", workspaceController.list);
router.post("/", workspaceController.create);
router.get("/:workspaceId", requireWorkspaceMember, workspaceController.get);
router.patch(
  "/:workspaceId",
  requireWorkspaceMember,
  requireRole(WorkspaceRole.Admin),
  workspaceController.update,
);
router.delete(
  "/:workspaceId",
  requireWorkspaceMember,
  requireRole(WorkspaceRole.Owner),
  workspaceController.delete,
);
router.post(
  "/:workspaceId/transfer",
  requireWorkspaceMember,
  requireRole(WorkspaceRole.Owner),
  workspaceController.transfer,
);

// Settings routes
router.patch(
  "/:workspaceId/permissions",
  requireWorkspaceMember,
  requireRole(WorkspaceRole.Admin),
  workspaceController.updatePermissions,
);

router.patch(
  "/:workspaceId/security",
  requireWorkspaceMember,
  requireRole(WorkspaceRole.Admin),
  workspaceController.updateSecurity,
);

router.post(
  "/:workspaceId/logo/presign",
  requireWorkspaceMember,
  requireRole(WorkspaceRole.Admin),
  workspaceController.presignLogo,
);
router.post(
  "/:workspaceId/logo/confirm",
  requireWorkspaceMember,
  requireRole(WorkspaceRole.Admin),
  workspaceController.confirmLogo,
);

router.post(
  "/:workspaceId/banner/presign",
  requireWorkspaceMember,
  requireRole(WorkspaceRole.Admin),
  workspaceController.presignBanner,
);
router.post(
  "/:workspaceId/banner/confirm",
  requireWorkspaceMember,
  requireRole(WorkspaceRole.Admin),
  workspaceController.confirmBanner,
);

router.use("/:workspaceId/members", membersRouter);
router.use("/:workspaceId/provider", providerRouter);
router.use("/:workspaceId/folders", foldersRouter);
router.use("/:workspaceId/files", filesRouter);
router.use("/:workspaceId/upload", uploadRouter);
router.use("/:workspaceId/events", eventsRouter);

export default router;
