import {
  MemberStatus,
  WorkspaceRole,
  type PrismaClient,
} from "@/generated/prisma/client";
import type {
  IMemberRepository,
  InviteRow,
  MemberRow,
  MyInviteRow,
} from "./members.interface";

const USER_SELECT = {
  id: true,
  name: true,
  email: true,
  image: true,
} as const;

class MembersRepository implements IMemberRepository {
  constructor(private prisma: PrismaClient) {}

  async listMembers(workspaceId: string): Promise<MemberRow[]> {
    return this.prisma.workspaceMember.findMany({
      where: { workspaceId, status: MemberStatus.Active },
      include: { user: { select: USER_SELECT } },
      orderBy: { joinedAt: "asc" },
    }) as unknown as MemberRow[];
  }

  async listInvites(workspaceId: string): Promise<InviteRow[]> {
    return this.prisma.workspaceMember.findMany({
      where: { workspaceId, status: MemberStatus.Pending },
      include: {
        user: { select: USER_SELECT },
        invitedBy: { select: { id: true, name: true, email: true } },
      },
      orderBy: { joinedAt: "desc" },
    }) as unknown as InviteRow[];
  }

  async getMembership(
    workspaceId: string,
    userId: string,
  ): Promise<{ role: WorkspaceRole; status: MemberStatus } | null> {
    const m = await this.prisma.workspaceMember.findUnique({
      where: { workspaceId_userId: { workspaceId, userId } },
      select: { role: true, status: true },
    });
    return m;
  }

  async addMember(
    workspaceId: string,
    userId: string,
    role: WorkspaceRole,
    invitedBy?: string,
  ): Promise<void> {
    await this.prisma.workspaceMember.create({
      data: {
        workspaceId,
        userId,
        role,
        status: MemberStatus.Pending,
        invitedById: invitedBy ?? null,
      },
    });
  }

  async removeMember(workspaceId: string, userId: string): Promise<void> {
    await this.prisma.workspaceMember.delete({
      where: { workspaceId_userId: { workspaceId, userId } },
    });
  }

  async updateMemberRole(
    workspaceId: string,
    userId: string,
    role: WorkspaceRole,
  ): Promise<void> {
    await this.prisma.workspaceMember.update({
      where: { workspaceId_userId: { workspaceId, userId } },
      data: { role },
    });
  }

  async acceptInvite(workspaceId: string, userId: string): Promise<void> {
    await this.prisma.workspaceMember.update({
      where: { workspaceId_userId: { workspaceId, userId } },
      data: { status: MemberStatus.Active, joinedAt: new Date() },
    });
  }

  async rejectInvite(workspaceId: string, userId: string): Promise<void> {
    await this.prisma.workspaceMember.delete({
      where: { workspaceId_userId: { workspaceId, userId } },
    });
  }

  async findUserById(
    userId: string,
  ): Promise<{ id: string; name: string; email: string } | null> {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true },
    });
  }

  async findWorkspaceById(
    workspaceId: string,
  ): Promise<{ id: string; name: string } | null> {
    return this.prisma.workspace.findUnique({
      where: { id: workspaceId },
      select: { id: true, name: true },
    });
  }

  async findUserByEmail(
    email: string,
  ): Promise<{ id: string; name: string; email: string } | null> {
    return this.prisma.user.findUnique({
      where: { email },
      select: { id: true, name: true, email: true },
    });
  }

  async getMyInvite(
    workspaceId: string,
    userId: string,
  ): Promise<MyInviteRow | null> {
    return this.prisma.workspaceMember.findFirst({
      where: { workspaceId, userId, status: MemberStatus.Pending },
      select: {
        id: true,
        workspaceId: true,
        userId: true,
        role: true,
        joinedAt: true,
        workspace: { select: { id: true, name: true, color: true } },
        invitedBy: { select: { id: true, name: true, email: true } },
      },
    }) as Promise<MyInviteRow | null>;
  }
}

export default MembersRepository;
