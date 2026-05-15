import type { Request, Response, NextFunction } from "express";
import { appSettings, type AppConfig } from "@/config/app-settings";

export function requireFeature(feature: keyof AppConfig["features"]) {
  return (_req: Request, res: Response, next: NextFunction): void => {
    if (!appSettings.getConfig().features[feature]) {
      res.status(403).json({
        error: `This feature is currently disabled`,
        code: "FEATURE_DISABLED",
        feature,
      });
      return;
    }
    next();
  };
}
