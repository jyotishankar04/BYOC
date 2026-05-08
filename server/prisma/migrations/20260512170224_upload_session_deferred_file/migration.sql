/*
  Warnings:

  - Added the required column `fileName` to the `upload_sessions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `mimeType` to the `upload_sessions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `originalSize` to the `upload_sessions` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "upload_sessions" DROP CONSTRAINT "upload_sessions_fileId_fkey";

-- DropIndex
DROP INDEX "upload_sessions_fileId_idx";

-- AlterTable
ALTER TABLE "upload_sessions" ADD COLUMN     "fileName" VARCHAR(500) NOT NULL,
ADD COLUMN     "folderId" VARCHAR(36),
ADD COLUMN     "mimeType" VARCHAR(200) NOT NULL,
ADD COLUMN     "originalSize" INTEGER NOT NULL,
ALTER COLUMN "fileId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "upload_sessions" ADD CONSTRAINT "upload_sessions_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "files"("id") ON DELETE SET NULL ON UPDATE CASCADE;
