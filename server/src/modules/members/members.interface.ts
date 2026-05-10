import type { MemberStatus, WorkspaceRole } from "@/generated/prisma/client";

export interface MemberRow {
  id: string;
  workspaceId: string;
  userId: string;
  role: WorkspaceRole;
  status: MemberStatus;
  joinedAt: Date;
  invitedById: string | null;
  user: { id: string; name: string; email: string; image: string | null };
}

export interface InviteRow extends MemberRow {
  invitedBy: { id: string; name: string; email: string } | null;
}

export interface MyInviteRow {
  id: string;
  workspaceId: string;
  userId: string;
  role: WorkspaceRole;
  joinedAt: Date;
  workspace: { id: string; name: string; color: string };
  invitedBy: { id: string; name: string; email: string } | null;
}

export interface IMemberRepository {
  listMembers(workspaceId: string): Promise<MemberRow[]>;
  listInvites(workspaceId: string): Promise<InviteRow[]>;
  getMembership(
    workspaceId: string,
    userId: string,
  ): Promise<{ role: WorkspaceRole; status: MemberStatus } | null>;
  addMember(
    workspaceId: string,
    userId: string,
    role: WorkspaceRole,
    invitedBy?: string,
  ): Promise<void>;
  removeMember(workspaceId: string, userId: string): Promise<void>;
  updateMemberRole(
    workspaceId: string,
    userId: string,
    role: WorkspaceRole,
  ): Promise<void>;
  acceptInvite(workspaceId: string, userId: string): Promise<void>;
  rejectInvite(workspaceId: string, userId: string): Promise<void>;
  findUserById(
    userId: string,
  ): Promise<{ id: string; name: string; email: string } | null>;
  findWorkspaceById(
    workspaceId: string,
  ): Promise<{ id: string; name: string } | null>;
  findUserByEmail(
    email: string,
  ): Promise<{ id: string; name: string; email: string } | null>;
  getMyInvite(workspaceId: string, userId: string): Promise<MyInviteRow | null>;
}

export interface IMemberService {
  listMembers(workspaceId: string): Promise<MemberRow[]>;
  listInvites(workspaceId: string): Promise<InviteRow[]>;
  inviteMember(
    workspaceId: string,
    userId: string,
    invitedBy: string,
  ): Promise<void>;
  inviteMemberByEmail(
    workspaceId: string,
    email: string,
    invitedBy: string,
  ): Promise<void>;
  changeMemberRole(
    workspaceId: string,
    userId: string,
    role: WorkspaceRole,
    changedBy: string,
  ): Promise<void>;
  removeMember(workspaceId: string, userId: string): Promise<void>;
  acceptInvite(workspaceId: string, userId: string): Promise<void>;
  rejectInvite(
    workspaceId: string,
    userId: string,
    callerUserId: string,
  ): Promise<void>;
  getMyInvite(workspaceId: string, userId: string): Promise<MyInviteRow | null>;
}
