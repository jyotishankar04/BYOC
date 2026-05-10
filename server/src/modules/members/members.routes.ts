import { Router } from "express";
import { WorkspaceRole } from "@/generated/prisma";
import prisma from "@/config/db.config";
import { requireAuth } from "@/modules/auth/auth.middleware";
import {
  requireRole,
  requireWorkspaceMember,
} from "@/shared/middleware/workspace.middleware";
import MembersRepository from "./members.repository";
import MembersService from "./members.service";
import MembersController from "./members.controller";

const membersRouter = Router({ mergeParams: true });

const memberRepository = new MembersRepository(prisma);
const membersService = new MembersService(memberRepository);
const membersController = new MembersController(membersService);

membersRouter.use(requireAuth);

// ── Active-member routes ────────────────────────────────────────────────────

membersRouter.get("/", requireWorkspaceMember, membersController.listMembers);

membersRouter.post(
  "/invite",
  requireWorkspaceMember,
  requireRole(WorkspaceRole.Admin),
  membersController.addMember,
);

membersRouter.post(
  "/invite-by-email",
  requireWorkspaceMember,
  requireRole(WorkspaceRole.Admin),
  membersController.inviteByEmail,
);

membersRouter.put(
  "/:userId/role",
  requireWorkspaceMember,
  requireRole(WorkspaceRole.Admin),
  membersController.updateMemberRole,
);

membersRouter.delete(
  "/:userId",
  requireWorkspaceMember,
  requireRole(WorkspaceRole.Admin),
  membersController.removeMember,
);

membersRouter.get(
  "/invites",
  requireWorkspaceMember,
  requireRole(WorkspaceRole.Admin),
  membersController.listInvites,
);

// ── Invite-response routes (no Active membership required) ──────────────────
// These three routes are for the invitee — they have Pending status, not Active.
// "me" must be registered before :userId to prevent shadowing.

membersRouter.get("/invites/me", membersController.getMyInvite);

membersRouter.post("/invites/:userId/accept", membersController.acceptInvite);

membersRouter.post("/invites/:userId/reject", membersController.rejectInvite);

export default membersRouter;
