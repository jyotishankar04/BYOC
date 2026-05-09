import type { Request } from "express";

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image: string | null;
  username: string | null;
  bio: string | null;
  location: string | null;
  website: string | null;
  avatar: string | null;
  onboarded: boolean | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface SessionData {
  id: string;
  token: string;
  userId: string;
  expiresAt: Date;
}

export interface AccessTokenPayload {
  sub: string;
  email: string;
  sessionId: string;
  exp: number;
}

export interface RedisSessionBlob {
  session: SessionData;
  user: SessionUser;
}

export interface GoogleProfile {
  id: string;
  email: string;
  verified_email: boolean;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
  locale: string;
}

export interface IAuthRepository {
  findUserById(id: string): Promise<Record<string, unknown> | null>;
  findApiKeysByUserId(userId: string): Promise<Array<Record<string, unknown>>>;
  createApiKey(data: {
    userId: string;
    name: string | null;
    keyPrefix: string;
    keyHash: string;
  }): Promise<Record<string, unknown>>;
  findApiKeyByIdAndUser(
    keyId: string,
    userId: string,
  ): Promise<Record<string, unknown> | null>;
  revokeApiKey(keyId: string): Promise<void>;
  updateApiKeyLastUsed(keyId: string): Promise<void>;
  findApiKeyByHash(keyHash: string): Promise<Record<string, unknown> | null>;
}

export interface IAuthService {
  onUserCreated(user: {
    id: string;
    email: string;
    name: string;
  }): Promise<void>;
  hashApiKey(key: string): string;
  verifyApiKey(key: string, storedHash: string): boolean;
  generateApiKey(): { fullKey: string; keyPrefix: string; keyHash: string };
  getSessionFromRequest(
    req: Request,
  ): Promise<{ user: SessionUser; session: SessionData } | null>;
  getMe(userId: string): Promise<Record<string, unknown>>;
  listApiKeys(userId: string): Promise<Array<Record<string, unknown>>>;
  createApiKey(
    userId: string,
    name?: string,
  ): Promise<{ fullKey: string; keyPrefix: string }>;
  revokeApiKey(keyId: string, userId: string): Promise<void>;
  getGoogleAuthUrl(): string;
  handleGoogleCallback(
    code: string,
    req: Request,
  ): Promise<{ accessToken: string; refreshToken: string; user: SessionUser }>;
  logout(refreshToken: string): Promise<void>;
  refreshAccessToken(
    refreshToken: string,
  ): Promise<{ accessToken: string; user: SessionUser; session: SessionData }>;
  verifyAccessToken(token: string): AccessTokenPayload;
}
