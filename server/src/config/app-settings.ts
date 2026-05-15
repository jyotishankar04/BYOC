import redisClient from "./redis.config";

export type ProviderStatus = "enabled" | "coming_soon" | "hidden";
export type ProviderKey = "S3" | "R2" | "GCS" | "Azure" | "MinIO" | "Supabase" | "Other";

export interface AppConfig {
  betaMode: boolean;
  maintenanceMode: boolean;
  signupsEnabled: boolean;
  allowedFileTypes: string[];
  providers: Record<ProviderKey, ProviderStatus>;
  features: {
    shareLinks: boolean;
    analytics: boolean;
    passwordProtectedLinks: boolean;
  };
}

const CONFIG_KEY = "app:config";
const LEGACY_BETA_KEY = "app:beta_mode";

const DEFAULT_CONFIG: AppConfig = {
  betaMode: true,
  maintenanceMode: false,
  signupsEnabled: true,
  allowedFileTypes: [],
  providers: {
    S3: "enabled",
    R2: "enabled",
    GCS: "coming_soon",
    Azure: "coming_soon",
    MinIO: "enabled",
    Supabase: "enabled",
    Other: "enabled",
  },
  features: {
    shareLinks: true,
    analytics: true,
    passwordProtectedLinks: true,
  },
};

class AppSettings {
  private _config: AppConfig = { ...DEFAULT_CONFIG };
  private _loaded = false;

  async load(): Promise<void> {
    const raw = await redisClient.get(CONFIG_KEY);
    if (raw) {
      try {
        this._config = { ...DEFAULT_CONFIG, ...JSON.parse(raw) };
      } catch {
        this._config = { ...DEFAULT_CONFIG };
      }
    } else {
      // Migrate legacy betaMode key if it exists
      const legacy = await redisClient.get(LEGACY_BETA_KEY);
      if (legacy !== null) {
        this._config = { ...DEFAULT_CONFIG, betaMode: legacy === "true" };
        await redisClient.del(LEGACY_BETA_KEY);
        await redisClient.set(CONFIG_KEY, JSON.stringify(this._config));
      }
    }
    this._loaded = true;
  }

  getConfig(): AppConfig {
    return this._config;
  }

  async updateConfig(patch: Partial<AppConfig>): Promise<void> {
    this._config = { ...this._config, ...patch };
    await redisClient.set(CONFIG_KEY, JSON.stringify(this._config));
  }

  // Legacy compat used by subscription-access.ts
  getBetaModeSync(): boolean {
    return this._config.betaMode;
  }

  async getBetaMode(): Promise<boolean> {
    if (!this._loaded) await this.load();
    return this._config.betaMode;
  }

  async setBetaMode(enabled: boolean): Promise<void> {
    await this.updateConfig({ betaMode: enabled });
  }
}

export const appSettings = new AppSettings();
