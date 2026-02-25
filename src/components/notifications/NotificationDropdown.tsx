"use client";

import { useRef } from "react";
import { Bell, CheckCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useClickOutside } from "@/hooks/useClickOutside";
import { cn } from "@/lib/utils";
import { RelativeTime } from "@/utils/hydration-safe-date";
import { useNotificationDropdown } from "@/hooks/components/useNotificationDropdown";
import { useLanguage } from "@/contexts/LanguageContext";

interface NotificationDropdownProps {
  className?: string;
}

export function NotificationDropdown({ className }: NotificationDropdownProps) {
  const { language } = useLanguage();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const {
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
  } = useNotificationDropdown();

  // Close dropdown when clicking outside
  useClickOutside(dropdownRef, () => setIsOpen(false));

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

  return (
    <div className={cn("relative", className)} ref={dropdownRef}>
      {/* Notification Bell Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={handleBellClick}
        className="relative text-white hover:bg-transparent group"
        title={`${unreadCount} unread notifications`}
      >
        <Bell
          size={20}
          className="transition-colors text-white group-hover:text-red-500"
        />

        {/* Unread count badge */}
        {unreadCount > 0 && (
          <div className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs bg-red-600 text-white rounded-full font-semibold">
            {unreadCount > 99 ? "99+" : unreadCount}
          </div>
        )}
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
                disabled={!isConnected || isMarkingAllAsRead}
                className="text-blue-400 hover:text-blue-300 text-xs disabled:opacity-50"
                title={
                  !isConnected
                    ? "⚠️ Cannot connect to server. Please check your network connection."
                    : notifications.every((n) => n.isRead)
                    ? "All notifications have been read"
                    : "Mark all as read"
                }
              >
                {isMarkingAllAsRead ? "Marking..." : "Mark all read"}
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
                  onClick={() => handleNotificationClick(notification)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      handleNotificationClick(notification);
                    }
                  }}
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
                      <RelativeTime
                        date={notification.createdAt}
                        className="text-xs text-gray-400 mt-1 block"
                        language={language}
                      />
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
                onClick={goToNotificationsPage}
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

export default NotificationDropdown;
