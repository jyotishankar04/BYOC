import type { Request, Response, NextFunction } from "express";
import { appSettings, type AppConfig } from "@/config/app-settings";

export class AdminSettingsController {
  getSettings = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      res.json({ settings: appSettings.getConfig() });
    } catch (err) {
      next(err);
    }
  };

  updateSettings = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const patch = req.body as Partial<AppConfig>;
      await appSettings.updateConfig(patch);
      res.json({ settings: appSettings.getConfig() });
    } catch (err) {
      next(err);
    }
  };
}

export class PublicConfigController {
  getConfig = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const config = appSettings.getConfig();
      res.json({
        betaMode: config.betaMode,
        maintenanceMode: config.maintenanceMode,
        signupsEnabled: config.signupsEnabled,
        providers: config.providers,
        features: config.features,
        allowedFileTypes: config.allowedFileTypes,
      });
    } catch (err) {
      next(err);
    }
  };
}
