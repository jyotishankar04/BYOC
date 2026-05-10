import { MemberStatus, WorkspaceRole } from "@/generated/prisma/client";
import { AppError } from "@/core/errors";
import type {
  IMemberService,
  InviteRow,
  MemberRow,
  MyInviteRow,
} from "./members.interface";
import type MembersRepository from "./members.repository";
import { mailService } from "@/core/mail/mail.service";
import env from "@/config/env";
import { broadcast } from "@/modules/events/events.service";
import prisma from "@/config/db.config";
import { SubscriptionSnapshotService } from "@/modules/billing/subscription-snapshot.service";
import { assertFeatureAccess, assertQuotaAvailable, buildQuotaSummary } from "@/modules/billing/subscription-access";

const ROLE_WEIGHT: Record<WorkspaceRole, number> = {
  [WorkspaceRole.Owner]: 4,
  [WorkspaceRole.Admin]: 3,
  [WorkspaceRole.Member]: 2,
  [WorkspaceRole.Viewer]: 1,
};

class MembersService implements IMemberService {
  constructor(private memberRepository: MembersRepository) {}

  async listMembers(workspaceId: string): Promise<MemberRow[]> {
    return this.memberRepository.listMembers(workspaceId);
  }

  async listInvites(workspaceId: string): Promise<InviteRow[]> {
    return this.memberRepository.listInvites(workspaceId);
  }

  async inviteMember(
    workspaceId: string,
    userId: string,
    invitedBy: string,
  ): Promise<void> {
    const snapshot = await new SubscriptionSnapshotService(
      prisma,
    ).getWorkspaceSnapshot(workspaceId);
    const teamQuota = buildQuotaSummary(
      snapshot.limits.maxTeamMembers,
      snapshot.usage.membersCount + snapshot.usage.pendingInvitesCount,
    );
    assertQuotaAvailable(
      teamQuota,
      "Member limit reached for this workspace plan",
      "MEMBER_LIMIT_REACHED",
    );

    const existing = await this.memberRepository.getMembership(
      workspaceId,
      userId,
    );
    if (existing) {
      const msg =
        existing.status === MemberStatus.Pending
          ? "User already has a pending invite"
          : "User is already a member of this workspace";
      throw new AppError(msg, 409, "CONFLICT");
    }

    const [workspace, inviter, invitee] = await Promise.all([
      this.memberRepository.findWorkspaceById(workspaceId),
      this.memberRepository.findUserById(invitedBy),
      this.memberRepository.findUserById(userId),
    ]);

    await this.memberRepository.addMember(
      workspaceId,
      userId,
      WorkspaceRole.Member,
      invitedBy,
    );

    if (workspace && invitee && inviter) {
      await mailService.sendInvitationEmail(invitee.email, {
        inviteeName: invitee.name,
        inviterName: inviter.name,
        workspaceName: workspace.name,
        role: "Member",
        acceptUrl: `${env.FRONTEND_URL}/app/invite/${workspaceId}`,
      });
    }
  }

  async inviteMemberByEmail(
    workspaceId: string,
    email: string,
    invitedBy: string,
  ): Promise<void> {
    const user = await this.memberRepository.findUserByEmail(email);
    if (!user) {
      throw new AppError(
        "No user found with this email",
        404,
        "USER_NOT_FOUND",
      );
    }
    await this.inviteMember(workspaceId, user.id, invitedBy);
  }

  async changeMemberRole(
    workspaceId: string,
    targetUserId: string,
    role: WorkspaceRole,
    changedBy: string,
  ): Promise<void> {
    const snapshot = await new SubscriptionSnapshotService(
      prisma,
    ).getWorkspaceSnapshot(workspaceId);
    assertFeatureAccess(
      snapshot.plan,
      "teamManagement",
      "Team plan required to manage member roles",
      "TEAM_PLAN_REQUIRED",
    );

    const membership = await this.memberRepository.getMembership(
      workspaceId,
      targetUserId,
    );
    if (!membership || membership.status !== MemberStatus.Active) {
      throw new AppError("Member not found", 404, "NOT_FOUND");
    }
    if (membership.role === WorkspaceRole.Owner) {
      throw new AppError(
        "Cannot change the Owner's role — use transfer ownership instead",
        403,
        "FORBIDDEN",
      );
    }
    await this.memberRepository.updateMemberRole(
      workspaceId,
      targetUserId,
      role,
    );

    const [workspace, member, changer] = await Promise.all([
      this.memberRepository.findWorkspaceById(workspaceId),
      this.memberRepository.findUserById(targetUserId),
      this.memberRepository.findUserById(changedBy),
    ]);

    if (workspace && member) {
      const changerName = changer?.name ?? "A workspace admin";
      await mailService.sendRoleChangeEmail(member.email, {
        memberName: member.name,
        workspaceName: workspace.name,
        newRole: role,
        changedByName: changerName,
      });
    }
  }

  async removeMember(workspaceId: string, userId: string): Promise<void> {
    const membership = await this.memberRepository.getMembership(
      workspaceId,
      userId,
    );
    if (!membership || membership.status !== MemberStatus.Active) {
      throw new AppError("Member not found", 404, "NOT_FOUND");
    }
    if (membership.role === WorkspaceRole.Owner) {
      throw new AppError("Cannot remove the workspace Owner", 403, "FORBIDDEN");
    }
    await this.memberRepository.removeMember(workspaceId, userId);

    broadcast(workspaceId, {
      type: "member.removed",
      payload: { memberId: userId },
    });
  }

  async acceptInvite(workspaceId: string, userId: string): Promise<void> {
    const invite = await this.memberRepository.getMembership(
      workspaceId,
      userId,
    );
    if (!invite || invite.status !== MemberStatus.Pending) {
      throw new AppError("Pending invite not found", 404, "NOT_FOUND");
    }
    await this.memberRepository.acceptInvite(workspaceId, userId);

    const members = await this.memberRepository.listMembers(workspaceId);
    const joinedMember = members.find((member) => member.userId === userId);
    if (joinedMember) {
      broadcast(workspaceId, {
        type: "member.joined",
        payload: joinedMember,
      });
    }
  }

  async rejectInvite(
    workspaceId: string,
    userId: string,
    callerUserId: string,
  ): Promise<void> {
    const invite = await this.memberRepository.getMembership(
      workspaceId,
      userId,
    );
    if (!invite || invite.status !== MemberStatus.Pending) {
      throw new AppError("Pending invite not found", 404, "NOT_FOUND");
    }

    if (callerUserId !== userId) {
      const callerMembership = await this.memberRepository.getMembership(
        workspaceId,
        callerUserId,
      );
      if (
        !callerMembership ||
        callerMembership.status !== MemberStatus.Active ||
        ROLE_WEIGHT[callerMembership.role] < ROLE_WEIGHT[WorkspaceRole.Admin]
      ) {
        throw new AppError("Forbidden", 403, "FORBIDDEN");
      }
    }

    await this.memberRepository.rejectInvite(workspaceId, userId);
  }

  async getMyInvite(
    workspaceId: string,
    userId: string,
  ): Promise<MyInviteRow | null> {
    return this.memberRepository.getMyInvite(workspaceId, userId);
  }
}

export default MembersService;
