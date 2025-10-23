"use client";

import { useState, useRef, useEffect } from "react";
import { Bell, CheckCircle, X, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNotificationSocket } from "@/hooks/useNotificationSocket";
import { useClickOutside } from "@/hooks/useClickOutside";
import { cn } from "@/lib/utils";

interface Notification {
  id: number;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error" | "system";
  createdAt: Date;
  isRead: boolean;
}

interface NotificationDropdownProps {
  className?: string;
}

export function NotificationDropdown({ className }: NotificationDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const {
    unreadCount,
    isConnected,
    latestNotification,
    markAsRead,
    markAllAsRead,
  } = useNotificationSocket();

  // Debug logging
  useEffect(() => {
    console.log("🔔 NotificationDropdown - unreadCount:", unreadCount);
    console.log("🔗 NotificationDropdown - isConnected:", isConnected);
  }, [unreadCount, isConnected]);

  // Close dropdown when clicking outside
  useClickOutside(dropdownRef, () => setIsOpen(false));

  // Fetch existing notifications on component mount
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) return;

        const response = await fetch(
          "http://localhost:8080/api/notifications?limit=10",
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          console.log("📦 User notifications:", data);

          if (data.success && data.data?.notifications) {
            const userNotifications = data.data.notifications.map(
              (notif: any) => ({
                id: notif.id,
                title: notif.title,
                message: notif.message,
                type: notif.type,
                createdAt: new Date(notif.createdAt),
                isRead: notif.isRead,
              })
            );
            setNotifications(userNotifications);
          }
        }
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };

    fetchNotifications();
  }, []);

  // Add new notification to list when received
  useEffect(() => {
    if (latestNotification) {
      const newNotification: Notification = {
        ...latestNotification,
        isRead: false,
      };
      setNotifications((prev) => [newNotification, ...prev.slice(0, 9)]); // Keep max 10 notifications
    }
  }, [latestNotification]);

  const handleMarkAsRead = (notificationId: number) => {
    markAsRead(notificationId);
    setNotifications((prev) =>
      prev.map((notif) =>
        notif.id === notificationId ? { ...notif, isRead: true } : notif
      )
    );
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead();
    setNotifications((prev) =>
      prev.map((notif) => ({ ...notif, isRead: true }))
    );
  };

  const handleRemoveNotification = (notificationId: number) => {
    setNotifications((prev) =>
      prev.filter((notif) => notif.id !== notificationId)
    );
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle size={16} className="text-green-500" />;
      case "error":
        return <X size={16} className="text-red-500" />;
      case "warning":
        return <Bell size={16} className="text-yellow-500" />;
      default:
        return <Bell size={16} className="text-blue-500" />;
    }
  };

  const formatTime = (date: Date | string) => {
    const now = new Date();
    const dateObj = typeof date === 'string' ? new Date(date) : date;

    // Validate date
    if (!dateObj || isNaN(dateObj.getTime())) {
      return "Just now";
    }

    const diff = now.getTime() - dateObj.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return "Just now";
  };

  return (
    <div className={cn("relative", className)} ref={dropdownRef}>
      {/* Notification Bell Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="relative text-white hover:bg-gray-700"
        title={`${unreadCount} unread notifications`}
      >
        <Bell size={20} />

        {/* Unread count badge */}
        {unreadCount > 0 && (
          <div className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs bg-red-600 text-white rounded-full font-semibold">
            {unreadCount > 99 ? "99+" : unreadCount}
          </div>
        )}

        {/* Connection status indicator */}
        <div
          className={cn(
            "absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-gray-800",
            isConnected ? "bg-green-500" : "bg-red-500"
          )}
          title={isConnected ? "Connected" : "Disconnected"}
        />
      </Button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-[150]">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-700">
            <h3 className="text-white font-semibold">Notifications</h3>
            {notifications.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkAllAsRead}
                className="text-blue-400 hover:text-blue-300 text-xs"
              >
                Mark all read
              </Button>
            )}
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-400">
                <Bell size={24} className="mx-auto mb-2 opacity-50" />
                <p>No notifications yet</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    "p-4 border-b border-gray-700 last:border-b-0 hover:bg-gray-700/50 transition-colors",
                    !notification.isRead && "bg-blue-900/20"
                  )}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-1">
                      {getTypeIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white">
                        {notification.title}
                      </p>
                      <p className="text-sm text-gray-300 mt-1">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {formatTime(notification.createdAt)}
                      </p>
                    </div>
                    <div className="flex items-center space-x-1">
                      {!notification.isRead && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleMarkAsRead(notification.id)}
                          className="text-blue-400 hover:text-blue-300 text-xs p-1"
                          title="Mark as read"
                        >
                          <CheckCircle size={14} />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          handleRemoveNotification(notification.id)
                        }
                        className="text-gray-400 hover:text-red-400 text-xs p-1"
                        title="Remove"
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-3 border-t border-gray-700 bg-gray-800/50">
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-blue-400 hover:text-blue-300 text-sm"
              >
                View all notifications
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
