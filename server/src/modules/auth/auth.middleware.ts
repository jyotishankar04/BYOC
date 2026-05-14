import type { Request, Response, NextFunction } from "express";
import { authService } from "./auth.service";
import prisma from "@/config/db.config";
import { ACCESS_COOKIE_NAME, REFRESH_COOKIE_NAME } from "./auth.config";

function parseCookies(header: string | undefined): Record<string, string> {
  if (!header) return {};
  const cookies: Record<string, string> = {};
  for (const part of header.split(";")) {
    const idx = part.indexOf("=");
    if (idx === -1) continue;
    const key = part.slice(0, idx).trim();
    const value = part.slice(idx + 1).trim();
    if (key) cookies[key] = value;
  }
  return cookies;
}

export const requireAuth = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    // Path 1: API key via Authorization: Bearer bringbucket_xxx
    const authHeader = req.headers["authorization"];
    if (authHeader?.startsWith("Bearer bringbucket_")) {
      const rawKey = authHeader.slice(7);
      const keyHash = authService.hashApiKey(rawKey);

      const apiKey = await prisma.apiKey.findUnique({
        where: { keyHash },
        select: { id: true, userId: true, revokedAt: true },
      });

      if (!apiKey || apiKey.revokedAt !== null) {
        return res
          .status(401)
          .json({
            error: { code: "UNAUTHORIZED", message: "Invalid API key" },
          });
      }

      prisma.apiKey
        .update({ where: { id: apiKey.id }, data: { lastUsedAt: new Date() } })
        .catch(() => {});

      req.userId = apiKey.userId;
      req.sessionId = undefined;
      return next();
    }

    // Path 2: Access token via Authorization or cookie
    const cookies = parseCookies(req.headers.cookie);
    const bearerToken = authHeader?.startsWith("Bearer ")
      ? authHeader.slice(7)
      : undefined;
    const accessToken = bearerToken || cookies[ACCESS_COOKIE_NAME];

    if (!accessToken) {
      return res
        .status(401)
        .json({ error: { code: "UNAUTHORIZED", message: "Unauthorized" } });
    }

      const payload = authService.verifyAccessToken(accessToken);
      req.userId = payload.sub;
      req.userEmail = payload.email;
      req.sessionId = payload.sessionId;
      req.sessionToken = cookies[REFRESH_COOKIE_NAME];
      return next();
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unauthorized";
    const code = message.includes("expired") ? "ACCESS_TOKEN_EXPIRED" : "UNAUTHORIZED";
    return res
      .status(401)
      .json({ error: { code, message: "Unauthorized" } });
  }
};

export const tryAuth = async (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  try {
    const authHeader = req.headers["authorization"];
    const cookies = parseCookies(req.headers.cookie);
    const bearerToken = authHeader?.startsWith("Bearer ")
      ? authHeader.slice(7)
      : undefined;
    const accessToken = bearerToken || cookies[ACCESS_COOKIE_NAME];
    if (!accessToken) {
      next();
      return;
    }

    const payload = authService.verifyAccessToken(accessToken);
    req.userId = payload.sub;
    req.userEmail = payload.email;
    req.sessionId = payload.sessionId;
    req.sessionToken = cookies[REFRESH_COOKIE_NAME];
  } catch {
    // Ignore auth errors — this is optional
  }
  next();
};
