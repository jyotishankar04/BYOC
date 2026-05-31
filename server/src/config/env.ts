import dotenv from "dotenv";
import { z } from "zod";

dotenv.config({
  path:
    process.env.NODE_ENV === "production"
      ? ".env"
      : process.env.NODE_ENV === "test"
        ? ".env.test"
        : ".env.dev",
});

const envSchema = z.object({
  PORT: z.string().min(1).max(5).default("4000"),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  JWT_ACCESS_SECRET: z
    .string()
    .min(32, "JWT_ACCESS_SECRET must be at least 32 characters"),
  JWT_REFRESH_SECRET: z
    .string()
    .min(32, "JWT_REFRESH_SECRET must be at least 32 characters"),
  JWT_SECRET: z.string().min(32, "JWT_SECRET must be at least 32 characters"),
  LOG_LEVEL: z
    .enum(["trace", "debug", "info", "warn", "error", "fatal"])
    .default("info"),
  LOG_PRETTY: z
    .string()
    .default("false")
    .transform((val) => val === "true"),
  FRONTEND_URL: z.string().default("http://localhost:3000"),
  COOKIE_DOMAIN: z.string().default(""),

  // Redis — REDIS_URL takes precedence over host/port/password (use for Upstash)
  REDIS_URL: z.string().optional(),
  REDIS_HOST: z.string().default("localhost"),
  REDIS_PORT: z.string().default("6379"),
  REDIS_PASSWORD: z.string().default(""),

  // Mail
  MAIL_PROVIDER: z.enum(["smtp", "resend"]).default("smtp"),
  MAIL_HOST: z.string().default("localhost"),
  MAIL_PORT: z.string().default("1025"),
  MAIL_SECURE: z
    .string()
    .default("false")
    .transform((val) => val === "true"),
  MAIL_FROM: z.string().default("no-reply@bringbucket.local"),
  RESEND_API_KEY: z.string().optional(),

  // Google OAuth
  GOOGLE_CLIENT_ID: z.string().default(""),
  GOOGLE_CLIENT_SECRET: z.string().default(""),

  // Storage credential encryption
  CRED_ENCRYPTION_KEY: z.string().default(""),

  // Generic webhook secret (S3 webhooks)
  WEBHOOK_SECRET: z.string().default(""),

  // Platform-level S3 storage (for avatars and other platform assets)
  PLATFORM_S3_PROVIDER: z.enum(["S3", "R2", "MinIO", "Supabase", "Other"]).default("S3"),
  PLATFORM_S3_ACCESS_KEY_ID: z.string().default(""),
  PLATFORM_S3_SECRET_ACCESS_KEY: z.string().default(""),
  PLATFORM_S3_BUCKET: z.string().default(""),
  PLATFORM_S3_REGION: z.string().default("us-east-1"),
  PLATFORM_S3_ENDPOINT: z.string().default(""),
  PLATFORM_S3_PUBLIC_URL: z.string().default(""),

  // Polar.sh billing
  POLAR_ACCESS_TOKEN: z.string().default(""),
  POLAR_SERVER: z.enum(["sandbox", "production"]).default("sandbox"),
  POLAR_SUCCESS_URL: z.string().default("http://localhost:3000/app/billing"),
  POLAR_RETURN_URL: z.string().default("http://localhost:3000/app/billing"),
  POLAR_WEBHOOK_SECRET: z.string().default(""),
  POLAR_PRO_PRODUCT_ID: z.string().default(""),
  POLAR_TEAM_PRODUCT_ID: z.string().default(""),
  POLAR_PRO_6M_PRODUCT_ID: z.string().default(""),
  POLAR_TEAM_6M_PRODUCT_ID: z.string().default(""),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error(
    "❌ Invalid environment variables:",
    parsedEnv.error.flatten().fieldErrors,
  );
  process.exit(1);
}

const env = parsedEnv.data;

if (env.NODE_ENV === "production" && !env.CRED_ENCRYPTION_KEY) {
  process.stderr.write(
    "FATAL: CRED_ENCRYPTION_KEY must be set in production — provider credentials would be stored unencrypted.\n",
  );
  process.exit(1);
}

export default env;
