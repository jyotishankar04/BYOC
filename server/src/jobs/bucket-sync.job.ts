import { randomUUID } from "node:crypto";
import mime from "mime-types";
import { Prisma } from "@/generated/prisma/client";
import prisma from "@/config/db.config";
import redis from "@/config/redis.config";
import { decrypt } from "@/shared/lib/crypto";
import { getProvider } from "@/shared/storage/storage.factory";
import { FileKind } from "@/generated/prisma/client";
import type { DecryptedCreds } from "@/shared/storage/storage.factory";
import logger from "@/core/logger";
import { broadcast } from "@/modules/events/events.service";

const PAGE_SIZE = 1000;
const SYNC_TOKEN_KEY = (workspaceId: string) => `sync:${workspaceId}:token`;

// ─── Helpers ──────────────────────────────────────────────────────────────────

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

// Build a map of every unique folder path across both regular file keys and
// directory marker keys (keys ending in "/"), keyed by path.
//
// For directory markers we append a dummy segment so the marker's own path is
// treated as a folder prefix — this handles empty folders created by other
// accounts or tools that share the same bucket.
function collectFolderPaths(
  fileKeys: string[],
  dirMarkerKeys: string[],
): Map<string, { name: string; parentPath: string | null; depth: number }> {
  const paths = new Map<
    string,
    { name: string; parentPath: string | null; depth: number }
  >();

  // Use a single loop for both kinds: dir markers get a dummy filename appended
  // so that the marker path itself is included as a folder prefix segment.
  const allKeys = [
    ...fileKeys,
    ...dirMarkerKeys.filter((k) => k !== "/").map((k) => `${k}__dir__`),
  ];

  for (const key of allKeys) {
    const segments = key.split("/");
    segments.pop(); // strip filename (or __dir__ sentinel)

    for (let i = 0; i < segments.length; i++) {
      const path = segments.slice(0, i + 1).join("/") + "/";
      if (!paths.has(path)) {
        paths.set(path, {
          name: segments[i]!,
          parentPath: i === 0 ? null : segments.slice(0, i).join("/") + "/",
          depth: i + 1,
        });
      }
    }
  }

  return paths;
}

// Bulk-upsert all folders for a page, depth-level by depth-level, and return
// the resolved path→id map (both new and pre-existing folders).
//
// Strategy per depth level:
//   INSERT ... ON CONFLICT (workspaceId, path) DO UPDATE SET updatedAt = updatedAt
//   RETURNING id, path
//
// The no-op DO UPDATE ensures conflicting rows are included in RETURNING, giving
// us the actual DB id regardless of whether the row was just inserted or already
// existed. Parents are resolved before children so FK constraints are always met.
async function bulkUpsertFolders(
  workspaceId: string,
  pathMap: Map<string, { name: string; parentPath: string | null; depth: number }>,
  folderCache: Map<string, string>,
): Promise<void> {
  // Only process paths not already in cache
  const toInsert = [...pathMap.entries()].filter(([p]) => !folderCache.has(p));
  if (toInsert.length === 0) return;

  // Pre-assign UUIDs (used for new rows; existing rows return their real id)
  const preAssigned = new Map(toInsert.map(([path]) => [path, randomUUID()]));

  const maxDepth = Math.max(...toInsert.map(([, v]) => v.depth));

  for (let depth = 1; depth <= maxDepth; depth++) {
    const atDepth = toInsert.filter(([, v]) => v.depth === depth);
    if (atDepth.length === 0) continue;

    const rows = atDepth.map(([path, { name, parentPath }]) => {
      const id = preAssigned.get(path)!;
      // Parent ID comes from cache (populated by previous depth levels)
      const parentId = parentPath ? (folderCache.get(parentPath) ?? null) : null;
      return { id, name, path, parentId };
    });

    const values = rows.map((r) =>
      Prisma.sql`(
        ${r.id}::uuid,
        ${workspaceId}::uuid,
        ${r.name},
        ${r.path},
        ${r.parentId}::uuid,
        ${"s3_import"},
        NOW(),
        NOW()
      )`,
    );

    const returned = await prisma.$queryRaw<{ id: string; path: string }[]>`
      INSERT INTO folders
        (id, "workspaceId", name, path, "parentId", source, "createdAt", "updatedAt")
      VALUES ${Prisma.join(values)}
      ON CONFLICT ("workspaceId", path)
      DO UPDATE SET "updatedAt" = folders."updatedAt"
      RETURNING id, path
    `;

    for (const row of returned) {
      folderCache.set(row.path, row.id);
    }
  }
}

// Bulk-insert a page of file rows. Existing rows (same workspaceId+storagePath)
// are skipped silently — idempotent so re-runs are safe.
async function bulkInsertFiles(
  workspaceId: string,
  ownerId: string,
  fileRows: Array<{
    key: string;
    fileName: string;
    extension: string | null;
    size: number;
    mimeType: string;
    kind: FileKind;
    folderId: string | null;
  }>,
): Promise<void> {
  if (fileRows.length === 0) return;

  const values = fileRows.map((r) =>
    Prisma.sql`(
      ${randomUUID()}::uuid,
      ${workspaceId}::uuid,
      ${r.folderId}::uuid,
      ${r.fileName},
      ${r.extension},
      ${r.key},
      ${r.size}::int,
      ${r.mimeType},
      ${r.kind}::"FileKind",
      ${"uploaded"}::"FileStatus",
      ${"s3_import"},
      ${ownerId},
      NOW(),
      NOW()
    )`,
  );

  await prisma.$executeRaw`
    INSERT INTO files
      (id, "workspaceId", "folderId", name, extension, "storagePath",
       size, "mimeType", kind, status, source, "uploadedById", "createdAt", "updatedAt")
    VALUES ${Prisma.join(values)}
    ON CONFLICT ("workspaceId", "storagePath") DO NOTHING
  `;
}

