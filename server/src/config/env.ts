import dotenv from "dotenv";
import { z } from "zod";

dotenv.config({
  path:
    process.env.NODE_ENV === "production" 
      ? ".env.prod"
      : process.env.NODE_ENV === "test"
        ? ".env.test"
        : ".env.dev",
});

const envSchema = z.object({
  PORT: z.string().min(1).max(5).default("4000"),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  DATABASE_URL: z.string().default(""),
  JWT_ACCESS_SECRET: z.string().default(""),
  JWT_REFRESH_SECRET: z.string().default(""),
  JWT_SECRET: z.string().default(""),
  LOG_LEVEL: z.enum(["trace", "debug", "info", "warn", "error", "fatal"]).default("info"),
  LOG_PRETTY: z.string().default("false").transform(val => val === "true"),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.log(parsedEnv.error);
  console.error("❌ Invalid environment variables");
  process.exit(1);
}

const env = parsedEnv.data;

export default env;
