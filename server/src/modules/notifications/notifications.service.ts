import type { PrismaClient, NotificationType } from "@/generated/prisma/client";
import redis from "@/config/redis.config";

const NOTIFICATION_TYPE_GROUPS: Record<string, NotificationType[]> = {
  files: [
    "FILE_SHARED",
    "FILE_UPLOADED",
    "FILE_DELETED",
    "LINK_EXPIRED",
    "LINK_DISABLED",
  ],
  members: ["MEMBER_JOINED", "MEMBER_LEFT", "INVITE_SENT"],
  security: ["SECURITY_ALERT", "STORAGE_ALERT"],
  system: ["SETTINGS_CHANGED"],
};

interface CreateNotificationData {
  userId: string;
  workspaceId?: string;
  type: NotificationType;
  title: string;
  message?: string;
  link?: string;
}

interface ListNotificationsOptions {
  filter?: "all" | "unread" | "files" | "members" | "security" | "system";
  page?: number;
  limit?: number;
}

const UNREAD_COUNT_CACHE_TTL = 30; // 30 seconds

function getUnreadCountKey(userId: string): string {
  return `notifications:unread_count:${userId}`;
}

export class NotificationsService {
  constructor(private prisma: PrismaClient) {}

  async listNotifications(
    userId: string,
    options: ListNotificationsOptions = {},
  ) {
    const { filter = "all", page = 1, limit = 20 } = options;

    const where: {
      userId: string;
      dismissed: boolean;
      type?: { in: NotificationType[] };
      read?: boolean;
    } = {
      userId,
      dismissed: false,
    };

    if (filter === "unread") {
      where.read = false;
    } else if (filter !== "all" && NOTIFICATION_TYPE_GROUPS[filter]) {
      where.type = { in: NOTIFICATION_TYPE_GROUPS[filter] };
    }

    const [notifications, total] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.notification.count({ where }),
    ]);

    return {
      notifications,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getUnreadCount(userId: string): Promise<number> {
    const cacheKey = getUnreadCountKey(userId);

    // Try cache first
    const cached = await redis.get(cacheKey);
    if (cached) {
      return parseInt(cached, 10);
    }

    // Query database
    const count = await this.prisma.notification.count({
      where: {
        userId,
        read: false,
        dismissed: false,
      },
    });

    // Cache result
    await redis.setex(cacheKey, UNREAD_COUNT_CACHE_TTL, count.toString());

    return count;
  }

  async invalidateUnreadCount(userId: string): Promise<void> {
    const cacheKey = getUnreadCountKey(userId);
    await redis.del(cacheKey);
  }

  async markRead(userId: string, notificationId: string): Promise<void> {
    const result = await this.prisma.notification.updateMany({
      where: {
        id: notificationId,
        userId,
      },
      data: { read: true },
    });

    if (result.count > 0) {
      await this.invalidateUnreadCount(userId);
    }
  }

  async markAllRead(
    userId: string,
    filter?: "all" | "files" | "members" | "security" | "system",
  ): Promise<number> {
    const where: {
      userId: string;
      read: boolean;
      dismissed: boolean;
      type?: { in: NotificationType[] };
    } = {
      userId,
      read: false,
      dismissed: false,
    };

    if (filter && filter !== "all" && NOTIFICATION_TYPE_GROUPS[filter]) {
      where.type = { in: NOTIFICATION_TYPE_GROUPS[filter] };
    }

    const result = await this.prisma.notification.updateMany({
      where,
      data: { read: true },
    });

    if (result.count > 0) {
      await this.invalidateUnreadCount(userId);
    }

    return result.count;
  }

  async dismiss(userId: string, notificationId: string): Promise<void> {
    const result = await this.prisma.notification.updateMany({
      where: {
        id: notificationId,
        userId,
      },
      data: { dismissed: true },
    });

    if (result.count > 0) {
      await this.invalidateUnreadCount(userId);
    }
  }

  async dismissAll(
    userId: string,
    filter?: "all" | "files" | "members" | "security" | "system",
  ): Promise<number> {
    const where: {
      userId: string;
      dismissed: boolean;
      type?: { in: NotificationType[] };
    } = {
      userId,
      dismissed: false,
    };

    if (filter && filter !== "all" && NOTIFICATION_TYPE_GROUPS[filter]) {
      where.type = { in: NOTIFICATION_TYPE_GROUPS[filter] };
    }

    const result = await this.prisma.notification.updateMany({
      where,
      data: { dismissed: true },
    });

    if (result.count > 0) {
      await this.invalidateUnreadCount(userId);
    }

    return result.count;
  }

  async createNotification(data: CreateNotificationData): Promise<void> {
    await this.prisma.notification.create({
      data: {
        userId: data.userId,
        workspaceId: data.workspaceId,
        type: data.type,
        title: data.title,
        message: data.message,
        link: data.link,
      },
    });

    // Invalidate unread count cache
    await this.invalidateUnreadCount(data.userId);
  }
}
