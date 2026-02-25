"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axiosInstance from "@/lib/axios-instance";
import { useAuth } from "@/hooks/useAuth";
import { useNotificationSocket } from "@/hooks/useNotificationSocket";

export interface NotificationItem {
  id: number;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error" | "system";
  createdAt: Date;
  isRead: boolean;
  metadata?: {
    movieId?: number;
    tvId?: number;
    commentId?: number;
    parentId?: number;
    [key: string]: unknown;
  };
}

interface RawNotification {
  id: number | string;
  title: string;
  message: string;
  type: NotificationItem["type"];
  createdAt: string;
  isRead: boolean;
  metadata?: NotificationItem["metadata"];
}

export interface UseNotificationDropdownResult {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  notifications: NotificationItem[];
  isMarkingAllAsRead: boolean;
  unreadCount: number;
  isConnected: boolean;
  handleBellClick: () => void;
  handleMarkAsRead: (notificationId: number) => void;
  handleNotificationClick: (notification: NotificationItem) => void;
  goToNotificationsPage: () => void;
  handleMarkAllAsRead: () => Promise<void>;
}

export function useNotificationDropdown(): UseNotificationDropdownResult {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isMarkingAllAsRead, setIsMarkingAllAsRead] = useState(false);
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const {
    unreadCount,
    isConnected,
    latestNotification,
    markAsRead,
    markAllAsRead,
  } = useNotificationSocket();

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!isAuthenticated) return;

      try {
        const response = await axiosInstance.get("/notifications", {
          params: { limit: 10 },
        });

        if (response.data?.success && response.data.data?.notifications) {
          const userNotifications = (
            response.data.data.notifications as RawNotification[]
          ).map((notif) => ({
            id: Number(notif.id),
            title: notif.title,
            message: notif.message,
            type: notif.type,
            createdAt: new Date(notif.createdAt),
            isRead: notif.isRead,
            metadata: notif.metadata,
          }));
          setNotifications(userNotifications);
        }
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };

    fetchNotifications();
  }, [isAuthenticated]);

  useEffect(() => {
    if (latestNotification) {
      const newNotification: NotificationItem = {
        ...latestNotification,
        isRead: false,
      };
      setNotifications((prev) => [newNotification, ...prev.slice(0, 9)]);
    }
  }, [latestNotification]);

  const handleMarkAsRead = useCallback(
    (notificationId: number) => {
      markAsRead(notificationId);
      setNotifications((prev) =>
        prev.map((notif) =>
          notif.id === notificationId ? { ...notif, isRead: true } : notif
        )
      );
    },
    [markAsRead]
  );

  const resolveTargetUrl = useCallback(
    (metadata?: NotificationItem["metadata"]): string | null => {
      if (!metadata) return null;
      if (metadata.movieId) return `/watch/movie-${metadata.movieId}`;
      if (metadata.tvId) return `/watch/tv-${metadata.tvId}`;
      return null;
    },
    []
  );

  const handleNotificationClick = useCallback(
    (notification: NotificationItem) => {
      const targetUrl = resolveTargetUrl(notification.metadata);
      if (targetUrl) {
        handleMarkAsRead(notification.id);
        router.push(targetUrl);
        setIsOpen(false);
      }
    },
    [handleMarkAsRead, resolveTargetUrl, router]
  );

  const goToNotificationsPage = useCallback(() => {
    router.push("/notifications");
    setIsOpen(false);
  }, [router]);

  const handleBellClick = useCallback(() => {
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      goToNotificationsPage();
      return;
    }
    setIsOpen((prev) => !prev);
  }, [goToNotificationsPage]);

  const handleMarkAllAsRead = useCallback(async () => {
    if (!isConnected) {
      console.warn("Cannot mark all as read: Socket not connected");
      return;
    }

    setIsMarkingAllAsRead(true);

    try {
      markAllAsRead();
      setNotifications((prev) => prev.map((notif) => ({ ...notif, isRead: true })));
    } catch (error) {
      console.error("Error marking all as read:", error);
    } finally {
      setTimeout(() => setIsMarkingAllAsRead(false), 500);
    }
  }, [isConnected, markAllAsRead]);

  return {
    isOpen,
    setIsOpen,
    notifications,
    isMarkingAllAsRead,
    unreadCount,
    isConnected,
    handleBellClick,
    handleMarkAsRead,
    handleNotificationClick,
    goToNotificationsPage,
    handleMarkAllAsRead,
  };
}
