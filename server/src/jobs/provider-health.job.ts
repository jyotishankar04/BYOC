import { randomUUID } from "node:crypto";
import prisma from "@/config/db.config";
import { decrypt } from "@/shared/lib/crypto";
import { getProvider } from "@/shared/storage/storage.factory";
import { StorageProviderStatus, NotificationType } from "@/generated/prisma/client";
import type { DecryptedCreds } from "@/shared/storage/storage.factory";
import logger from "@/core/logger";
import { broadcast } from "@/modules/events/events.service";

export async function runProviderHealthChecks(): Promise<void> {
  logger.info("Provider health check job started");

  const providers = await prisma.storageProvider.findMany({
    where: { status: { not: StorageProviderStatus.Invalid } },
    include: { workspace: { select: { ownerId: true } } },
  });

  for (const row of providers) {
    try {
      const creds = JSON.parse(decrypt(row.encryptedCreds)) as DecryptedCreds;
      const provider = getProvider(row.providerType, creds, row.bucket, row.region ?? undefined);

      const prevStatus = row.status;
      const start = Date.now();
      const result = await provider.verifyConnection();
      const latencyMs = Date.now() - start;

      const newStatus = result.ok
        ? StorageProviderStatus.Active
        : StorageProviderStatus.Error;

      await prisma.storageProvider.update({
        where: { id: row.id },
        data: { status: newStatus, lastChecked: new Date() },
      });

      broadcast(row.workspaceId, {
        type: "provider.status",
        payload: {
          status: newStatus,
          lastChecked: new Date().toISOString(),
        },
      });

      // Notify workspace owner when status degrades to Error
      if (prevStatus !== StorageProviderStatus.Error && newStatus === StorageProviderStatus.Error) {
        const notification = await prisma.notification.create({
          data: {
            id: randomUUID(),
            workspaceId: row.workspaceId,
            userId: row.workspace.ownerId,
            type: NotificationType.STORAGE_ALERT,
            title: "Storage provider connection error",
            message: `Your storage provider could not be reached. Error: ${result.error ?? "Unknown"}`,
          },
        });

        broadcast(row.workspaceId, {
          type: "notification.new",
          payload: notification,
        });
      }

      logger.info(
        { workspaceId: row.workspaceId, status: newStatus, latencyMs },
        "Health check completed",
      );
    } catch (err) {
      logger.error({ workspaceId: row.workspaceId, err }, "Health check failed unexpectedly");
    }
  }
}
