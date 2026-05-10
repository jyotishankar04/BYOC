import type { Request, Response, NextFunction } from "express";
import type { IWorkspaceService } from "./workspace.interface";
import {
  createWorkspaceSchema,
  updateWorkspaceSchema,
  transferSchema,
  updatePermissionsSchema,
  updateSecuritySchema,
} from "./workspace.schema";

export class WorkspaceController {
  constructor(private workspaceService: IWorkspaceService) {}

  list = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const workspaces = await this.workspaceService.listWorkspaces(
        req.userId!,
      );
      res.json({ workspaces });
    } catch (err) {
      next(err);
    }
  };

  create = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const parsed = createWorkspaceSchema.safeParse(req.body);
      if (!parsed.success) return next(parsed.error);

      const workspace = await this.workspaceService.createWorkspace(
        req.userId!,
        parsed.data,
      );
      res.status(201).json({ workspace });
    } catch (err) {
      next(err);
    }
  };

  get = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const workspace = await this.workspaceService.getWorkspace(
        req.workspaceId!,
      );
      res.json({ workspace });
    } catch (err) {
      next(err);
    }
  };

  update = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const parsed = updateWorkspaceSchema.safeParse(req.body);
      if (!parsed.success) return next(parsed.error);

      const workspace = await this.workspaceService.updateWorkspace(
        req.workspaceId!,
        parsed.data,
      );
      res.json({ workspace });
    } catch (err) {
      next(err);
    }
  };

  delete = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      await this.workspaceService.deleteWorkspace(
        req.workspaceId!,
        req.userId!,
      );
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  };

  transfer = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const parsed = transferSchema.safeParse(req.body);
      if (!parsed.success) return next(parsed.error);

      await this.workspaceService.transferOwnership(
        req.workspaceId!,
        req.userId!,
        parsed.data,
      );
      res.json({ message: "Ownership transferred successfully" });
    } catch (err) {
      next(err);
    }
  };

  updatePermissions = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const parsed = updatePermissionsSchema.safeParse(req.body);
      if (!parsed.success) return next(parsed.error);

      const permissions = await this.workspaceService.updatePermissions(
        req.workspaceId!,
        req.userId!,
        parsed.data,
      );
      res.json({ permissions });
    } catch (err) {
      next(err);
    }
  };

  updateSecurity = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const parsed = updateSecuritySchema.safeParse(req.body);
      if (!parsed.success) return next(parsed.error);

      const security = await this.workspaceService.updateSecurity(
        req.workspaceId!,
        req.userId!,
        parsed.data,
      );
      res.json({ security });
    } catch (err) {
      next(err);
    }
  };
}