// ─── Main sync ────────────────────────────────────────────────────────────────

export async function runBucketSync(workspaceId: string): Promise<void> {
  logger.info({ workspaceId }, "Bucket sync started");

  await prisma.storageProvider.update({
    where: { workspaceId },
    data: { syncStatus: "syncing", syncTotalObjects: 0, syncCompletedObjects: 0 },
  });

  broadcast(workspaceId, {
    type: "sync.progress",
    payload: { completed: 0, total: 0, status: "syncing" },
  });

  try {
    const row = await prisma.storageProvider.findUnique({ where: { workspaceId } });
    if (!row) throw new Error("No storage provider configured");

    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      select: { ownerId: true },
    });
    if (!workspace) throw new Error("Workspace not found");

    const creds = JSON.parse(decrypt(row.encryptedCreds)) as DecryptedCreds;
    const provider = getProvider(row.providerType, creds, row.bucket, row.region ?? undefined);

    let continuationToken: string | undefined =
      (await redis.get(SYNC_TOKEN_KEY(workspaceId))) ?? undefined;

    // folderCache persists across pages — avoids re-querying the same paths
    const folderCache = new Map<string, string>();
    let totalProcessed = 0;

    while (true) {
      const result = await provider.listObjects("", continuationToken, PAGE_SIZE);

      const dirMarkers  = result.objects.filter((o) => o.key.endsWith("/"));
      const realObjects = result.objects.filter((o) => !o.key.endsWith("/"));

      if (realObjects.length > 0 || dirMarkers.length > 0) {
        // ── 1. Resolve all folder paths for this page in bulk ──────────────
        // Dir markers represent empty folders created by other tools/accounts
        // sharing the same bucket — include them so they appear in the UI.
        const pathMap = collectFolderPaths(
          realObjects.map((o) => o.key),
          dirMarkers.map((o) => o.key),
        );
        await bulkUpsertFolders(workspaceId, pathMap, folderCache);

        // ── 2. Build file rows with resolved folder IDs ────────────────────
        const fileRows = realObjects.map((obj) => {
          const segments = obj.key.split("/");
          const fileName = segments.pop()!;
          const extension = fileName.includes(".")
            ? fileName.split(".").pop()!
            : null;
          const mimeType =
            (mime.lookup(fileName) as string | false) || "application/octet-stream";
          const folderPath = segments.length > 0 ? segments.join("/") + "/" : null;
          const folderId = folderPath ? (folderCache.get(folderPath) ?? null) : null;

          return {
            key: obj.key,
            fileName,
            extension,
            size: obj.size,
            mimeType,
            kind: inferKind(mimeType),
            folderId,
          };
        });

        // ── 3. Bulk insert files ────────────────────────────────────────────
        await bulkInsertFiles(workspaceId, workspace.ownerId, fileRows);

        totalProcessed += realObjects.length;

        await prisma.storageProvider.update({
          where: { workspaceId },
          data: { syncCompletedObjects: totalProcessed },
        });

        broadcast(workspaceId, {
          type: "sync.progress",
          payload: {
            completed: totalProcessed,
            total: totalProcessed,
            status: "syncing",
          },
        });

        logger.debug({ workspaceId, totalProcessed }, "Page synced");
      }

      if (result.nextContinuationToken) {
        await redis.set(
          SYNC_TOKEN_KEY(workspaceId),
          result.nextContinuationToken,
          "EX",
          60 * 60 * 24,
        );
      }

      if (!result.isTruncated) break;
      continuationToken = result.nextContinuationToken;
    }

    await redis.del(SYNC_TOKEN_KEY(workspaceId));

    await prisma.storageProvider.update({
      where: { workspaceId },
      data: {
        syncStatus: "completed",
        syncTotalObjects: totalProcessed,
        syncCompletedObjects: totalProcessed,
        lastSyncedAt: new Date(),
      },
    });

    broadcast(workspaceId, {
      type: "sync.progress",
      payload: {
        completed: totalProcessed,
        total: totalProcessed,
        status: "completed",
      },
    });

    logger.info({ workspaceId, totalProcessed }, "Bucket sync completed");
  } catch (err) {
    logger.error({ workspaceId, err }, "Bucket sync failed");
    await prisma.storageProvider
      .update({ where: { workspaceId }, data: { syncStatus: "failed" } })
      .catch(() => {});
    broadcast(workspaceId, {
      type: "sync.progress",
      payload: { completed: 0, total: 0, status: "failed" },
    });
  }
}

export function enqueueSyncJob(workspaceId: string): void {
  setImmediate(() => {
    runBucketSync(workspaceId).catch((err) =>
      logger.error({ workspaceId, err }, "enqueueSyncJob: unhandled error"),
    );
  });
}
