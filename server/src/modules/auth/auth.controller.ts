import type { Request, Response, NextFunction } from "express";
import type { IAuthService } from "./auth.interface";
import {
  ACCESS_COOKIE_NAME,
  ACCESS_TOKEN_EXPIRY_MS,
  REFRESH_COOKIE_NAME,
  SESSION_EXPIRY_MS,
} from "./auth.config";
import { env } from "@/config";
import logger from "@/core/logger";

export class AuthController {
  constructor(private authService: IAuthService) {}

  healthCheck = (_req: Request, res: Response): void => {
    res.json({ ok: true });
  };

  googleLogin = (_req: Request, res: Response): void => {
    const url = this.authService.getGoogleAuthUrl();
    res.redirect(url);
  };

  googleCallback = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { code } = req.query;
      if (typeof code !== "string") {
        res.status(400).json({ error: "Missing authorization code" });
        return;
      }

      const { accessToken, refreshToken, user } =
        await this.authService.handleGoogleCallback(code, req);

      res.cookie(ACCESS_COOKIE_NAME, accessToken, {
        httpOnly: true,
        sameSite: env.NODE_ENV === "production" ? "none" : "lax",
        maxAge: ACCESS_TOKEN_EXPIRY_MS,
        path: "/",
        secure: env.NODE_ENV === "production",
        domain: env.COOKIE_DOMAIN || undefined,
      });

      res.cookie(REFRESH_COOKIE_NAME, refreshToken, {
        httpOnly: true,
        sameSite: env.NODE_ENV === "production" ? "none" : "lax",
        maxAge: SESSION_EXPIRY_MS,
        path: "/",
        secure: env.NODE_ENV === "production",
        domain: env.COOKIE_DOMAIN || undefined,
      });

      // Check if user needs onboarding
      if (!user.onboarded) {
        res.redirect(`${env.FRONTEND_URL}/onboard`);
      } else {
        res.redirect(`${env.FRONTEND_URL}/app`);
      }
    } catch (err) {
      logger.error({ err }, "Google callback error");
      res.redirect(`${env.FRONTEND_URL}/auth/login?error=oauth_failed`);
    }
  };

  refresh = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const cookies = parseCookies(req.headers.cookie);
      const refreshToken = cookies[REFRESH_COOKIE_NAME];
      if (!refreshToken) {
        res.status(401).json({
          error: { code: "UNAUTHORIZED", message: "Missing refresh token" },
        });
        return;
      }

      const { accessToken, user, session } =
        await this.authService.refreshAccessToken(refreshToken);

      res.cookie(ACCESS_COOKIE_NAME, accessToken, {
        httpOnly: true,
        sameSite: env.NODE_ENV === "production" ? "none" : "lax",
        maxAge: ACCESS_TOKEN_EXPIRY_MS,
        path: "/",
        secure: env.NODE_ENV === "production",
        domain: env.COOKIE_DOMAIN || undefined,
      });

      res.json({
        ok: true,
        user,
        session: {
          id: session.id,
          userId: session.userId,
        },
      });
    } catch (err) {
      res.clearCookie(ACCESS_COOKIE_NAME, {
        httpOnly: true,
        sameSite: env.NODE_ENV === "production" ? "none" : "lax",
        path: "/",
        secure: env.NODE_ENV === "production",
        domain: env.COOKIE_DOMAIN || undefined,
      });
      res.clearCookie(REFRESH_COOKIE_NAME, {
        httpOnly: true,
        sameSite: env.NODE_ENV === "production" ? "none" : "lax",
        path: "/",
        secure: env.NODE_ENV === "production",
        domain: env.COOKIE_DOMAIN || undefined,
      });
      next(err);
    }
  };

  logout = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const cookies = parseCookies(req.headers.cookie);
      const refreshToken = cookies[REFRESH_COOKIE_NAME];
      if (refreshToken) {
        await this.authService.logout(refreshToken);
      }

      res.clearCookie(ACCESS_COOKIE_NAME, {
        httpOnly: true,
        sameSite: env.NODE_ENV === "production" ? "none" : "lax",
        path: "/",
        secure: env.NODE_ENV === "production",
        domain: env.COOKIE_DOMAIN || undefined,
      });
      res.clearCookie(REFRESH_COOKIE_NAME, {
        httpOnly: true,
        sameSite: env.NODE_ENV === "production" ? "none" : "lax",
        path: "/",
        secure: env.NODE_ENV === "production",
        domain: env.COOKIE_DOMAIN || undefined,
      });
      res.json({ ok: true });
    } catch (err) {
      next(err);
    }
  };

  getMe = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const user = await this.authService.getMe(req.userId!);
      res.json({
        user,
        session: {
          id: req.sessionId,
          userId: req.userId,
        },
      });
    } catch (err) {
      next(err);
    }
  };

  listApiKeys = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const keys = await this.authService.listApiKeys(req.userId!);
      res.json({ keys });
    } catch (err) {
      next(err);
    }
  };

  createApiKey = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const name: string | undefined = req.body?.name;
      const result = await this.authService.createApiKey(req.userId!, name);
      res
        .status(201)
        .json({ key: result.fullKey, keyPrefix: result.keyPrefix });
    } catch (err) {
      next(err);
    }
  };

  revokeApiKey = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const keyId = req.params["keyId"] as string;
      await this.authService.revokeApiKey(keyId, req.userId!);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  };
}

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
