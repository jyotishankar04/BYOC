import type {
  CreateWorkspaceDto,
  UpdateWorkspaceDto,
  TransferDto,
  UpdatePermissionsDto,
  UpdateSecurityDto,
} from "./workspace.schema";

export interface IWorkspaceRepository {
  findWorkspacesByUserId(
    userId: string,
  ): Promise<Array<Record<string, unknown>>>;
  findWorkspaceById(
    workspaceId: string,
  ): Promise<Record<string, unknown> | null>;
  createWorkspace(
    data: Record<string, unknown>,
  ): Promise<Record<string, unknown>>;
  updateWorkspace(
    workspaceId: string,
    data: Record<string, unknown>,
  ): Promise<Record<string, unknown>>;
  deleteWorkspace(workspaceId: string): Promise<void>;
  checkSlugExists(slug: string, excludeId?: string): Promise<boolean>;
  findMembership(
    workspaceId: string,
    userId: string,
  ): Promise<Record<string, unknown> | null>;
  findOwnerPlan(userId: string): Promise<Record<string, unknown>[]>;
  updateMembership(
    workspaceId: string,
    userId: string,
    data: Record<string, unknown>,
  ): Promise<Record<string, unknown>>;

  upsertPermissions(
    workspaceId: string,
    data: Record<string, unknown>,
  ): Promise<Record<string, unknown>>;
  updateSecurity(
    workspaceId: string,
    data: Record<string, unknown>,
  ): Promise<Record<string, unknown>>;
  findActivePublicShareLinks(
    workspaceId: string,
  ): Promise<Array<Record<string, unknown>>>;
  disableShareLinks(
    workspaceId: string,
    accessType: string,
  ): Promise<Array<Record<string, unknown>>>;
  createActivityLog(
    workspaceId: string,
    userId: string,
    action: string,
    details?: string,
  ): Promise<void>;
  createNotification(data: {
    workspaceId?: string;
    userId: string;
    type: string;
    title: string;
    message?: string;
    link?: string;
  }): Promise<void>;
  findUserById(
    userId: string,
  ): Promise<{ id: string; name: string; email: string } | null>;
}

export interface IWorkspaceService {
  listWorkspaces(userId: string): Promise<Array<Record<string, unknown>>>;
  createWorkspace(
    userId: string,
    data: CreateWorkspaceDto,
  ): Promise<Record<string, unknown>>;
  getWorkspace(workspaceId: string): Promise<Record<string, unknown>>;
  updateWorkspace(
    workspaceId: string,
    data: UpdateWorkspaceDto,
  ): Promise<Record<string, unknown>>;
  deleteWorkspace(workspaceId: string, userId: string): Promise<void>;
  transferOwnership(
    workspaceId: string,
    currentOwnerId: string,
    data: TransferDto,
  ): Promise<void>;
  updatePermissions(
    workspaceId: string,
    userId: string,
    data: UpdatePermissionsDto,
  ): Promise<Record<string, unknown>>;
  updateSecurity(
    workspaceId: string,
    userId: string,
    data: UpdateSecurityDto,
  ): Promise<Record<string, unknown>>;
}
