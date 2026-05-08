-- AlterTable
ALTER TABLE "ShareLink" ADD COLUMN     "fileId" UUID;

-- CreateIndex
CREATE INDEX "ShareLink_fileId_idx" ON "ShareLink"("fileId");

-- AddForeignKey
ALTER TABLE "ShareLink" ADD CONSTRAINT "ShareLink_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "files"("id") ON DELETE SET NULL ON UPDATE CASCADE;
