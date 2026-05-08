/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `ShareLink` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `slug` to the `ShareLink` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ShareLink" ADD COLUMN     "allowDownload" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "passwordHash" VARCHAR(255),
ADD COLUMN     "slug" VARCHAR(50) NOT NULL,
ADD COLUMN     "visits" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "ShareLinkVisit" (
    "id" UUID NOT NULL,
    "shareLinkId" UUID NOT NULL,
    "ipAddress" VARCHAR(45),
    "userAgent" TEXT,
    "visitedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ShareLinkVisit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ShareLinkVisit_shareLinkId_idx" ON "ShareLinkVisit"("shareLinkId");

-- CreateIndex
CREATE UNIQUE INDEX "ShareLink_slug_key" ON "ShareLink"("slug");

-- AddForeignKey
ALTER TABLE "ShareLinkVisit" ADD CONSTRAINT "ShareLinkVisit_shareLinkId_fkey" FOREIGN KEY ("shareLinkId") REFERENCES "ShareLink"("id") ON DELETE CASCADE ON UPDATE CASCADE;
