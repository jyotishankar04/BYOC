import type { Request, Response } from "express";
import logger from "../../core/logger";
import type { IHealthService } from "./health.interface";

export class HealthController {
  constructor(private healthService: IHealthService) {}

  async check(req: Request, res: Response): Promise<void> {
    try {
      logger.info("Health check requested");
      const data = this.healthService.check();
      res.status(200).json(data);
    } catch (error) {
      logger.error({ error }, "Health check failed");
      res.status(500).json({ success: false, message: "Health check failed" });
    }
  }
}
