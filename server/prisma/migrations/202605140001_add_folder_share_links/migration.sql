ALTER TABLE "ShareLink"
ADD COLUMN "folderId" UUID NULL;

ALTER TABLE "ShareLink"
ADD CONSTRAINT "ShareLink_folderId_fkey"
FOREIGN KEY ("folderId") REFERENCES "folders"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "ShareLink_folderId_idx" ON "ShareLink"("folderId");
