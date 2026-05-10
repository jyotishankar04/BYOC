import type { NextFunction, Request, Response } from "express";
import type MembersService from "./members.service";
import {
  inviteMemberSchema,
  inviteByEmailSchema,
  changeMemberRoleSchema,
} from "./members.schema";

class MembersController {
  constructor(private memberService: MembersService) {}

  listMembers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const workspaceId = req.params["workspaceId"] as string;
      const members = await this.memberService.listMembers(workspaceId);
      res.json({ members });
    } catch (err) {
      next(err);
    }
  };

  listInvites = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const workspaceId = req.params["workspaceId"] as string;
      const invites = await this.memberService.listInvites(workspaceId);
      res.json({ invites });
    } catch (err) {
      next(err);
    }
  };

  addMember = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const workspaceId = req.params["workspaceId"] as string;
      const parsed = inviteMemberSchema.safeParse(req.body);
      if (!parsed.success) return next(parsed.error);

      await this.memberService.inviteMember(
        workspaceId,
        parsed.data.userId,
        req.userId!,
      );
      res.status(201).json({ message: "Invite sent" });
    } catch (err) {
      next(err);
    }
  };

  inviteByEmail = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const workspaceId = req.params["workspaceId"] as string;
      const parsed = inviteByEmailSchema.safeParse(req.body);
      if (!parsed.success) return next(parsed.error);

      await this.memberService.inviteMemberByEmail(
        workspaceId,
        parsed.data.email,
        req.userId!,
      );
      res.status(201).json({ message: "Invite sent" });
    } catch (err) {
      next(err);
    }
  };

  updateMemberRole = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const workspaceId = req.params["workspaceId"] as string;
      const userId = req.params["userId"] as string;
      const parsed = changeMemberRoleSchema.safeParse(req.body);
      if (!parsed.success) return next(parsed.error);

      await this.memberService.changeMemberRole(
        workspaceId,
        userId,
        parsed.data.role,
        req.userId!,
      );
      res.json({ message: "Role updated" });
    } catch (err) {
      next(err);
    }
  };

  removeMember = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const workspaceId = req.params["workspaceId"] as string;
      const userId = req.params["userId"] as string;
      await this.memberService.removeMember(workspaceId, userId);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  };

  acceptInvite = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const workspaceId = req.params["workspaceId"] as string;
      const userId = req.params["userId"] as string;

      if (req.userId !== userId) {
        return res.status(403).json({
          error: {
            code: "FORBIDDEN",
            message: "You can only accept your own invite",
          },
        });
      }

      await this.memberService.acceptInvite(workspaceId, userId);
      res.json({ message: "Invite accepted" });
    } catch (err) {
      next(err);
    }
  };

  rejectInvite = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const workspaceId = req.params["workspaceId"] as string;
      const userId = req.params["userId"] as string;

      await this.memberService.rejectInvite(workspaceId, userId, req.userId!);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  };

  // Invitee fetches their own pending invite details (no Active membership required)
  getMyInvite = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const workspaceId = req.params["workspaceId"] as string;
      const invite = await this.memberService.getMyInvite(
        workspaceId,
        req.userId!,
      );
      if (!invite) {
        return res
          .status(404)
          .json({ error: { code: "NOT_FOUND", message: "No pending invite found" } });
      }
      res.json({ invite });
    } catch (err) {
      next(err);
    }
  };
}

export default MembersController;
