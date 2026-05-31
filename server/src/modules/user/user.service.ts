import { AppError } from "@/core/errors";
import type { IUserService, IUserRepository } from "./user.interface";
import type { UpdateProfileDto, UpdatePreferencesDto } from "./user.schema";
import redis from "@/config/redis.config";
import prisma from "@/config/db.config";
import { cache } from "@/shared/cache/cache.service";
import { SubscriptionSnapshotService } from "@/modules/billing/subscription-snapshot.service";
import {
  getPlatformStorage,
  buildStoredValue,
  resolveStorageUrl,
  mimeToExt,
  ALLOWED_IMAGE_MIME,
  PRESIGN_TTL_SECONDS,
} from "@/shared/storage/platform-storage";

export class UserService implements IUserService {
  constructor(private userRepository: IUserRepository) {}

  async getProfile(userId: string): Promise<Record<string, unknown>> {
    return cache.wrap(`user:profile:${userId}`, 120, async () => {
      const user = await this.userRepository.findById(userId);
      if (!user) throw new AppError("User not found", 404, "NOT_FOUND");
      const subscriptionSnapshot = await new SubscriptionSnapshotService(
        prisma,
      ).getUserSnapshot(userId);

      const avatarUrl = await resolveStorageUrl(user.avatar as string | null);

      return { ...user, avatarUrl, subscription: subscriptionSnapshot };
    });
  }

  async updateProfile(
    userId: string,
    data: UpdateProfileDto,
  ): Promise<Record<string, unknown>> {
    const result = await this.userRepository.update(userId, data as Record<string, unknown>);
    await cache.del(`user:profile:${userId}`);
    return result;
  }

  async presignAvatarUpload(
    userId: string,
    contentType: string,
  ): Promise<{ uploadUrl: string; key: string }> {
    if (!ALLOWED_IMAGE_MIME.has(contentType)) {
      throw new AppError("Unsupported image type", 415, "UNSUPPORTED_MEDIA_TYPE");
    }
    const key = `avatars/${userId}${mimeToExt(contentType)}`;
    const storage = getPlatformStorage();
    const uploadUrl = await storage.generatePutPresignedUrl(key, contentType, PRESIGN_TTL_SECONDS);
    return { uploadUrl, key };
  }

  async confirmAvatarUpload(userId: string, key: string): Promise<string> {
    if (!key.startsWith(`avatars/${userId}`)) {
      throw new AppError("Invalid key", 400, "INVALID_KEY");
    }
    const storedValue = buildStoredValue(key);
    await this.userRepository.update(userId, { avatar: storedValue });
    await cache.del(`user:profile:${userId}`);

    const avatarUrl = await resolveStorageUrl(storedValue);
    return avatarUrl ?? storedValue;
  }

  async getPreferences(userId: string): Promise<Record<string, unknown>> {
    const prefs = await this.userRepository.findPreferences(userId);
    if (!prefs) throw new AppError("Preferences not found", 404, "NOT_FOUND");
    return prefs;
  }

  async updatePreferences(
    userId: string,
    data: UpdatePreferencesDto,
  ): Promise<Record<string, unknown>> {
    return this.userRepository.upsertPreferences(
      userId,
      data as Record<string, unknown>,
    );
  }

  async listMyInvites(userId: string): Promise<Record<string, unknown>[]> {
    return this.userRepository.listMyInvites(userId);
  }

  async listAccounts(userId: string): Promise<Record<string, unknown>[]> {
    return this.userRepository.listAccounts(userId);
  }

  async listSessions(
    userId: string,
    currentSessionId: string,
  ): Promise<Record<string, unknown>[]> {
    const sessions = await this.userRepository.listSessions(userId);
    return sessions.map((session) => ({
      ...session,
      current: session.id === currentSessionId,
    }));
  }

  async revokeSession(userId: string, sessionId: string): Promise<void> {
    const session = await this.userRepository.findSessionById(userId, sessionId);
    if (!session) throw new AppError("Session not found", 404, "NOT_FOUND");

    await this.userRepository.deleteSession(sessionId);
    if (typeof session.token === "string") {
      await redis.del(session.token);
    }
  }

  async revokeOtherSessions(
    userId: string,
    currentSessionId: string,
  ): Promise<void> {
    const sessions = await this.userRepository.listSessions(userId);
    const staleTokens = sessions
      .filter((session) => session.id !== currentSessionId)
      .map((session) => session.token)
      .filter((token): token is string => typeof token === "string");

    await this.userRepository.deleteSessionsExcept(userId, currentSessionId);
    if (staleTokens.length > 0) {
      await redis.del(...staleTokens);
    }
  }
}
