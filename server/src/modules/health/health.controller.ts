import type { Request, Response } from "express";
import logger from "../../core/logger";
import type { IHealthService } from "./health.interface";

export class HealthController {
  constructor(private healthService: IHealthService) {}

  async check(_req: Request, res: Response): Promise<void> {
    try {
      const data = this.healthService.check();
      res.status(200).json(data);
    } catch (error) {
      logger.error({ error }, "Health check failed");
      res.status(500).json({ success: false, message: "Health check failed" });
    }
  }

  async ready(_req: Request, res: Response): Promise<void> {
    try {
      const data = await this.healthService.ready();
      res.status(data.success ? 200 : 503).json(data);
    } catch (error) {
      logger.error({ error }, "Readiness check failed");
      res.status(503).json({ success: false, checks: { database: false, redis: false } });
    }
  }
}
