import { Router } from "express";
import { WorkspaceRole } from "@/generated/prisma/client";
import prisma from "@/config/db.config";
import { requireAuth } from "@/modules/auth/auth.middleware";
import {
  requireWorkspaceMember,
  requireRole,
} from "@/shared/middleware/workspace.middleware";
import { ProviderController } from "./provider.controller";

const providerRouter = Router({ mergeParams: true });
const providerController = new ProviderController(prisma);

providerRouter.use(requireAuth);

// GET /workspaces/:workspaceId/provider
providerRouter.get("/", requireWorkspaceMember, providerController.getProvider);

// POST /workspaces/:workspaceId/provider
providerRouter.post(
  "/",
  requireWorkspaceMember,
  requireRole(WorkspaceRole.Admin),
  providerController.connectProvider,
);

// PATCH /workspaces/:workspaceId/provider
providerRouter.patch(
  "/",
  requireWorkspaceMember,
  requireRole(WorkspaceRole.Admin),
  providerController.updateProvider,
);

// DELETE /workspaces/:workspaceId/provider
providerRouter.delete(
  "/",
  requireWorkspaceMember,
  requireRole(WorkspaceRole.Owner),
  providerController.disconnectProvider,
);

// POST /workspaces/:workspaceId/provider/health-check
providerRouter.post(
  "/health-check",
  requireWorkspaceMember,
  providerController.healthCheck,
);

// GET /workspaces/:workspaceId/provider/sync/status
providerRouter.get(
  "/sync/status",
  requireWorkspaceMember,
  providerController.getSyncStatus,
);

// POST /workspaces/:workspaceId/provider/sync
providerRouter.post(
  "/sync",
  requireWorkspaceMember,
  requireRole(WorkspaceRole.Admin),
  providerController.triggerSync,
);

export default providerRouter;
