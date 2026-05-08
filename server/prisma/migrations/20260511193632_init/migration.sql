/*
  Warnings:

  - You are about to drop the column `deletedAt` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `user` table. All the data in the column will be lost.
  - You are about to drop the `Workspace` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `WorkspaceInvite` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `WorkspaceMember` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `WorkspaceRolePermission` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `session` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `verification` table. If the table is not empty, all the data it contains will be lost.
  - Made the column `name` on table `user` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Workspace" DROP CONSTRAINT "Workspace_ownerUserId_fkey";

-- DropForeignKey
ALTER TABLE "WorkspaceInvite" DROP CONSTRAINT "WorkspaceInvite_acceptedById_fkey";

-- DropForeignKey
ALTER TABLE "WorkspaceInvite" DROP CONSTRAINT "WorkspaceInvite_invitedById_fkey";

-- DropForeignKey
ALTER TABLE "WorkspaceInvite" DROP CONSTRAINT "WorkspaceInvite_workspaceId_fkey";

-- DropForeignKey
ALTER TABLE "WorkspaceMember" DROP CONSTRAINT "WorkspaceMember_invitedBy_fkey";

-- DropForeignKey
ALTER TABLE "WorkspaceMember" DROP CONSTRAINT "WorkspaceMember_userId_fkey";

-- DropForeignKey
ALTER TABLE "WorkspaceMember" DROP CONSTRAINT "WorkspaceMember_workspaceId_fkey";

-- DropForeignKey
ALTER TABLE "session" DROP CONSTRAINT "session_userId_fkey";

-- DropIndex
DROP INDEX "account_providerId_idx";

-- DropIndex
DROP INDEX "user_deletedAt_idx";

-- DropIndex
DROP INDEX "user_email_idx";

-- DropIndex
DROP INDEX "user_status_idx";

-- AlterTable
ALTER TABLE "user" DROP COLUMN "deletedAt",
DROP COLUMN "status",
ADD COLUMN     "avatar" TEXT,
ADD COLUMN     "bio" TEXT,
ADD COLUMN     "location" TEXT,
ADD COLUMN     "onboarded" BOOLEAN DEFAULT false,
ADD COLUMN     "username" TEXT,
ADD COLUMN     "website" TEXT,
ALTER COLUMN "name" SET NOT NULL;

-- DropTable
DROP TABLE "Workspace";

-- DropTable
DROP TABLE "WorkspaceInvite";

-- DropTable
DROP TABLE "WorkspaceMember";

-- DropTable
DROP TABLE "WorkspaceRolePermission";

-- DropTable
DROP TABLE "session";

-- DropTable
DROP TABLE "verification";

-- DropEnum
DROP TYPE "AlertSeverity";

-- DropEnum
DROP TYPE "AlertStatus";

-- DropEnum
DROP TYPE "AlertType";

-- DropEnum
DROP TYPE "ApiKeyStatus";

-- DropEnum
DROP TYPE "AuditActorType";

-- DropEnum
DROP TYPE "BillingCycle";

-- DropEnum
DROP TYPE "ConfidenceLevel";

-- DropEnum
DROP TYPE "DeploymentMode";

-- DropEnum
DROP TYPE "EstimateType";

-- DropEnum
DROP TYPE "FileEntryType";

-- DropEnum
DROP TYPE "OptimizationSeverity";

-- DropEnum
DROP TYPE "OptimizationStatus";

-- DropEnum
DROP TYPE "OptimizationType";

-- DropEnum
DROP TYPE "PaymentStatus";

-- DropEnum
DROP TYPE "PlanType";

-- DropEnum
DROP TYPE "ProviderStatus";

-- DropEnum
DROP TYPE "ProviderType";

-- DropEnum
DROP TYPE "SecretStatus";

-- DropEnum
DROP TYPE "ShareStatus";

-- DropEnum
DROP TYPE "ShareType";

-- DropEnum
DROP TYPE "StorageOperationType";

-- DropEnum
DROP TYPE "SubscriptionStatus";

-- DropEnum
DROP TYPE "TransferJobStatus";

-- DropEnum
DROP TYPE "UserStatus";

-- DropEnum
DROP TYPE "WebhookDeliveryStatus";

-- DropEnum
DROP TYPE "WebhookEventType";

-- DropEnum
DROP TYPE "WebhookStatus";

-- DropEnum
DROP TYPE "WorkspaceInviteStatus";

-- DropEnum
DROP TYPE "WorkspaceMemberStatus";

-- DropEnum
DROP TYPE "WorkspacePermission";

-- DropEnum
DROP TYPE "WorkspaceRole";

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "token" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Verification" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Verification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Session_token_key" ON "Session"("token");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- CreateIndex
CREATE INDEX "Verification_identifier_idx" ON "Verification"("identifier");

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
