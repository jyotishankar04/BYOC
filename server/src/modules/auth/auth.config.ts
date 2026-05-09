import { env } from "@/config";

export const GOOGLE_CLIENT_ID = env.GOOGLE_CLIENT_ID;
export const GOOGLE_CLIENT_SECRET = env.GOOGLE_CLIENT_SECRET;
export const GOOGLE_REDIRECT_URI = `${env.FRONTEND_URL}/api/auth/callback/google`;

export const ACCESS_COOKIE_NAME = "access_token";
export const REFRESH_COOKIE_NAME = "refresh_token";
export const SESSION_EXPIRY_SECONDS = 60 * 60 * 24 * 7; // 7 days
export const SESSION_EXPIRY_MS = SESSION_EXPIRY_SECONDS * 1000;
export const ACCESS_TOKEN_EXPIRY_SECONDS = 60 * 15; // 15 minutes
export const ACCESS_TOKEN_EXPIRY_MS = ACCESS_TOKEN_EXPIRY_SECONDS * 1000;
