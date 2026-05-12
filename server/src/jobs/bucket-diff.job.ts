import { randomUUID } from "node:crypto";
import mime from "mime-types";
import prisma from "@/config/db.config";
import { decrypt } from "@/shared/lib/crypto";
import { getProvider } from "@/shared/storage/storage.factory";
import { FileKind } from "@/generated/prisma/client";
import type { DecryptedCreds } from "@/shared/storage/storage.factory";
import logger from "@/core/logger";

function inferKind(mimeType: string): FileKind {
  if (mimeType.startsWith("image/")) return FileKind.image;
  if (mimeType.startsWith("video/")) return FileKind.video;
  if (mimeType.startsWith("audio/")) return FileKind.audio;
  if (
    mimeType.startsWith("text/") ||
    mimeType === "application/pdf" ||
    mimeType.includes("document") ||
    mimeType.includes("spreadsheet") ||
    mimeType.includes("presentation")
  )
    return FileKind.document;
  if (
    [
      "application/zip",
      "application/x-tar",
      "application/gzip",
      "application/x-bzip2",
      "application/x-7z-compressed",
      "application/x-rar-compressed",
    ].includes(mimeType)
  )
    return FileKind.archive;
  return FileKind.other;
}

export async function runBucketDiff(): Promise<void> {
  logger.info("Bucket diff job started");

  const providers = await prisma.storageProvider.findMany({
    where: { syncStatus: "completed" },
    include: { workspace: { select: { ownerId: true } } },
  });

  for (const row of providers) {
    try {
      const creds = JSON.parse(decrypt(row.encryptedCreds)) as DecryptedCreds;
      const provider = getProvider(row.providerType, creds, row.bucket, row.region ?? undefined);
      const workspaceId = row.workspaceId;

      // Collect all known storage paths from DB (status = uploaded/ready)
      const dbFiles = await prisma.file.findMany({
        where: { workspaceId, status: "uploaded" },
        select: { id: true, storagePath: true },
      });
      const dbPathMap = new Map(dbFiles.map((f) => [f.storagePath, f.id]));

      // Paginate through S3 and build a set of all current keys
      const s3Keys = new Set<string>();
      let continuationToken: string | undefined;

      do {
        const result = await provider.listObjects("", continuationToken);
        for (const obj of result.objects) {
          if (!obj.key.endsWith("/")) s3Keys.add(obj.key);
        }
        continuationToken = result.nextContinuationToken;
        if (!result.isTruncated) break;
      } while (continuationToken);

      // DB keys not in S3 → mark deleted (user deleted directly from S3)
      const removedIds: string[] = [];
      for (const [path, id] of dbPathMap) {
        if (!s3Keys.has(path)) removedIds.push(id);
      }
      if (removedIds.length > 0) {
        await prisma.file.updateMany({
          where: { id: { in: removedIds } },
          data: { status: "deleted" },
        });
        logger.info({ workspaceId, count: removedIds.length }, "Diff: marked files as deleted");
      }

      // S3 keys not in DB → insert new file records (user added directly to S3)
      const workspace = row.workspace;
      for (const key of s3Keys) {
        if (!dbPathMap.has(key)) {
          const segments = key.split("/");
          const fileName = segments[segments.length - 1]!;
          const mimeType =
            (mime.lookup(fileName) as string | false) || "application/octet-stream";
          const extension = fileName.includes(".") ? fileName.split(".").pop()! : undefined;

          await prisma.file.upsert({
            where: { workspaceId_storagePath: { workspaceId, storagePath: key } },
            create: {
              id: randomUUID(),
              workspaceId,
              name: fileName,
              extension: extension ?? null,
              storagePath: key,
              size: 0,
              mimeType,
              kind: inferKind(mimeType),
              status: "uploaded",
              source: "s3_import",
              uploadedById: workspace.ownerId,
            },
            update: {},
          });
        }
      }

      logger.info({ workspaceId }, "Bucket diff completed");
    } catch (err) {
      logger.error({ workspaceId: row.workspaceId, err }, "Bucket diff failed for workspace");
    }
  }
}
