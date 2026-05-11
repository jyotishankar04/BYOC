import type { Request, Response, NextFunction } from "express";
import { UploadService } from "./upload.service";
import {
  presignSchema,
  initiateSchema,
  progressSchema,
  completeSchema,
} from "./upload.schema";
import type { PrismaClient } from "@/generated/prisma/client";

export class UploadController {
  private uploadService: UploadService;

  constructor(prisma: PrismaClient) {
    this.uploadService = new UploadService(prisma);
  }

  presignSmallFile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = presignSchema.safeParse(req.body);
      if (!parsed.success) return next(parsed.error);
      const result = await this.uploadService.presignSmallFile(
        req.params["workspaceId"] as string,
        req.userId!,
        parsed.data,
      );
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  };

  initiateMultipart = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = initiateSchema.safeParse(req.body);
      if (!parsed.success) return next(parsed.error);
      const sessions = await this.uploadService.initiateMultipart(
        req.params["workspaceId"] as string,
        req.userId!,
        parsed.data.files,
      );
      res.status(201).json({ sessions });
    } catch (err) {
      next(err);
    }
  };

  confirmSmallFile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const file = await this.uploadService.confirmSmallFile(
        req.params["workspaceId"] as string,
        req.userId!,
        req.params["fileId"] as string,
      );
      res.json({ file });
    } catch (err) {
      next(err);
    }
  };

  getSession = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const session = await this.uploadService.getSession(
        req.params["workspaceId"] as string,
        req.params["sessionId"] as string,
      );
      res.json({ session });
    } catch (err) {
      next(err);
    }
  };

  updateProgress = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = progressSchema.safeParse(req.body);
      if (!parsed.success) return next(parsed.error);
      await this.uploadService.updateProgress(
        req.params["workspaceId"] as string,
        req.params["sessionId"] as string,
        req.userId!,
        parsed.data.completedParts,
      );
      res.json({ ok: true });
    } catch (err) {
      next(err);
    }
  };

  completeSession = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = completeSchema.safeParse(req.body);
      if (!parsed.success) return next(parsed.error);
      const file = await this.uploadService.completeSession(
        req.params["workspaceId"] as string,
        req.params["sessionId"] as string,
        req.userId!,
        parsed.data.parts,
      );
      res.json({ file });
    } catch (err) {
      next(err);
    }
  };

  abortSession = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.uploadService.abortSession(
        req.params["workspaceId"] as string,
        req.params["sessionId"] as string,
        req.userId!,
      );
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  };

  refreshUrls = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.uploadService.refreshUrls(
        req.params["workspaceId"] as string,
        req.params["sessionId"] as string,
        req.userId!,
      );
      res.json(result);
    } catch (err) {
      next(err);
    }
  };
}
