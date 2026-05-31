import type { Request, Response, NextFunction } from "express";
import { FilesService } from "./files.service";
import { AppError } from "@/core/errors";
import {
  listFilesQuerySchema,
  renameFileSchema,
  moveFileSchema,
} from "./files.schema";
import type { PrismaClient } from "@/generated/prisma/client";

export class FilesController {
  private filesService: FilesService;

  constructor(prisma: PrismaClient) {
    this.filesService = new FilesService(prisma);
  }

  listFiles = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = listFilesQuerySchema.safeParse(req.query);
      if (!parsed.success) return next(parsed.error);

      const result = await this.filesService.listFiles(
        req.params["workspaceId"] as string,
        parsed.data,
      );
      res.json(result);
    } catch (err) {
      next(err);
    }
  };

  getFile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const file = await this.filesService.getFile(
        req.params["workspaceId"] as string,
        req.params["fileId"] as string,
      );
      res.json({ file });
    } catch (err) {
      next(err);
    }
  };

  getBatchPreviewUrls = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const fileIds = req.body?.fileIds;
      if (!Array.isArray(fileIds)) { next(new AppError("fileIds must be an array", 400, "VALIDATION_ERROR")); return; }
      const result = await this.filesService.getBatchPreviewUrls(
        req.params["workspaceId"] as string,
        fileIds as string[],
      );
      res.set("Cache-Control", "private, max-age=3000");
      res.json(result);
    } catch (err) {
      next(err);
    }
  };

  getPreviewUrl = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const url = await this.filesService.getPreviewUrl(
        req.params["workspaceId"] as string,
        req.params["fileId"] as string,
      );
      res.set("Cache-Control", "private, max-age=3000");
      res.json({ url, expiresIn: 3600 });
    } catch (err) {
      next(err);
    }
  };

  getDownloadUrl = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const url = await this.filesService.getDownloadUrl(
        req.params["workspaceId"] as string,
        req.params["fileId"] as string,
      );
      res.set("Cache-Control", "private, max-age=240");
      res.json({ url, expiresIn: 300 });
    } catch (err) {
      next(err);
    }
  };

  getThumbnail = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const size = (req.query["size"] as string) || "sm";
      if (!["sm", "md", "lg"].includes(size)) {
        next(new AppError("size must be sm, md, or lg", 400, "VALIDATION_ERROR"));
        return;
      }
      const url = await this.filesService.getThumbnailUrl(
        req.params["workspaceId"] as string,
        req.params["fileId"] as string,
        size as "sm" | "md" | "lg",
      );
      res.set("Cache-Control", "private, max-age=3000");
      res.json({ url, expiresIn: 3600 });
    } catch (err) {
      next(err);
    }
  };

  renameFile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = renameFileSchema.safeParse(req.body);
      if (!parsed.success) return next(parsed.error);

      const file = await this.filesService.renameFile(
        req.params["workspaceId"] as string,
        req.params["fileId"] as string,
        parsed.data,
      );
      res.json({ file });
    } catch (err) {
      next(err);
    }
  };

  moveFile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = moveFileSchema.safeParse(req.body);
      if (!parsed.success) return next(parsed.error);

      const file = await this.filesService.moveFile(
        req.params["workspaceId"] as string,
        req.params["fileId"] as string,
        parsed.data,
      );
      res.json({ file });
    } catch (err) {
      next(err);
    }
  };

  deleteFile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.filesService.deleteFile(
        req.params["workspaceId"] as string,
        req.params["fileId"] as string,
        req.userId!,
      );
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  };
}
