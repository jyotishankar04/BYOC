import type { IHealthService } from "./health.interface";

export class HealthService implements IHealthService {
  check(): {
    success: boolean;
    timestamp: string;
    uptime: number;
    environment: string;
  } {
    return {
      success: true,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || "development",
    };
  }
}
