-- CreateEnum
CREATE TYPE "DeploymentMode" AS ENUM ('HOSTED', 'SELF_HOSTED');

-- CreateEnum
CREATE TYPE "WorkspaceRole" AS ENUM ('OWNER', 'ADMIN', 'EDITOR', 'VIEWER', 'BILLING_ADMIN');

-- CreateEnum
CREATE TYPE "WorkspacePermission" AS ENUM ('WORKSPACE_MANAGE', 'MEMBER_INVITE', 'MEMBER_REMOVE', 'PROVIDER_CONNECT', 'PROVIDER_REMOVE', 'FILE_UPLOAD', 'FILE_DOWNLOAD', 'FILE_DELETE', 'FILE_RENAME', 'FILE_MOVE', 'FILE_SHARE', 'ANALYTICS_VIEW', 'COST_VIEW', 'BILLING_MANAGE', 'AUDIT_VIEW');

-- CreateEnum
CREATE TYPE "WorkspaceMemberStatus" AS ENUM ('INVITED', 'ACTIVE', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "WorkspaceInviteStatus" AS ENUM ('PENDING', 'ACCEPTED', 'EXPIRED', 'REVOKED');

-- CreateEnum
CREATE TYPE "ProviderType" AS ENUM ('AWS_S3', 'CLOUDFLARE_R2');

-- CreateEnum
CREATE TYPE "ProviderStatus" AS ENUM ('PENDING', 'VALIDATING', 'ACTIVE', 'ERROR', 'REVOKED');

-- CreateEnum
CREATE TYPE "SecretStatus" AS ENUM ('ACTIVE', 'ROTATED', 'REVOKED');

-- CreateEnum
CREATE TYPE "FileEntryType" AS ENUM ('FILE', 'FOLDER');

-- CreateEnum
CREATE TYPE "StorageOperationType" AS ENUM ('LIST', 'UPLOAD', 'DOWNLOAD', 'DELETE', 'RENAME', 'MOVE', 'BULK_DELETE', 'BULK_MOVE', 'CREATE_FOLDER', 'SIGNED_URL');

-- CreateEnum
CREATE TYPE "ShareType" AS ENUM ('PUBLIC', 'PASSWORD_PROTECTED', 'EMAIL_PROTECTED', 'USER_PROTECTED');

-- CreateEnum
CREATE TYPE "ShareStatus" AS ENUM ('ACTIVE', 'EXPIRED', 'REVOKED');

-- CreateEnum
CREATE TYPE "TransferJobStatus" AS ENUM ('QUEUED', 'RUNNING', 'SUCCESS', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "EstimateType" AS ENUM ('MODELED', 'TELEMETRY_BACKED', 'RECONCILED');

-- CreateEnum
CREATE TYPE "OptimizationType" AS ENUM ('HIGH_EGRESS', 'COLD_DATA', 'TOO_MANY_REQUESTS', 'R2_MIGRATION', 'SHARE_LINK_EGRESS');

-- CreateEnum
CREATE TYPE "OptimizationSeverity" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "OptimizationStatus" AS ENUM ('ACTIVE', 'APPLIED', 'DISMISSED');

-- CreateEnum
CREATE TYPE "ConfidenceLevel" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateEnum
CREATE TYPE "AlertType" AS ENUM ('COST_SPIKE', 'STORAGE_SPIKE', 'PROVIDER_FAILURE', 'FAILED_UPLOAD');

-- CreateEnum
CREATE TYPE "AlertSeverity" AS ENUM ('INFO', 'WARNING', 'CRITICAL');

-- CreateEnum
CREATE TYPE "AlertStatus" AS ENUM ('ACTIVE', 'DISMISSED', 'RESOLVED');

-- CreateEnum
CREATE TYPE "PlanType" AS ENUM ('FREE', 'PRO');

-- CreateEnum
CREATE TYPE "BillingCycle" AS ENUM ('MONTHLY', 'YEARLY');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIVE', 'TRIAL', 'CANCELLED', 'PAST_DUE', 'EXPIRED');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PAID', 'FAILED', 'REFUNDED', 'PENDING');

-- CreateEnum
CREATE TYPE "AuditActorType" AS ENUM ('USER', 'SYSTEM', 'ADMIN', 'PUBLIC');

-- CreateEnum
CREATE TYPE "ApiKeyStatus" AS ENUM ('ACTIVE', 'REVOKED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "WebhookStatus" AS ENUM ('ACTIVE', 'DISABLED', 'REVOKED');

-- CreateEnum
CREATE TYPE "WebhookEventType" AS ENUM ('FILE_UPLOADED', 'FILE_DELETED', 'SHARE_CREATED', 'SHARE_VIEWED', 'COST_SPIKE', 'PROVIDER_ERROR');

-- CreateEnum
CREATE TYPE "WebhookDeliveryStatus" AS ENUM ('PENDING', 'SUCCESS', 'FAILED', 'RETRYING');

-- CreateTable
CREATE TABLE "Workspace" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "deploymentMode" "DeploymentMode" NOT NULL DEFAULT 'HOSTED',
    "ownerUserId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Workspace_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkspaceMember" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "WorkspaceRole" NOT NULL DEFAULT 'OWNER',
    "status" "WorkspaceMemberStatus" NOT NULL DEFAULT 'ACTIVE',
    "invitedBy" TEXT,
    "joinedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkspaceMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkspaceRolePermission" (
    "id" TEXT NOT NULL,
    "role" "WorkspaceRole" NOT NULL,
    "permission" "WorkspacePermission" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WorkspaceRolePermission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkspaceInvite" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" "WorkspaceRole" NOT NULL DEFAULT 'VIEWER',
    "tokenHash" TEXT NOT NULL,
    "status" "WorkspaceInviteStatus" NOT NULL DEFAULT 'PENDING',
    "invitedById" TEXT,
    "acceptedById" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "acceptedAt" TIMESTAMP(3),
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkspaceInvite_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Workspace_slug_key" ON "Workspace"("slug");

-- CreateIndex
CREATE INDEX "Workspace_ownerUserId_idx" ON "Workspace"("ownerUserId");

-- CreateIndex
CREATE INDEX "Workspace_deploymentMode_idx" ON "Workspace"("deploymentMode");

-- CreateIndex
CREATE INDEX "Workspace_deletedAt_idx" ON "Workspace"("deletedAt");

-- CreateIndex
CREATE INDEX "Workspace_slug_idx" ON "Workspace"("slug");

-- CreateIndex
CREATE INDEX "WorkspaceMember_workspaceId_idx" ON "WorkspaceMember"("workspaceId");

-- CreateIndex
CREATE INDEX "WorkspaceMember_userId_idx" ON "WorkspaceMember"("userId");

-- CreateIndex
CREATE INDEX "WorkspaceMember_role_idx" ON "WorkspaceMember"("role");

-- CreateIndex
CREATE INDEX "WorkspaceMember_status_idx" ON "WorkspaceMember"("status");

-- CreateIndex
CREATE UNIQUE INDEX "WorkspaceMember_workspaceId_userId_key" ON "WorkspaceMember"("workspaceId", "userId");

-- CreateIndex
CREATE INDEX "WorkspaceRolePermission_role_idx" ON "WorkspaceRolePermission"("role");

-- CreateIndex
CREATE UNIQUE INDEX "WorkspaceRolePermission_role_permission_key" ON "WorkspaceRolePermission"("role", "permission");

-- CreateIndex
CREATE UNIQUE INDEX "WorkspaceInvite_tokenHash_key" ON "WorkspaceInvite"("tokenHash");

-- CreateIndex
CREATE INDEX "WorkspaceInvite_workspaceId_idx" ON "WorkspaceInvite"("workspaceId");

-- CreateIndex
CREATE INDEX "WorkspaceInvite_email_idx" ON "WorkspaceInvite"("email");

-- CreateIndex
CREATE INDEX "WorkspaceInvite_status_idx" ON "WorkspaceInvite"("status");

-- CreateIndex
CREATE INDEX "WorkspaceInvite_expiresAt_idx" ON "WorkspaceInvite"("expiresAt");

-- CreateIndex
CREATE INDEX "user_email_idx" ON "user"("email");

-- AddForeignKey
ALTER TABLE "Workspace" ADD CONSTRAINT "Workspace_ownerUserId_fkey" FOREIGN KEY ("ownerUserId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkspaceMember" ADD CONSTRAINT "WorkspaceMember_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkspaceMember" ADD CONSTRAINT "WorkspaceMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkspaceMember" ADD CONSTRAINT "WorkspaceMember_invitedBy_fkey" FOREIGN KEY ("invitedBy") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkspaceInvite" ADD CONSTRAINT "WorkspaceInvite_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkspaceInvite" ADD CONSTRAINT "WorkspaceInvite_invitedById_fkey" FOREIGN KEY ("invitedById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkspaceInvite" ADD CONSTRAINT "WorkspaceInvite_acceptedById_fkey" FOREIGN KEY ("acceptedById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
