import api from "./axios";

export type NotificationType =
  | "FILE_SHARED"
  | "FILE_UPLOADED"
  | "FILE_DELETED"
  | "MEMBER_JOINED"
  | "MEMBER_LEFT"
  | "INVITE_SENT"
  | "STORAGE_ALERT"
  | "SECURITY_ALERT"
  | "LINK_EXPIRED"
  | "LINK_DISABLED"
  | "SETTINGS_CHANGED";

export type NotificationFilter = "all" | "unread" | "files" | "members" | "security" | "system";

export interface Notification {
  id: string;
  workspaceId: string | null;
  type: NotificationType;
  title: string;
  message: string | null;
  link: string | null;
  read: boolean;
  dismissed: boolean;
  createdAt: string;
}

export interface NotificationsResponse {
  notifications: Notification[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface UnreadCountResponse {
  count: number;
}

export interface MarkReadResponse {
  success: boolean;
}

export interface MarkAllReadResponse {
  success: boolean;
  count: number;
}

export interface DismissResponse {
  success: boolean;
}

export interface DismissAllResponse {
  success: boolean;
  count: number;
}

// API Functions
export async function fetchNotifications(
  filter: NotificationFilter = "all",
  page: number = 1,
  limit: number = 20,
): Promise<NotificationsResponse> {
  const { data } = await api.get("/api/v1/users/me/notifications", {
    params: { filter, page, limit },
  });
  return data;
}

export async function fetchUnreadCount(): Promise<number> {
  const { data } = await api.get<UnreadCountResponse>("/api/v1/users/me/notifications/count");
  return data.count;
}

export async function markNotificationRead(id: string): Promise<void> {
  await api.patch(`/api/v1/users/me/notifications/${id}/read`);
}

export async function markAllNotificationsRead(filter?: NotificationFilter): Promise<number> {
  const { data } = await api.patch<MarkAllReadResponse>("/api/v1/users/me/notifications/read-all", {
    params: filter ? { filter } : undefined,
  });
  return data.count;
}

export async function dismissNotification(id: string): Promise<void> {
  await api.delete(`/api/v1/users/me/notifications/${id}`);
}

export async function dismissAllNotifications(filter?: NotificationFilter): Promise<number> {
  const { data } = await api.delete<DismissAllResponse>("/api/v1/users/me/notifications", {
    params: filter ? { filter } : undefined,
  });
  return data.count;
}

// React Query Keys
export const notificationKeys = {
  all: ["notifications"] as const,
  lists: () => [...notificationKeys.all, "list"] as const,
  list: (filter: NotificationFilter, page: number) =>
    [...notificationKeys.lists(), { filter, page }] as const,
  unreadCount: () => [...notificationKeys.all, "unread-count"] as const,
};
