import crypto from "node:crypto";
import {
  WorkspaceRole,
  WorkspaceType,
  WorkspacePlan,
} from "@/generated/prisma/client";
import type { PrismaClient } from "@/generated/prisma/client";
import { getWorkspaceDefaultName } from "@/shared/constants/workspace.constants";
import { getSlug } from "./auth.utils";
import type { Request } from "express";
import type {
  IAuthService,
  SessionUser,
  SessionData,
  RedisSessionBlob,
  GoogleProfile,
} from "./auth.interface";
import { authRepository, type AuthRepository } from "./auth.repository";
import prisma from "@/config/db.config";
import redis from "@/config/redis.config";
import {
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_REDIRECT_URI,
  ACCESS_TOKEN_EXPIRY_SECONDS,
  REFRESH_COOKIE_NAME,
  SESSION_EXPIRY_SECONDS,
} from "./auth.config";
import env from "@/config/env";
import { AppError } from "@/core/errors";
import { appSettings } from "@/config/app-settings";
import { EmailQueueService } from "@/core/mail/mail.queue";

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

export class AuthService implements IAuthService {
  constructor(
    private prisma: PrismaClient,
    private authRepository: AuthRepository,
  ) {}

  private encodeBase64Url(input: string): string {
    return Buffer.from(input)
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/g, "");
  }

  private decodeBase64Url(input: string): string {
    const normalized = input.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized + "=".repeat((4 - (normalized.length % 4)) % 4);
    return Buffer.from(padded, "base64").toString("utf8");
  }

  private getAccessSecret(): string {
    const secret = env.JWT_ACCESS_SECRET || env.JWT_SECRET;
    if (!secret) {
      throw new Error("JWT access token secret is not configured");
    }
    return secret;
  }

  private signAccessToken(payload: {
    sub: string;
    email: string;
    sessionId: string;
  }): string {
    const header = { alg: "HS256", typ: "JWT" };
    const body = {
      ...payload,
      exp: Math.floor(Date.now() / 1000) + ACCESS_TOKEN_EXPIRY_SECONDS,
    };
    const encodedHeader = this.encodeBase64Url(JSON.stringify(header));
    const encodedBody = this.encodeBase64Url(JSON.stringify(body));
    const signature = crypto
      .createHmac("sha256", this.getAccessSecret())
      .update(`${encodedHeader}.${encodedBody}`)
      .digest("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/g, "");
    return `${encodedHeader}.${encodedBody}.${signature}`;
  }

  verifyAccessToken(token: string) {
    const [encodedHeader, encodedBody, signature] = token.split(".");
    if (!encodedHeader || !encodedBody || !signature) {
      throw new Error("Malformed access token");
    }

    const expectedSignature = crypto
      .createHmac("sha256", this.getAccessSecret())
      .update(`${encodedHeader}.${encodedBody}`)
      .digest("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/g, "");

    if (signature !== expectedSignature) {
      throw new Error("Invalid access token signature");
    }

    const payload = JSON.parse(this.decodeBase64Url(encodedBody)) as {
      sub: string;
      email: string;
      sessionId: string;
      exp: number;
    };

    if (!payload.exp || payload.exp <= Math.floor(Date.now() / 1000)) {
      throw new Error("Access token expired");
    }

    return payload;
  }

  async onUserCreated(user: {
    id: string;
    email: string;
    name: string;
  }): Promise<void> {
    const baseSlug = getSlug(user.email);

    const tryCreate = (slug: string) =>
      this.prisma.$transaction(async (tx) => {
        await tx.workspace.create({
          data: {
            name: getWorkspaceDefaultName(user.name),
            slug,
            type: WorkspaceType.PERSONAL,
            plan: WorkspacePlan.Free,
            owner: { connect: { id: user.id } },
            members: {
              create: { userId: user.id, role: WorkspaceRole.Owner },
            },
            permissions: { create: {} },
            security: { create: {} },
          },
        });
        await tx.userPreferences.create({ data: { userId: user.id } });
      });

    try {
      await tryCreate(baseSlug);
    } catch (err: any) {
      if (err?.code === "P2002") {
        const suffix = crypto.randomBytes(2).toString("hex");
        await tryCreate(`${baseSlug}-${suffix}`);
      } else {
        throw err;
      }
    }

    EmailQueueService.enqueue({ type: "welcome", to: user.email, name: user.name });
  }

  hashApiKey(key: string): string {
    return crypto.createHash("sha256").update(key).digest("hex");
  }

  verifyApiKey(key: string, storedHash: string): boolean {
    const computed = Buffer.from(this.hashApiKey(key), "hex");
    const stored = Buffer.from(storedHash, "hex");
    if (computed.length !== stored.length) return false;
    return crypto.timingSafeEqual(computed, stored);
  }

  generateApiKey(): { fullKey: string; keyPrefix: string; keyHash: string } {
    const raw = crypto.randomBytes(32).toString("hex");
    const fullKey = `bringbucket_${raw}`;
    return {
      fullKey,
      keyPrefix: fullKey.slice(0, 12),
      keyHash: this.hashApiKey(fullKey),
    };
  }

  getGoogleAuthUrl(): string {
    const params = new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      redirect_uri: GOOGLE_REDIRECT_URI,
      response_type: "code",
      scope: "openid email profile",
      access_type: "offline",
      prompt: "select_account",
    });
    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  }

  async handleGoogleCallback(
    code: string,
    req: Request,
  ): Promise<{ accessToken: string; refreshToken: string; user: SessionUser }> {
    // Exchange authorization code for tokens
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: GOOGLE_REDIRECT_URI,
        grant_type: "authorization_code",
      }).toString(),
    });

    if (!tokenRes.ok) {
      const errBody = await tokenRes.text();
      throw new Error(`Google token exchange failed: ${errBody}`);
    }

    const tokens = (await tokenRes.json()) as {
      access_token: string;
      refresh_token?: string;
      id_token?: string;
      scope?: string;
      expires_in?: number;
    };
    const accessTokenExpiresAt = tokens.expires_in
      ? new Date(Date.now() + tokens.expires_in * 1000)
      : null;

    // Fetch user profile
    const profileRes = await fetch(
      "https://www.googleapis.com/oauth2/v2/userinfo",
      {
        headers: { Authorization: `Bearer ${tokens.access_token}` },
      },
    );

    if (!profileRes.ok) {
      throw new Error("Failed to fetch Google profile");
    }

    const profile = (await profileRes.json()) as GoogleProfile;

    // Find or create user
    let user = await this.prisma.user.findUnique({
      where: { email: profile.email },
    });
    let isNewUser = false;

    if (!user) {
      if (!appSettings.getConfig().signupsEnabled) {
        throw new AppError(
          "Sign-ups are currently closed",
          403,
          "SIGNUPS_CLOSED",
        );
      }
      user = await this.prisma.user.create({
        data: {
          id: crypto.randomUUID(),
          name: profile.name,
          email: profile.email,
          emailVerified: profile.verified_email,
          image: profile.picture,
        },
      });
      isNewUser = true;
    } else if (!user.image && profile.picture) {
      // Update profile picture if missing
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: { image: profile.picture },
      });
    }

    // Upsert Account record
    const existingAccount = await this.prisma.account.findFirst({
      where: { userId: user.id, providerId: "google" },
      select: {
        id: true,
        refreshToken: true,
        idToken: true,
        scope: true,
      },
    });

    if (existingAccount) {
      await this.prisma.account.update({
        where: { id: existingAccount.id },
        data: {
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token ?? existingAccount.refreshToken,
          idToken: tokens.id_token ?? existingAccount.idToken,
          scope: tokens.scope ?? existingAccount.scope,
          accessTokenExpiresAt,
        },
      });
    } else {
      await this.prisma.account.create({
        data: {
          id: `${profile.id}_google`,
          accountId: profile.id,
          providerId: "google",
          userId: user.id,
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token,
          idToken: tokens.id_token,
          scope: tokens.scope,
          accessTokenExpiresAt,
        },
      });
    }

    // Create session
    const refreshToken = crypto.randomUUID();
    const sessionId = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + SESSION_EXPIRY_SECONDS * 1000);

    await this.prisma.session.create({
      data: {
        id: sessionId,
        token: refreshToken,
        userId: user.id,
        expiresAt,
        ipAddress: req.ip ?? req.socket?.remoteAddress ?? "",
        userAgent: req.headers["user-agent"] ?? "",
      },
    });

    const sessionUser: SessionUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      emailVerified: user.emailVerified,
      image: user.image,
      username: user.username,
      bio: user.bio,
      location: user.location,
      website: user.website,
      avatar: user.avatar,
      onboarded: user.onboarded,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    const sessionData: SessionData = {
      id: sessionId,
      token: refreshToken,
      userId: user.id,
      expiresAt,
    };

    // Store in Redis in the same format better-auth used
    const blob: RedisSessionBlob = { session: sessionData, user: sessionUser };
    await redis.set(
      refreshToken,
      JSON.stringify(blob),
      "EX",
      SESSION_EXPIRY_SECONDS,
    );

    if (isNewUser) {
      // Fire-and-forget onboarding — don't block the response
      this.onUserCreated(user).catch((err) => {
        console.error("onUserCreated failed:", err);
      });
    } else {
      EmailQueueService.enqueue({
        type: "login_alert",
        to: user.email,
        name: user.name,
        ip: req.ip ?? req.socket?.remoteAddress,
      });
    }

    return {
      accessToken: this.signAccessToken({
        sub: user.id,
        email: user.email,
        sessionId,
      }),
      refreshToken,
      user: sessionUser,
    };
  }

  async logout(refreshToken: string): Promise<void> {
    await Promise.all([
      redis.del(refreshToken),
      this.prisma.session.deleteMany({ where: { token: refreshToken } }),
    ]);
  }

  getSessionFromRequest(req: Request) {
    const cookies = parseCookies(req.headers.cookie);
    const sessionToken = cookies[REFRESH_COOKIE_NAME];
    if (!sessionToken) return Promise.resolve(null);

    return redis.get(sessionToken).then((raw) => {
      if (!raw) return null;
      try {
        const blob = JSON.parse(raw) as RedisSessionBlob;
        if (new Date(blob.session.expiresAt) < new Date()) {
          redis.del(sessionToken).catch(() => {});
          return null;
        }
        return blob;
      } catch {
        return null;
      }
    });
  }

  async refreshAccessToken(refreshToken: string) {
    const raw = await redis.get(refreshToken);
    if (!raw) {
      throw new Error("Refresh token not found");
    }

    const blob = JSON.parse(raw) as RedisSessionBlob;
    if (new Date(blob.session.expiresAt) < new Date()) {
      await this.logout(refreshToken);
      throw new Error("Refresh token expired");
    }

    return {
      accessToken: this.signAccessToken({
        sub: blob.user.id,
        email: blob.user.email,
        sessionId: blob.session.id,
      }),
      user: blob.user,
      session: blob.session,
    };
  }

  async getMe(userId: string): Promise<Record<string, unknown>> {
    const user = await this.authRepository.findUserById(userId);
    if (!user) {
      throw new Error("User not found");
    }
    return user;
  }

  async listApiKeys(userId: string): Promise<Array<Record<string, unknown>>> {
    return this.authRepository.findApiKeysByUserId(userId);
  }

  async createApiKey(
    userId: string,
    name?: string,
  ): Promise<{ fullKey: string; keyPrefix: string }> {
    const { fullKey, keyPrefix, keyHash } = this.generateApiKey();
    await this.authRepository.createApiKey({
      userId,
      name: name ?? null,
      keyPrefix,
      keyHash,
    });
    return { fullKey, keyPrefix };
  }

  async revokeApiKey(keyId: string, userId: string): Promise<void> {
    const existing = await this.authRepository.findApiKeyByIdAndUser(
      keyId,
      userId,
    );
    if (!existing) {
      throw new Error("API key not found");
    }
    await this.authRepository.revokeApiKey(keyId);
  }
}

export const authService = new AuthService(prisma, authRepository);
