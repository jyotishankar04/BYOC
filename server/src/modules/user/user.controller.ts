import type { Request, Response, NextFunction } from "express";
import type { IUserService } from "./user.interface";
import { updateProfileSchema, updatePreferencesSchema } from "./user.schema";

export class UserController {
  constructor(private userService: IUserService) {}

  getProfile = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const user = await this.userService.getProfile(req.userId!);
      res.json({ user });
    } catch (err) {
      next(err);
    }
  };

  updateProfile = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const parsed = updateProfileSchema.safeParse(req.body);
      if (!parsed.success) return next(parsed.error);

      const user = await this.userService.updateProfile(
        req.userId!,
        parsed.data,
      );
      res.json({ user });
    } catch (err) {
      next(err);
    }
  };

  getPreferences = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const preferences = await this.userService.getPreferences(req.userId!);
      res.json({ preferences });
    } catch (err) {
      next(err);
    }
  };

  updatePreferences = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const parsed = updatePreferencesSchema.safeParse(req.body);
      if (!parsed.success) return next(parsed.error);

      const preferences = await this.userService.updatePreferences(
        req.userId!,
        parsed.data,
      );
      res.json({ preferences });
    } catch (err) {
      next(err);
    }
  };

  presignAvatarUpload = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { contentType } = req.body as { contentType?: string };
      if (!contentType) {
        res.status(400).json({ message: "contentType is required" });
        return;
      }
      const result = await this.userService.presignAvatarUpload(req.userId!, contentType);
      res.json(result);
    } catch (err) {
      next(err);
    }
  };

  confirmAvatarUpload = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { key } = req.body as { key?: string };
      if (!key) {
        res.status(400).json({ message: "key is required" });
        return;
      }
      const avatarUrl = await this.userService.confirmAvatarUpload(req.userId!, key);
      res.json({ avatarUrl });
    } catch (err) {
      next(err);
    }
  };

  listMyInvites = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const invites = await this.userService.listMyInvites(req.userId!);
      res.json({ invites });
    } catch (err) {
      next(err);
    }
  };

  listAccounts = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const accounts = await this.userService.listAccounts(req.userId!);
      res.json({ accounts });
    } catch (err) {
      next(err);
    }
  };

  listSessions = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const sessions = await this.userService.listSessions(
        req.userId!,
        req.sessionId!,
      );
      res.json({ sessions });
    } catch (err) {
      next(err);
    }
  };

  revokeSession = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      await this.userService.revokeSession(
        req.userId!,
        req.params["sessionId"] as string,
      );
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  };

  revokeOtherSessions = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      await this.userService.revokeOtherSessions(req.userId!, req.sessionId!);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  };
}
