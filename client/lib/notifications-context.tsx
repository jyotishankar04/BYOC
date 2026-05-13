"use client";

import {
  createContext,
  useContext,
  useCallback,
  useState,
  type ReactNode,
} from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  notificationKeys,
  fetchNotifications,
  fetchUnreadCount,
  markNotificationRead,
  markAllNotificationsRead,
  dismissNotification,
  dismissAllNotifications,
  type Notification,
  type NotificationFilter,
} from "@/lib/notifications";

interface NotificationsContextType {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  filter: NotificationFilter;
  setFilter: (filter: NotificationFilter) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  dismiss: (id: string) => void;
  dismissAll: () => void;
  refetch: () => void;
}

const NotificationsContext = createContext<NotificationsContextType | null>(null);

interface NotificationsProviderProps {
  children: ReactNode;
  initialFilter?: NotificationFilter;
}

export function NotificationsProvider({
  children,
  initialFilter = "all",
}: NotificationsProviderProps) {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<NotificationFilter>(initialFilter);

  // Fetch notifications
  const { data: notificationsData, isLoading, refetch } = useQuery({
    queryKey: notificationKeys.list(filter, 1),
    queryFn: () => fetchNotifications(filter, 1, 20),
  });

  // Fetch unread count
  const { data: unreadCount = 0 } = useQuery({
    queryKey: notificationKeys.unreadCount(),
    queryFn: fetchUnreadCount,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Mark as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: markNotificationRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });

  // Mark all as read mutation
  const markAllAsReadMutation = useMutation({
    mutationFn: () => markAllNotificationsRead(filter),
    onSuccess: (count) => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
      toast.success(`Marked ${count} notifications as read`);
    },
  });

  // Dismiss mutation
  const dismissMutation = useMutation({
    mutationFn: dismissNotification,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });

  // Dismiss all mutation
  const dismissAllMutation = useMutation({
    mutationFn: () => dismissAllNotifications(filter),
    onSuccess: (count) => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
      toast.success(`Dismissed ${count} notifications`);
    },
  });

  const markAsRead = useCallback((id: string) => {
    markAsReadMutation.mutate(id);
  }, [markAsReadMutation]);

  const markAllAsRead = useCallback(() => {
    markAllAsReadMutation.mutate();
  }, [markAllAsReadMutation]);

  const dismiss = useCallback((id: string) => {
    dismissMutation.mutate(id);
  }, [dismissMutation]);

  const dismissAll = useCallback(() => {
    dismissAllMutation.mutate();
  }, [dismissAllMutation]);

  const notifications = notificationsData?.notifications || [];

  return (
    <NotificationsContext.Provider
      value={{
        notifications,
        unreadCount,
        isLoading,
        filter,
        setFilter,
        markAsRead,
        markAllAsRead,
        dismiss,
        dismissAll,
        refetch,
      }}
    >
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationsContext);
  if (!context) {
    throw new Error(
      "useNotifications must be used within a NotificationsProvider"
    );
  }
  return context;
}
