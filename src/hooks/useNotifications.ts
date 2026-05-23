import { useEffect, useReducer, useState, useMemo, useCallback } from "react";
import axiosInstance from "@/lib/axios-instance";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import { getLocaleFromLanguage } from "@/constants/app.constants";
import { useRouter } from "next/navigation";
import {
  getNotificationsPageUiMessages,
  type NotificationUiType,
} from "@/lib/ui-messages";

export interface NotificationDetailItem {
  id: string | number;
  title: string;
  message: string;
  titleVi?: string;
  messageVi?: string;
  titleEn?: string;
  messageEn?: string;
  type: string;
  createdAt: Date | string;
  metadata?: { imageUrl?: string; [key: string]: unknown };
}

export interface NotificationItem {
  id: string | number;
  title: string;
  message: string;
  titleVi?: string;
  messageVi?: string;
  titleEn?: string;
  messageEn?: string;
  actionUrl?: string;
  type: NotificationUiType;
  createdAt: string;
  isRead?: boolean;
  metadata?: {
    movieId?: number;
    tvId?: number;
    commentId?: number;
    parentId?: number;
    [key: string]: unknown;
  };
}

export function getLocalizedNotif(
  n: { title: string; message: string; titleVi?: string; messageVi?: string; titleEn?: string; messageEn?: string },
  language: string
) {
  if (language === "vi") return { title: n.titleVi || n.title, message: n.messageVi || n.message };
  return { title: n.titleEn || n.title, message: n.messageEn || n.message };
}

export const badgeStyles: Record<NotificationItem["type"], string> = {
  info: "bg-blue-900/50 text-blue-200 border border-blue-700/60",
  success: "bg-green-900/50 text-green-200 border border-green-700/60",
  warning: "bg-yellow-900/40 text-yellow-200 border border-yellow-700/60",
  error: "bg-red-900/40 text-red-200 border border-red-700/60",
  system: "bg-purple-900/40 text-purple-200 border border-purple-700/60",
};

export function useNotifications() {
  const { push } = useRouter();
  const { isLoading } = useAuth();
  const { language } = useLanguage();
  const labels = getNotificationsPageUiMessages(language);
  const locale = getLocaleFromLanguage(language);

  type ListState = { notifications: NotificationItem[]; loading: boolean; error: string | null; isEmpty: boolean };
  const [listState, dispatchList] = useReducer(
    (s: ListState, a: Partial<ListState>): ListState => ({ ...s, ...a }),
    { notifications: [], loading: true, error: null, isEmpty: false }
  );

  const { notifications, loading, error, isEmpty } = listState;
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<NotificationDetailItem | null>(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await axiosInstance.get("/notifications", {
          params: { limit: 50, unreadOnly: showUnreadOnly || undefined },
        });

        if (
          response.data?.success &&
          Array.isArray(response.data.data?.notifications)
        ) {
          const items = response.data.data.notifications.map(
            (n: Partial<NotificationItem>) => ({
              id: n.id ?? crypto.randomUUID(),
              title: n.title ?? labels.fallbackTitle,
              message: n.message ?? "",
              titleVi: n.titleVi,
              messageVi: n.messageVi,
              titleEn: n.titleEn,
              messageEn: n.messageEn,
              actionUrl: n.actionUrl,
              type: (n.type as NotificationItem["type"]) || "info",
              createdAt: n.createdAt ?? new Date().toISOString(),
              isRead: n.isRead,
              metadata: n.metadata,
            })
          ) as NotificationItem[];
          dispatchList({ notifications: items, isEmpty: items.length === 0, loading: false });
        } else {
          dispatchList({ error: labels.noNotificationsFound, isEmpty: true, loading: false });
        }
      } catch (err) {
        console.error("Failed to load notifications:", err);
        dispatchList({ error: labels.cannotLoadNotifications, isEmpty: true, loading: false });
      }
    };

    fetchNotifications();
  }, [
    labels.cannotLoadNotifications,
    labels.fallbackTitle,
    labels.noNotificationsFound,
    showUnreadOnly,
  ]);

  const filteredNotifications = useMemo(() => {
    return showUnreadOnly
      ? notifications.filter((n) => !n.isRead)
      : notifications;
  }, [notifications, showUnreadOnly]);

  const filteredEmpty = filteredNotifications.length === 0;

  // Group notifications by date (YYYY-MM-DD)
  const groupedByDate = useMemo(() => {
    return filteredNotifications.reduce<Record<string, NotificationItem[]>>((acc, notif) => {
      const dateKey = new Date(notif.createdAt).toISOString().split("T")[0];
      acc[dateKey] = acc[dateKey] ? [...acc[dateKey], notif] : [notif];
      return acc;
    }, {});
  }, [filteredNotifications]);

  const sortedDateKeys = useMemo(() => {
    return Object.keys(groupedByDate).sort((a, b) => (a < b ? 1 : -1));
  }, [groupedByDate]);

  const resolveTargetUrl = useCallback((notif: NotificationItem): string | null => {
    if (notif.actionUrl) return notif.actionUrl;
    const meta = notif.metadata;
    if (meta?.movieId) return `/watch/movie-${meta.movieId}`;
    if (meta?.tvId) return `/watch/tv-${meta.tvId}`;
    return null;
  }, []);

  const markNotificationAsRead = useCallback(async (notif: NotificationItem) => {
    if (notif.isRead) return;

    dispatchList({
      notifications: notifications.map((item) =>
        item.id === notif.id ? { ...item, isRead: true } : item
      ),
    });

    try {
      await axiosInstance.put(`/notifications/${notif.id}/read`);
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
      dispatchList({
        notifications: notifications.map((item) =>
          item.id === notif.id ? { ...item, isRead: false } : item
        ),
      });
    }
  }, [notifications]);

  const handleNotificationClick = useCallback((notif: NotificationItem) => {
    markNotificationAsRead(notif);
    const url = resolveTargetUrl(notif);
    if (url) {
      push(url);
    } else {
      setSelectedNotification(notif);
    }
  }, [markNotificationAsRead, resolveTargetUrl, push]);

  const handleDeleteNotification = useCallback(async (notif: NotificationItem) => {
    const previousNotifications = notifications;
    const filtered = previousNotifications.filter((item) => item.id !== notif.id);
    dispatchList({ notifications: filtered, isEmpty: filtered.length === 0 });

    try {
      await axiosInstance.delete(`/notifications/${notif.id}`);
    } catch (error) {
      console.error("Failed to delete notification:", error);
      dispatchList({ notifications: previousNotifications, isEmpty: previousNotifications.length === 0 });
    }
  }, [notifications]);

  const handleClearNotifications = useCallback(async () => {
    const previousNotifications = notifications;
    dispatchList({ notifications: [], isEmpty: true });

    try {
      await axiosInstance.delete("/notifications");
    } catch (error) {
      console.error("Failed to clear notifications:", error);
      dispatchList({ notifications: previousNotifications, isEmpty: previousNotifications.length === 0 });
    }
  }, [notifications]);

  return {
    push,
    isLoading,
    language,
    labels,
    locale,
    notifications,
    loading,
    error,
    isEmpty,
    showUnreadOnly,
    selectedNotification,
    filteredNotifications,
    filteredEmpty,
    groupedByDate,
    sortedDateKeys,
    setSelectedNotification,
    setShowUnreadOnly,
    markNotificationAsRead,
    handleNotificationClick,
    handleDeleteNotification,
    handleClearNotifications,
  };
}
