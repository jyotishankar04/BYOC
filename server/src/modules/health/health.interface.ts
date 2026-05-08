export interface IHealthService {
  check(): {
    success: boolean;
    timestamp: string;
    uptime: number;
    environment: string;
  };
}
