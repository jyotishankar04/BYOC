import type { Request, Response, NextFunction } from "express";
import { appSettings } from "@/config/app-settings";

const EXEMPT_PREFIXES = [
  "/api/v1/config",
  "/api/v1/auth",
  "/api/v1/admin",
  "/api/v1/blogs",
  "/s/",
];

export function maintenanceModeMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  if (!appSettings.getConfig().maintenanceMode) {
    next();
    return;
  }
  const path = req.path;
  if (EXEMPT_PREFIXES.some((prefix) => path.startsWith(prefix))) {
    next();
    return;
  }
  res.status(503).json({
    error: "Service temporarily unavailable",
    code: "MAINTENANCE_MODE",
    message: "The platform is currently under maintenance. Please check back soon.",
  });
}
