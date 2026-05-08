-- CreateTable
CREATE TABLE "upload_sessions" (
    "id" UUID NOT NULL,
    "workspaceId" UUID NOT NULL,
    "fileId" UUID NOT NULL,
    "uploadedById" TEXT NOT NULL,
    "providerUploadId" VARCHAR(500) NOT NULL,
    "storagePath" VARCHAR(1000) NOT NULL,
    "totalChunks" INTEGER NOT NULL,
    "completedChunks" JSONB NOT NULL DEFAULT '[]',
    "status" "UploadSessionStatus" NOT NULL DEFAULT 'pending',
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "upload_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "upload_sessions_workspaceId_idx" ON "upload_sessions"("workspaceId");

-- CreateIndex
CREATE INDEX "upload_sessions_fileId_idx" ON "upload_sessions"("fileId");

-- AddForeignKey
ALTER TABLE "upload_sessions" ADD CONSTRAINT "upload_sessions_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "upload_sessions" ADD CONSTRAINT "upload_sessions_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "files"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "upload_sessions" ADD CONSTRAINT "upload_sessions_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
