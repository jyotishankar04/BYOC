-- CreateEnum
CREATE TYPE "WorkspaceType" AS ENUM ('PERSONAL', 'STARTUP', 'TEAM');

-- CreateEnum
CREATE TYPE "WorkspacePlan" AS ENUM ('Free', 'Pro', 'Team');

-- CreateEnum
CREATE TYPE "WorkspaceRole" AS ENUM ('Owner', 'Admin', 'Member', 'Viewer');

-- CreateEnum
CREATE TYPE "PermissionRole" AS ENUM ('Owner', 'Admin', 'Member', 'Viewer');

-- CreateEnum
CREATE TYPE "StorageProviderType" AS ENUM ('S3', 'R2', 'GCS', 'Azure', 'MinIO', 'Supabase', 'Other');

-- CreateEnum
CREATE TYPE "StorageProviderStatus" AS ENUM ('Unchecked', 'Active', 'Invalid', 'Error');

-- CreateEnum
CREATE TYPE "FileKind" AS ENUM ('image', 'video', 'document', 'audio', 'archive', 'other');

-- CreateEnum
CREATE TYPE "FileStatus" AS ENUM ('uploading', 'uploaded', 'failed', 'deleted');

-- CreateEnum
CREATE TYPE "ShareAccessType" AS ENUM ('Public', 'PasswordProtected', 'Private');

-- CreateEnum
CREATE TYPE "ShareLinkStatus" AS ENUM ('Active', 'Expired', 'Revoked');

-- CreateEnum
CREATE TYPE "UploadSessionStatus" AS ENUM ('pending', 'uploading', 'completed', 'failed', 'aborted');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('FILE_SHARED', 'FILE_UPLOADED', 'FILE_DELETED', 'MEMBER_JOINED', 'MEMBER_LEFT', 'INVITE_SENT', 'STORAGE_ALERT', 'SECURITY_ALERT', 'LINK_EXPIRED');

-- CreateTable
CREATE TABLE "Workspace" (
    "id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "slug" VARCHAR(50) NOT NULL,
    "type" "WorkspaceType" NOT NULL,
    "plan" "WorkspacePlan" NOT NULL DEFAULT 'Free',
    "color" VARCHAR(7) NOT NULL DEFAULT '#6366f1',
    "ownerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Workspace_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkspaceMember" (
    "id" UUID NOT NULL,
    "workspaceId" UUID NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "WorkspaceRole" NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "invitedById" TEXT,

    CONSTRAINT "WorkspaceMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkspacePermission" (
    "workspaceId" UUID NOT NULL,
    "canUpload" "PermissionRole" NOT NULL DEFAULT 'Member',
    "canCreateFolders" "PermissionRole" NOT NULL DEFAULT 'Member',
    "canShareFiles" "PermissionRole" NOT NULL DEFAULT 'Member',
    "canDeleteFiles" "PermissionRole" NOT NULL DEFAULT 'Admin',
    "canManageBilling" "PermissionRole" NOT NULL DEFAULT 'Owner',

    CONSTRAINT "WorkspacePermission_pkey" PRIMARY KEY ("workspaceId")
);

-- CreateTable
CREATE TABLE "WorkspaceSecurity" (
    "workspaceId" UUID NOT NULL,
    "requirePasswordForPublicLinks" BOOLEAN NOT NULL DEFAULT false,
    "disablePublicSharing" BOOLEAN NOT NULL DEFAULT false,
    "allowPrivateInviteSharing" BOOLEAN NOT NULL DEFAULT true,
    "enableActivityLogs" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "WorkspaceSecurity_pkey" PRIMARY KEY ("workspaceId")
);

-- CreateTable
CREATE TABLE "StorageProvider" (
    "id" UUID NOT NULL,
    "workspaceId" UUID NOT NULL,
    "providerType" "StorageProviderType" NOT NULL,
    "bucket" VARCHAR(255) NOT NULL,
    "region" VARCHAR(100),
    "endpointUrl" VARCHAR(500),
    "accessKeyIdHint" VARCHAR(10),
    "encryptedCreds" TEXT NOT NULL,
    "status" "StorageProviderStatus" NOT NULL DEFAULT 'Unchecked',
    "lastChecked" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StorageProvider_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Workspace_slug_key" ON "Workspace"("slug");

-- CreateIndex
CREATE INDEX "Workspace_ownerId_idx" ON "Workspace"("ownerId");

-- CreateIndex
CREATE UNIQUE INDEX "WorkspaceMember_workspaceId_userId_key" ON "WorkspaceMember"("workspaceId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "StorageProvider_workspaceId_key" ON "StorageProvider"("workspaceId");

-- AddForeignKey
ALTER TABLE "Workspace" ADD CONSTRAINT "Workspace_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkspaceMember" ADD CONSTRAINT "WorkspaceMember_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkspaceMember" ADD CONSTRAINT "WorkspaceMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkspaceMember" ADD CONSTRAINT "WorkspaceMember_invitedById_fkey" FOREIGN KEY ("invitedById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkspacePermission" ADD CONSTRAINT "WorkspacePermission_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkspaceSecurity" ADD CONSTRAINT "WorkspaceSecurity_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StorageProvider" ADD CONSTRAINT "StorageProvider_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
