export interface IHealthService {
  check(): {
    success: boolean;
    timestamp: string;
    uptime: number;
    environment: string;
  };
  ready(): Promise<{
    success: boolean;
    checks: { database: boolean; redis: boolean };
  }>;
}
