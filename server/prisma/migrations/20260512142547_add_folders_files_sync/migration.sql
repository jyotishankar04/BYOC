-- AlterTable
ALTER TABLE "StorageProvider" ADD COLUMN     "lastSyncedAt" TIMESTAMP(3),
ADD COLUMN     "syncCompletedObjects" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "syncStatus" VARCHAR(20) NOT NULL DEFAULT 'idle',
ADD COLUMN     "syncTotalObjects" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "folders" (
    "id" UUID NOT NULL,
    "workspaceId" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "path" TEXT NOT NULL,
    "parentId" UUID,
    "source" VARCHAR(20) NOT NULL DEFAULT 'byoc',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "folders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "files" (
    "id" UUID NOT NULL,
    "workspaceId" UUID NOT NULL,
    "folderId" UUID,
    "name" VARCHAR(255) NOT NULL,
    "extension" VARCHAR(20),
    "storagePath" VARCHAR(1000) NOT NULL,
    "size" INTEGER NOT NULL DEFAULT 0,
    "mimeType" VARCHAR(100),
    "kind" "FileKind" NOT NULL DEFAULT 'other',
    "status" "FileStatus" NOT NULL DEFAULT 'uploading',
    "source" VARCHAR(20) NOT NULL DEFAULT 'byoc',
    "uploadedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "files_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "folders_workspaceId_idx" ON "folders"("workspaceId");

-- CreateIndex
CREATE INDEX "folders_parentId_idx" ON "folders"("parentId");

-- CreateIndex
CREATE UNIQUE INDEX "folders_workspaceId_path_key" ON "folders"("workspaceId", "path");

-- CreateIndex
CREATE INDEX "files_workspaceId_idx" ON "files"("workspaceId");

-- CreateIndex
CREATE INDEX "files_folderId_idx" ON "files"("folderId");

-- CreateIndex
CREATE UNIQUE INDEX "files_workspaceId_storagePath_key" ON "files"("workspaceId", "storagePath");

-- AddForeignKey
ALTER TABLE "folders" ADD CONSTRAINT "folders_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "folders" ADD CONSTRAINT "folders_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "folders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "files" ADD CONSTRAINT "files_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "files" ADD CONSTRAINT "files_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "folders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "files" ADD CONSTRAINT "files_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
