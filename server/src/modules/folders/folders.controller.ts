import type { Request, Response, NextFunction } from "express";
import { FolderService } from "./folders.service";
import {
  createFolderSchema,
  renameFolderSchema,
  moveFolderSchema,
} from "./folders.schema";
import type { PrismaClient } from "@/generated/prisma/client";

export class FoldersController {
  private folderService: FolderService;

  constructor(prisma: PrismaClient) {
    this.folderService = new FolderService(prisma);
  }

  listFolders = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parentId = req.query["parentId"] as string | undefined;
      const folders = await this.folderService.listFolders(
        req.params["workspaceId"] as string,
        parentId,
      );
      res.json({ folders });
    } catch (err) {
      next(err);
    }
  };

  createFolder = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = createFolderSchema.safeParse(req.body);
      if (!parsed.success) return next(parsed.error);

      const folder = await this.folderService.createFolder(
        req.params["workspaceId"] as string,
        req.userId!,
        parsed.data,
      );
      res.status(201).json({ folder });
    } catch (err) {
      next(err);
    }
  };

  renameFolder = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = renameFolderSchema.safeParse(req.body);
      if (!parsed.success) return next(parsed.error);

      const folder = await this.folderService.renameFolder(
        req.params["workspaceId"] as string,
        req.params["folderId"] as string,
        req.userId!,
        parsed.data.name,
      );
      res.json({ folder });
    } catch (err) {
      next(err);
    }
  };

  deleteFolder = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.folderService.deleteFolder(
        req.params["workspaceId"] as string,
        req.params["folderId"] as string,
        req.userId!,
      );
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  };

  moveFolder = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = moveFolderSchema.safeParse(req.body);
      if (!parsed.success) return next(parsed.error);

      const folder = await this.folderService.moveFolder(
        req.params["workspaceId"] as string,
        req.params["folderId"] as string,
        req.userId!,
        parsed.data.targetParentId,
      );
      res.json({ folder });
    } catch (err) {
      next(err);
    }
  };
}
