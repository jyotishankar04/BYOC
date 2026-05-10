import type { Request, Response, NextFunction } from "express";
import { ProviderService } from "./provider.service";
import { connectProviderSchema, updateProviderSchema } from "./provider.schema";
import { enqueueSyncJob } from "@/jobs/bucket-sync.job";
import { AppError } from "@/core/errors";
import type { PrismaClient } from "@/generated/prisma/client";

export class ProviderController {
  private providerService: ProviderService;

  constructor(private prisma: PrismaClient) {
    this.providerService = new ProviderService(prisma);
  }

  getProvider = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const provider = await this.providerService.getProvider(
        req.params["workspaceId"] as string,
      );
      res.json({ provider });
    } catch (err) {
      next(err);
    }
  };

  connectProvider = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = connectProviderSchema.safeParse(req.body);
      if (!parsed.success) return next(parsed.error);

      const provider = await this.providerService.connectProvider(
        req.params["workspaceId"] as string,
        parsed.data,
      );
      res.status(201).json({ provider });
    } catch (err) {
      next(err);
    }
  };

  updateProvider = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = updateProviderSchema.safeParse(req.body);
      if (!parsed.success) return next(parsed.error);

      const provider = await this.providerService.updateProvider(
        req.params["workspaceId"] as string,
        parsed.data,
      );
      res.json({ provider });
    } catch (err) {
      next(err);
    }
  };

  disconnectProvider = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.providerService.disconnectProvider(
        req.params["workspaceId"] as string,
      );
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  };

  healthCheck = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.providerService.healthCheck(
        req.params["workspaceId"] as string,
      );
      res.json(result);
    } catch (err) {
      next(err);
    }
  };

  getSyncStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const workspaceId = req.params["workspaceId"] as string;
      const row = await this.prisma.storageProvider.findUnique({
        where: { workspaceId },
        select: {
          syncStatus: true,
          syncTotalObjects: true,
          syncCompletedObjects: true,
          lastSyncedAt: true,
        },
      });
      if (!row) throw new AppError("No provider connected", 404, "NOT_FOUND");
      res.json({
        syncStatus: row.syncStatus,
        syncTotalObjects: row.syncTotalObjects,
        syncCompletedObjects: row.syncCompletedObjects,
        lastSyncedAt: row.lastSyncedAt,
      });
    } catch (err) {
      next(err);
    }
  };

  triggerSync = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const workspaceId = req.params["workspaceId"] as string;
      const row = await this.prisma.storageProvider.findUnique({
        where: { workspaceId },
        select: { syncStatus: true },
      });
      if (!row) throw new AppError("No provider connected", 404, "NOT_FOUND");
      if (row.syncStatus === "syncing") {
        throw new AppError("Sync already in progress", 409, "SYNC_IN_PROGRESS");
      }

      await this.prisma.storageProvider.update({
        where: { workspaceId },
        data: { syncStatus: "pending" },
      });
      enqueueSyncJob(workspaceId);

      res.status(202).json({ message: "Sync enqueued" });
    } catch (err) {
      next(err);
    }
  };
}
